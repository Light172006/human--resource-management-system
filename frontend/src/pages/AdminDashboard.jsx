import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ClipboardList, Wallet, LogOut, 
  Check, X, Search, UserCircle, CheckCircle2, AlertCircle, Save
} from 'lucide-react';

/* --- Design Tokens --- */
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#4F46E5', 
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
  successBg: '#A7F3D0', 
  successText: '#065F46',
  dangerBg: '#FECACA',
  dangerText: '#991B1B',
  badgePresent: '#F1F5F9',
  badgePresentText: '#334155',
  badgeAbsent: '#FEE2E2',
  badgeAbsentText: '#991B1B'
};

/* --- Reusable UI Components --- */
const Card = ({ title, children, action }) => (
  <div style={{ background: COLORS.card, padding: '24px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
    {(title || action) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {title && <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: COLORS.textMain, margin: 0 }}>{title}</h2>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const isPresent = status.toLowerCase() === 'present' || status.toLowerCase() === 'active';
  return (
    <span style={{
      backgroundColor: isPresent ? COLORS.badgePresent : COLORS.badgeAbsent,
      color: isPresent ? COLORS.badgePresentText : COLORS.badgeAbsentText,
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    }}>
      {status}
    </span>
  );
};

/* --- Main Dashboard Application --- */
export default function AdminDashboardPortal() {
  // Application State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  const [editingEmp, setEditingEmp] = useState(null);

  // Mock Database
  const [employees, setEmployees] = useState([
    { id: 'E001', name: 'Riya Sharma', email: 'employee1@demo.com', role: 'Software Engineer', dept: 'Engineering', status: 'Present', salary: { base: 40000, hra: 15000, allowance: 10000 } },
    { id: 'E002', name: 'Aman Roy', email: 'aman@demo.com', role: 'QA Automation', dept: 'Engineering', status: 'Present', salary: { base: 35000, hra: 12000, allowance: 8000 } },
    { id: 'E003', name: 'Kavya Iyer', email: 'kavya@demo.com', role: 'Product Designer', dept: 'Design', status: 'Absent', salary: { base: 45000, hra: 16000, allowance: 12000 } },
  ]);

  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: 'Kavya Iyer', type: 'Sick Leave', dates: '2026-07-04 to 2026-07-05', status: 'Pending' },
    { id: 2, name: 'Rahul Das', type: 'Casual Leave', dates: '2026-07-10 to 2026-07-12', status: 'Pending' }
  ]);

  /* --- Actions & Handlers --- */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLeaveAction = (id, action, name) => {
    setLeaveRequests(leaveRequests.filter(req => req.id !== id));
    showToast(`Leave request for ${name} has been ${action.toLowerCase()}.`, action === 'Approved' ? 'success' : 'error');
  };

  const handleSaveEmployee = (updatedEmp) => {
    setEmployees(employees.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    setEditingEmp(null);
    showToast(`${updatedEmp.name}'s profile updated successfully.`);
  };

  /* --- Render Navigation & Layout --- */
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Employee Directory', icon: Users },
    { id: 'leave', label: 'Time-Off Requests', icon: ClipboardList },
    { id: 'payroll', label: 'Payroll & Compensation', icon: Wallet },
  ];

  /* --- Render Sections --- */
  const renderDashboard = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card title="Company Overview">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
              <p style={{ color: COLORS.textSub, fontSize: '0.8rem', margin: '0 0 8px 0' }}>Total Employees</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: COLORS.textMain }}>{employees.length}</p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
              <p style={{ color: COLORS.textSub, fontSize: '0.8rem', margin: '0 0 8px 0' }}>On Leave Today</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: COLORS.dangerText }}>
                {employees.filter(e => e.status.toLowerCase() === 'absent').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Attendance Logs">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: COLORS.textSub, fontSize: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ paddingBottom: '12px' }}>Calendar Date</th>
              <th style={{ paddingBottom: '12px' }}>Employee</th>
              <th style={{ paddingBottom: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((row, i) => (
              <tr key={row.id} style={{ borderBottom: i === employees.length - 1 ? 'none' : `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '16px 0', fontSize: '0.85rem', color: COLORS.textSub }}>2026-07-04</td>
                <td style={{ padding: '16px 0', fontSize: '0.9rem', fontWeight: '500', color: COLORS.textMain }}>{row.name}</td>
                <td style={{ padding: '16px 0' }}><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderDirectory = () => {
    // Search Filtering Logic
    const filteredEmployees = employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Card 
        title="Staff Directory" 
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: COLORS.bg, padding: '8px 16px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
            <Search size={16} color={COLORS.textSub} />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '200px' }} 
            />
            {searchQuery && <X size={14} color={COLORS.textSub} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />}
          </div>
        }
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: COLORS.textSub, fontSize: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ paddingBottom: '12px' }}>FULL NAME</th>
              <th style={{ paddingBottom: '12px' }}>EMAIL ADDRESS</th>
              <th style={{ paddingBottom: '12px' }}>DEPARTMENT</th>
              <th style={{ paddingBottom: '12px' }}>STATUS</th>
              <th style={{ paddingBottom: '12px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? filteredEmployees.map((emp, i) => (
              <tr key={emp.id} style={{ borderBottom: i === filteredEmployees.length - 1 ? 'none' : `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '16px 0', fontSize: '0.9rem', fontWeight: '600', color: COLORS.textMain }}>{emp.name}<div style={{fontSize: '0.75rem', color: COLORS.textSub, fontWeight: '400'}}>{emp.role}</div></td>
                <td style={{ padding: '16px 0', fontSize: '0.9rem', color: COLORS.textSub }}>{emp.email}</td>
                <td style={{ padding: '16px 0', fontSize: '0.9rem', color: COLORS.textSub }}>{emp.dept}</td>
                <td style={{ padding: '16px 0' }}><StatusBadge status={emp.status} /></td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  <button 
                    onClick={() => setEditingEmp(emp)}
                    style={{ background: '#EEF2FF', border: 'none', color: COLORS.primary, fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}
                  >
                    Edit Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ padding: '32px 0', textAlign: 'center', color: COLORS.textSub }}>No employees found matching "{searchQuery}"</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    );
  };

  const renderLeave = () => (
    <Card title="Pending Time-Off Requests">
      {leaveRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textSub, background: '#F8FAFC', borderRadius: '8px', border: `1px dashed ${COLORS.border}` }}>
          <CheckCircle2 size={32} color={COLORS.successText} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontWeight: '500' }}>All caught up! No pending requests at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {leaveRequests.map(req => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontWeight: '600', color: COLORS.textMain, marginBottom: '4px' }}>{req.name}</div>
                <div style={{ fontSize: '0.85rem', color: COLORS.textSub }}>{req.type} | {req.dates}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleLeaveAction(req.id, 'Approved', req.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: COLORS.successBg, color: COLORS.successText, borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  <Check size={16} /> Approve
                </button>
                <button onClick={() => handleLeaveAction(req.id, 'Denied', req.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: COLORS.dangerBg, color: COLORS.dangerText, borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  <X size={16} /> Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderPayroll = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <Card title="Payroll & Compensation Breakdown">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: COLORS.textSub, fontSize: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ paddingBottom: '12px' }}>EMPLOYEE</th>
              <th style={{ paddingBottom: '12px' }}>BASE SALARY</th>
              <th style={{ paddingBottom: '12px' }}>HRA</th>
              <th style={{ paddingBottom: '12px' }}>ALLOWANCES</th>
              <th style={{ paddingBottom: '12px', textAlign: 'right' }}>TOTAL GROSS EARNINGS</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => {
              const total = emp.salary.base + emp.salary.hra + emp.salary.allowance;
              return (
                <tr key={emp.id} style={{ borderBottom: i === employees.length - 1 ? 'none' : `1px dashed ${COLORS.border}` }}>
                  <td style={{ padding: '16px 0', fontSize: '0.9rem', fontWeight: '600', color: COLORS.textMain }}>{emp.name}</td>
                  <td style={{ padding: '16px 0', fontSize: '0.9rem', color: COLORS.textMain }}>₹{emp.salary.base.toLocaleString()}</td>
                  <td style={{ padding: '16px 0', fontSize: '0.9rem', color: COLORS.textMain }}>₹{emp.salary.hra.toLocaleString()}</td>
                  <td style={{ padding: '16px 0', fontSize: '0.9rem', color: COLORS.textMain }}>₹{emp.salary.allowance.toLocaleString()}</td>
                  <td style={{ padding: '16px 0', fontSize: '1rem', fontWeight: '700', color: COLORS.primary, textAlign: 'right' }}>₹{total.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'sans-serif' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: COLORS.card, border: `1px solid ${toast.type === 'error' ? COLORS.dangerBg : COLORS.successBg}`,
          padding: '16px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          {toast.type === 'error' ? <AlertCircle color={COLORS.dangerText} size={20} /> : <CheckCircle2 color={COLORS.successText} size={20} />}
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: COLORS.textMain }}>{toast.message}</span>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingEmp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ width: '400px' }}>
            <Card title={`Edit Details: ${editingEmp.name}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: COLORS.textSub, fontWeight: '600', marginBottom: '4px', display: 'block' }}>Role</label>
                  <input type="text" value={editingEmp.role} onChange={e => setEditingEmp({...editingEmp, role: e.target.value})} style={{ width: '90%', padding: '10px', borderRadius: '6px', border: `1px solid ${COLORS.border}` }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: COLORS.textSub, fontWeight: '600', marginBottom: '4px', display: 'block' }}>Status</label>
                  <select value={editingEmp.status} onChange={e => setEditingEmp({...editingEmp, status: e.target.value})} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: `1px solid ${COLORS.border}`, background: 'white' }}>
                    <option>Present</option>
                    <option>Absent</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={() => setEditingEmp(null)} style={{ flex: 1, padding: '10px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: COLORS.textSub }}>Cancel</button>
                  <button onClick={() => handleSaveEmployee(editingEmp)} style={{ flex: 1, padding: '10px', background: COLORS.primary, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <nav style={{ width: '280px', backgroundColor: COLORS.card, borderRight: `1px solid ${COLORS.border}`, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: COLORS.textMain, margin: '0 0 4px 0' }}>Admin Dashboard</h1>
          <p style={{ color: COLORS.textSub, fontSize: '0.85rem', margin: 0 }}>HR Management System</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem',
                backgroundColor: activeTab === item.id ? '#EEF2FF' : 'transparent',
                color: activeTab === item.id ? COLORS.primary : COLORS.textSub,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} /> {item.label}
              {/* Leave notification badge */}
              {item.id === 'leave' && leaveRequests.length > 0 && (
                <span style={{ marginLeft: 'auto', background: COLORS.dangerBg, color: COLORS.dangerText, fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{leaveRequests.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* User Profile Block */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserCircle size={36} color={COLORS.textSub} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.textMain }}>Admin User</div>
            <div style={{ fontSize: '0.75rem', color: COLORS.textSub }}>admin@demo.com</div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: COLORS.textMain, margin: 0 }}>
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
          
          {/* Sign Out Button - Redirects to external login page */}
          <button 
            onClick={() => {
              // Redirect to your app's actual login route. 
              // Change '/login' to whatever route your initial login page lives on.
              window.location.href = '/login'; 
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: COLORS.card,
              color: COLORS.textMain, fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseOut={(e) => e.currentTarget.style.background = COLORS.card}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        {/* Render Active Section */}
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'directory' && renderDirectory()}
          {activeTab === 'leave' && renderLeave()}
          {activeTab === 'payroll' && renderPayroll()}
        </div>
      </main>
    </div>
  );
}
