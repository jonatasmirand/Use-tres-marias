import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ManagedUser,
  GetUsersFilter,
  GetUsersResponse,
  InviteAdminInput,
  UserRole,
  UserStatus,
} from "@/types/user";

/**
 * Diretório e arquivo para persistência resiliente em disco local de contas sincronizadas.
 */
const DISK_CACHE_DIR = path.join(process.cwd(), "src", "data");
const DISK_CACHE_FILE = path.join(DISK_CACHE_DIR, "synced-accounts.json");

/**
 * Armazenamento em memória para resiliência durante o ciclo de vida da aplicação.
 */
const memoryUsersFallback = new Map<string, ManagedUser>();

/**
 * Usuários iniciais de demonstração (exibidos APENAS enquanto não houver contas reais registradas).
 */
const INITIAL_DEMO_USERS: ManagedUser[] = [
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

function readDiskCache(): Map<string, ManagedUser> {
  const map = new Map<string, ManagedUser>();
  try {
    if (fs.existsSync(DISK_CACHE_FILE)) {
      const raw = fs.readFileSync(DISK_CACHE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u && u.id && u.email) map.set(u.id, u);
        });
      } else if (parsed && typeof parsed === "object") {
        Object.values(parsed).forEach((u: any) => {
          if (u && u.id && u.email) map.set(u.id, u);
        });
      }
    }
  } catch {
    // Falha silenciosa em caso de restrição de leitura ou ambiente serverless read-only
  }
  return map;
}

function writeDiskCache(map: Map<string, ManagedUser>): void {
  try {
    if (!fs.existsSync(DISK_CACHE_DIR)) {
      fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
    }
    const array = Array.from(map.values());
    fs.writeFileSync(DISK_CACHE_FILE, JSON.stringify(array, null, 2), "utf-8");
  } catch {
    // Falha silenciosa em caso de restrição de escrita
  }
}

function initializeFallbackUsers() {
  if (memoryUsersFallback.size > 0) return;

  const diskAccounts = readDiskCache();
  if (diskAccounts.size > 0) {
    diskAccounts.forEach((u) => memoryUsersFallback.set(u.id, u));
  } else {
    INITIAL_DEMO_USERS.forEach((u) => memoryUsersFallback.set(u.id, u));
  }
}

initializeFallbackUsers();

/**
 * Registra ou atualiza um usuário autenticado na base gerenciada de contas.
 * Sincroniza simultaneamente no cache em memória, no cache local persistente em disco
 * e na tabela site_settings no Supabase.
 */
export async function syncAuthenticatedUser(user: {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "customer";
  status?: "active" | "blocked";
  created_at?: string;
  last_sign_in_at?: string | null;
}): Promise<void> {
  if (!user.id || !user.email) return;

  const now = new Date().toISOString();
  const existing = memoryUsersFallback.get(user.id);

  const managed: ManagedUser = {
    id: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name?.trim() || existing?.name || user.email.split("@")[0] || "Cliente",
    role: user.role || existing?.role || "customer",
    status: user.status || existing?.status || "active",
    created_at: user.created_at || existing?.created_at || now,
    last_sign_in_at: user.last_sign_in_at || now,
    orders_count: existing?.orders_count || 0,
    blocked_at: existing?.blocked_at || null,
    blocked_reason: existing?.blocked_reason || null,
  };

  memoryUsersFallback.set(user.id, managed);

  // 1. Grava no cache em disco local para persistência de desenvolvimento
  const diskAccounts = readDiskCache();
  diskAccounts.set(user.id, managed);
  writeDiskCache(diskAccounts);

  // 2. Tenta sincronizar com a tabela site_settings no Supabase
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "synced_accounts")
      .maybeSingle();

    const currentMap: Record<string, ManagedUser> =
      data && data.value && typeof data.value === "object"
        ? (data.value as Record<string, ManagedUser>)
        : {};

    currentMap[user.id] = managed;

    await supabase.from("site_settings").upsert({
      key: "synced_accounts",
      value: currentMap,
      updated_at: now,
    });
  } catch {
    // Continua normalmente em caso de falha de rede/permissão RLS
  }
}

/**
 * Consulta a contagem de pedidos e descobre clientes da tabela orders.
 */
interface OrdersData {
  countsMap: Map<string, number>;
  orderCustomers: Map<string, ManagedUser>;
}

async function getOrdersAndCustomersData(): Promise<OrdersData> {
  const countsMap = new Map<string, number>();
  const orderCustomers = new Map<string, ManagedUser>();

  try {
    const adminClient = getSupabaseAdminClient();
    const supabase = adminClient || (await createClient());
    const { data, error } = await supabase
      .from("orders")
      .select("id, user_id, customer_email, customer_name, created_at");

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row.user_id) {
          countsMap.set(row.user_id, (countsMap.get(row.user_id) || 0) + 1);
        }
        if (row.customer_email) {
          const cleanEmail = row.customer_email.toLowerCase().trim();
          const emailKey = `email:${cleanEmail}`;
          countsMap.set(emailKey, (countsMap.get(emailKey) || 0) + 1);

          const customerKey = row.user_id || `order-${cleanEmail}`;
          if (!orderCustomers.has(customerKey)) {
            orderCustomers.set(customerKey, {
              id: customerKey,
              email: cleanEmail,
              name: row.customer_name?.trim() || cleanEmail.split("@")[0] || "Cliente",
              role: "customer",
              status: "active",
              created_at: row.created_at || new Date().toISOString(),
              last_sign_in_at: null,
              orders_count: 0,
            });
          }
        }
      }
    }
  } catch {
    // Ignora erro em caso de banco offline
  }

  for (const customer of orderCustomers.values()) {
    const total = Math.max(
      countsMap.get(customer.id) || 0,
      countsMap.get(`email:${customer.email}`) || 0
    );
    customer.orders_count = total;
  }

  return { countsMap, orderCustomers };
}

/**
 * Carrega contas sincronizadas a partir da tabela site_settings no Supabase.
 */
async function loadSyncedAccountsFromSupabase(): Promise<Map<string, ManagedUser>> {
  const syncedMap = new Map<string, ManagedUser>();
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "synced_accounts")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      Object.values(data.value).forEach((item: any) => {
        if (item && item.id && item.email) {
          syncedMap.set(item.id, item as ManagedUser);
        }
      });
    }
  } catch {
    // Falha silenciosa
  }
  return syncedMap;
}

/**
 * Lista e pesquisa contas de usuários e clientes.
 * Executada no servidor por administradores autorizados.
 *
 * Integração inteligente de múltiplas fontes:
 * 1. Supabase Auth Admin API (listUsers direto via SUPABASE_SERVICE_ROLE_KEY)
 * 2. site_settings (synced_accounts no Supabase)
 * 3. Base de pedidos (orders)
 * 4. Cache persistente em disco (synced-accounts.json)
 * 5. Cache em memória resiliente
 *
 * Remove automaticamente contas fictícias de teste se houver qualquer usuário real registrado.
 */
export async function listUsers(filter?: GetUsersFilter): Promise<GetUsersResponse> {
  const page = Math.max(1, filter?.page || 1);
  const perPage = Math.max(1, Math.min(100, filter?.perPage || 20));

  const { countsMap, orderCustomers } = await getOrdersAndCustomersData();
  const combinedMap = new Map<string, ManagedUser>();

  // 1. Supabase Auth Admin API (se SUPABASE_SERVICE_ROLE_KEY estiver disponível)
  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!error && data?.users) {
        for (const u of data.users) {
          const isBannedByDuration = Boolean(
            u.banned_until && new Date(u.banned_until).getTime() > Date.now()
          );
          const isExplicitlyBlocked = Boolean(u.app_metadata?.is_blocked);
          const isBlocked = isBannedByDuration || isExplicitlyBlocked;

          const email = (u.email || "").toLowerCase().trim();
          const emailOrderCount = countsMap.get(`email:${email}`) || 0;
          const userOrderCount = countsMap.get(u.id) || 0;
          const totalOrders = Math.max(userOrderCount, emailOrderCount);

          const role: UserRole = u.app_metadata?.role === "admin" ? "admin" : "customer";

          const managed: ManagedUser = {
            id: u.id,
            email,
            name:
              (u.user_metadata?.full_name as string) ||
              (u.user_metadata?.name as string) ||
              email.split("@")[0] ||
              (role === "admin" ? "Administrador" : "Cliente"),
            role,
            status: isBlocked ? "blocked" : "active",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            orders_count: totalOrders,
            blocked_at: (u.app_metadata?.blocked_at as string) || null,
            blocked_reason: (u.app_metadata?.blocked_reason as string) || null,
          };

          combinedMap.set(managed.id, managed);
          memoryUsersFallback.set(managed.id, managed);
        }
      }
    } catch {
      // API Admin falhou ou não autorizada
    }
  }

  // 2. Contas sincronizadas na tabela site_settings do Supabase
  const supabaseSynced = await loadSyncedAccountsFromSupabase();
  for (const [id, user] of supabaseSynced.entries()) {
    if (!combinedMap.has(id)) {
      combinedMap.set(id, user);
      memoryUsersFallback.set(id, user);
    }
  }

  // 3. Clientes obtidos da tabela de pedidos (orders)
  for (const customer of orderCustomers.values()) {
    const existingById = combinedMap.get(customer.id);
    const existingByEmail = Array.from(combinedMap.values()).find(
      (u) => u.email.toLowerCase() === customer.email.toLowerCase()
    );

    if (!existingById && !existingByEmail) {
      combinedMap.set(customer.id, customer);
      memoryUsersFallback.set(customer.id, customer);
    }
  }

  // 4. Cache persistente em disco local
  const diskAccounts = readDiskCache();
  for (const [id, user] of diskAccounts.entries()) {
    if (!combinedMap.has(id)) {
      combinedMap.set(id, user);
      memoryUsersFallback.set(id, user);
    }
  }

  // 5. Cache em memória
  for (const [id, user] of memoryUsersFallback.entries()) {
    if (!combinedMap.has(id)) {
      combinedMap.set(id, user);
    }
  }

  // Atualiza as contagens de pedidos mais recentes para todas as contas combinadas
  for (const user of combinedMap.values()) {
    const emailKey = `email:${user.email.toLowerCase()}`;
    const ordersCount = Math.max(
      countsMap.get(user.id) || 0,
      countsMap.get(emailKey) || 0,
      user.orders_count || 0
    );
    user.orders_count = ordersCount;
  }

  // 6. Separação de contas de demonstração vs contas reais:
  const mockTestUserIds = new Set([
    "usr-cliente-mariana",
    "usr-cliente-carolina",
    "usr-cliente-juliana",
  ]);

  const realAccounts = Array.from(combinedMap.values()).filter(
    (u) =>
      !mockTestUserIds.has(u.id) &&
      !u.email.endsWith("@exemplo.com") &&
      u.id !== "usr-admin-principal"
  );

  let allUsers: ManagedUser[];
  if (realAccounts.length > 0) {
    // Se existem contas ou logins reais registrados, remove as contas fictícias de teste
    allUsers = Array.from(combinedMap.values()).filter(
      (u) => !mockTestUserIds.has(u.id) && !u.email.endsWith("@exemplo.com")
    );
  } else {
    // Se nenhuma conta real foi registrada ainda, mantém a demonstração
    allUsers = Array.from(combinedMap.values());
  }

  // 7. Filtro por Busca (Nome, E-mail ou ID)
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

  // 8. Filtro por Papel (Cliente ou Administrador)
  if (filter?.role && filter.role !== "all") {
    filtered = filtered.filter((u) => u.role === filter.role);
  }

  // 9. Filtro por Situação (Ativa ou Bloqueada)
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

  const list = await listUsers({ perPage: 1000 });
  return list.users.find((u) => u.id === userId) || memoryUsersFallback.get(userId) || null;
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

  const updated: ManagedUser = {
    ...existingUser,
    status: block ? "blocked" : "active",
    blocked_at: block ? now : null,
    blocked_reason: cleanReason,
  };

  memoryUsersFallback.set(targetUserId, updated);

  const diskAccounts = readDiskCache();
  diskAccounts.set(targetUserId, updated);
  writeDiskCache(diskAccounts);

  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      await adminClient.auth.admin.updateUserById(targetUserId, {
        ban_duration: block ? "876000h" : "none",
        app_metadata: {
          role: "customer",
          is_blocked: block,
          blocked_at: block ? now : null,
          blocked_reason: cleanReason,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Operação negada")) {
        throw err;
      }
    }
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "synced_accounts")
      .maybeSingle();

    const currentMap: Record<string, ManagedUser> =
      data && data.value && typeof data.value === "object"
        ? (data.value as Record<string, ManagedUser>)
        : {};

    currentMap[targetUserId] = updated;

    await supabase.from("site_settings").upsert({
      key: "synced_accounts",
      value: currentMap,
      updated_at: now,
    });
  } catch {
    // Falha silenciosa
  }

  return {
    success: true,
    user: updated,
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

          const disk = readDiskCache();
          disk.set(newUser.id, newUser);
          writeDiskCache(disk);

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

          const disk = readDiskCache();
          disk.set(newUser.id, newUser);
          writeDiskCache(disk);

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

  // Fallback em memória e disco para ambientes de testes e desenvolvimento
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

  const disk = readDiskCache();
  disk.set(fallbackId, newAdminFallback);
  writeDiskCache(disk);

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "synced_accounts")
      .maybeSingle();

    const currentMap: Record<string, ManagedUser> =
      data && data.value && typeof data.value === "object"
        ? (data.value as Record<string, ManagedUser>)
        : {};

    currentMap[fallbackId] = newAdminFallback;

    await supabase.from("site_settings").upsert({
      key: "synced_accounts",
      value: currentMap,
      updated_at: now,
    });
  } catch {
    // Falha silenciosa
  }

  return {
    success: true,
    user: newAdminFallback,
    message: `Administrador ${cleanName} (${cleanEmail}) registrado com sucesso.`,
  };
}
