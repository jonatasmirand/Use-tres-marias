import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectUrl } from "@/lib/auth-redirect";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "";
const ACCESS_COOKIE_NAME = "tm_admin_access";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. POLÍTICA DE DESCONTINUAÇÃO DAS ROTAS ANTIGAS:
  // /conta e /conta/* respondem com 404 real (Not Found)
  if (pathname === "/conta" || pathname.startsWith("/conta/")) {
    return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Atualiza e valida a sessão no Supabase de forma confiável no servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Papel de administrador obtido estritamente do app_metadata (fonte segura e imutável pelo cliente)
  const isAdmin = user?.app_metadata?.role === "admin";
  const isBlocked = Boolean(user?.app_metadata?.is_blocked);

  const isAccessingAdmin = pathname.startsWith("/admin");
  const isAccessingAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/login";
  const isCadastroPage = pathname === "/cadastro";
  const isClienteRoute = pathname === "/cliente" || pathname.startsWith("/cliente/");

  // Bloqueio de contas suspensas em rotas privadas
  const isPrivateRoute = isAccessingAdmin || isClienteRoute || pathname.startsWith("/checkout");
  if (user && isBlocked && isPrivateRoute) {
    return NextResponse.redirect(new URL("/login?error=blocked", request.url));
  }

  // 2. Proteção do Painel Administrativo (/admin e /api/admin/*)
  if (isAccessingAdminApi && !isAdmin) {
    return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  }

  if (isAccessingAdmin) {
    // Visitante não autenticado tentando acessar o admin -> redireciona ao login com retorno seguro
    if (!user) {
      const nextParam = encodeURIComponent(pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(new URL(`/login?next=${nextParam}`, request.url));
    }
    // Cliente comum autenticado tentando acessar o admin -> bloqueio efetivo (404 Not Found)
    if (!isAdmin) {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }
  }

  // 3. Regras para /login
  if (isLoginPage) {
    if (user) {
      const rawNext = request.nextUrl.searchParams.get("next");
      if (isAdmin) {
        const destination = sanitizeRedirectUrl(rawNext, "/admin", true);
        return NextResponse.redirect(new URL(destination, request.url));
      }
      const destination = sanitizeRedirectUrl(rawNext, "/cliente", false);
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Se forneceu a chave de admin na URL, grava o cookie de conveniência
    const queryKey =
      request.nextUrl.searchParams.get("chave") ||
      request.nextUrl.searchParams.get("key") ||
      request.nextUrl.searchParams.get("token");

    if (Boolean(ADMIN_SECRET_KEY) && queryKey === ADMIN_SECRET_KEY) {
      const cleanUrl = new URL("/login", request.url);
      const redirectRes = NextResponse.redirect(cleanUrl);
      redirectRes.cookies.set(ACCESS_COOKIE_NAME, ADMIN_SECRET_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return redirectRes;
    }
  }

  // 4. Regras para /cadastro
  if (isCadastroPage && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const rawNext = request.nextUrl.searchParams.get("next");
    const destination = sanitizeRedirectUrl(rawNext, "/cliente", false);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 5. Política e Proteção da Área de Cliente (/cliente e /cliente/*)
  if (isClienteRoute) {
    // Visitante não autenticado tentando acessar a área de cliente -> login com retorno
    if (!user) {
      const nextParam = encodeURIComponent(pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(new URL(`/login?next=${nextParam}`, request.url));
    }

    // Administrador autenticado tentando acessar a área de cliente:
    // Aplicação da política de perfil: impede permanência e redireciona ao painel administrativo
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 6. Proteção de outras rotas privadas de clientes (/checkout)
  if (pathname.startsWith("/checkout") && !user) {
    const nextParam = encodeURIComponent(pathname + (request.nextUrl.search || ""));
    return NextResponse.redirect(new URL(`/login?next=${nextParam}`, request.url));
  }

  return response;
}

// Restringe a execução do middleware estritamente às rotas que necessitam de interceptação
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    "/cadastro",
    "/cliente",
    "/cliente/:path*",
    "/checkout",
    "/conta",
    "/conta/:path*",
  ],
};
