import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Chave secreta necessária na URL para desbloquear a tela de login.
// Pode ser alterada no arquivo .env pela variável ADMIN_SECRET_KEY
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "tresmarias_acesso_2026";
const ACCESS_COOKIE_NAME = "tm_admin_access";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  // Atualiza e valida a sessão no Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAccessingAdmin = pathname.startsWith("/admin");
  const isAccessingAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/login";

  // 1. Se tentar acessar APIs administrativas sem estar autenticado -> Responde 404 (Not Found)
  if (isAccessingAdminApi && !user) {
    return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  }

  // 2. Se tentar acessar qualquer página /admin sem estar autenticado -> 404 (disfarce total)
  if (isAccessingAdmin && !user) {
    return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
  }

  // 3. Controle da página de Login:
  if (isLoginPage) {
    // Se já estiver logado, redireciona direto para o painel
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Checa se o visitante passou a chave secreta na URL (?chave=... ou ?key=...)
    const queryKey =
      request.nextUrl.searchParams.get("chave") ||
      request.nextUrl.searchParams.get("key") ||
      request.nextUrl.searchParams.get("token");

    const hasValidKeyInUrl = queryKey === ADMIN_SECRET_KEY;
    const hasValidAccessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value === ADMIN_SECRET_KEY;

    // Se forneceu a chave correta: libera o acesso, grava o cookie seguro e limpa a URL
    if (hasValidKeyInUrl) {
      const cleanUrl = new URL("/login", request.url);
      const redirectRes = NextResponse.redirect(cleanUrl);
      redirectRes.cookies.set(ACCESS_COOKIE_NAME, ADMIN_SECRET_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 dias de autorização no navegador do administrador
      });
      return redirectRes;
    }

    // Se NÃO possui a chave na URL nem o cookie gravado -> Responde 404 (tela de login invisível)
    if (!hasValidAccessCookie) {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
