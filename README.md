# Volentra — Smart Resource Allocation Platform

**Data-Driven Volunteer Coordination for Social Impact**

Volentra is a centralized NGO/volunteer management platform designed to aggregate community issue reports, prioritize urgent needs, intelligently match volunteers to tasks, and provide real-time operational analytics.

**🎥 Watch the Demo:** [Homepage Mock Demo (YouTube)](https://youtu.be/TRakgNzc9pA)

Designed for hackathons and rapid deployment, it features a polished, modern SaaS dashboard with real-time updates and interactive mapping.

## Features

- **🤖 Gemini AI Triage:** Every submitted incident is automatically analyzed by Google's Gemini 2.5 Flash model — producing an AI urgency score, recommended actions, and required supply lists in real-time.
- **📊 Real-time Dashboard:** Built with Socket.io to provide live updates as reports are submitted and tasks are completed.
- **🗺️ Interactive Mapping:** Dual-mode map component. Auto-detects network connectivity to display either a real Leaflet + OpenStreetMap or a beautiful CSS-based interactive heatmap fallback.
- **📱 Responsive UI:** Fully responsive for desktop, tablet, and mobile with a built-in mobile drawer and hamburger menu.
- **📁 Cloud Storage:** Backend configured with Multer and Cloudinary for seamless image uploads in serverless environments.
- **🔑 Secure Auth:** Robust JWT (JSON Web Tokens) based authentication with secure cookie management for persistent sessions and role-based access control.
- **📈 Advanced Analytics:** Embedded Chart.js for data visualization, displaying system statistics and priority breakdown.

## Tech Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Vanilla CSS (Glassmorphism, custom design system, dark mode)
- **Mapping:** Leaflet / React-Leaflet (Auto-detects Tile Server connectivity)
- **Charts:** Chart.js + react-chartjs-2
- **Real-time:** Socket.io-client
- **Routing:** React Router v7

### Backend
- **Server:** Node.js + Express 5
- **AI:** Google Gemini 2.5 Flash (`@google/genai`)
- **Real-time:** Socket.io
- **Storage:** Cloudinary (via multer-storage-cloudinary)
- **Database:** In-memory Database (Ready to connect to MongoDB/PostgreSQL)
- **Authentication:** JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** installed
- *(Optional)* A [Google AI Studio](https://aistudio.google.com/) API key to enable Gemini AI triage
- *(Optional)* Cloudinary credentials for image uploads

### 1. Clone the Repository

```bash
git clone https://github.com/adixyz1/Volentra.git
cd Volentra
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`)

Copy the example and fill in your keys:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Authentication
JWT_SECRET=super-secret-volentra-key

# Google Gemini AI (optional — enables AI triage on new reports)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage (optional — enables image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### Frontend (`frontend/.env`)

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Points to the backend API (default for local development)
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Start the Backend API

```bash
cd backend
npm install
node server.js
```

The server starts on **http://localhost:5000**.

### 4. Start the Frontend Application

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5173**.

### 5. Log In

Once both servers are running, open **http://localhost:5173/** in your browser.

Use any of the demo accounts to test the different views:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ngo.org` | `password` |
| **Volunteer** | `john@vol.org` | `password` |
| **Field Worker** | `mike@field.org` | `password` |

## Troubleshooting

- **Map is blank or grey:** Your network is blocking OpenStreetMap tile servers (`tile.openstreetmap.org`). The application will automatically detect this on the first load and gracefully degrade to a beautiful fallback CSS heatmap. If you still see a grey box, try hard-refreshing (`Ctrl+Shift+R`).
- **AI Analysis shows "unavailable":** Make sure you have set a valid `GEMINI_API_KEY` in `backend/.env`. Without it the app still works — AI triage is simply skipped and reports can be assessed manually.
- **npm install fails with ETIMEDOUT:** If your network blocks the default npm registry, append `--registry https://registry.npmmirror.com` to the install command.

## Deployment

This application supports a **split-deployment** model to fully support WebSockets and cloud storage.

### Backend → Google Cloud Run

The `backend/` directory includes a production-ready `Dockerfile`.

```bash
cd backend

# Build and deploy with Google Cloud CLI
gcloud run deploy volentra-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Environment Variables Required:** `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Frontend → Firebase Hosting

The `frontend/` directory is pre-configured with `firebase.json` for single-page app hosting.

```bash
cd frontend
npm run build

# Deploy the dist/ folder
firebase deploy --only hosting
```

**Environment Variables Required (build-time):** `VITE_BACKEND_URL` (set to your Cloud Run service URL).

### Alternative: Frontend → Vercel

You can also deploy the frontend to Vercel. The repository includes a `vercel.json` file to ensure React Router handles SPA routing without 404 errors.

- Import the `frontend/` directory as a Vite project on Vercel.
- **Environment Variables Required:** `VITE_BACKEND_URL` (set to your Cloud Run or backend URL).
