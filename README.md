# 🌐 Real-Time Private Chat Engine

A modern, full-duplex 1-on-1 private chat application built entirely from scratch. This project showcases structured, real-time message routing using a **Next.js frontend framework** connected to an independent **Node.js WebSocket (`ws`) server**.

---

## ✨ Key Product Features

* **1x1 Isolated Private Messaging:** Messages are securely routed from handle to handle over server memory mappings rather than blasted out to a global channel.
* **Smart Roster Directory:** Automatic directory rendering displaying users online with animated ping indicators.
* **Instant Dynamic Theme Toggle:** Fluid theme transition engine switching configurations seamlessly between light mode and dark mode without severing socket frames.
* **Browser Tab Ticker Alert:** Tab headers change titles dynamically (`💬 New Message!`) when messages drop into background minimized windows.
* **Unread Notification Highlights:** Channels light up with pulsing state flags if a message is received from a background user thread.
* **TypeScript Integrity (TSX):** Complete static type layout handling tracking form data events and client network payloads safely.

---

## 🛠️ Tech Architecture Blueprint

* **Framework:** Next.js (App Router & Tailwind CSS integration layout)
* **Language Layer:** TypeScript (TSX formatting)
* **Real-time Pipeline:** Native WebSocket API Framework (`ws` node configuration)
* **Design Engine:** Tailwind CSS Utility Tokens

---

## 🚀 Rapid Deployment & Startup Guide

Follow these quick commands back-to-back to spin up the cluster environment on your local workstation machine.

### 1. Installation Phase

Navigate into your directory root and install the required modules:

```bash
cd ixcamper-chat-app

# Install the WebSocket engine and its type definitions
npm install ws
npm install --save-dev @types/ws
```

### 2. Execution Phase

You will need **two independent terminal windows running simultaneously** to load the platform frames.

#### Terminal A: Fire up the WebSocket Relay Router
```bash
node ws-server.js
```
*Expected console output: `🚀 Private 1x1 Chat Server active on ws://localhost:5001`*

#### Terminal B: Initialize Next.js Framework Viewport
```bash
npm run dev
```
*Expected console output: Open your web browser workspace to `http://localhost:3000`*

---

## 🧪 Simulation Testing Strategy

To see full duplex network routing functionality work locally:

1. Fire up a default browser page grid directed at `http://localhost:3000` and pick a handle like **`Alice`**.
2. Launch a separate **Incognito or Private window** pointing at `http://localhost:3000` and spawn a user handle like **`Bob`**.
3. Select **Bob** inside **Alice's** connection roster. Send an arbitrary text string message block. 
4. Minimize Alice's viewport grid and watch the tab alerts flash seamlessly while tracking changes inside Bob's direct conversation thread panel container!

---

## 📈 Roadmap & Upcoming Modules

If you want to continue extending this infrastructure template, consider implementing:

* **Persistent History:** Binding data models down into a local **SQLite / PostgreSQL database configuration via Prisma ORM**.
* **Identity Management:** Wrapping profile locks inside **NextAuth / Auth.js JSON Web Token layouts**.
* **Media Pipelines:** Transferring attachments or image uploads utilizing **AWS S3 / Cloudinary asset streams**.
