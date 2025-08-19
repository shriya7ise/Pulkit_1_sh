import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, Settings, Home } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin", label: "Admin", icon: Settings },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-1 p-4 bg-card/50 backdrop-blur-sm border-b border-border">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
            D2C Platform
          </span>
        </Link>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "transition-all duration-200",
                isActive && "shadow-glow"
              )}
            >
              <Link to={item.path} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}