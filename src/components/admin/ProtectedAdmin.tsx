import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedAdmin({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, isAuthor, rolesLoaded, loading } = useAuth();

  if (loading || (user && !rolesLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        A carregar...
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (adminOnly && !isAdmin && isAuthor) return <Navigate to="/admin/articles" replace />;

  if (!isAdmin && !isAuthor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground max-w-md">
          A sua conta foi bloqueada por um administrador. Fale com a equipe do portal se achar que é um engano.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
