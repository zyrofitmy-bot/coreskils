import { Link } from "@tanstack/react-router";
import logoMarkWhite from "@/assets/logo-mark-white.svg.asset.json";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/courses", label: "Courses" },
      { to: "/products", label: "Products" },
      { to: "/creators", label: "Creators" },
      { to: "/about", label: "About" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/contact", label: "Contact" },
      { to: "/refund-policy", label: "Refund policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/auth", label: "Sign in" },
      { to: "/creator-application", label: "Become a creator" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of service" },
      { to: "/privacy", label: "Privacy policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-foreground py-14 text-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div>
            <img src={logoMarkWhite.url} alt="CoreSkils" className="h-10 w-10" />
            <p className="mt-4 text-sm text-background/70">
              Practical skills. Real career growth.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-background/60">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-background/80 transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-background/15 pt-6 text-center text-sm text-background/60">
          © {new Date().getFullYear()} CoreSkils · coreskils.com
        </div>
      </div>
    </footer>
  );
}
