import { useState, useRef } from "react";
import { UserPlus, Mail, User, CheckCircle, AlertCircle } from "lucide-react";
import WebcamCapture from "./WebcamCapture";
import { api } from "../api";

export default function RegisterPage({ onRegistered }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // { success, message }
  const webcamRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())   return alert("Please enter your name.");

    setLoading(true);
    setResult(null);
    try {
      // Capture live face directly from webcam
      const blob = await webcamRef.current.capture();
      if (!blob) throw new Error("Could not capture image from webcam.");

      const data = await api.register(name.trim(), email.trim() || null, blob);
      setResult({ success: true, message: data.message });
      setName(""); setEmail("");
      onRegistered?.();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Register Your Face</h1>
        <p className="page-subtitle">
          Just enter your details and look at the camera. Your live face will be registered automatically upon submission.
        </p>
      </div>

      <div className="two-col">
        {/* ── Left – Webcam ── */}
        <div className="card">
          <h2 className="card-title">
            <User size={18} /> Live Camera Feed
          </h2>
          <WebcamCapture
            ref={webcamRef}
            hideUI={true}
          />
        </div>

        {/* ── Right – Form ── */}
        <div className="card">
          <h2 className="card-title">
            <UserPlus size={18} /> Your Details
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <User size={12} style={{ display: "inline", marginRight: 4 }} />
                Full Name *
              </label>
              <input
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={12} style={{ display: "inline", marginRight: 4 }} />
                Email Address (optional)
              </label>
              <input
                className="form-input"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginTop: "1.75rem" }}>
              <button
                type="submit"
                className="btn btn-success btn-full"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <><div className="spinner" /> Registering…</>
                ) : (
                  <><CheckCircle size={17} /> Register Face</>
                )}
              </button>
            </div>
          </form>

          {/* Result banner */}
          {result && (
            <div className={`result-banner ${result.success ? "success" : "error"}`}>
              <span className="result-icon">
                {result.success ? "🎉" : "❌"}
              </span>
              <div>
                <div className="result-name">
                  {result.success ? "Registration Successful!" : "Registration Failed"}
                </div>
                <div className="result-meta">{result.message}</div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: "var(--radius-md)"
          }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-light)", marginBottom: "0.5rem" }}>
              📸 Tips for best results
            </p>
            <ul style={{ fontSize: "0.8rem", color: "var(--text-secondary)", paddingLeft: "1.1rem", lineHeight: "1.8" }}>
              <li>Ensure good lighting on your face</li>
              <li>Look directly at the camera when you click Register</li>
              <li>Remove glasses or hats if possible</li>
              <li>Keep a neutral expression</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
