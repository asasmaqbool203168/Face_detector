import { useState, useRef } from "react";
import { ScanFace, AlertCircle, CheckCircle, Zap } from "lucide-react";
import WebcamCapture from "./WebcamCapture";
import { api } from "../api";

export default function RecognizePage() {
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [camStatus, setCamStatus] = useState("idle");
  const webcamRef = useRef(null);

  const handleRecognize = async () => {
    setLoading(true);
    setResult(null);
    setCamStatus("scanning");
    try {
      const blob = await webcamRef.current.capture();
      if (!blob) throw new Error("Could not capture image from webcam.");

      const data = await api.recognize(blob);
      setResult(data);
      setCamStatus(data.recognized ? "success" : "error");
    } catch (err) {
      setResult({ recognized: false, message: err.message });
      setCamStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCamStatus("idle");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Face Recognition</h1>
        <p className="page-subtitle">
          Look at the camera and click Identify to verify yourself against the database.
        </p>
      </div>

      <div className="two-col">
        {/* ── Left – Webcam ── */}
        <div className="card">
          <h2 className="card-title">
            <ScanFace size={18} /> Live Camera Feed
          </h2>

          <WebcamCapture
            ref={webcamRef}
            status={camStatus}
            hideUI={true}
          />

          <div className="btn-strip" style={{ marginTop: "1rem" }}>
            <button
              className="btn btn-primary btn-full"
              onClick={handleRecognize}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" /> Identifying…</>
                : <><Zap size={16} /> Identify Face</>}
            </button>
          </div>
        </div>

        {/* ── Right – Result panel ── */}
        <div className="card">
          <h2 className="card-title">
            <CheckCircle size={18} /> Recognition Result
          </h2>

          {!result && !loading && (
            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
              <ScanFace size={64} style={{ margin: "0 auto 1rem", display: "block" }} />
              <h3>Awaiting Scan</h3>
              <p>Look directly at the camera and press "Identify Face" to begin.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
              <div className="spinner" style={{
                width: 48, height: 48,
                borderWidth: 4,
                margin: "0 auto 1.5rem",
                borderColor: "rgba(99,102,241,0.3)",
                borderTopColor: "var(--accent)"
              }} />
              <h3 style={{ color: "var(--accent-light)" }}>Analysing face…</h3>
              <p>Comparing against registered users</p>
            </div>
          )}

          {result && (
            <>
              {result.recognized ? (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  {/* Big success state */}
                  <div style={{
                    width: 90, height: 90,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--success), #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.5rem",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 0 30px var(--success-glow)"
                  }}>
                    ✓
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                    Recognised
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    {result.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    <span className="badge badge-success">
                      {result.confidence}% confidence
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID #{result.user_id}</span>
                  </div>
                  <div style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    fontSize: "0.9rem",
                    color: "var(--success)"
                  }}>
                    {result.message}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  {/* Not found state */}
                  <div style={{
                    width: 90, height: 90,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--danger), #dc2626)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.5rem",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 0 30px var(--danger-glow)"
                  }}>
                    ✗
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                    Not Recognised
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--danger)", marginBottom: "1.5rem" }}>
                    User does not exist.
                  </div>
                  <div style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)"
                  }}>
                    {result.message}
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Not registered yet?
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--accent-light)", fontWeight: 600 }}>
                      Go to the Register tab to add your face.
                    </p>
                  </div>
                </div>
              )}

              <button
                className="btn btn-ghost btn-full"
                style={{ marginTop: "1.5rem" }}
                onClick={handleReset}
              >
                Clear Result
              </button>
            </>
          )}
        </div>
      </div>

      {/* How it works strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.25rem",
        marginTop: "2.5rem"
      }}>
        {[
          { icon: "📸", title: "Capture", desc: "Live photo taken instantly" },
          { icon: "🧠", title: "Analyse", desc: "128-D face embeddings are extracted" },
          { icon: "✅", title: "Identify", desc: "Matched against the registered database" },
        ].map((step) => (
          <div key={step.title} className="card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{step.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{step.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
