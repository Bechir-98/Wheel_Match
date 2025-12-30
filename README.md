# Wheel Match

> A full-stack web platform connecting **patients** and **vendors** to streamline wheelchair selection through AI matching.

---

## AI matching (clinician role retired)

Wheelchair ranking is rule-first (`EstAssocie` + propulsion + in-stock) via
`GET /api/v1/patient/recommendations`, with an optional Ollama re-rank
(`slm` service in `docker-compose.yml`, model `qwen2.5:0.5b`). The SLM never
writes approvals: a patient's choice from the ranking is final at creation
(`STATUT="APPROUVE"`, `ORIGIN="slm"`). History tables (`Consultation`,
`MedicalEntry`) and old request notes are kept; `CLINICIEN`,
`CLINICIAN_PATIENT`, `LINK_REQUEST` are dropped by
`backend/scripts/drop_clinician.sql`.

Runbook (Docker daemon required, in order):

```bash
docker compose up --build                                   # pulls the SLM model on first boot
docker compose exec backend python scripts/eval_recommend.py # rule recall@3, exit 1 under 0.8
curl -X POST http://localhost:8000/api/v1/chat/rebuild-kb   # re-embed KB, purges role_clinician
cat backend/scripts/drop_clinician.sql | docker compose exec -T db psql -U postgres -d wheel
```

`backend/.env` is gitignored and required locally
(`DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, optional `SLM_URL`/`SLM_MODEL`).

---

## Overview

Wheel Match is a role-based healthcare mobility platform that helps patients find the right wheelchair based on their medical profile (morphology, pathologies, usage habits), ranked by a rule-first engine with an optional SLM re-rank, and vendors a dashboard to manage their inventory.

---

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router DOM** — client-side routing
- **Bootstrap 5** + **React Bootstrap** — responsive UI
- **Ant Design** — data tables and form controls
- **Framer Motion** — animations
- **Axios** — HTTP client

### Backend
- **FastAPI** — async Python API
- **SQLAlchemy 2.0** — ORM
- **PostgreSQL** — database
- **JWT (python-jose)** — token-based auth
- **bcrypt** — password hashing
- **Pydantic** — validation & settings

---

## Project Structure

```
Wheel_Match/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routers/
│   │   │       ├── auth.py           # Login / Register
│   │   │       ├── users.py         # Current user profile
│   │   │       ├── patients.py      # Patient CRUD + medical data
│   │   │       ├── patient_portal.py # Patient dashboard & requests
│   │   │       ├── clinician_portal.py # Clinician dashboard & approvals
│   │   │       ├── vendor_portal.py  # Vendor dashboard
│   │   │       ├── wheelchairs.py    # Catalog browsing
│   │   │       └── reference.py     # Morphologies, pathologies, components, options
│   │   ├── core/
│   │   │   └── config.py            # Settings, JWT, CORS
│   │   ├── db/
│   │   │   └── session.py           # SQLAlchemy session factory
│   │   ├── models/
│   │   │   └── tables.py            # All database models
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── auth_service.py      # Password hashing, JWT, role resolution
│   │   │   └── user_profile.py      # Profile helpers
│   │   ├── api/
│   │   │   └── deps.py             # Auth dependencies (get_current_user, role guards)
│   │   └── main.py                 # FastAPI app entry
│   ├── scripts/
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── GuestRoute.jsx
    │   │   ├── DashboardShell.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Input.jsx
    │   │   ├── NavBar.jsx
    │   │   ├── Footer.jsx
    │   │   └── WheelchairDetail.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── contexts/
    │   │   ├── CartContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── hooks/
    │   │   ├── useWheelchairs.js
    │   │   ├── useAuth.js
    │   │   └── use-toast.js
    │   ├── pages/
    │   │   ├── home.jsx            # Landing page
    │   │   ├── sign.jsx            # Registration
    │   │   ├── log.jsx             # Login
    │   │   ├── faq.jsx             # FAQ
    │   │   ├── WheelchairsPage.jsx  # Catalog
    │   │   ├── patients.jsx        # Clinician patient management
    │   │   ├── Patient_Dashboard.jsx
    │   │   ├── Dashboard_clinicien.jsx
    │   │   ├── VendorDashboard.jsx
    │   │   ├── record.jsx          # Medical records
    │   │   ├── products.jsx       # Vendor inventory
    │   │   └── choisis.jsx        # Wheelchair selection
    │   │   └── dashboard/
    │   │       ├── MyProfile.jsx
    │   │       ├── Messages.jsx
    │   │       └── Settings.jsx
    │   ├── routes/
    │   │   └── AppRoutes.jsx       # All app routes
    │   ├── services/
    │   │   └── api.ts              # Axios client
    │   ├── config/
    │   │   └── api.js
    │   ├── data/
    │   │   └── wheelchairs.jsx     # Mock data
    │   ├── styles/
    │   │   └── theme.js            # Design tokens
    │   └── App.jsx
    └── package.json
```

---

## Features

### Authentication & Authorization
- JWT-based login with 7-day token expiration
- Multi-role registration (Patient, Clinician, Vendor)
- Role-based route guards and redirects
- Automatic legacy password upgrade on login
- Cross-tab session sync via localStorage events

### Patient Portal
- Registration with medical details (NSS, weight, height, propulsion type)
- Dashboard with profile completion tracking
- Medical records view (morphology, pathology, clinician notes)
- Consultation history
- Wheelchair request submission with status tracking (Pending / Approved / Rejected)
- Catalog browsing and wheelchair details

### Clinician Portal
- Patient registry with CRUD operations
- Medical data entry for patients (morphology, pathology, notes)
- Consultation recording
- Dashboard with stats (patients seen, consultations today/month, pending assessments)
- Wheelchair request review — approve or reject with clinician notes

### Vendor Portal
- Inventory management dashboard
- Product stats and inventory value calculation
- Stock alerts for low-stock items
- Product catalog management

### Wheelchair Catalog
- Filterable product listing (type, morphology, pathology, components, options)
- Full-text search
- In-stock filtering
- Pagination
- Product detail page with image gallery, specs, options, components
- Related products recommendations
- Add to cart / wishlist

### Shared Features
- Responsive layout with mobile sidebar
- Toast notification system
- Loading skeletons on catalog pages
- Form validation across all inputs
- Settings page (account, notifications, display, privacy)

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (patient / clinician / vendor) |
| POST | `/api/v1/auth/login` | Login, returns JWT + redirect path |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/me/settings` | User preferences |
| PUT | `/api/v1/users/me/settings` | Update preferences |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | List patients (clinician only) |
| POST | `/api/v1/patients` | Create patient |
| PUT | `/api/v1/patients/{id}` | Update patient |
| DELETE | `/api/v1/patients/{id}` | Delete patient |
| POST | `/api/v1/patients/{id}/medical` | Save medical data |

### Patient Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patient/dashboard` | Dashboard data |
| POST | `/api/v1/patient/requests` | Submit wheelchair request |
| GET | `/api/v1/patient/requests` | List patient requests |

### Clinician Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/clinician/dashboard` | Dashboard with stats |
| GET | `/api/v1/clinician/requests` | All patient requests |
| PUT | `/api/v1/clinician/requests/{id}/status` | Approve/reject request |

### Vendor Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vendor/dashboard` | Dashboard with inventory stats |

### Wheelchairs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wheelchairs` | List with filters |
| GET | `/api/v1/wheelchairs/{id}` | Product detail |
| GET | `/api/v1/wheelchairs/related/list` | Related products |

### Reference Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reference/morphologies` | All morphology types |
| GET | `/api/v1/reference/pathologies` | All pathologies |
| GET | `/api/v1/reference/components` | All components |
| GET | `/api/v1/reference/options` | All options |

---

## Database Models

- **Utilisateur** — base user (email, password, address, phone)
- **Patient** — name, NSS, weight, height, propulsion type, caregiver flag
- **Clinicien** — name, specialty (rehabilitation / orthopedics / neurology)
- **Comercant** — commercial name
- **Fauteuil** — wheelchair product (type, propulsion, price, stock)
- **TypeFauteuil** — wheelchair type definitions
- **Pathologie** — medical pathologies
- **Morphologie** — body morphology types
- **Composant** — wheelchair components
- **Option** — wheelchair options/accessories
- **Consultation** — patient-clinician consultation records
- **DemandeFauteuil** — wheelchair requests with status (EN_ATTENTE / APPROUVE / REJETE)
- **PatientMedical** — clinician-entered medical records
- **UserPreferences** — user settings

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Configure your database URL in `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/wheelmatch
SECRET_KEY=your-secret-key
```

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> The frontend proxies `/api` requests to the backend via `vite.config.js`.

---

## Route Overview

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Home | Public |
| `/wheelchairs` | Catalog | Public |
| `/wheelchairs/:id` | Detail | Public |
| `/sign` | Register | Guest only |
| `/log` | Login | Guest only |
| `/faq` | FAQ | Public |
| `/patients` | Patients | Clinician |
| `/patient-dashboard` | Patient Dashboard | Patient |
| `/clinician-dashboard` | Clinician Dashboard | Clinician |
| `/vendor-dashboard` | Vendor Dashboard | Vendor |
| `/profile` | My Profile | Authenticated |
| `/settings` | Settings | Authenticated |
| `/messages` | Messages | Authenticated |
| `/record` | Medical Records | Patient |
| `/products` | Inventory | Vendor |
| `/choisis` | Wheelchair Selection | Authenticated |