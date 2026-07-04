import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoPlaceholder}>
            {/* You can replace this with an actual <img> tag for your logo */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to access your workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: "14px" }}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Demo Credentials</p>
          <div style={styles.demoGrid}>
            <div style={styles.demoItem}>
              <span style={styles.demoRole}>Employee</span>
              <span style={styles.demoCreds}>employee1@demo.com<br/>demo1234</span>
            </div>
            <div style={styles.demoItem}>
              <span style={styles.demoRole}>Admin</span>
              <span style={styles.demoCreds}>admin@demo.com<br/>admin1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual Identity Framework
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    padding: "40px 32px",
    boxSizing: "border-box"
  },
  header: {
    textAlign: "center",
    marginBottom: "32px"
  },
  logoPlaceholder: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    backgroundColor: "#e0e7ff",
    borderRadius: "14px",
    marginBottom: "16px"
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fef2f2",
    borderLeft: "3px solid #ef4444",
    padding: "10px 12px",
    borderRadius: "6px"
  },
  errorText: {
    margin: 0,
    fontSize: "13px",
    color: "#b91c1c",
    fontWeight: "500"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    marginTop: "8px"
  },
  demoSection: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px dashed #e2e8f0"
  },
  demoTitle: {
    margin: "0 0 12px 0",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#94a3b8",
    textAlign: "center"
  },
  demoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  demoItem: {
    backgroundColor: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    textAlign: "center"
  },
  demoRole: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "4px"
  },
  demoCreds: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    lineHeight: "1.4"
  }
};