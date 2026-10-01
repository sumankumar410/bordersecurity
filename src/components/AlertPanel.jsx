import React, { useState } from "react";
import { villages } from "@/data/villages";
import { useComm } from "@/context/CommContext";
import { useToast } from "@/hooks/use-toast";
import { playAlertTone } from "@/utils/audio";
import { AlertTriangle, Send, Radio, CheckCircle2, ShieldAlert, Volume2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESET_ALERTS = [
  "🚨 Drone activity sighted near perimeter",
  "⚠️ Fence sensor trigger in sector grid",
  "🚗 Unregistered vehicle approaching checkpoint",
  "📡 Signal jamming detected on channel B",
];

const AlertPanel = ({ currentVillage, otherVillages }) => {
  const { sendMessage, getAlertsForVillage, getSentAlertsForVillage } = useComm();
  const { toast } = useToast();
  const [alertText, setAlertText] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [viewTab, setViewTab] = useState("incoming"); // 'incoming' | 'sent'

  const incomingAlerts = getAlertsForVillage(currentVillage.id);
  const sentAlerts = getSentAlertsForVillage ? getSentAlertsForVillage(currentVillage.id) : [];

  const handleSendAlert = () => {
    setError("");
    setSuccessInfo(null);

    if (!alertText.trim()) {
      setError("Alert message cannot be empty.");
      return;
    }
    if (!broadcast && !selectedReceiver) {
      setError("Select a receiver village or enable broadcast.");
      return;
    }

    const targetVillage = !broadcast ? otherVillages.find(v => v.id === selectedReceiver) : null;
    const targetName = broadcast ? "ALL OUTPOSTS (BROADCAST)" : (targetVillage?.name || `Sector #${selectedReceiver}`);

    // Send via comm context
    sendMessage({
      from: currentVillage.id,
      to: broadcast ? "ALL" : selectedReceiver,
      text: alertText.trim(),
      type: "alert",
    });

    // Play tactical siren tone
    playAlertTone("alarm");

    // Rich toast feedback
    toast({
      title: broadcast ? "🚨 BROADCAST ALERT TRANSMITTED" : "🚨 EMERGENCY ALERT SENT",
      description: `Dispatched to ${targetName} at ${new Date().toLocaleTimeString()}`,
      variant: "destructive",
    });

    // Show visual confirmation banner
    setSuccessInfo({
      message: alertText.trim(),
      target: targetName,
      time: new Date().toLocaleTimeString(),
      broadcast,
    });

    setAlertText("");
  };

  const displayedAlerts = viewTab === "incoming" ? incomingAlerts : sentAlerts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT: SEND ALERT */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-mono tracking-wider text-muted-foreground">SEND ALERT</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/30 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> AUDIO ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            {/* Broadcast Checkbox */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={broadcast}
                  onChange={(e) => {
                    setBroadcast(e.target.checked);
                    setError("");
                  }}
                  className="accent-primary"
                />
                <span className="text-sm font-mono text-muted-foreground">BROADCAST TO ALL</span>
              </label>
            </div>

            {/* Receiver Select */}
            {!broadcast && (
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
                  SELECT RECEIVER VILLAGE
                </label>
                <select
                  value={selectedReceiver}
                  onChange={(e) => {
                    setSelectedReceiver(e.target.value ? Number(e.target.value) : "");
                    setError("");
                  }}
                  className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm font-mono text-foreground"
                >
                  <option value="">-- Select Village --</option>
                  {otherVillages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (#{v.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1 tracking-wider">
                TACTICAL TEMPLATES (QUICK SELECT)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ALERTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAlertText(preset);
                      setError("");
                    }}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-secondary/80 hover:bg-secondary border border-border text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Message Input */}
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 tracking-wider">
                ALERT MESSAGE
              </label>
              <Input
                value={alertText}
                onChange={(e) => {
                  setAlertText(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAlert();
                  }
                }}
                placeholder="Enter alert details..."
                className="bg-secondary border-border font-mono text-sm"
              />
            </div>

            {error && <p className="text-xs font-mono text-destructive">{error}</p>}

            {/* Success Feedback Banner */}
            {successInfo && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <div className="font-bold">ALERT DISPATCHED & VERIFIED</div>
                  <div className="text-emerald-300/80 text-[11px] mt-0.5">
                    Target: {successInfo.target} | Time: {successInfo.time}
                  </div>
                  <div className="text-foreground/90 mt-1 italic font-sans text-xs">
                    "{successInfo.message}"
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSendAlert} className="w-full font-mono tracking-wider text-sm mt-4">
          <Send className="w-4 h-4 mr-2" />
          {broadcast ? "BROADCAST ALERT" : "SEND ALERT"}
        </Button>
      </div>

      {/* RIGHT: INCOMING / DISPATCHED ALERTS */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive" />
            <span className="text-sm font-mono tracking-wider text-muted-foreground">INCOMING ALERTS</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 bg-secondary/50 p-0.5 rounded border border-border">
            <button
              onClick={() => setViewTab("incoming")}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1 ${
                viewTab === "incoming"
                  ? "bg-destructive text-destructive-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              INBOX ({incomingAlerts.length})
            </button>
            <button
              onClick={() => setViewTab("sent")}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1 ${
                viewTab === "sent"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              DISPATCHED ({sentAlerts.length})
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
          {displayedAlerts.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <ShieldAlert className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs font-mono text-muted-foreground/50">
                {viewTab === "incoming" ? "No alerts received." : "No dispatched alerts yet."}
              </p>
              {viewTab === "incoming" && sentAlerts.length > 0 && (
                <p className="text-[11px] font-mono text-muted-foreground/70">
                  Tip: You have sent {sentAlerts.length} alert(s). Switch to "DISPATCHED" tab to view.
                </p>
              )}
            </div>
          )}

          {displayedAlerts.map((alert) => {
            const fromVillage = villages.find((v) => v.id === alert.from);
            const toVillage = villages.find((v) => v.id === alert.to);
            const isOutgoing = viewTab === "sent" || alert.from === currentVillage.id;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded border animate-slide-in-right ${
                  isOutgoing
                    ? "bg-primary/10 border-primary/20"
                    : "bg-destructive/10 border-destructive/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isOutgoing ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {isOutgoing ? (
                      <>📤 TO: {alert.to === "ALL" ? "BROADCAST (ALL OUTPOSTS)" : toVillage?.name.toUpperCase() || alert.to}</>
                    ) : (
                      <>⚠ FROM: {fromVillage?.name.toUpperCase() || alert.from}</>
                    )}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{alert.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  {alert.to === "ALL" && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                      BROADCAST
                    </span>
                  )}
                  {isOutgoing && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      DELIVERED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
