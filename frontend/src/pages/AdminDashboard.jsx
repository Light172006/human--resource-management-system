// export default function AdminDashboard() {
//   return <h1>Admin Dashboard (placeholder)</h1>;
// }
import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, ClipboardList, Wallet, UserCircle, Settings as SettingsIcon,
  Search, Eye, Pencil, Trash2, Check, X, Bell,
  Filter, Clock, TrendingUp, AlertCircle, Menu, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ---------- design tokens ---------- */
const C = {
  ink: '#1C2333',
  inkSoft: '#2C3547',
  paper: '#F5F6F8',
  card: '#FFFFFF',
  slate: '#5B6478',
  slateLight: '#95A0B3',
  line: '#E5E8EE',
  amber: '#D98E2B',
  amberSoft: '#FBF0DC',
  coral: '#D9564C',
  coralSoft: '#FBE6E4',
  teal: '#2E8F82',
  tealSoft: '#DFF1EE',
  indigo: '#5B5FC7',
  indigoSoft: '#E7E7F9',
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
.f-display{font-family:'Space Grotesk',sans-serif;}
.f-body{font-family:'Inter',sans-serif;}
.f-mono{font-family:'IBM Plex Mono',monospace;}
`;

/* ---------- rupee formatting ---------- */
const rupee = (n) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;

/* ---------- source data: frontend/src/mock/mock-data.json ---------- */
const MOCK = {
  users: [
    { id: 'emp001', name: 'Riya Sharma', email: 'employee1@demo.com', password: 'demo1234', role: 'employee', jobTitle: 'Software Engineer', department: 'Engineering', phone: '9876543210', address: 'Kolkata, India', salary: 65000 },
    { id: 'emp002', name: 'Aman Roy', email: 'employee2@demo.com', password: 'demo1234', role: 'employee', jobTitle: 'QA Engineer', department: 'Engineering', phone: '9123456780', address: 'Howrah, India', salary: 55000 },
    { id: 'adm001', name: 'Priya Das', email: 'admin@demo.com', password: 'admin1234', role: 'admin', jobTitle: 'HR Manager', department: 'Human Resources', phone: '9988776655', address: 'Kolkata, India', salary: 90000 },
  ],
  loginResponses: {
    'employee1@demo.com': { token: 'mock-jwt-emp001', user: { id: 'emp001', name: 'Riya Sharma', role: 'employee', email: 'employee1@demo.com' } },
    'admin@demo.com': { token: 'mock-jwt-adm001', user: { id: 'adm001', name: 'Priya Das', role: 'admin', email: 'admin@demo.com' } },
  },
  attendance: {
    emp001: [
      { date: '2026-07-04', checkIn: '09:05', checkOut: '18:02', status: 'present' },
      { date: '2026-07-03', checkIn: '09:15', checkOut: '17:50', status: 'present' },
      { date: '2026-07-02', checkIn: null, checkOut: null, status: 'absent' },
    ],
    emp002: [
      { date: '2026-07-04', checkIn: '09:30', checkOut: '13:00', status: 'half-day' },
    ],
  },
  attendanceAll: [
    { employeeId: 'emp001', name: 'Riya Sharma', date: '2026-07-04', status: 'present' },
    { employeeId: 'emp002', name: 'Aman Roy', date: '2026-07-04', status: 'half-day' },
  ],
  leave: {
    emp001: [{ id: 'leave001', employeeId: 'emp001', type: 'sick', startDate: '2026-07-10', endDate: '2026-07-11', remarks: 'Fever', status: 'pending' }],
    emp002: [],
  },
  leaveAll: [
    { id: 'leave001', employeeId: 'emp001', employeeName: 'Riya Sharma', type: 'sick', startDate: '2026-07-10', endDate: '2026-07-11', remarks: 'Fever', status: 'pending' },
  ],
  payroll: {
    emp001: { employeeId: 'emp001', basic: 40000, hra: 15000, allowances: 10000, total: 65000 },
    emp002: { employeeId: 'emp002', basic: 34000, hra: 12000, allowances: 9000, total: 55000 },
  },
};

/* ---------- derive app data from MOCK ---------- */
const initials = (name) => name.split(' ').map(p => p[0]).join('').toUpperCase();
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');

const ADMIN_USER = MOCK.users.find(u => u.role === 'admin');

const BASE_EMPLOYEES = MOCK.users.filter(u => u.role === 'employee').map(u => ({
  id: u.id,
  name: u.name,
  initials: initials(u.name),
  email: u.email,
  phone: u.phone,
  department: u.department,
  jobTitle: u.jobTitle,
  address: u.address,
  status: 'Active',
  salary: MOCK.payroll[u.id] || { basic: u.salary, hra: 0, allowances: 0, total: u.salary },
}));

const DEPARTMENTS = [...new Set(BASE_EMPLOYEES.map(e => e.department))];
const TODAY = '2026-07-04';
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function hashSeed(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
function syntheticStatus(empId, dayIndex) {
  const v = (hashSeed(empId) + dayIndex * 7) % 20;
  if (v < 14) return 'present';
  if (v < 16) return 'half-day';
  if (v < 18) return 'leave';
  return 'absent';
}
function realRecordFor(empId, date) {
  return (MOCK.attendance[empId] || []).find(r => r.date === date);
}
function statusLabel(s) {
  return { present: 'Present', absent: 'Absent', 'half-day': 'Half-day', leave: 'Leave' }[s] || s;
}

const WEEKLY_CHART = WEEK_LABELS.map((d, di) => {
  let present = 0, absent = 0;
  BASE_EMPLOYEES.forEach(e => {
    const s = syntheticStatus(e.id, di);
    if (s === 'present' || s === 'half-day') present++; else absent++;
  });
  return { day: d, Present: present, Absent: absent };
});

function initialLeaveRequests() {
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
  return MOCK.leaveAll.map(r => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employeeName,
    initials: initials(r.employeeName),
    type: titleCase(r.type),
    from: r.startDate,
    to: r.endDate,
    days: daysBetween(r.startDate, r.endDate),
    remarks: r.remarks,
    status: titleCase(r.status),
    comment: '',
  }));
}

/* ---------- small ui bits ---------- */
function Badge({ children, tone = 'slate' }) {
  const map = {
    teal: { bg: C.tealSoft, fg: C.teal },
    coral: { bg: C.coralSoft, fg: C.coral },
    amber: { bg: C.amberSoft, fg: C.amber },
    indigo: { bg: C.indigoSoft, fg: C.indigo },
    slate: { bg: '#EEF0F4', fg: C.slate },
  };
  const t = map[tone];
  return (
    <span className="f-body text-xs font-medium px-2 py-1 rounded-full inline-block whitespace-nowrap" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === 'Present' || status === 'Active' || status === 'Approved') return 'teal';
  if (status === 'Absent' || status === 'Inactive' || status === 'Rejected') return 'coral';
  if (status === 'Half-day' || status === 'Pending') return 'amber';
  if (status === 'Leave') return 'indigo';
  return 'slate';
}

function StatCard({ label, value, icon: Icon, tone, sub }) {
  const t = { teal: C.teal, coral: C.coral, amber: C.amber, indigo: C.indigo }[tone] || C.ink;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between">
        <span className="f-body text-sm" style={{ color: C.slate }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${t}1A` }}>
          <Icon size={17} style={{ color: t }} />
        </div>
      </div>
      <div>
        <div className="f-mono text-3xl font-semibold" style={{ color: C.ink }}>{value}</div>
        {sub && <div className="f-body text-xs mt-1" style={{ color: C.slateLight }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <div className="f-mono text-xs tracking-widest uppercase" style={{ color: C.slateLight }}>{eyebrow}</div>
        <h2 className="f-display text-2xl font-semibold" style={{ color: C.ink }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ employees, leaveRequests }) {
  const total = employees.length;
  const presentToday = employees.filter(e => {
    const rec = realRecordFor(e.id, TODAY);
    const s = rec ? rec.status : syntheticStatus(e.id, 2);
    return s === 'present' || s === 'half-day';
  }).length;
  const onLeave = employees.filter(e => {
    const rec = realRecordFor(e.id, TODAY);
    const s = rec ? rec.status : syntheticStatus(e.id, 2);
    return s === 'leave';
  }).length;
  const pending = leaveRequests.filter(r => r.status === 'Pending').length;
  const payrollTotal = employees.reduce((sum, e) => sum + e.salary.basic + e.salary.hra + e.salary.allowances, 0);

  return (
    <div>
      <SectionHeader eyebrow="Overview" title="Good morning, here's today's pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={total} icon={Users} tone="indigo" sub={`${DEPARTMENTS.length} department${DEPARTMENTS.length > 1 ? 's' : ''}`} />
        <StatCard label="Present Today" value={presentToday} icon={CalendarCheck} tone="teal" sub={`${Math.round((presentToday / total) * 100)}% attendance`} />
        <StatCard label="On Leave" value={onLeave} icon={Clock} tone="amber" sub="as of today" />
        <StatCard label="Pending Requests" value={pending} icon={AlertCircle} tone="coral" sub="awaiting review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="f-display font-semibold" style={{ color: C.ink }}>Weekly attendance</h3>
            <TrendingUp size={16} style={{ color: C.slateLight }} />
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={WEEKLY_CHART} barGap={4}>
              <CartesianGrid vertical={false} stroke={C.line} />
              <XAxis dataKey="day" tick={{ fill: C.slate, fontSize: 12, fontFamily: 'Inter' }} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: C.slate, fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: 'Inter', fontSize: 12 }} />
              <Bar dataKey="Present" fill={C.teal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill={C.coral} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <h3 className="f-display font-semibold mb-4" style={{ color: C.ink }}>Payroll summary</h3>
          <div className="f-mono text-3xl font-semibold mb-1" style={{ color: C.ink }}>{rupee(payrollTotal)}</div>
          <div className="f-body text-xs mb-5" style={{ color: C.slateLight }}>net payout \u00b7 July 2026</div>
          <div className="space-y-3">
            {[
              ['Basic', employees.reduce((s, e) => s + e.salary.basic, 0), C.indigo],
              ['HRA + Allowances', employees.reduce((s, e) => s + e.salary.hra + e.salary.allowances, 0), C.teal],
            ].map(([label, val, color]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="f-body text-sm" style={{ color: C.slate }}>{label}</span>
                <span className="f-mono text-sm font-semibold" style={{ color }}>{rupee(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Employee Management ---------- */
function EmployeeDetail({ employee, mode, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(employee);
  const editable = mode === 'edit';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28,35,51,0.45)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: C.card }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center f-mono font-semibold" style={{ background: C.indigoSoft, color: C.indigo }}>{employee.initials}</div>
            <div>
              <div className="f-display font-semibold" style={{ color: C.ink }}>{employee.name}</div>
              <div className="f-body text-xs" style={{ color: C.slateLight }}>{employee.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70"><X size={18} style={{ color: C.slate }} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'],
            ['department', 'Department'], ['jobTitle', 'Job title'], ['address', 'Address'],
          ].map(([key, label]) => (
            <div key={key} className={key === 'address' ? 'col-span-2' : ''}>
              <label className="f-body text-xs" style={{ color: C.slateLight }}>{label}</label>
              {editable ? (
                <input
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="f-body w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: `1px solid ${C.line}`, color: C.ink }}
                />
              ) : (
                <div className="f-body text-sm mt-1" style={{ color: C.ink }}>{form[key]}</div>
              )}
            </div>
          ))}
          <div>
            <label className="f-body text-xs" style={{ color: C.slateLight }}>Status</label>
            <div className="mt-1"><Badge tone={statusTone(form.status)}>{form.status}</Badge></div>
          </div>
          <div>
            <label className="f-body text-xs" style={{ color: C.slateLight }}>Monthly salary</label>
            <div className="f-mono text-sm mt-1" style={{ color: C.ink }}>{rupee(form.salary.total)}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          {mode === 'view' && (
            <button onClick={() => onDelete(employee.id)} className="f-body text-sm px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ color: C.coral, border: `1px solid ${C.coralSoft}` }}>
              <Trash2 size={14} /> Remove
            </button>
          )}
          <button onClick={onClose} className="f-body text-sm px-4 py-2 rounded-lg" style={{ color: C.slate, border: `1px solid ${C.line}` }}>Cancel</button>
          {editable && (
            <button onClick={() => onSave(form)} className="f-body text-sm px-4 py-2 rounded-lg text-white" style={{ background: C.ink }}>Save changes</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeManagement({ employees, setEmployees }) {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [active, setActive] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => employees.filter(e => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    const matchesDept = dept === 'All' || e.department === dept;
    const matchesStatus = status === 'All' || e.status === status;
    return matchesQuery && matchesDept && matchesStatus;
  }), [employees, query, dept, status]);

  return (
    <div>
      <SectionHeader eyebrow="People" title="Employee management" />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[220px]" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <Search size={15} style={{ color: C.slateLight }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, ID, or email"
            className="f-body text-sm outline-none w-full"
            style={{ color: C.ink }}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <Filter size={14} style={{ color: C.slateLight }} />
          <select value={dept} onChange={e => setDept(e.target.value)} className="f-body text-sm outline-none bg-transparent" style={{ color: C.ink }}>
            <option>All</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <select value={status} onChange={e => setStatus(e.target.value)} className="f-body text-sm outline-none bg-transparent" style={{ color: C.ink }}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <span className="f-body text-xs ml-auto" style={{ color: C.slateLight }}>{filtered.length} of {employees.length}</span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['Employee', 'Department', 'Job title', 'Status', ''].map(h => (
                  <th key={h} className="f-body text-left text-xs font-medium px-5 py-3" style={{ color: C.slateLight }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center f-mono text-xs font-semibold" style={{ background: C.indigoSoft, color: C.indigo }}>{e.initials}</div>
                    <div>
                      <div className="f-body font-medium" style={{ color: C.ink }}>{e.name}</div>
                      <div className="f-body text-xs" style={{ color: C.slateLight }}>{e.id}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 f-body" style={{ color: C.slate }}>{e.department}</td>
                  <td className="px-5 py-3 f-body" style={{ color: C.slate }}>{e.jobTitle}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setActive({ employee: e, mode: 'view' })} className="p-1.5 rounded-lg hover:opacity-70" title="View"><Eye size={15} style={{ color: C.slate }} /></button>
                      <button onClick={() => setActive({ employee: e, mode: 'edit' })} className="p-1.5 rounded-lg hover:opacity-70" title="Edit"><Pencil size={15} style={{ color: C.slate }} /></button>
                      <button onClick={() => setConfirmDelete(e)} className="p-1.5 rounded-lg hover:opacity-70" title="Delete"><Trash2 size={15} style={{ color: C.coral }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center f-body text-sm" style={{ color: C.slateLight }}>No employees match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {active && (
        <EmployeeDetail
          employee={active.employee}
          mode={active.mode}
          onClose={() => setActive(null)}
          onSave={(updated) => { setEmployees(employees.map(e => e.id === updated.id ? updated : e)); setActive(null); }}
          onDelete={(id) => { setConfirmDelete(employees.find(e => e.id === id)); setActive(null); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28,35,51,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: C.card }}>
            <h3 className="f-display font-semibold mb-2" style={{ color: C.ink }}>Remove {confirmDelete.name}?</h3>
            <p className="f-body text-sm mb-5" style={{ color: C.slate }}>This deletes their record from the directory. This can't be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="f-body text-sm px-4 py-2 rounded-lg" style={{ color: C.slate, border: `1px solid ${C.line}` }}>Cancel</button>
              <button
                onClick={() => { setEmployees(employees.filter(e => e.id !== confirmDelete.id)); setConfirmDelete(null); }}
                className="f-body text-sm px-4 py-2 rounded-lg text-white"
                style={{ background: C.coral }}
              >Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Attendance ---------- */
function AttendanceSection({ employees }) {
  const [view, setView] = useState('Daily');
  const [empIndex, setEmpIndex] = useState(0);
  const monthDays = 30;

  return (
    <div>
      <SectionHeader
        eyebrow="Time"
        title="Attendance"
        right={
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
            {['Daily', 'Weekly', 'Monthly'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="f-body text-sm px-4 py-2"
                style={{ background: view === v ? C.ink : C.card, color: view === v ? '#fff' : C.slate }}
              >{v}</button>
            ))}
          </div>
        }
      />

      {view === 'Daily' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="px-5 py-3 f-body text-xs" style={{ color: C.slateLight, borderBottom: `1px solid ${C.line}` }}>Saturday, July 4, 2026</div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['Employee', 'Check-in', 'Check-out', 'Status'].map(h => (
                  <th key={h} className="f-body text-left text-xs font-medium px-5 py-3" style={{ color: C.slateLight }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(e => {
                const rec = realRecordFor(e.id, TODAY);
                const s = rec ? rec.status : syntheticStatus(e.id, 2);
                const checkin = rec ? (rec.checkIn || '\u2014') : '\u2014';
                const checkout = rec ? (rec.checkOut || '\u2014') : '\u2014';
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="px-5 py-3 f-body" style={{ color: C.ink }}>{e.name}</td>
                    <td className="px-5 py-3 f-mono text-xs" style={{ color: C.slate }}>{checkin}</td>
                    <td className="px-5 py-3 f-mono text-xs" style={{ color: C.slate }}>{checkout}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone(statusLabel(s))}>{statusLabel(s)}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'Weekly' && (
        <div className="rounded-2xl overflow-x-auto" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <th className="f-body text-left text-xs font-medium px-5 py-3" style={{ color: C.slateLight }}>Employee</th>
                {WEEK_LABELS.map(d => <th key={d} className="f-body text-xs font-medium px-3 py-3" style={{ color: C.slateLight }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="px-5 py-3 f-body whitespace-nowrap" style={{ color: C.ink }}>{e.name}</td>
                  {WEEK_LABELS.map((d, di) => {
                    const s = syntheticStatus(e.id, di);
                    const dot = { present: C.teal, absent: C.coral, 'half-day': C.amber, leave: C.indigo }[s];
                    return (
                      <td key={d} className="px-3 py-3 text-center">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: dot }} title={statusLabel(s)} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 px-5 py-3 f-body text-xs" style={{ color: C.slateLight, borderTop: `1px solid ${C.line}` }}>
            {['present', 'half-day', 'leave', 'absent'].map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: { present: C.teal, absent: C.coral, 'half-day': C.amber, leave: C.indigo }[s] }} /> {statusLabel(s)}
              </span>
            ))}
          </div>
        </div>
      )}

      {view === 'Monthly' && (
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: `1px solid ${C.line}` }}>
              <select value={empIndex} onChange={e => setEmpIndex(Number(e.target.value))} className="f-body text-sm outline-none bg-transparent" style={{ color: C.ink }}>
                {employees.map((e, i) => <option key={e.id} value={i}>{e.name}</option>)}
              </select>
            </div>
            <span className="f-body text-xs" style={{ color: C.slateLight }}>July 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: monthDays }, (_, d) => {
              const emp = employees[empIndex];
              const dateStr = `2026-07-${String(d + 1).padStart(2, '0')}`;
              const rec = realRecordFor(emp.id, dateStr);
              const s = rec ? rec.status : syntheticStatus(emp.id, d);
              const dot = { present: C.tealSoft, absent: C.coralSoft, 'half-day': C.amberSoft, leave: C.indigoSoft }[s];
              const fg = { present: C.teal, absent: C.coral, 'half-day': C.amber, leave: C.indigo }[s];
              return (
                <div key={d} className="aspect-square rounded-lg flex flex-col items-center justify-center f-mono text-xs font-semibold" style={{ background: dot, color: fg }}>
                  {d + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Leave Management ---------- */
function LeaveManagement({ requests, setRequests }) {
  const pending = requests.filter(r => r.status === 'Pending');
  const history = requests.filter(r => r.status !== 'Pending');

  const updateStatus = (id, status) => setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  const updateComment = (id, comment) => setRequests(requests.map(r => r.id === id ? { ...r, comment } : r));

  return (
    <div>
      <SectionHeader eyebrow="Time-off" title="Leave management" />

      <h3 className="f-body text-sm font-medium mb-3" style={{ color: C.slate }}>Pending requests ({pending.length})</h3>
      <div className="space-y-3 mb-8">
        {pending.map(r => (
          <div key={r.id} className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3 md:w-52">
              <div className="w-9 h-9 rounded-full flex items-center justify-center f-mono text-xs font-semibold shrink-0" style={{ background: C.indigoSoft, color: C.indigo }}>{r.initials}</div>
              <div>
                <div className="f-body text-sm font-medium" style={{ color: C.ink }}>{r.employeeName}</div>
                <div className="f-body text-xs" style={{ color: C.slateLight }}>{r.type} leave \u00b7 {r.days}d</div>
              </div>
            </div>
            <div className="f-body text-xs md:flex-1" style={{ color: C.slate }}>
              <span className="f-mono">{r.from} \u2192 {r.to}</span> \u00b7 {r.remarks}
            </div>
            <input
              placeholder="Add a comment"
              value={r.comment}
              onChange={e => updateComment(r.id, e.target.value)}
              className="f-body text-xs px-3 py-2 rounded-lg outline-none md:w-48"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            />
            <div className="flex gap-2 shrink-0">
              <button onClick={() => updateStatus(r.id, 'Approved')} className="p-2 rounded-lg" style={{ background: C.tealSoft }} title="Approve"><Check size={15} style={{ color: C.teal }} /></button>
              <button onClick={() => updateStatus(r.id, 'Rejected')} className="p-2 rounded-lg" style={{ background: C.coralSoft }} title="Reject"><X size={15} style={{ color: C.coral }} /></button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <div className="f-body text-sm px-1" style={{ color: C.slateLight }}>No pending requests. All caught up.</div>}
      </div>

      <h3 className="f-body text-sm font-medium mb-3" style={{ color: C.slate }}>History</h3>
      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              {['Employee', 'Type', 'Dates', 'Comment', 'Status'].map(h => (
                <th key={h} className="f-body text-left text-xs font-medium px-5 py-3" style={{ color: C.slateLight }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="px-5 py-3 f-body" style={{ color: C.ink }}>{r.employeeName}</td>
                <td className="px-5 py-3 f-body" style={{ color: C.slate }}>{r.type}</td>
                <td className="px-5 py-3 f-mono text-xs" style={{ color: C.slate }}>{r.from} \u2192 {r.to}</td>
                <td className="px-5 py-3 f-body text-xs" style={{ color: C.slateLight }}>{r.comment || '\u2014'}</td>
                <td className="px-5 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center f-body text-sm" style={{ color: C.slateLight }}>Nothing here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Payroll ---------- */
function Payroll({ employees }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <SectionHeader eyebrow="Compensation" title="Payroll" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['Employee', 'Basic', 'Net pay', ''].map(h => (
                  <th key={h} className="f-body text-left text-xs font-medium px-5 py-3" style={{ color: C.slateLight }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} className="cursor-pointer" style={{ borderBottom: `1px solid ${C.line}`, background: selected?.id === e.id ? C.paper : 'transparent' }}>
                  <td className="px-5 py-3 f-body" style={{ color: C.ink }}>{e.name}</td>
                  <td className="px-5 py-3 f-mono text-xs" style={{ color: C.slate }}>{rupee(e.salary.basic)}</td>
                  <td className="px-5 py-3 f-mono text-xs font-semibold" style={{ color: C.teal }}>{rupee(e.salary.total)}</td>
                  <td className="px-5 py-3 text-right"><Eye size={15} style={{ color: C.slateLight }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <Wallet size={22} style={{ color: C.slateLight }} />
              <p className="f-body text-sm mt-3" style={{ color: C.slateLight }}>Select an employee to view salary structure and payslip.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="f-display font-semibold" style={{ color: C.ink }}>{selected.name}</div>
                  <div className="f-body text-xs" style={{ color: C.slateLight }}>{selected.jobTitle} \u00b7 {selected.department}</div>
                </div>
                <button className="flex items-center gap-1.5 f-body text-xs px-3 py-2 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.slate }}>
                  <Download size={13} /> Payslip
                </button>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  ['Basic', selected.salary.basic],
                  ['HRA', selected.salary.hra],
                  ['Allowances', selected.salary.allowances],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between f-body text-sm py-1.5" style={{ borderBottom: `1px solid ${C.line}`, color: C.slate }}>
                    <span>{label}</span>
                    <span className="f-mono" style={{ color: C.ink }}>{rupee(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between f-body text-sm font-semibold pt-1">
                  <span style={{ color: C.ink }}>Net pay</span>
                  <span className="f-mono" style={{ color: C.teal }}>{rupee(selected.salary.total)}</span>
                </div>
              </div>
              <div className="f-body text-xs font-medium mb-2" style={{ color: C.slateLight }}>RECENT PAYSLIPS</div>
              <div className="space-y-1.5">
                {['June 2026', 'May 2026', 'April 2026'].map(m => (
                  <div key={m} className="flex items-center justify-between f-body text-xs px-3 py-2 rounded-lg" style={{ background: C.paper }}>
                    <span style={{ color: C.slate }}>{m}</span>
                    <Download size={13} style={{ color: C.slateLight, cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function Profile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    phone: ADMIN_USER.phone,
    jobTitle: ADMIN_USER.jobTitle,
    address: ADMIN_USER.address,
  });

  return (
    <div>
      <SectionHeader eyebrow="Account" title="My profile" right={
        !editing ? (
          <button onClick={() => setEditing(true)} className="f-body text-sm px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.slate }}><Pencil size={14} /> Edit</button>
        ) : (
          <button onClick={() => setEditing(false)} className="f-body text-sm px-4 py-2 rounded-lg text-white" style={{ background: C.ink }}>Save</button>
        )
      } />
      <div className="rounded-2xl p-6 max-w-xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center f-mono text-lg font-semibold" style={{ background: C.indigoSoft, color: C.indigo }}>{initials(form.name)}</div>
          <div>
            <div className="f-display text-lg font-semibold" style={{ color: C.ink }}>{form.name}</div>
            <Badge tone="indigo">{form.jobTitle}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['jobTitle', 'Job title'], ['address', 'Address']].map(([key, label]) => (
            <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
              <label className="f-body text-xs" style={{ color: C.slateLight }}>{label}</label>
              {editing ? (
                <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="f-body w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              ) : (
                <div className="f-body text-sm mt-1" style={{ color: C.ink }}>{form[key]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className="w-10 h-6 rounded-full relative transition-colors" style={{ background: checked ? C.teal : C.line }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
}

function Settings() {
  const [notifs, setNotifs] = useState({ email: true, sms: false, weeklyDigest: true });
  return (
    <div>
      <SectionHeader eyebrow="Preferences" title="Settings" />
      <div className="rounded-2xl p-6 max-w-xl mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <h3 className="f-display font-semibold mb-4" style={{ color: C.ink }}>Notifications</h3>
        <div className="space-y-4">
          {[
            ['email', 'Email notifications for new leave requests'],
            ['sms', 'SMS alerts for urgent approvals'],
            ['weeklyDigest', 'Weekly attendance digest'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="f-body text-sm" style={{ color: C.slate }}>{label}</span>
              <Toggle checked={notifs[key]} onChange={(v) => setNotifs({ ...notifs, [key]: v })} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-6 max-w-xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <h3 className="f-display font-semibold mb-4" style={{ color: C.ink }}>Security</h3>
        <div className="grid grid-cols-1 gap-3">
          <input placeholder="Current password" type="password" className="f-body text-sm px-3 py-2 rounded-lg outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          <input placeholder="New password" type="password" className="f-body text-sm px-3 py-2 rounded-lg outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          <button className="f-body text-sm px-4 py-2 rounded-lg text-white w-fit" style={{ background: C.ink }}>Update password</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'leave', label: 'Leave', icon: ClipboardList },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function HRAdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [employees, setEmployees] = useState(BASE_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests());

  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;

  const renderTab = () => {
    switch (tab) {
      case 'dashboard': return <Dashboard employees={employees} leaveRequests={leaveRequests} />;
      case 'employees': return <EmployeeManagement employees={employees} setEmployees={setEmployees} />;
      case 'attendance': return <AttendanceSection employees={employees} />;
      case 'leave': return <LeaveManagement requests={leaveRequests} setRequests={setLeaveRequests} />;
      case 'payroll': return <Payroll employees={employees} />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      default: return null;
    }
  };

  return (
    <div className="f-body min-h-screen flex" style={{ background: C.paper }}>
      <style>{FONTS}</style>

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 shrink-0 flex-col transition-transform ${navOpen ? 'flex translate-x-0' : 'hidden md:flex'}`}
        style={{ background: C.ink }}
      >
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center f-mono font-bold text-sm" style={{ background: C.amber, color: C.ink }}>N</div>
          <div>
            <div className="f-display text-white font-semibold leading-tight text-sm">Northgate HR</div>
            <div className="f-body text-xs" style={{ color: C.slateLight }}>Admin console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setNavOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl f-body text-sm transition-colors"
              style={{ background: tab === key ? C.inkSoft : 'transparent', color: tab === key ? '#fff' : C.slateLight }}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {key === 'leave' && pendingCount > 0 && (
                <span className="f-mono text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.amber, color: C.ink }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-6 py-5 f-body text-xs" style={{ color: C.slateLight, borderTop: `1px solid ${C.inkSoft}` }}>
          v1.0 \u00b7 Every workday, perfectly aligned.
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setNavOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-5 md:px-8 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button className="md:hidden p-2 rounded-lg" onClick={() => setNavOpen(true)}><Menu size={18} style={{ color: C.ink }} /></button>
          <div className="hidden md:block f-body text-sm" style={{ color: C.slateLight }}>Saturday, July 4, 2026</div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg relative" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <Bell size={15} style={{ color: C.slate }} />
              {pendingCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: C.coral }} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center f-mono text-xs font-semibold" style={{ background: C.indigoSoft, color: C.indigo }}>{initials(ADMIN_USER.name)}</div>
              <span className="f-body text-sm hidden sm:block" style={{ color: C.ink }}>{ADMIN_USER.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}

