import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // IMPORTANTE: Não redirecionar admin de /dashboard para /dashboard/admin automaticamente
    // Isso permite que múltiplas guias tenham sessões diferentes
    // O layout client-side fará a verificação correta baseada no sessionStorage
    
    // Apenas proteger rotas admin: se não for admin tentando acessar rota admin, redirecionar
    // Isso garante que profissionais não acessem o painel admin
    if (token && token.role !== "ADMIN" && pathname.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Não redirecionar admin de /dashboard para /dashboard/admin aqui
    // Deixar o layout client-side fazer isso baseado no sessionStorage
    // Isso permite múltiplas sessões simultâneas em diferentes guias
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Se está tentando acessar dashboard, precisa estar autenticado
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};

