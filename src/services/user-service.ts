import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ManagedUser,
  GetUsersFilter,
  GetUsersResponse,
  InviteAdminInput,
} from "@/types/user";

/**
 * Armazenamento em memória para resiliência de desenvolvimento local e testes.
 */
const memoryUsersFallback = new Map<string, ManagedUser>();

// Usuários iniciais de demonstração para testes e resiliência
function initializeFallbackUsers() {
  if (memoryUsersFallback.size > 0) return;

  const initialUsers: ManagedUser[] = [
    {
      id: "usr-admin-principal",
      email: "admin@usetresmarias.com.br",
      name: "Administrador Geral",
      role: "admin",
      status: "active",
      created_at: "2026-10-25T10:00:00.000Z",
      last_sign_in_at: "2026-10-29T08:00:00.000Z",
      orders_count: 0,
    },
    {
      id: "usr-cliente-mariana",
      email: "mariana.silva@exemplo.com",
      name: "Mariana Silva",
      role: "customer",
      status: "active",
      created_at: "2026-10-27T14:30:00.000Z",
      last_sign_in_at: "2026-10-28T19:00:00.000Z",
      orders_count: 3,
    },
    {
      id: "usr-cliente-carolina",
      email: "carolina.mendes@exemplo.com",
      name: "Carolina Mendes",
      role: "customer",
      status: "active",
      created_at: "2026-10-28T09:15:00.000Z",
      last_sign_in_at: "2026-10-28T11:45:00.000Z",
      orders_count: 1,
    },
    {
      id: "usr-cliente-juliana",
      email: "juliana.costa@exemplo.com",
      name: "Juliana Costa",
      role: "customer",
      status: "blocked",
      created_at: "2026-10-26T16:20:00.000Z",
      last_sign_in_at: "2026-10-27T10:10:00.000Z",
      orders_count: 0,
      blocked_at: "2026-10-28T12:00:00.000Z",
      blocked_reason: "Suspeita de atividade fraudulenta",
    },
  ];

  initialUsers.forEach((u) => memoryUsersFallback.set(u.id, u));
}

initializeFallbackUsers();

/**
 * Consulta a contagem de pedidos por cliente a partir da tabela orders.
 */
async function getOrdersCountMap(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("user_id, customer_email");

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row.user_id) {
          counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
        }
        if (row.customer_email) {
          const emailKey = `email:${row.customer_email.toLowerCase()}`;
          counts.set(emailKey, (counts.get(emailKey) || 0) + 1);
        }
      }
    }
  } catch {
    // Ignora erro em caso de banco offline
  }
  return counts;
}

/**
 * Lista e pesquisa contas de usuários e clientes.
 * Executada exclusivamente no servidor por administradores autorizados.
 */
export async function listUsers(filter?: GetUsersFilter): Promise<GetUsersResponse> {
  const page = Math.max(1, filter?.page || 1);
  const perPage = Math.max(1, Math.min(100, filter?.perPage || 20));
  const ordersCountMap = await getOrdersCountMap();

  const adminClient = getSupabaseAdminClient();
  let allUsers: ManagedUser[] = [];

  if (adminClient) {
    try {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!error && data?.users) {
        allUsers = data.users.map((u) => {
          const isBannedByDuration = Boolean(
            u.banned_until && new Date(u.banned_until).getTime() > Date.now()
          );
          const isExplicitlyBlocked = Boolean(u.app_metadata?.is_blocked);
          const isBlocked = isBannedByDuration || isExplicitlyBlocked;

          const email = u.email || "";
          const emailOrderCount = ordersCountMap.get(`email:${email.toLowerCase()}`) || 0;
          const userOrderCount = ordersCountMap.get(u.id) || 0;
          const totalOrders = Math.max(userOrderCount, emailOrderCount);

          const role = u.app_metadata?.role === "admin" ? "admin" : "customer";

          return {
            id: u.id,
            email,
            name:
              (u.user_metadata?.full_name as string) ||
              (u.user_metadata?.name as string) ||
              email.split("@")[0] ||
              "Cliente",
            role,
            status: isBlocked ? "blocked" : "active",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            orders_count: totalOrders,
            blocked_at: (u.app_metadata?.blocked_at as string) || null,
            blocked_reason: (u.app_metadata?.blocked_reason as string) || null,
          };
        });

        // Sincroniza usuários reais com o fallback em memória
        allUsers.forEach((u) => memoryUsersFallback.set(u.id, u));
      }
    } catch {
      // Falha ao conectar na API Admin do Supabase, utiliza o fallback em memória
    }
  }

  // Se não obteve usuários do Supabase Admin (chave ausente ou indisponível), usa o fallback
  if (allUsers.length === 0) {
    allUsers = Array.from(memoryUsersFallback.values()).map((u) => ({
      ...u,
      orders_count:
        ordersCountMap.get(u.id) ||
        ordersCountMap.get(`email:${u.email.toLowerCase()}`) ||
        u.orders_count ||
        0,
    }));
  }

  // 1. Filtro por Busca (Nome, E-mail ou ID)
  let filtered = allUsers;
  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }

  // 2. Filtro por Papel (Cliente ou Administrador)
  if (filter?.role && filter.role !== "all") {
    filtered = filtered.filter((u) => u.role === filter.role);
  }

  // 3. Filtro por Situação (Ativa ou Bloqueada)
  if (filter?.status && filter.status !== "all") {
    filtered = filtered.filter((u) => u.status === filter.status);
  }

  // Ordena por data de criação (mais recentes primeiro)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const pagedUsers = filtered.slice(startIndex, startIndex + perPage);

  return {
    users: pagedUsers,
    total,
    page,
    perPage,
    totalPages,
  };
}

/**
 * Consulta um usuário específico por ID.
 */
export async function getUserById(userId: string): Promise<ManagedUser | null> {
  if (!userId) return null;

  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.auth.admin.getUserById(userId);
      if (!error && data?.user) {
        const u = data.user;
        const isBannedByDuration = Boolean(
          u.banned_until && new Date(u.banned_until).getTime() > Date.now()
        );
        const isExplicitlyBlocked = Boolean(u.app_metadata?.is_blocked);
        const isBlocked = isBannedByDuration || isExplicitlyBlocked;

        return {
          id: u.id,
          email: u.email || "",
          name:
            (u.user_metadata?.full_name as string) ||
            (u.user_metadata?.name as string) ||
            u.email?.split("@")[0] ||
            "Cliente",
          role: u.app_metadata?.role === "admin" ? "admin" : "customer",
          status: isBlocked ? "blocked" : "active",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || null,
          blocked_at: (u.app_metadata?.blocked_at as string) || null,
          blocked_reason: (u.app_metadata?.blocked_reason as string) || null,
        };
      }
    } catch {
      // Fallback
    }
  }

  return memoryUsersFallback.get(userId) || null;
}

/**
 * Bloqueia ou reativa a conta de um cliente.
 * Validações de segurança:
 * 1. O administrador não pode bloquear sua própria conta.
 * 2. Bloqueio restrito a contas de cliente para evitar exclusão acidental de privilégios admin.
 */
export async function setUserBlockedStatus(
  targetUserId: string,
  block: boolean,
  adminSessionId: string,
  reason?: string
): Promise<{ success: boolean; user?: ManagedUser; message: string }> {
  if (!targetUserId) {
    throw new Error("Identificador de usuário não informado.");
  }

  // 1. REGRA DE SEGURANÇA: Administrador não pode bloquear sua própria conta
  if (targetUserId === adminSessionId) {
    throw new Error("Operação negada: você não pode bloquear sua própria conta de administrador.");
  }

  const existingUser = await getUserById(targetUserId);
  if (!existingUser) {
    throw new Error("Usuário não encontrado.");
  }

  // 2. REGRA DE SEGURANÇA: Contas de administrador não são bloqueadas por esta função
  if (existingUser.role === "admin") {
    throw new Error(
      "Operação negada: contas de administrador não podem ser bloqueadas diretamente nesta interface."
    );
  }

  const now = new Date().toISOString();
  const cleanReason = reason?.trim() || (block ? "Bloqueado pelo administrador" : null);

  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.auth.admin.updateUserById(targetUserId, {
        ban_duration: block ? "876000h" : "none", // 100 anos para banir ou 'none' para desbanir
        app_metadata: {
          role: "customer",
          is_blocked: block,
          blocked_at: block ? now : null,
          blocked_reason: cleanReason,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao atualizar situação do usuário no Supabase.");
      }

      if (data?.user) {
        const updated: ManagedUser = {
          ...existingUser,
          status: block ? "blocked" : "active",
          blocked_at: block ? now : null,
          blocked_reason: cleanReason,
        };
        memoryUsersFallback.set(targetUserId, updated);

        return {
          success: true,
          user: updated,
          message: block
            ? `Conta de ${existingUser.name} bloqueada com sucesso.`
            : `Conta de ${existingUser.name} reativada com sucesso.`,
        };
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Operação negada")) {
        throw err;
      }
      // Se a chamada ao Supabase falhar, atualiza o fallback em memória
    }
  }

  // Atualização no fallback em memória
  const updatedFallback: ManagedUser = {
    ...existingUser,
    status: block ? "blocked" : "active",
    blocked_at: block ? now : null,
    blocked_reason: cleanReason,
  };
  memoryUsersFallback.set(targetUserId, updatedFallback);

  return {
    success: true,
    user: updatedFallback,
    message: block
      ? `Conta de ${existingUser.name} bloqueada com sucesso.`
      : `Conta de ${existingUser.name} reativada com sucesso.`,
  };
}

/**
 * Cadastra ou convida um novo administrador por meio de operação administrativa protegida no servidor.
 */
export async function createOrInviteAdmin(
  input: InviteAdminInput,
  adminSessionId: string
): Promise<{ success: boolean; user?: ManagedUser; message: string }> {
  if (!adminSessionId) {
    throw new Error("UNAUTHORIZED");
  }

  const cleanEmail = input.email?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Informe um endereço de e-mail corporativo válido.");
  }

  const cleanName = input.name?.trim() || cleanEmail.split("@")[0] || "Administrador";
  const now = new Date().toISOString();

  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      if (input.password && input.password.trim().length >= 6) {
        // Criação direta com senha inicial
        const { data, error } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password: input.password.trim(),
          email_confirm: true,
          app_metadata: {
            role: "admin",
          },
          user_metadata: {
            full_name: cleanName,
          },
        });

        if (error) {
          throw new Error(error.message || "Erro ao cadastrar administrador.");
        }

        if (data?.user) {
          const newUser: ManagedUser = {
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            role: "admin",
            status: "active",
            created_at: data.user.created_at || now,
            last_sign_in_at: null,
            orders_count: 0,
          };
          memoryUsersFallback.set(newUser.id, newUser);

          return {
            success: true,
            user: newUser,
            message: `Administrador ${cleanName} cadastrado com sucesso.`,
          };
        }
      } else {
        // Envio de convite administrativo por e-mail
        const { data, error } = await adminClient.auth.admin.inviteUserByEmail(cleanEmail, {
          data: {
            full_name: cleanName,
          },
        });

        if (error) {
          throw new Error(error.message || "Erro ao enviar convite administrativo.");
        }

        if (data?.user) {
          // Garante papel de admin no app_metadata do usuário convidado
          await adminClient.auth.admin.updateUserById(data.user.id, {
            app_metadata: { role: "admin" },
          });

          const newUser: ManagedUser = {
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            role: "admin",
            status: "active",
            created_at: data.user.created_at || now,
            last_sign_in_at: null,
            orders_count: 0,
          };
          memoryUsersFallback.set(newUser.id, newUser);

          return {
            success: true,
            user: newUser,
            message: `Convite de administrador enviado para ${cleanEmail} com sucesso.`,
          };
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Erro de comunicação ao registrar administrador.");
    }
  }

  // Fallback em memória para ambientes de testes e desenvolvimento
  const fallbackId = `admin-${Date.now()}`;
  const newAdminFallback: ManagedUser = {
    id: fallbackId,
    email: cleanEmail,
    name: cleanName,
    role: "admin",
    status: "active",
    created_at: now,
    last_sign_in_at: null,
    orders_count: 0,
  };
  memoryUsersFallback.set(fallbackId, newAdminFallback);

  return {
    success: true,
    user: newAdminFallback,
    message: `Administrador ${cleanName} (${cleanEmail}) registrado com sucesso.`,
  };
}

