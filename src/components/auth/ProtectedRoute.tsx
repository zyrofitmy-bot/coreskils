import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useGetSession } from "@/lib/use-session";

export function ProtectedRoute({
  role,
  children,
}: {
  role: "student" | "creator" | "admin";
  children: ReactNode;
}) {
  const session = useGetSession();

  if (session.isLoading) {
    return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Checking your session…</div>;
  }

  if (!session.data?.authenticated || !session.data.user) {
    return <Navigate to={"/auth/login" as any} />;
  }

  if (session.data.user.role !== role) {
    return <Navigate to={`/dashboard/${session.data.user.role}` as any} />;
  }

  return children;
}
