import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, LogOut, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
const TopBar = () => {
    const { village, logout } = useAuth();
    return (<header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary"/>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-primary leading-none">
              RAKSHANET<span className="text-foreground">RA</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-secondary border border-border">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow"/>
            <span className="text-xs font-mono text-muted-foreground">SECURE CHANNEL</span>
          </div>

          {village && (<div className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 border border-primary/30">
              <Radio className="w-3 h-3 text-primary"/>
              <span className="text-xs font-mono text-primary">
                {village.name.toUpperCase()} • {village.id}
              </span>
            </div>)}

          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </header>);
};
export default TopBar;
