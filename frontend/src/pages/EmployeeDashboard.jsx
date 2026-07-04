import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getProfile, updateProfile } from "../services/authService";
import { checkIn, checkOut, getAttendance } from "../services/attendanceService";
import { applyLeave, getLeaveByEmployee } from "../services/leaveService";
import { getPayroll } from "../services/payrollService";

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState(null);

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [leaveType, setLeaveType] = useState("paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const todayStatus = attendance.find(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );
  const isCheckedIn = todayStatus && todayStatus.checkIn && !todayStatus.checkOut;
  const isCheckedOut = todayStatus && todayStatus.checkIn && todayStatus.checkOut;

  async function loadAll() {
    setLoading(true);
    const [profileData, attendanceData, leaveData, payrollData] = await Promise.all([
      getProfile(user.id),
      getAttendance(user.id),
      getLeaveByEmployee(user.id),
      getPayroll(user.id).catch(() => null),
    ]);
    setProfile(profileData);
    setPhone(profileData.phone || "");
    setAddress(profileData.address || "");
    setAttendance(attendanceData);
    setLeaves(leaveData);
    setPayroll(payrollData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCheckIn = async () => {
    setMessage("");
    try {
      await checkIn(user.id);
      setMessage("Checked in successfully.");
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleCheckOut = async () => {
    setMessage("");
    try {
      await checkOut(user.id);
      setMessage("Checked out successfully.");
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await updateProfile(user.id, { phone, address });
      setEditing(false);
      setMessage("Profile updated.");
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!startDate || !endDate) {
      setMessage("Please select both start and end dates.");
      return;
    }

    try {
      await applyLeave(user.id, {
        type: leaveType,
        startDate,
        endDate,
        remarks,
      });
      setMessage("Leave request submitted.");
      setStartDate("");
      setEndDate("");
      setRemarks("");
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: 12, color: "#64748b", fontWeight: "500" }}>Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top Header Row */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Employee Dashboard</h1>
          <p style={styles.subTitle}>Welcome back, {profile?.name || "Team Member"}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </div>

      {/* Global Status Notifications */}
      {message && (
        <div style={styles.messageBox}>
          <span style={{ fontSize: "18px" }}>ℹ️</span>
          <p style={styles.messageText}>{message}</p>
        </div>
      )}

      {/* Primary Grid Layout */}
      <div style={styles.dashboardGrid}>
        
        {/* Left Hand: Profile & Payroll info */}
        <div style={styles.leftColumn}>
          {/* Profile Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Personal Profile</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} style={styles.inlineEditBtn}>
                  Edit Details
                </button>
              )}
            </div>
            
            {!editing ? (
              <div style={styles.profileGrid}>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Full Name</span>
                  <span style={styles.profileValue}>{profile.name}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Email Address</span>
                  <span style={styles.profileValue}>{profile.email}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Job Designation</span>
                  <span style={styles.profileValue}>{profile.jobTitle}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Department</span>
                  <span style={styles.profileValue}>{profile.department}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Phone Contact</span>
                  <span style={styles.profileValue}>{profile.phone || "—"}</span>
                </div>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Residential Address</span>
                  <span style={styles.profileValue}>{profile.address || "—"}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} style={styles.formContainer}>
                <div style={styles.formRow}>
                  <label style={styles.fieldLabel}>Phone Number</label>
                  <input style={styles.textInput} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.fieldLabel}>Residential Address</label>
                  <input style={styles.textInput} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter home address" />
                </div>
                <div style={styles.formActions}>
                  <button type="button" onClick={() => setEditing(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payroll Section */}
          {payroll && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Payroll & Compensation</h2>
              </div>
              <div style={styles.payrollGrid}>
                <div style={styles.payrollBlock}>
                  <span style={styles.profileLabel}>Base Salary</span>
                  <span style={styles.payrollAmount}>₹{payroll.basic.toLocaleString()}</span>
                </div>
                <div style={styles.payrollBlock}>
                  <span style={styles.profileLabel}>HRA</span>
                  <span style={styles.payrollAmount}>₹{payroll.hra.toLocaleString()}</span>
                </div>
                <div style={styles.payrollBlock}>
                  <span style={styles.profileLabel}>Allowances</span>
                  <span style={styles.payrollAmount}>₹{payroll.allowances.toLocaleString()}</span>
                </div>
                <div style={{ ...styles.payrollBlock, gridColumn: "span 3", borderTop: "1px dashed #e2e8f0", paddingTop: 12, marginTop: 4 }}>
                  <span style={{ ...styles.profileLabel, color: "#4f46e5", fontWeight: "600" }}>Total Gross Earnings</span>
                  <span style={{ ...styles.payrollAmount, color: "#4f46e5", fontSize: "20px" }}>₹{payroll.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Hand: Action Items (Attendance and Time-off requests) */}
        <div style={styles.rightColumn}>
          {/* Attendance Actions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Time Tracking</h2>
            </div>
            
            <div style={styles.attendanceBanner}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Current Status Today:</span>
              <span style={{ 
                ...styles.badge, 
                backgroundColor: isCheckedOut ? "#f1f5f9" : isCheckedIn ? "#dcfce7" : "#fef3c7",
                color: isCheckedOut ? "#64748b" : isCheckedIn ? "#166534" : "#92400e"
              }}>
                {todayStatus ? todayStatus.status : "Not Flagged"}
              </span>
            </div>

            <p style={styles.attendanceMeta}>
              {todayStatus
                ? `Logged intervals: (Clock-in: ${todayStatus.checkIn || "—"} | Clock-out: ${todayStatus.checkOut || "—"})`
                : "You haven't initiated a time block for today yet."}
            </p>

            <div style={styles.attendanceActions}>
              <button 
                onClick={handleCheckIn} 
                disabled={isCheckedIn || isCheckedOut} 
                style={{ ...styles.primaryBtn, ...((isCheckedIn || isCheckedOut) && styles.disabledBtn), flex: 1, backgroundColor: "#10b981" }}
              >
                Clock In
              </button>
              <button 
                onClick={handleCheckOut} 
                disabled={!isCheckedIn} 
                style={{ ...styles.primaryBtn, ...(!isCheckedIn && styles.disabledBtn), flex: 1, backgroundColor: "#ef4444" }}
              >
                Clock Out
              </button>
            </div>

            <h3 style={styles.subSectionTitle}>Recent Logs</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Calendar Date</th>
                    <th style={styles.th}>In</th>
                    <th style={styles.th}>Out</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan="4" style={styles.emptyTd}>No recorded logs found.</td></tr>
                  ) : (
                    attendance.map((a) => (
                      <tr key={a.date} style={styles.tableRow}>
                        <td style={styles.td}>{a.date}</td>
                        <td style={styles.td}>{a.checkIn || "—"}</td>
                        <td style={styles.td}>{a.checkOut || "—"}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: a.status === "Present" ? "#e2f9ec" : "#fde8e8",
                            color: a.status === "Present" ? "#15803d" : "#991b1b"
                          }}>{a.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Application Actions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Time-Off Requests</h2>
            </div>
            
            <form onSubmit={handleApplyLeave} style={styles.formGrid}>
              <div style={styles.formRow}>
                <label style={styles.fieldLabel}>Absence Classification</label>
                <select style={styles.selectInput} value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div style={styles.dateRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.fieldLabel}>Start Date</label>
                  <input type="date" style={styles.textInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.fieldLabel}>End Date</label>
                  <input type="date" style={styles.textInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div style={styles.formRow}>
                <label style={styles.fieldLabel}>Justification / Remarks</label>
                <input style={styles.textInput} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide contextual summary notes..." />
              </div>
              <button type="submit" style={{ ...styles.primaryBtn, width: "100%", marginTop: 4 }}>
                Dispatch Leave Application
              </button>
            </form>

            <h3 style={styles.subSectionTitle}>Historical Requests</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Range</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Admin Note</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr><td colSpan="4" style={styles.emptyTd}>No recorded allocations requested.</td></tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l.id} style={styles.tableRow}>
                        <td style={{ ...styles.td, textTransform: "capitalize", fontWeight: "500" }}>{l.type}</td>
                        <td style={{ ...styles.td, fontSize: "12px", color: "#64748b" }}>{l.startDate} to {l.endDate}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...statusStyle(l.status) }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontSize: "13px", color: "#64748b", fontStyle: l.comment ? "normal" : "italic" }}>
                          {l.comment || "No review left"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Dynamically compute styling tokens for approval workflows
function statusStyle(status) {
  const themes = {
    pending: { backgroundColor: "#fef3c7", color: "#b45309" },
    approved: { backgroundColor: "#dcfce7", color: "#15803d" },
    rejected: { backgroundColor: "#fee2e2", color: "#b91c1c" }
  };
  return themes[status] || { backgroundColor: "#f1f5f9", color: "#334155" };
}

// Visual Identity Framework Design System tokens
const styles = {
  page: { 
    maxWidth: 1200, 
    margin: "40px auto", 
    padding: "0 24px", 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#1e293b",
    backgroundColor: "#f8fafc"
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "20px",
    marginBottom: "32px"
  },
  mainTitle: { fontSize: "28px", fontWeight: "700", letterSpacing: "-0.5px", color: "#0f172a", margin: 0 },
  subTitle: { fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" },
  logoutBtn: { 
    padding: "10px 18px", 
    borderRadius: "8px", 
    border: "1px solid #e2e8f0", 
    backgroundColor: "#ffffff", 
    color: "#64748b", 
    fontWeight: "600", 
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  },
  messageBox: { 
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#eff6ff", 
    borderLeft: "4px solid #3b82f6",
    padding: "12px 16px", 
    borderRadius: "8px",
    marginBottom: "24px"
  },
  messageText: { margin: 0, fontSize: "14px", color: "#1e40af", fontWeight: "500" },
  dashboardGrid: { 
    display: "flex", 
    flexWrap: "wrap",
    gap: "24px" 
  },
  leftColumn: { flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "24px" },
  rightColumn: { flex: "1.2 1 500px", display: "flex", flexDirection: "column", gap: "24px" },
  card: { 
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0", 
    borderRadius: "12px", 
    padding: "24px", 
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)"
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 },
  inlineEditBtn: { 
    backgroundColor: "transparent", 
    border: "none", 
    color: "#4f46e5", 
    fontWeight: "600", 
    fontSize: "14px", 
    cursor: "pointer" 
  },
  profileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  profileItem: { display: "flex", flexDirection: "column", gap: "4px" },
  profileLabel: { fontSize: "12px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
  profileValue: { fontSize: "15px", fontWeight: "500", color: "#334155" },
  payrollGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" },
  payrollBlock: { display: "flex", flexDirection: "column", gap: "4px" },
  payrollAmount: { fontSize: "16px", fontWeight: "600", color: "#334155" },
  attendanceBanner: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "12px"
  },
  badge: { 
    padding: "4px 10px", 
    borderRadius: "9999px", 
    fontSize: "12px", 
    fontWeight: "600",
    display: "inline-block",
    textAlign: "center"
  },
  attendanceMeta: { fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" },
  attendanceActions: { display: "flex", gap: "12px", marginBottom: "24px" },
  subSectionTitle: { fontSize: "14px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "24px", marginBottom: "12px" },
  tableWrapper: { overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" },
  th: { backgroundColor: "#f8fafc", padding: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle" },
  emptyTd: { padding: "20px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" },
  tableRow: { transition: "background-color 0.15s" },
  formContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  formGrid: { display: "flex", flexDirection: "column", gap: "16px" },
  formRow: { display: "flex", flexDirection: "column", gap: "6px" },
  dateRow: { display: "flex", gap: "12px" },
  fieldLabel: { fontSize: "13px", fontWeight: "500", color: "#475569" },
  textInput: { 
    padding: "10px 14px", 
    borderRadius: "8px", 
    border: "1px solid #cbd5e1", 
    fontSize: "14px",
    outline: "none",
    color: "#1e293b"
  },
  selectInput: { 
    padding: "10px 14px", 
    borderRadius: "8px", 
    border: "1px solid #cbd5e1", 
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#1e293b"
  },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" },
  primaryBtn: { 
    padding: "10px 20px", 
    borderRadius: "8px", 
    border: "none", 
    backgroundColor: "#4f46e5", 
    color: "#ffffff", 
    fontWeight: "600", 
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  },
  cancelBtn: { 
    padding: "10px 20px", 
    borderRadius: "8px", 
    border: "1px solid #cbd5e1", 
    backgroundColor: "#ffffff", 
    color: "#475569", 
    fontWeight: "600", 
    fontSize: "14px",
    cursor: "pointer"
  },
  disabledBtn: { opacity: 0.4, cursor: "not-allowed", boxShadow: "none" },
  loadingPage: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }
};