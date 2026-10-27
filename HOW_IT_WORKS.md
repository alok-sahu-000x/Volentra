# Volentra: How It Works & System Architecture

This document provides a comprehensive overview of how **Volentra — Smart Resource Allocation Platform** operates, what components and entities it handles, and the tangible benefits it brings to disaster response and community management.

---

## 1. What Things It Works On

Volentra is designed to manage and coordinate resources during emergency situations, community events, or regular NGO operations. The platform works specifically on:

- **Incident Reports:** Captures real-time community issues classified into categories like *Medical, Food Shortage, Infrastructure, Shelter, Water Supply, and Logistics*.
- **Volunteer Coordination:** Manages a database of volunteers, tracking their skills, real-time location (latitude/longitude), availability status, and performance ratings.
- **Task Delegation (Matches):** Connects the right incident report to the most appropriate volunteer based on intelligent scoring algorithms.
- **NGO Organization Networking:** Maintains an active registry of various organizations and shelters, creating a unified coordination network.

---

## 2. Core Mechanisms: How It Works

Volentra relies on a full-stack automated architecture (React + Node.js/Express) to ensure operations feel instant and seamless.

### A. Intelligent Priority Scoring
When an incident report is submitted, Volentra does not view all tasks equally. It automatically calculates a **Priority Score** (0-100) using a specific algorithm:
- **Urgency Level:** Contributes 50% to the overall score.
- **Scale of Impact (People Affected):** Contributes 30% to the score.
- **Time Pending (Hours since creation):** Contributes 20% to the score.
*This ensures that critical mass-casualty events or reports that have been ignored for too long are surfaced to the top of the queue automatically.*

### B. Smart Resource Matching Engine
When attempting to match a volunteer to an incident, the backend computes a **Match Score** for nearby volunteers. The Match engine analyzes:
1. **Skill Relevance (40% weight):** Does the volunteer have skills matching the incident type?
2. **Proximity (30% weight):** Uses the *Haversine Formula* to calculate the exact distance (in km) between the incident coordinate and the volunteer's current GPS location.
3. **Availability (20% weight):** Prioritizes volunteers whose status is marked as 'Available'.
4. **Volunteer Rating (10% weight):** Rewards highly-rated, experienced volunteers for critical tasks.
*The system returns the Top 5 best matches, enabling instant, data-driven deployment.*

### C. Real-Time Synchronization (Socket.io)
Traditional systems require page refreshes to see new tasks. Volentra uses **Socket.io** web-sockets to push live updates. When a field worker submits a new report, or when an Admin assigns a task, the dashboard instantly flashes the update to all connected clients without requiring a reload.

### D. Network-Resilient Mapping
Field operations often occur in low-connectivity zones. Volentra incorporates a **Dual-Mode MapView**:
- **Primary:** Leverages *Leaflet.js* and OpenStreetMap tile servers for high-fidelity interactive mapping.
- **Fallback Mode:** If the app detects that the network is blocking external Maps/CDNs (common in strict proxies or disaster zones), it instantly and gracefully degrades to a fast, purely CSS-based interactive heatmap.

### E. Secure Authentication (JWT)
Volentra implements robust role-based authentication using **JSON Web Tokens (JWT)**.
- **Stateless & Scalable:** JWT allows the backend to securely verify users without needing complex server-side session stores.
- **Secure Cookies:** Tokens are securely handled via HTTP-only cookies, protecting against XSS attacks while ensuring seamless, persistent login sessions.
- **Role-Based Access Control (RBAC):** Different access levels (Admin, Volunteer, Field Worker) are strictly enforced by the backend on API routes, ensuring data integrity.

### F. Serverless Cloud Architecture
The platform is designed to be highly scalable using a split-deployment model:
- **Cloudinary Image Storage:** Files are not saved locally. Instead, they are streamed directly into Cloudinary, allowing the backend to remain fully serverless and ephemeral.
- **Vercel & Render Integration:** The decoupled frontend and backend seamlessly communicate across the cloud via dynamic environment variables (`VITE_BACKEND_URL`) and open CORS policies.

---

## 3. High-Level Architecture Flow

1. **Submission:** A *Field Worker* or citizen logs in and submits a visual incident report, attaching images (handled dynamically via Cloudinary cloud storage).
2. **Analysis:** The Express API categorizes the report and calculates its Priority Score.
3. **Broadcast:** The new report is emitted via WebSockets to the Admin Dashboard.
4. **Action:** The Admin clicks exactly one button to "Find Match." The server calculates proximity arrays and surfaces the Top 5 volunteers.
5. **Execution:** The Admin assigns the task. The assigned *Volunteer* receives a real-time notification on their device and the task status shifts to "In Progress".

---

## 4. Key Benefits of This System

| Benefit Area | Description |
|--------------|-------------|
| **Significantly Faster Response Times** | Intelligent volunteer matching eliminates the manual burden of searching through spreadsheets. The system connects the incident to the closest, most capable person instantly. |
| **Data-Driven Triage** | Automated priority scoring guarantees that resources are pushed toward the highest impact/highest urgency crises first, eliminating human bias. |
| **Operational Awareness** | The built-in Chart.js analytics and map visualizations provide command centers with a bird's-eye view of where issues are clustering, allowing proactive supply deployments. |
| **Resilience & Accessibility** | Capable of starting up with Zero network-dependencies. The custom CSS heatmap and localized database ensure operations continue even if global infrastructure goes down. |
| **Modern User Experience** | Premium glassmorphism design, dark mode, and micro-animations result in exceptionally high user engagement, reducing onboarding friction for elderly or non-technical volunteers. |
