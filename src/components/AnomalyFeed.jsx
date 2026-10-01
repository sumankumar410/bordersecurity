import React from "react";
import { useSurveillance } from "@/context/SurveillanceContext";
import { villages } from "@/data/villages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap } from "lucide-react";
const severityColor = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-primary text-primary-foreground",
    low: "bg-muted text-muted-foreground",
};
const AnomalyFeed = () => {
    const { anomalies } = useSurveillance();
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-destructive"/>
        <span className="text-xs font-mono text-destructive tracking-wider">AI ANOMALY DETECTION FEED</span>
        {anomalies.length > 0 && (<Badge variant="destructive" className="font-mono text-[10px] animate-pulse">{anomalies.length} ALERTS</Badge>)}
      </div>

      <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-auto">
        {anomalies.slice(0, 50).map(a => {
            const v = villages.find(v => v.id === a.villageId);
            return (<Card key={a.id} className={`border-border bg-card/80 ${a.severity === "critical" ? "border-destructive/50 animate-pulse" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === "critical" || a.severity === "high" ? "text-destructive" : "text-warning"}`}/>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold">{a.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground">{v?.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">|</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{a.cameraId}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">|</span>
                        <span className="text-[10px] font-mono text-muted-foreground capitalize">{a.type.replace("-", " ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge className={`${severityColor[a.severity]} font-mono text-[10px]`}>{a.severity.toUpperCase()}</Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>);
        })}
        {anomalies.length === 0 && (<div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30"/>
            <p className="text-xs font-mono">No anomalies detected — AI monitoring active</p>
          </div>)}
      </div>
    </div>);
};
export default AnomalyFeed;
