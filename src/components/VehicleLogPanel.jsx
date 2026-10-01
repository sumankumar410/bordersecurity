import React, { useState } from "react";
import { useSurveillance } from "@/context/SurveillanceContext";
import { villages } from "@/data/villages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Car, AlertTriangle } from "lucide-react";
const VehicleLogPanel = () => {
    const { vehicleLogs, updateVehicleStatus } = useSurveillance();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const filtered = vehicleLogs.filter(v => {
        if (filter === "suspicious" && v.status === "normal")
            return false;
        if (filter === "high-risk" && v.status !== "high-risk")
            return false;
        if (search && !v.plate.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });
    const statusBadge = (status) => {
        switch (status) {
            case "high-risk": return <Badge variant="destructive" className="font-mono text-[10px]">HIGH RISK</Badge>;
            case "suspicious": return <Badge className="bg-warning text-warning-foreground font-mono text-[10px]">SUSPICIOUS</Badge>;
            default: return <Badge variant="outline" className="font-mono text-[10px]">NORMAL</Badge>;
        }
    };
    // Find repeated plates
    const plateCounts = {};
    vehicleLogs.forEach(v => { plateCounts[v.plate] = (plateCounts[v.plate] || 0) + 1; });
    return (<div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary"/>
          <span className="text-xs font-mono text-primary tracking-wider">ANPR VEHICLE LOG</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate..." className="pl-7 h-7 text-xs font-mono w-40 bg-background"/>
          </div>
          <div className="flex border border-border rounded overflow-hidden">
            {["all", "suspicious", "high-risk"].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 text-[10px] font-mono transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.toUpperCase()}</button>))}
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border bg-card/80">
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">PLATE</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">VILLAGE</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">CAMERA</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">TIME</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">STATUS</TableHead>
                  <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(log => {
            const v = villages.find(v => v.id === log.villageId);
            const isRepeated = (plateCounts[log.plate] || 0) > 1;
            return (<TableRow key={log.id} className={`border-border ${log.status === "high-risk" ? "bg-destructive/5" : log.status === "suspicious" ? "bg-warning/5" : ""}`}>
                      <TableCell className="font-mono text-xs font-bold">
                        <div className="flex items-center gap-1">
                          {log.plate}
                          {isRepeated && (<AlertTriangle className="w-3 h-3 text-warning"/>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{v?.name || "—"}</TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">{log.cameraId}</TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{statusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {log.status !== "normal" && (<button onClick={() => updateVehicleStatus(log.id, "normal")} className="text-[10px] font-mono px-2 py-0.5 border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors">CLEAR</button>)}
                          {log.status === "normal" && (<button onClick={() => updateVehicleStatus(log.id, "suspicious")} className="text-[10px] font-mono px-2 py-0.5 border border-warning/30 rounded text-warning hover:bg-warning/10 transition-colors">FLAG</button>)}
                          {log.status !== "high-risk" && (<button onClick={() => updateVehicleStatus(log.id, "high-risk")} className="text-[10px] font-mono px-2 py-0.5 border border-destructive/30 rounded text-destructive hover:bg-destructive/10 transition-colors">HIGH RISK</button>)}
                        </div>
                      </TableCell>
                    </TableRow>);
        })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default VehicleLogPanel;
