# Wheel Match

> A full-stack web platform connecting **patients** and **vendors** to streamline wheelchair selection through AI matching.

---

## AI matching (clinician role retired)

Wheelchair ranking is rule-first (`EstAssocie` + propulsion + in-stock) via
`GET /api/v1/patient/recommendations`, with an optional llama.cpp re-rank
(`slm` service in `docker-compose.yml`, `Qwen2.5-0.5B-Instruct` Q4_K_M GGUF). The SLM never
writes approvals: a patient's choice from the ranking is final at creation
(`STATUT="APPROUVE"`, `ORIGIN="slm"`). History tables (`Consultation`,
`MedicalEntry`) and old request notes are kept; `CLINICIEN`,
`CLINICIAN_PATIENT`, `LINK_REQUEST` are dropped by
`backend/scripts/drop_clinician.sql`.

Runbook (Docker daemon required, in order):

```bash
docker compose up --build                                   # downloads the GGUF into llama-models on first boot
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
- **Tailwind CSS** + **Radix UI** (`src/components/ui`) — responsive UI
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
│   │   │   ├── deps.py             # Auth dependencies (get_current_user, role guards)
│   │   │   └── routers/
│   │   │       ├── auth.py           # Login / Register
│   │   │       ├── users.py          # Current user profile + settings
│   │   │       ├── patient_portal.py # Patient dashboard, medical, requests
│   │   │       ├── recommendations.py# Rule-first ranking + SLM re-rank
│   │   │       ├── vendor_portal.py  # Vendor dashboard + requests
│   │   │       ├── wheelchairs.py    # Catalog CRUD + image upload
│   │   │       ├── reference.py      # Types, morphologies, pathologies, components, options
│   │   │       ├── chat.py           # Chat + rebuild-kb
│   │   │       └── messages.py       # Threads + unread-count
│   │   ├── core/
│   │   │   └── config.py            # Settings, JWT, CORS
│   │   ├── db/
│   │   │   └── session.py           # SQLAlchemy session factory
│   │   ├── models/
│   │   │   └── tables.py            # All database models
│   │   ├── schemas/                 # auth, chat, demandes, messages
│   │   ├── services/                # auth_service, chat_service, docscan_service,
│   │   │                           # kb_builder, messaging, recommend_service, user_profile
│   │   └── main.py                  # FastAPI app entry
│   ├── scripts/                     # schema_postgresql, drop_clinician, eval_recommend
│   ├── uploads/                     # Runtime images (gitignored, .gitkeep)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/                # ProtectedRoute, GuestRoute
    │   │   ├── chat/                # ChatWidget, ChatInput, ChatMessage, ChatContext
    │   │   ├── dashboard/           # DashboardShell
    │   │   ├── ui/                  # alert, avatar, badge, button, card, dialog,
    │   │   │                       # dropdown-menu, input, label, select, separator,
    │   │   │                       # skeleton, table, textarea
    │   │   ├── MedicalRecordForm.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── theme-toggle.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── home.jsx             # Landing page
    │   │   ├── About.jsx
    │   │   ├── Faq.jsx
    │   │   ├── sign.jsx             # Registration (patient / vendor)
    │   │   ├── log.jsx              # Login
    │   │   ├── WheelchairsPage.jsx  # Catalog
    │   │   ├── WheelchairDetailPage.jsx
    │   │   ├── Patient_Dashboard.jsx
    │   │   ├── VendorDashboard.jsx
    │   │   ├── products.jsx         # Vendor inventory
    │   │   ├── choisis.jsx          # Wheelchair selection
    │   │   └── dashboard/
    │   │       ├── MyProfile.jsx
    │   │       ├── Messages.jsx
    │   │       └── Settings.jsx
    │   ├── layouts/
    │   │   ├── nav.jsx
    │   │   └── footer.jsx
    │   ├── routes/
    │   │   └── AppRoutes.jsx        # All app routes
    │   ├── config/
    │   │   └── api.js               # apiUrl / authHeaders (single client)
    │   ├── lib/
    │   │   └── utils.js             # cn()
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Features

### Authentication & Authorization
- JWT-based login with 7-day token expiration
- Registration (Patient, Vendor)
- Role-based route guards and redirects
- Automatic legacy password upgrade on login
- Cross-tab session sync via localStorage events

### Patient Portal
- Registration with medical details (NSS, weight, height, propulsion type)
- Dashboard with profile completion tracking
- Medical records view (morphology, pathology, history)
- AI-ranked recommendations (`GET /patient/recommendations`), patient choice is final (`APPROUVE`)
- Wheelchair request submission with status tracking (Pending / Approved / Rejected)
- Catalog browsing and wheelchair details

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
| POST | `/api/v1/auth/register` | Register (patient / vendor) |
| POST | `/api/v1/auth/login` | Login, returns JWT + redirect path |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/me/settings` | User preferences |
| PUT | `/api/v1/users/me/settings` | Update preferences |

### Patient Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patient/dashboard` | Dashboard data |
| PUT | `/api/v1/patient/medical` | Update medical data |
| POST | `/api/v1/patient/medical/scan` | Scan medical document |
| POST | `/api/v1/patient/requests` | Submit wheelchair request |
| GET | `/api/v1/patient/requests` | List patient requests |
| POST | `/api/v1/patient/requests/{id}/accept` | Accept ranking choice (final) |
| GET | `/api/v1/patient/recommendations` | Rule-first ranking + SLM re-rank |

### Vendor Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vendor/dashboard` | Dashboard with inventory stats |
| GET | `/api/v1/vendor/requests` | Incoming patient requests |

### Wheelchairs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wheelchairs` | List with filters |
| POST | `/api/v1/wheelchairs` | Create product (vendor) |
| GET | `/api/v1/wheelchairs/{id}` | Product detail |
| PUT | `/api/v1/wheelchairs/{id}` | Update product (vendor) |
| DELETE | `/api/v1/wheelchairs/{id}` | Delete product (vendor) |
| POST | `/api/v1/wheelchairs/{id}/image` | Upload product image |

### Reference Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reference/types` | All wheelchair types |
| GET | `/api/v1/reference/morphologies` | All morphology types |
| GET | `/api/v1/reference/pathologies` | All pathologies |
| GET | `/api/v1/reference/components` | All components |
| GET | `/api/v1/reference/options` | All options |

### Chat & Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Chat query |
| POST | `/api/v1/chat/rebuild-kb` | Re-embed knowledge base |
| GET | `/api/v1/chat/health` | Chat service health |
| GET | `/api/v1/messages/threads` | List threads |
| GET | `/api/v1/messages/threads/{id}` | Thread messages |
| POST | `/api/v1/messages/messages` | Send message |
| GET | `/api/v1/messages/unread-count` | Unread count |

---

## Database Models

- **Utilisateur** — base user (email, password, address, phone)
- **Patient** — name, NSS, weight, height, propulsion type, caregiver flag
- **Comercant** — commercial name
- **Fauteuil** — wheelchair product (type, propulsion, price, stock)
- **TypeFauteuil** — wheelchair type definitions
- **Pathologie** — medical pathologies
- **Morphologie** — body morphology types
- **Composant** — wheelchair components
- **Option** — wheelchair options/accessories
- **Consultation** — patient-clinician consultation records
- **DemandeFauteuil** — wheelchair requests with status (EN_ATTENTE / APPROUVE / REJETE)
- **PatientMedical** — patient medical records
- **UserPreferences** — user settings

> Clinician tables (`CLINICIEN`, `CLINICIAN_PATIENT`, `LINK_REQUEST`) are dropped by
> `backend/scripts/drop_clinician.sql`. History tables (`Consultation`, `MedicalEntry`) are kept.

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
| `/about` | About | Public |
| `/patient-dashboard` | Patient Dashboard | Authenticated |
| `/vendor-dashboard` | Vendor Dashboard | Authenticated |
| `/profile` | My Profile | Authenticated |
| `/settings` | Settings | Authenticated |
| `/messages` | Messages | Authenticated |
| `/products` | Inventory | Authenticated |
| `/choisis` | Wheelchair Selection | Authenticated |