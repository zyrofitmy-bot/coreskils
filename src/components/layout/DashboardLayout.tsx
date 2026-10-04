import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  ShoppingCart,
  Heart,
  BarChart3,
  Users,
  FileCheck,
  FolderTree,
  Menu,
  X,
  LogOut,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoHorizontal from "@/assets/logo-horizontal.svg.asset.json";

export type DashSection = { id: string; label: string; icon: any };

const studentSections: DashSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "library", label: "My Learning", icon: BookOpen },
  { id: "products", label: "My Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

const creatorSections: DashSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "products", label: "Products", icon: Package },
  { id: "sales", label: "Sales", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: UserRound },
];

const adminSections: DashSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "applications", label: "Applications", icon: FileCheck },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "categories", label: "Categories", icon: FolderTree },
];

export function DashboardLayout({
  role,
  active,
  onNavigate,
  children,
}: {
  role: "student" | "creator" | "admin";
  active: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const sections =
    role === "admin"
      ? adminSections
      : role === "creator"
        ? creatorSections
        : studentSections;

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="px-6 py-5">
        <img src={logoHorizontal.url} alt="CoreSkils" className="h-8 w-auto" />
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onNavigate(s.id);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <s.icon className="size-4" />
            {s.label}
          </button>
        ))}
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <GraduationCap className="size-4" /> Back to site
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card md:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex-1 md:ml-64">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-6" />
          </button>
          <span className="text-sm font-semibold capitalize">{role} dashboard</span>
        </div>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
