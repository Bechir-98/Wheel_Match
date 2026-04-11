# 🦽 Wheel Match

**Wheel Match** is a modern web platform that connects **patients**, **clinicians**, and **vendors** to streamline the process of selecting and managing personalized wheelchairs. With a role-based experience, dynamic catalog, and intelligent matching, Wheel Match brings efficiency and empathy to mobility care.

---

## 📸 Preview

[🔗 Click here to view the app preview](https://imgur.com/a/AGeLB2X)

---

## 🚀 Features

### 🧭 General
- 🏠 **Landing Page** with intuitive navigation  
- 🔐 **Authentication**: Sign Up / Log In  
- ❓ **FAQ Section** for user assistance  
- 🎨 **Responsive UI** with Bootstrap 5  

---

### 📚 Wheelchair Catalog
- 🦽 **Browse** available wheelchair models  
- 📄 **Detailed view** for each wheelchair: type, components, and customization options  
- 📦 **Stock availability** and **pricing** displayed transparently  

---

### 👥 Role-Based User Experience

#### 👤 Patients
- Submit personal and medical details (height, weight, mobility level, usage habits)  
- View personalized recommendations powered by intelligent matching  
- Place orders (subject to clinician approval)  

#### 👩‍⚕️ Clinicians
- Access and manage patient profiles  
- Conduct and log consultations  
- Match diagnoses and morphologies with appropriate wheelchair types  

#### 🧑‍💼 Vendors
- Manage wheelchair inventory, pricing, and descriptions  
- Link each wheelchair to specific components and customization options  

---

### 🧠 Intelligent Matching
- 🔄 **Matching algorithm** considers morphology, pathologies, and daily usage  
- 🧩 **Modular design** system: wheelchairs are constructed with reusable types, options, and components  
- 🧾 **History tracking** of consultations, choices, and orders for traceability  

---

## 📁 Project Structure


```text
wheel-match/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, icons, and media
│   ├── layouts/            # Shared layout components (Navbar, Footer)
│   ├── pages/              # Individual views (Home, Login, Dashboard, etc.)
│   ├── routes/             # App routes (React Router)
│   ├── styles/             # Custom styles (CSS or SCSS)
│   └── App.jsx             # Application entry point

```


---

## ⚙️ Tech Stack

- ⚛️ **React** — frontend UI library  
- 🔁 **React Router DOM** — routing and page transitions  
- 🎨 **Bootstrap** — for responsive UI and layout  
- ⚡ **Vite** — fast dev server and bundler (optional)  
- 🐘 **PHP & MySQL** — backend logic and database  

---

## 🧬 Database Design Overview

### 📌 Key Entities
- `Utilisateur` (Superclass: `Patient`, `Clinicien`, `Commerçant`)  
- `Fauteuil` (Wheelchair): `Type_fauteuil`, `Option`, `Composant`  
- `Consultation` (links patients and clinicians)  
- `Pathologie` & `Morphologie` (mapped to wheelchair suitability)  

### 🔑 Key Actions
- `commander` (order)  
- `choisir` (choose)  
- `effectuer`, `concerner`, and more for role-based workflows  

---

## 📌 Upcoming Enhancements

- 🔎 **Advanced filtering** and search for wheelchairs  
- 📊 **Analytics dashboard** for clinicians and vendors  
- 📨 **In-app notifications** for updates and alerts  
- 📱 **Full mobile optimization** for on-the-go access  

---

## 🤝 Contribution

We welcome contributions and feedback!  
If you'd like to contribute:

1. Fork the repository  
2. Create a new branch  
3. Make your changes  
4. Submit a Pull Request  

For bugs, suggestions, or ideas, feel free to [open an issue](#)!

---

