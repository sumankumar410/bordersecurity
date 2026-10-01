import React, { useState, useRef, useEffect } from "react";
import { villages } from "@/data/villages";
import { useComm } from "@/context/CommContext";
import { Send, Paperclip, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const ChatPanel = ({ senderVillage, receiverVillageId }) => {
    const { sendMessage, getConversation } = useComm();
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const receiver = villages.find(v => v.id === receiverVillageId);
    const conversation = receiver ? getConversation(senderVillage.id, receiver.id) : [];
    useEffect(() => {
        bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
    }, [conversation.length]);
    const handleSend = () => {
        if (!text.trim() || !receiver)
            return;
        sendMessage({
            from: senderVillage.id,
            to: receiver.id,
            text: text.trim(),
            type: "text",
        });
        setText("");
    };
    const handleFileSelect = () => {
        if (!receiver)
            return;
        sendMessage({
            from: senderVillage.id,
            to: receiver.id,
            text: "📎 File transferred securely",
            type: "file",
            fileName: "classified_document.enc",
        });
    };
    if (!receiverVillageId) {
        return (<div className="h-full flex flex-col items-center justify-center bg-card border border-border rounded-lg">
        <Lock className="w-12 h-12 text-muted-foreground/30 mb-4"/>
        <p className="text-muted-foreground font-mono text-sm">SELECT A RECEIVER VILLAGE</p>
        <p className="text-muted-foreground/50 font-mono text-xs mt-1">to establish secure communication channel</p>
      </div>);
    }
    return (<div className="h-full flex flex-col bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/30">
        <div>
          <p className="text-sm font-mono text-muted-foreground">
            <span className="text-primary">{senderVillage.name.toUpperCase()}</span>
            {" → "}
            <span className="text-foreground">{receiver?.name.toUpperCase()}</span>
          </p>
          <p className="text-xs font-mono text-muted-foreground">#{senderVillage.id} → #{receiver?.id}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-success">
          <ShieldCheck className="w-3.5 h-3.5"/>
          <span>ENCRYPTED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.length === 0 && (<div className="text-center text-muted-foreground/50 font-mono text-xs py-8">
            🔒 Secure channel established. No messages yet.
          </div>)}

        {conversation.map(msg => {
            const isSelf = msg.from === senderVillage.id;
            const fromVillage = villages.find(v => v.id === msg.from);
            return (<div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isSelf
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-secondary border border-border"}`}>
                <p className="text-xs font-mono text-muted-foreground mb-0.5">
                  {fromVillage?.name.toUpperCase()} • {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-sm">{msg.text}</p>
                {msg.fileName && (<p className="text-xs font-mono text-primary mt-1">📁 {msg.fileName}</p>)}
              </div>
            </div>);
        })}
        <div ref={bottomRef}/>
      </div>

      <div className="p-3 border-t border-border bg-secondary/30">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleFileSelect} className="shrink-0 text-muted-foreground hover:text-primary">
            <Paperclip className="w-4 h-4"/>
          </Button>
          <Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type secure message..." className="bg-background border-border font-mono text-sm"/>
          <Button size="icon" onClick={handleSend} disabled={!text.trim()} className="shrink-0">
            <Send className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>);
};
export default ChatPanel;
