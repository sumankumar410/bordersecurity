import React from "react";
import { villages } from "@/data/villages";
import { MapPin, Shield, Radio } from "lucide-react";
const VillageOverview = ({ currentVillage }) => {
    const grouped = villages.reduce((acc, v) => {
        if (!acc[v.state])
            acc[v.state] = [];
        acc[v.state].push(v);
        return acc;
    }, {});
    return (<div className="space-y-6">
      <div className="bg-card border border-primary/30 rounded-lg p-4 glow-primary">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary"/>
          <span className="font-mono text-sm tracking-wider text-primary">YOUR STATION</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">VILLAGE</p>
            <p className="text-lg font-bold text-primary">{currentVillage.name}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">ID</p>
            <p className="text-lg font-bold font-mono">#{currentVillage.id}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">SECTOR</p>
            <p className="text-lg font-bold">{currentVillage.sector}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">COORDINATES</p>
            <p className="text-sm font-mono">{currentVillage.lat}°N, {currentVillage.lng}°E</p>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([state, vils]) => (<div key={state} className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-secondary/50 border-b border-border">
            <h3 className="text-sm font-mono tracking-wider text-muted-foreground">{state.toUpperCase()}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {vils.map(v => {
                const isCurrent = v.id === currentVillage.id;
                return (<div key={v.id} className={`p-3 border-b border-r border-border/50 ${isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}/>
                    <span className={`text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>
                      {v.name}
                    </span>
                    {isCurrent && (<span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">YOU</span>)}
                  </div>
                  <div className="ml-6 mt-1 flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{v.id}</span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground">{v.sector}</span>
                  </div>
                  <div className="ml-6 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Radio className={`w-2.5 h-2.5 ${isCurrent ? "text-success" : "text-muted-foreground/30"}`}/>
                      <span className={`text-xs font-mono ${isCurrent ? "text-success" : "text-muted-foreground/50"}`}>
                        {isCurrent ? "ONLINE" : "VIEW ONLY"}
                      </span>
                    </div>
                  </div>
                </div>);
            })}
          </div>
        </div>))}
    </div>);
};
export default VillageOverview;
