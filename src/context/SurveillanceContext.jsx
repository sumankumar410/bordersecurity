import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { villages } from "@/data/villages";
import { generateCamerasForVillage, generateRandomAnomaly, generateVehicleLog, } from "@/data/surveillance";
const SurveillanceContext = createContext(null);
export const SurveillanceProvider = ({ children }) => {
    const [cameras] = useState(() => villages.flatMap(v => generateCamerasForVillage(v.id, v.name)));
    const [vehicleLogs, setVehicleLogs] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const intervalRef = useRef();
    // Simulate periodic detections
    useEffect(() => {
        // Initial seed
        const onlineCams = cameras.filter(c => c.status === "online");
        const initial = [];
        for (let i = 0; i < 15; i++) {
            const cam = onlineCams[Math.floor(Math.random() * onlineCams.length)];
            if (cam) {
                const log = generateVehicleLog(cam.villageId, cam.id);
                log.timestamp = Date.now() - Math.floor(Math.random() * 3600000);
                initial.push(log);
            }
        }
        setVehicleLogs(initial);
        // Periodic simulation
        intervalRef.current = setInterval(() => {
            const cam = onlineCams[Math.floor(Math.random() * onlineCams.length)];
            if (!cam)
                return;
            // 60% chance vehicle, 40% chance anomaly
            if (Math.random() < 0.6) {
                setVehicleLogs(prev => [generateVehicleLog(cam.villageId, cam.id), ...prev].slice(0, 200));
            }
            else {
                setAnomalies(prev => [generateRandomAnomaly(cam.villageId, cam.id), ...prev].slice(0, 100));
            }
        }, 5000);
        return () => clearInterval(intervalRef.current);
    }, [cameras]);
    const updateVehicleStatus = useCallback((id, status) => {
        setVehicleLogs(prev => prev.map(v => v.id === id ? { ...v, status, flagged: status !== "normal" } : v));
    }, []);
    const stats = {
        totalVehicles: vehicleLogs.length,
        suspiciousCount: vehicleLogs.filter(v => v.status !== "normal").length,
        activeCameras: cameras.filter(c => c.status === "online").length,
        alertsToday: anomalies.length,
    };
    return (<SurveillanceContext.Provider value={{ cameras, vehicleLogs, anomalies, updateVehicleStatus, stats }}>
      {children}
    </SurveillanceContext.Provider>);
};
export const useSurveillance = () => {
    const ctx = useContext(SurveillanceContext);
    if (!ctx)
        throw new Error("useSurveillance must be used within SurveillanceProvider");
    return ctx;
};
