# Real-Time Service Request Management Frontend

A real-time, responsive, and robust frontend for the Service Management application, built with [Next.js 14](https://nextjs.org/) and React. This application provides a seamless interface for Operators to submit service requests and Supervisors to manage them, featuring real-time bidirectional communication via WebSockets.

##  Key Features

###  Role-Based Dashboards
- **Operator Portal:** Submit service requests, view historical statuses, and communicate directly with supervisors in real-time.
- **Supervisor Portal:** Comprehensive view of all queued requests. Approve, reject, or cancel requests with full visibility into the processing lifecycle. Manage user accounts and system access.

###  Real-Time Chat & Support System
Powered by Socket.io, the platform includes a highly integrated chat system to facilitate instant communication.
- **Floating Operator Widget:** A non-intrusive chat widget for Operators to instantly message Supervisors without leaving their dashboard.
- **Supervisor Chat Hub:** A dedicated chat page for Supervisors to handle multiple operator conversations simultaneously, complete with a responsive side-panel list of active chats.
- **Typing Indicators:** Real-time bouncing dot (`...`) animations appear when the other party is typing.
- **Unread Message Badges:** Smart, global unread counters on the navigation sidebar and chat widgets.
- **Smart Deduplication & Sync:** Flawless cross-window syncing ensures messages are deduplicated and active conversation lists are instantly updated without manual refreshes.

###  Fully Responsive Design
- Built with **Tailwind CSS** for fluid scaling across all devices.
- Mobile-first implementations for complex UI elements like the Supervisor Chat, ensuring maximum typing area and clean navigation (e.g., sliding panels, hidden text labels, and dynamic header back-buttons).

###  State Management & API
- **Zustand:** Lightweight and fast global state management for Authentication and Real-time Chat synchronicity.
- **Axios:** Centralized API requests with JWT interception for secure communication with the NestJS backend.

##  Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Real-time:** Socket.io-client
- **Icons:** Lucide React

##  Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and configure your backend API and Socket endpoints:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open [http://localhost:3001](http://localhost:3001) in your browser. *(The port defaults to 3000 if unoccupied, but typically runs on 3001 if the backend runs on 3000).*

---
*This project is optimized for modern browsers and relies on real-time WebSocket connections for the best user experience.*
