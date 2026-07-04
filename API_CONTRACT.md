# HRMS Hackathon — API Contract

Locked at kickoff. Do not change without telling the whole team.
Base URL: `http://localhost:<port>/api`

Auth: Bearer token in header for all routes except `/login`
`Authorization: Bearer <token>`

---

## 1. Auth

### POST /login
**Request**
```json
{
  "email": "employee1@demo.com",
  "password": "demo1234"
}
```
**Response 200**
```json
{
  "token": "jwt-string",
  "user": {
    "id": "emp001",
    "name": "Riya Sharma",
    "role": "employee",   // "employee" | "admin"
    "email": "employee1@demo.com"
  }
}
```
**Response 401**
```json
{ "error": "Invalid credentials" }
```

---

## 2. Profile

### GET /profile/:id
**Response 200**
```json
{
  "id": "emp001",
  "name": "Riya Sharma",
  "email": "employee1@demo.com",
  "role": "employee",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "phone": "9876543210",
  "address": "Kolkata, India",
  "salary": 65000
}
```

### PUT /profile/:id
**Request** (partial fields allowed)
```json
{
  "phone": "9998887777",
  "address": "New Address"
}
```
**Response 200** → updated profile object (same shape as GET)

---

## 3. Attendance

### POST /attendance/checkin
**Request**
```json
{ "employeeId": "emp001" }
```
**Response 200**
```json
{
  "id": "att101",
  "employeeId": "emp001",
  "date": "2026-07-04",
  "checkIn": "09:05",
  "status": "present"
}
```

### POST /attendance/checkout
**Request**
```json
{ "employeeId": "emp001" }
```
**Response 200**
```json
{
  "id": "att101",
  "checkOut": "18:02"
}
```

### GET /attendance/:employeeId
Query param optional: `?range=week` (default: today)
**Response 200**
```json
[
  {
    "date": "2026-07-04",
    "checkIn": "09:05",
    "checkOut": "18:02",
    "status": "present"   // present | absent | half-day | leave
  }
]
```

### GET /attendance/all  *(admin only)*
**Response 200**
```json
[
  { "employeeId": "emp001", "name": "Riya Sharma", "date": "2026-07-04", "status": "present" },
  { "employeeId": "emp002", "name": "Aman Roy", "date": "2026-07-04", "status": "absent" }
]
```

---

## 4. Leave

### POST /leave/apply
**Request**
```json
{
  "employeeId": "emp001",
  "type": "sick",          // paid | sick | unpaid
  "startDate": "2026-07-10",
  "endDate": "2026-07-11",
  "remarks": "Fever"
}
```
**Response 200**
```json
{
  "id": "leave001",
  "employeeId": "emp001",
  "type": "sick",
  "startDate": "2026-07-10",
  "endDate": "2026-07-11",
  "remarks": "Fever",
  "status": "pending"      // pending | approved | rejected
}
```

### GET /leave/:employeeId
**Response 200** → array of leave objects (same shape as above)

### GET /leave/all  *(admin only)*
**Response 200**
```json
[
  {
    "id": "leave001",
    "employeeId": "emp001",
    "employeeName": "Riya Sharma",
    "type": "sick",
    "startDate": "2026-07-10",
    "endDate": "2026-07-11",
    "remarks": "Fever",
    "status": "pending"
  }
]
```

### PUT /leave/:id/approve  *(admin only)*
**Request**
```json
{ "comment": "Approved, get well soon" }
```
**Response 200**
```json
{ "id": "leave001", "status": "approved" }
```

### PUT /leave/:id/reject  *(admin only)*
**Request**
```json
{ "comment": "Insufficient balance" }
```
**Response 200**
```json
{ "id": "leave001", "status": "rejected" }
```

---

## 5. Payroll (stretch goal — build only if core loop is done)

### GET /payroll/:employeeId
**Response 200**
```json
{
  "employeeId": "emp001",
  "basic": 40000,
  "hra": 15000,
  "allowances": 10000,
  "total": 65000
}
```

### PUT /payroll/:employeeId  *(admin only)*
**Request**
```json
{ "basic": 42000, "hra": 16000, "allowances": 10000 }
```
**Response 200** → updated payroll object

---

## Seed / Demo Data (create these before 4:15 freeze)

| id | name | email | password | role |
|---|---|---|---|---|
| emp001 | Riya Sharma | employee1@demo.com | demo1234 | employee |
| emp002 | Aman Roy | employee2@demo.com | demo1234 | employee |
| adm001 | Priya Das | admin@demo.com | admin1234 | admin |

Seed one **pending leave request** from emp001 before the demo, so the admin approval step has something to click live.

---

## Status codes to standardize on
- `200` success
- `400` bad request / validation error
- `401` unauthorized / bad login
- `403` forbidden (wrong role)
- `404` not found
- `500` server error

All error responses: `{ "error": "human readable message" }`

---

## Demo path (build & test in this exact order)
1. Login (employee) → 2. Check-in → 3. Apply leave → 4. Login (admin) → 5. Approve leave → 6. Employee sees status = approved
