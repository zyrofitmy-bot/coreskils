import { Button, ButtonProps } from "@/components/ui/button";
import { useGetSession } from "@/lib/use-session";
import { useNavigate } from "@tanstack/react-router";

export function UpgradeCreatorButton({ 
  className,
  variant = "default",
  size = "default",
  children
}: ButtonProps) {
  const navigate = useNavigate();
  const { data: session } = useGetSession();

  const handleApply = () => {
    if (!session?.authenticated) {
      navigate({ to: "/auth/login" as any });
      return;
    }

    if (session?.user?.role === "creator" || session?.user?.role === "admin") {
      navigate({ to: `/dashboard/${session.user.role}` as any });
      return;
    }
    navigate({ to: "/creator-application" });
  };

  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={handleApply}
    >
      {children || "Apply to become a creator"}
    </Button>
  );
}
