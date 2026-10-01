import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setTimeout(() => {
            const err = login(username, password);
            if (err)
                setError(err);
            setLoading(false);
        }, 800);
    };
    return (<div className="min-h-screen flex items-center justify-center tactical-grid relative overflow-hidden">
      <div className="absolute inset-0 scanline"/>

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary glow-primary mb-4">
            <Shield className="w-10 h-10 text-primary"/>
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-primary">
            RAKSHANET<span className="text-foreground">RA</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2 tracking-widest">
            SECURE BORDER INTELLIGENCE SYSTEM
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
            <Lock className="w-3 h-3 text-primary"/>
            <span>CLASSIFIED • AUTHORIZED PERSONNEL ONLY</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg p-6 glow-primary">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"/>
            <span className="text-sm font-mono text-muted-foreground tracking-wider">
              AUTHENTICATION TERMINAL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
                OFFICER USERNAME
              </label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. admin or amritsar_hq" className="bg-secondary border-border font-mono text-sm" required/>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
                ACCESS CODE
              </label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="e.g. admin123 or 1234" className="bg-secondary border-border font-mono text-sm" required/>
            </div>

            {error && (<div className="flex items-center gap-2 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0"/>
                {error}
              </div>)}

            <Button type="submit" disabled={loading} className="w-full font-mono tracking-wider text-sm h-11">
              {loading ? (<span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/>
                  AUTHENTICATING...
                </span>) : ("AUTHENTICATE")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Admin: admin / admin123 | Unit Code: 1234
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          Ministry of Defence • Government of India
        </p>
      </div>
    </div>);
};
export default LoginPage;
