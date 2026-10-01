import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Imports from app
import { villages, authenticateUser } from "@/data/villages";
import {
  generatePlate,
  generateCamerasForVillage,
  generateRandomAnomaly,
  generateVehicleLog,
} from "@/data/surveillance";
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CommProvider, useComm } from "@/context/CommContext";
import { SurveillanceProvider, useSurveillance } from "@/context/SurveillanceContext";

import LoginPage from "@/pages/LoginPage";
import TopBar from "@/components/TopBar";
import VillageSelector from "@/components/VillageSelector";
import ChatPanel from "@/components/ChatPanel";
import AlertPanel from "@/components/AlertPanel";
import AnomalyFeed from "@/components/AnomalyFeed";
import VehicleLogPanel from "@/components/VehicleLogPanel";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import VillageOverview from "@/components/VillageOverview";
import Dashboard from "@/pages/Dashboard";

// 1. DATA & LOGIC TESTS
describe("Data Models & Auth Logic", () => {
  it("should have valid villages list including admin", () => {
    expect(villages.length).toBeGreaterThan(30);
    const admin = villages.find((v) => v.username === "admin");
    expect(admin).toBeDefined();
    expect(admin.id).toBe(0);
    expect(admin.name).toBe("Central Command HQ");
    expect(admin.sector).toBe("National Command HQ");
  });

  it("should authenticate admin with admin123 and 1234", () => {
    const res1 = authenticateUser("admin", "admin123");
    expect(res1).not.toBeNull();
    expect(res1?.username).toBe("admin");

    const res2 = authenticateUser("admin", "1234");
    expect(res2).not.toBeNull();
    expect(res2?.username).toBe("admin");
  });

  it("should authenticate border sector units with password 1234", () => {
    const user = authenticateUser("amritsar_hq", "1234");
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Amritsar");
    expect(user?.state).toBe("Punjab");
  });

  it("should reject invalid credentials", () => {
    expect(authenticateUser("admin", "wrong")).toBeNull();
    expect(authenticateUser("nonexistent_user", "1234")).toBeNull();
    expect(authenticateUser("", "")).toBeNull();
  });
});

// 2. SURVEILLANCE GENERATORS
describe("Surveillance Generators", () => {
  it("should generate valid vehicle license plates", () => {
    const plate = generatePlate();
    expect(plate).toBeDefined();
    expect(typeof plate).toBe("string");
    expect(plate.length).toBeGreaterThanOrEqual(8);
  });

  it("should generate cameras for a village", () => {
    const cams = generateCamerasForVillage(1, "Kupwara");
    expect(cams.length).toBeGreaterThanOrEqual(1);
    expect(cams[0]).toHaveProperty("id");
    expect(cams[0]).toHaveProperty("villageId", 1);
    expect(cams[0]).toHaveProperty("status");
    expect(cams[0]).toHaveProperty("signalStrength");
  });

  it("should generate random anomalies with valid severities", () => {
    const anomaly = generateRandomAnomaly(1, "CAM-01");
    expect(anomaly).toHaveProperty("id");
    expect(anomaly).toHaveProperty("villageId", 1);
    expect(anomaly).toHaveProperty("cameraId", "CAM-01");
    expect(["low", "medium", "high", "critical"]).toContain(anomaly.severity);
  });

  it("should generate vehicle log entries", () => {
    const log = generateVehicleLog(1, "CAM-01");
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("plate");
    expect(log).toHaveProperty("status");
    expect(["normal", "suspicious", "high-risk"]).toContain(log.status);
  });
});

// 3. UTILITIES
describe("Utility Functions", () => {
  it("should merge tailwind classes properly with cn()", () => {
    const result = cn("p-4 text-red-500", "p-6", false && "hidden", "text-blue-500");
    expect(result).toContain("p-6");
    expect(result).not.toContain("p-4");
    expect(result).toContain("text-blue-500");
  });
});

// 4. CONTEXT PROVIDERS TEST
describe("Contexts Operations", () => {
  it("AuthContext handles login, session storage and logout", async () => {
    const TestComponent = () => {
      const { village, login, logout, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="status">{isAuthenticated ? "auth" : "guest"}</span>
          <span data-testid="user">{village?.username || "none"}</span>
          <button onClick={() => login("admin", "admin123")}>Do Login</button>
          <button onClick={logout}>Do Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("status").textContent).toBe("guest");
    expect(screen.getByTestId("user").textContent).toBe("none");

    // Click Login
    fireEvent.click(screen.getByText("Do Login"));
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("auth");
      expect(screen.getByTestId("user").textContent).toBe("admin");
    });

    // Click Logout
    fireEvent.click(screen.getByText("Do Logout"));
    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("guest");
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
  });

  it("CommContext handles sendMessage, conversation filtering, and alerts", () => {
    const TestComm = () => {
      const { sendMessage, getConversation, getAlertsForVillage } = useComm();
      const convo = getConversation(1, 2);
      const alerts = getAlertsForVillage(2);

      return (
        <div>
          <button
            onClick={() =>
              sendMessage({
                from: 1,
                to: 2,
                text: "Sector Alpha secure",
                type: "text",
              })
            }
          >
            Send Text
          </button>
          <button
            onClick={() =>
              sendMessage({
                from: 1,
                to: "ALL",
                text: "High Alert at Border Fence",
                type: "alert",
              })
            }
          >
            Send Alert
          </button>
          <div data-testid="convo-count">{convo.length}</div>
          <div data-testid="alerts-count">{alerts.length}</div>
        </div>
      );
    };

    render(
      <CommProvider>
        <TestComm />
      </CommProvider>
    );

    expect(screen.getByTestId("convo-count").textContent).toBe("0");
    expect(screen.getByTestId("alerts-count").textContent).toBe("0");

    fireEvent.click(screen.getByText("Send Text"));
    expect(screen.getByTestId("convo-count").textContent).toBe("1");

    fireEvent.click(screen.getByText("Send Alert"));
    expect(screen.getByTestId("alerts-count").textContent).toBe("1");
  });

  it("SurveillanceContext provides cameras and stats", () => {
    const TestSurv = () => {
      const { cameras, stats } = useSurveillance();
      return (
        <div>
          <span data-testid="cam-count">{cameras.length}</span>
          <span data-testid="stats-total">{stats.totalVehicles}</span>
        </div>
      );
    };

    render(
      <SurveillanceProvider>
        <TestSurv />
      </SurveillanceProvider>
    );

    expect(Number(screen.getByTestId("cam-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("stats-total").textContent)).toBeGreaterThanOrEqual(0);
  });
});

// 5. COMPONENT INTERFACES
describe("Component Rendering and User Interactions", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("LoginPage renders and shows authentication terminal", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByText("RAKSHANET")).toBeInTheDocument();
    expect(screen.getByText(/AUTHENTICATION TERMINAL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. admin or amritsar_hq/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AUTHENTICATE/i })).toBeInTheDocument();
  });

  it("LoginPage shows error message on wrong credentials", async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const userInput = screen.getByPlaceholderText(/e\.g\. admin or amritsar_hq/i);
    const passInput = screen.getByPlaceholderText(/e\.g\. admin123 or 1234/i);
    const submitBtn = screen.getByRole("button", { name: /AUTHENTICATE/i });

    fireEvent.change(userInput, { target: { value: "invalid_user" } });
    fireEvent.change(passInput, { target: { value: "wrong_password" } });
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it("TopBar renders village info when authenticated", () => {
    const adminVillage = villages.find((v) => v.username === "admin");
    sessionStorage.setItem("rn_village", JSON.stringify(adminVillage));

    render(
      <AuthProvider>
        <TopBar />
      </AuthProvider>
    );

    expect(screen.getByText(/CENTRAL COMMAND HQ/i)).toBeInTheDocument();
    expect(screen.getByText(/SECURE CHANNEL/i)).toBeInTheDocument();
  });

  it("VillageSelector searches and selects village", () => {
    const onSelect = vi.fn();
    const otherVillages = villages.slice(1, 10);
    const currentVillage = villages[0];

    render(
      <VillageSelector
        villages={otherVillages}
        selectedId={null}
        onSelect={onSelect}
        currentVillage={currentVillage}
      />
    );

    expect(screen.getByPlaceholderText(/Search village\.\.\./i)).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Search village\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "Keran" } });
    expect(screen.getByText("Keran")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Keran"));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("ChatPanel allows sending secure message", () => {
    const currentVillage = villages[0]; // admin
    const receiverVillage = villages[1]; // Kupwara

    render(
      <CommProvider>
        <ChatPanel senderVillage={currentVillage} receiverVillageId={receiverVillage.id} />
      </CommProvider>
    );

    expect(screen.getByText(/ENCRYPTED/i)).toBeInTheDocument();
    const msgInput = screen.getByPlaceholderText(/Type secure message\.\.\./i);
    fireEvent.change(msgInput, { target: { value: "Border patrol reporting status clear" } });
    fireEvent.keyDown(msgInput, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Border patrol reporting status clear")).toBeInTheDocument();
  });

  it("AlertPanel handles sending alert messages", () => {
    const currentVillage = villages[0];
    const otherVillages = villages.slice(1, 5);

    render(
      <CommProvider>
        <AlertPanel currentVillage={currentVillage} otherVillages={otherVillages} />
      </CommProvider>
    );

    expect(screen.getAllByText("SEND ALERT")[0]).toBeInTheDocument();
    const alertInput = screen.getByPlaceholderText(/Enter alert details\.\.\./i);
    fireEvent.change(alertInput, { target: { value: "Perimeter breach detected sector 4" } });

    // Enable broadcast
    const broadcastCheckbox = screen.getByLabelText(/BROADCAST TO ALL/i);
    fireEvent.click(broadcastCheckbox);

    const sendBtn = screen.getByRole("button", { name: /BROADCAST ALERT/i });
    fireEvent.click(sendBtn);

    // Alert should appear in incoming alerts
    expect(screen.getByText("Perimeter breach detected sector 4")).toBeInTheDocument();
  });

  it("AnomalyFeed displays anomalies or monitoring active", () => {
    render(
      <SurveillanceProvider>
        <AnomalyFeed />
      </SurveillanceProvider>
    );

    expect(screen.getByText(/AI ANOMALY DETECTION FEED/i)).toBeInTheDocument();
  });

  it("VehicleLogPanel allows filtering and searching plates", () => {
    render(
      <SurveillanceProvider>
        <VehicleLogPanel />
      </SurveillanceProvider>
    );

    expect(screen.getByText(/ANPR VEHICLE LOG/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search plate\.\.\./i)).toBeInTheDocument();
  });

  it("AnalyticsPanel renders statistics cards", () => {
    render(
      <SurveillanceProvider>
        <AnalyticsPanel />
      </SurveillanceProvider>
    );

    expect(screen.getByText(/INTELLIGENCE ANALYTICS/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Vehicles/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Cameras/i)).toBeInTheDocument();
  });

  it("VillageOverview renders station details and state groups", () => {
    const currentVillage = villages[0];

    render(<VillageOverview currentVillage={currentVillage} />);

    expect(screen.getByText(/YOUR STATION/i)).toBeInTheDocument();
    expect(screen.getAllByText(currentVillage.name).length).toBeGreaterThan(0);
    expect(screen.getByText(/JAMMU & KASHMIR/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PUNJAB/i)[0]).toBeInTheDocument();
  });

  it("Dashboard tab navigation works across COMMS, ALERTS, ANOMALIES, etc.", () => {
    const adminVillage = villages.find((v) => v.username === "admin");
    sessionStorage.setItem("rn_village", JSON.stringify(adminVillage));

    render(
      <AuthProvider>
        <CommProvider>
          <SurveillanceProvider>
            <Dashboard />
          </SurveillanceProvider>
        </CommProvider>
      </AuthProvider>
    );

    // Initial tab is COMMS
    expect(screen.getByText(/SELECT A RECEIVER VILLAGE/i)).toBeInTheDocument();

    // Click ALERTS tab
    fireEvent.click(screen.getByRole("button", { name: /ALERTS/i }));
    expect(screen.getAllByText("SEND ALERT")[0]).toBeInTheDocument();

    // Click AI DETECT tab
    fireEvent.click(screen.getByRole("button", { name: /AI DETECT/i }));
    expect(screen.getByText(/AI ANOMALY DETECTION FEED/i)).toBeInTheDocument();

    // Click ANPR tab
    fireEvent.click(screen.getByRole("button", { name: /ANPR/i }));
    expect(screen.getByText(/ANPR VEHICLE LOG/i)).toBeInTheDocument();

    // Click INTEL tab
    fireEvent.click(screen.getByRole("button", { name: /INTEL/i }));
    expect(screen.getByText(/INTELLIGENCE ANALYTICS/i)).toBeInTheDocument();

    // Click OVERVIEW tab
    fireEvent.click(screen.getByRole("button", { name: /OVERVIEW/i }));
    expect(screen.getByText(/YOUR STATION/i)).toBeInTheDocument();
  });
});
