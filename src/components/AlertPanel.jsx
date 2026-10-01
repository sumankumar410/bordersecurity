import React, { useState } from "react";
import { villages } from "@/data/villages";
import { useComm } from "@/context/CommContext";
import { AlertTriangle, Send, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const AlertPanel = ({ currentVillage, otherVillages }) => {
    const { sendMessage, getAlertsForVillage } = useComm();
    const [alertText, setAlertText] = useState("");
    const [broadcast, setBroadcast] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState("");
    const [error, setError] = useState("");
    const alerts = getAlertsForVillage(currentVillage.id);
    const handleSendAlert = () => {
        setError("");
        if (!alertText.trim()) {
            setError("Alert message cannot be empty.");
            return;
        }
        if (!broadcast && !selectedReceiver) {
            setError("Select a receiver village or enable broadcast.");
            return;
        }
        sendMessage({
            from: currentVillage.id,
            to: broadcast ? "ALL" : selectedReceiver,
            text: alertText.trim(),
            type: "alert",
        });
        setAlertText("");
    };
    return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <AlertTriangle className="w-4 h-4 text-warning"/>
          <span className="text-sm font-mono tracking-wider text-muted-foreground">SEND ALERT</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={broadcast} onChange={e => setBroadcast(e.target.checked)} className="accent-primary"/>
              <span className="text-sm font-mono text-muted-foreground">BROADCAST TO ALL</span>
            </label>
          </div>

          {!broadcast && (<div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
                SELECT RECEIVER VILLAGE
              </label>
              <select value={selectedReceiver} onChange={e => setSelectedReceiver(e.target.value ? Number(e.target.value) : "")} className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm font-mono text-foreground">
                <option value="">-- Select Village --</option>
                {otherVillages.map(v => (<option key={v.id} value={v.id}>{v.name} (#{v.id})</option>))}
              </select>
            </div>)}

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
              ALERT MESSAGE
            </label>
            <Input value={alertText} onChange={e => setAlertText(e.target.value)} placeholder="Enter alert details..." className="bg-secondary border-border font-mono text-sm"/>
          </div>

          {error && (<p className="text-xs font-mono text-destructive">{error}</p>)}

          <Button onClick={handleSendAlert} className="w-full font-mono tracking-wider text-sm">
            <Send className="w-4 h-4 mr-2"/>
            {broadcast ? "BROADCAST ALERT" : "SEND ALERT"}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Radio className="w-4 h-4 text-destructive"/>
          <span className="text-sm font-mono tracking-wider text-muted-foreground">INCOMING ALERTS</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.length === 0 && (<p className="text-xs font-mono text-muted-foreground/50 text-center py-8">
              No alerts received.
            </p>)}
          {alerts.map(alert => {
            const fromVillage = villages.find(v => v.id === alert.from);
            return (<div key={alert.id} className="p-3 rounded bg-destructive/10 border border-destructive/20 animate-slide-in-right">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-destructive font-bold">
                    ⚠ FROM: {fromVillage?.name.toUpperCase() || alert.from}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{alert.text}</p>
                {alert.to === "ALL" && (<span className="inline-block mt-1 text-xs font-mono px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                    BROADCAST
                  </span>)}
              </div>);
        })}
        </div>
      </div>
    </div>);
};
export default AlertPanel;
