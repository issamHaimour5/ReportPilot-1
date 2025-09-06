import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-home", current: location === "/" },
    { name: "Reports", href: "/reports", icon: "fas fa-file-alt", current: location === "/reports" },
    { name: "Integrations", href: "/integrations", icon: "fas fa-plug", current: location === "/integrations" },
    { name: "Automation", href: "/automation", icon: "fas fa-robot", current: location === "/automation" },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-card border-r border-border">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <i className="fas fa-chart-line text-primary-foreground text-sm"></i>
        </div>
        <span className="text-lg font-semibold">ReportFlow</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              data-testid={`link-${item.name.toLowerCase()}`}
            >
              <i className={`${item.icon} w-4`}></i>
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium" data-testid="text-user-initials">SM</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" data-testid="text-user-name">Sarah Mitchell</div>
            <div className="text-xs text-muted-foreground" data-testid="text-user-role">Data Team Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
