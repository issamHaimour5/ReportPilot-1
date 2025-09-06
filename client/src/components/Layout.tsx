import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/reports":
        return "Reports";
      case "/integrations":
        return "Integrations";
      case "/automation":
        return "Automation";
      default:
        return "Dashboard";
    }
  };

  const getPageDescription = () => {
    switch (location) {
      case "/reports":
        return "View and manage your generated reports";
      case "/integrations":
        return "Connect and manage your project management tools";
      case "/automation":
        return "Configure smart automation rules and behavior learning";
      default:
        return "Monitor your team's progress and automation insights";
    }
  };

  return (
    <div className="flex h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{getPageTitle()}</h1>
              <p className="text-muted-foreground">{getPageDescription()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                data-testid="button-generate-report"
              >
                <i className="fas fa-refresh w-4 h-4"></i>
                Generate Report
              </button>
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                data-testid="button-new-automation"
              >
                <i className="fas fa-plus w-4 h-4"></i>
                New Automation
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
