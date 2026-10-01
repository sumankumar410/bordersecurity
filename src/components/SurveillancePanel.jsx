import React, { useState, useEffect, useRef } from "react";
import { useSurveillance } from "@/context/SurveillanceContext";
import { useAuth } from "@/context/AuthContext";
import { villages } from "@/data/villages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Wifi, WifiOff, Maximize2, X } from "lucide-react";
// ✅ CAMERA FEED COMPONENT (OUTSIDE)
const CameraFeed = ({ camera, villageName, onExpand }) => {
    const [time, setTime] = useState(new Date());
    const videoRef = useRef(null);
    // ⏱ Time update
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    // 🎥 Webcam fallback
    useEffect(() => {
        if (camera.status === "online" && !camera.streamUrl) {
            navigator.mediaDevices?.getUserMedia?.({ video: true })
                ?.then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
                ?.catch((err) => console.error("Camera error:", err));
        }
    }, [camera.status, camera.streamUrl]);
    const isOnline = camera.status === "online";
    return (<Card className="overflow-hidden border bg-card/80">
      <div className="relative aspect-video bg-black cursor-pointer group" onClick={onExpand}>
        {isOnline ? (<>
            {/* 🎥 LIVE VIDEO */}
            {camera.streamUrl ? (<video src={camera.streamUrl} autoPlay controls muted className="w-full h-full object-cover"/>) : (<video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>)}

            {/* 🔴 LIVE indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-[10px] font-mono text-red-500 font-bold">
                LIVE
              </span>
            </div>

            {/* 🕒 Timestamp */}
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/70">
              {time.toLocaleTimeString()} | {camera.id}
            </div>

            {/* 🔍 Expand icon */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-4 h-4 text-white"/>
            </div>
          </>) : (<div className="flex flex-col items-center justify-center h-full text-gray-400">
            <WifiOff className="w-8 h-8"/>
            <span className="text-xs font-mono">NO SIGNAL</span>
          </div>)}
      </div>

      <CardContent className="p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Video className="w-3 h-3"/>
          <span className="text-xs font-mono">{camera.label}</span>
        </div>

        {isOnline ? (<div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-green-500"/>
            <span className="text-[10px]">{camera.signalStrength}%</span>
          </div>) : (<Badge variant="destructive" className="text-[10px]">
            OFFLINE
          </Badge>)}
      </CardContent>
    </Card>);
};
// ✅ MAIN PANEL
const SurveillancePanel = () => {
    const { cameras } = useSurveillance();
    const { village } = useAuth();
    const [expandedCam, setExpandedCam] = useState(null);
    const [filter, setFilter] = useState("mine");
    if (!village)
        return null;
    const filtered = filter === "mine"
        ? cameras.filter((c) => c.villageId === village.id)
        : cameras;
    return (<div className="space-y-4">

      {/* 🔘 Filter buttons */}
      <div className="flex gap-2">
        <button onClick={() => setFilter("mine")} className="px-3 py-1 border">
          MY POST
        </button>
        <button onClick={() => setFilter("all")} className="px-3 py-1 border">
          ALL FEEDS
        </button>
      </div>

      {/* 📹 Camera Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cam) => {
            const v = villages.find((v) => v.id === cam.villageId);
            return (<CameraFeed key={cam.id} camera={cam} villageName={v?.name || "Unknown"} onExpand={() => setExpandedCam(cam)}/>);
        })}
      </div>

      {/* 🔍 Fullscreen View */}
    {expandedCam && (<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setExpandedCam(null)} // ✅ click outside closes
        >
    <div className="relative w-[80%] h-[80%] bg-black" onClick={(e) => e.stopPropagation()} // 🛑 prevent closing when clicking inside
        >
      {/* ❌ Close Button */}
      <button onClick={(e) => {
                e.stopPropagation();
                setExpandedCam(null);
            }} className="absolute top-2 right-2 text-white z-10 bg-black/50 px-2 py-1 rounded">
        <X />
      </button>

      {/* 🎥 Video */}
      {expandedCam.streamUrl ? (<video src={expandedCam.streamUrl} autoPlay controls className="w-full h-full"/>) : (<video autoPlay muted className="w-full h-full" ref={(ref) => {
                    if (ref) {
                        navigator.mediaDevices
                            .getUserMedia({ video: true })
                            .then((stream) => (ref.srcObject = stream));
                    }
                }}/>)}
    </div>
  </div>)}
    </div>);
};
export default SurveillancePanel;
