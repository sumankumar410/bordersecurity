const ANOMALY_TYPES = [
    "smuggling", "trafficking", "abnormal-behavior", "restricted-entry", "crowd-gathering"
];
const ANOMALY_DESCRIPTIONS = {
    "smuggling": ["Unusual object transfer detected near border fence", "Group movement with unidentified packages"],
    "trafficking": ["Repeated vehicle at checkpoint after hours", "Night movement pattern detected"],
    "abnormal-behavior": ["Running detected in restricted zone", "Unusual loitering near perimeter"],
    "restricted-entry": ["Unauthorized entry attempt at sector gate", "Perimeter breach detected"],
    "crowd-gathering": ["Unexpected crowd formation near border", "Large group assembly in restricted area"],
};
const STATES = ["JK", "PB", "RJ", "GJ"];
const PLATE_PREFIXES = ["JK01", "JK02", "PB10", "PB65", "RJ19", "RJ14", "GJ12", "GJ01", "HR26", "DL4C", "UP32"];
export function generatePlate() {
    const prefix = PLATE_PREFIXES[Math.floor(Math.random() * PLATE_PREFIXES.length)];
    const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const num = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}${l1}${l2}${num}`;
}
export function generateCamerasForVillage(villageId, villageName) {
    const count = 1 + Math.floor(Math.random() * 3); // 1-3 cameras
    return Array.from({ length: count }, (_, i) => ({
        id: `CAM-${villageId}-${String(i + 1).padStart(2, "0")}`,
        villageId,
        label: `${villageName} ${["Gate", "Perimeter", "Checkpoint", "Tower"][i] || "Cam"} ${i + 1}`,
        status: Math.random() > 0.15 ? "online" : "offline",
        signalStrength: Math.floor(40 + Math.random() * 60),
    }));
}
export function generateRandomAnomaly(villageId, cameraId) {
    const type = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)];
    const descs = ANOMALY_DESCRIPTIONS[type];
    return {
        id: crypto.randomUUID(),
        villageId,
        cameraId,
        type,
        description: descs[Math.floor(Math.random() * descs.length)],
        timestamp: Date.now(),
        severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
    };
}
export function generateVehicleLog(villageId, cameraId) {
    const flagged = Math.random() < 0.2;
    return {
        id: crypto.randomUUID(),
        plate: generatePlate(),
        villageId,
        cameraId,
        timestamp: Date.now(),
        flagged,
        status: flagged ? (Math.random() < 0.3 ? "high-risk" : "suspicious") : "normal",
    };
}
