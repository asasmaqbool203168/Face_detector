import { useState } from "react";
import { UserPlus, ScanFace, Users, Cpu } from "lucide-react";
import { Toaster } from "react-hot-toast";

import RegisterPage  from "./components/RegisterPage";
import RecognizePage from "./components/RecognizePage";
import UsersPage     from "./components/UsersPage";
import "./index.css";

const TABS = [
  { id: "register",  label: "Register",  Icon: UserPlus  },
  { id: "recognize", label: "Recognize", Icon: ScanFace  },
  { id: "users",     label: "Users",     Icon: Users     },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState("register");
  const [refreshUsers, setRefreshUsers] = useState(0);

  // Called after a successful registration → refreshes the users table
  const handleRegistered = () => setRefreshUsers((n) => n + 1);

  return (
    <div className="app-wrapper">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          },
        }}
      />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Cpu size={20} color="#fff" />
          </div>
          <span className="brand-text">FaceID System</span>
        </div>

        <div className="nav-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-tab ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          v1.0.0
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="main-content">
        {activeTab === "register"  && <RegisterPage  onRegistered={handleRegistered} />}
        {activeTab === "recognize" && <RecognizePage />}
        {activeTab === "users"     && <UsersPage refreshTrigger={refreshUsers} />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(15,21,39,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        padding: "0.75rem 0",
        zIndex: 100,
      }} className="mobile-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.3rem",
              background: "none", border: "none", cursor: "pointer",
              color: activeTab === id ? "var(--accent-light)" : "var(--text-muted)",
              fontSize: "0.7rem", fontWeight: 600,
              transition: "color 0.2s",
            }}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
