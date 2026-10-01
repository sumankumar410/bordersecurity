import React from "react";
import { useSurveillance } from "@/context/SurveillanceContext";
import { villages } from "@/data/villages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, AlertTriangle, Video, Shield, Activity, TrendingUp } from "lucide-react";
const StatCard = ({ icon, label, value, sub, accent = "primary", }) => (<Card className="border-border bg-card/80">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">{label}</p>
          <p className={`text-2xl font-mono font-bold mt-1 text-${accent}`}>{value}</p>
          {sub && <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded bg-${accent}/10`}>{icon}</div>
      </div>
    </CardContent>
  </Card>);
const AnalyticsPanel = () => {
    const { stats, anomalies, vehicleLogs, cameras } = useSurveillance();
    // Anomaly breakdown
    const anomalyByType = {};
    anomalies.forEach(a => { anomalyByType[a.type] = (anomalyByType[a.type] || 0) + 1; });
    // Severity breakdown
    const severityCount = {};
    anomalies.forEach(a => { severityCount[a.severity] = (severityCount[a.severity] || 0) + 1; });
    // Top villages by alerts
    const alertsByVillage = {};
    anomalies.forEach(a => { alertsByVillage[a.villageId] = (alertsByVillage[a.villageId] || 0) + 1; });
    const topVillages = Object.entries(alertsByVillage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ village: villages.find(v => v.id === Number(id)), count }));
    // Repeated vehicles
    const plateCounts = {};
    vehicleLogs.forEach(v => { plateCounts[v.plate] = (plateCounts[v.plate] || 0) + 1; });
    const repeatedVehicles = Object.entries(plateCounts)
        .filter(([, c]) => c > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary"/>
        <span className="text-xs font-mono text-primary tracking-wider">INTELLIGENCE ANALYTICS</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Car className="w-5 h-5 text-primary"/>} label="Total Vehicles" value={stats.totalVehicles} sub="ANPR detections"/>
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-warning"/>} label="Suspicious" value={stats.suspiciousCount} sub="Flagged vehicles" accent="warning"/>
        <StatCard icon={<Video className="w-5 h-5 text-primary"/>} label="Active Cameras" value={stats.activeCameras} sub={`of ${cameras.length} total`}/>
        <StatCard icon={<Shield className="w-5 h-5 text-destructive"/>} label="Alerts Today" value={stats.alertsToday} sub="AI detections" accent="destructive"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Anomaly Breakdown */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">ANOMALY TYPES</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {Object.entries(anomalyByType).map(([type, count]) => (<div key={type} className="flex items-center justify-between">
                <span className="text-xs font-mono capitalize">{type.replace("-", " ")}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-primary/20 w-20">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((count / Math.max(...Object.values(anomalyByType))) * 100, 100)}%` }}/>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                </div>
              </div>))}
            {Object.keys(anomalyByType).length === 0 && (<p className="text-xs font-mono text-muted-foreground">No anomalies detected yet</p>)}
          </CardContent>
        </Card>

        {/* Top Alert Villages */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">TOP ALERT LOCATIONS</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {topVillages.map(({ village: v, count }, i) => (<div key={i} className="flex items-center justify-between">
                <span className="text-xs font-mono">{v?.name || "Unknown"}</span>
                <Badge variant="outline" className="font-mono text-[10px]">{count}</Badge>
              </div>))}
            {topVillages.length === 0 && (<p className="text-xs font-mono text-muted-foreground">No data yet</p>)}
          </CardContent>
        </Card>

        {/* Repeated Vehicles */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3 h-3"/> REPEATED VEHICLES
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {repeatedVehicles.map(([plate, count]) => (<div key={plate} className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold">{plate}</span>
                <Badge variant="destructive" className="font-mono text-[10px]">{count}x spotted</Badge>
              </div>))}
            {repeatedVehicles.length === 0 && (<p className="text-xs font-mono text-muted-foreground">No repeated vehicles</p>)}
          </CardContent>
        </Card>
      </div>

      {/* Severity */}
      <Card className="border-border bg-card/80">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">SEVERITY DISTRIBUTION</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex gap-4">
            {["critical", "high", "medium", "low"].map(sev => (<div key={sev} className="flex-1 text-center">
                <div className={`text-xl font-mono font-bold ${sev === "critical" ? "text-destructive" : sev === "high" ? "text-warning" : "text-primary"}`}>
                  {severityCount[sev] || 0}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">{sev}</div>
              </div>))}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default AnalyticsPanel;
