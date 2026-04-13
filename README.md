# VenueFlow 🏟️ — Smart Event Experience Platform

> **PromptWars: Virtual** — Physical Event Experience Challenge

## 🎯 Problem Statement

Design a solution that improves the physical event experience for attendees at large-scale venues — addressing **crowd management**, **waiting times**, and **real-time coordination** (stadiums, concert halls, festivals, metro stations).

## 💡 Solution: VenueFlow

**VenueFlow** is an intelligent, real-time event experience platform that transforms how attendees navigate and enjoy large-scale venues. It provides:

### Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Interactive Venue Map** | SVG-based live venue layout with color-coded crowd density zones |
| 📊 **Crowd Heatmap** | Real-time crowd density visualization (green/yellow/red) with trend indicators |
| ⏱️ **Queue Estimator** | Live wait times for food stalls, restrooms, entry gates with progress bars |
| 📅 **Event Schedule** | Filterable timeline with reminder functionality (persisted in localStorage) |
| 🔔 **Smart Alerts** | Context-aware push notifications: "Gate B is less crowded — exit now!" |
| 👨‍💼 **Organizer Panel** | Admin dashboard to broadcast alerts, override crowd data, and monitor stats |

### How It Solves the Problem

1. **Crowd Management** → Live heatmap shows attendees where crowds are concentrated, enabling them to make informed decisions about which zones to visit.

2. **Reducing Wait Times** → Queue estimator shows real-time wait times across all service points, helping attendees identify the shortest queues.

3. **Real-Time Coordination** → Admin panel allows organizers to broadcast targeted alerts ("Rain incoming — move to indoor areas"), override zone data, and coordinate event operations live.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism, CSS Custom Properties), Vanilla JavaScript (ES6+ Modules)
- **Backend**: Node.js + Express (static file server)
- **Deployment**: Docker → Google Cloud Run
- **Storage**: localStorage for user preferences (reminders)
- **Data**: Simulated real-time data engine (demonstrates the concept without requiring IoT infrastructure)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Run Locally
```bash
npm install
npm start
```
The app will be available at `http://localhost:8080`

### Docker
```bash
docker build -t venueflow .
docker run -p 8080:8080 venueflow
```

## 📦 Project Structure

```
venueflow/
├── public/
│   ├── index.html          # Main SPA entry
│   ├── css/
│   │   ├── variables.css   # Design tokens
│   │   ├── base.css        # Reset & globals
│   │   ├── animations.css  # Micro-animations
│   │   └── components.css  # All component styles
│   └── js/
│       ├── data.js         # Simulated real-time data engine
│       ├── venue-map.js    # Interactive SVG map
│       ├── heatmap.js      # Queue cards & density
│       ├── schedule.js     # Event timeline
│       ├── alerts.js       # Smart notification system
│       ├── admin.js        # Organizer controls
│       └── app.js          # Main app controller
├── server.js               # Express static server
├── Dockerfile              # Cloud Run container
├── package.json
└── README.md
```

## 🌟 Built With

- Built using **Google Antigravity** as part of the [PromptWars: Virtual](https://promptwars.in/) hackathon
- Author: **Mamidi Vashisht** — [GitHub](https://github.com/Vasi1951)

## 📄 License

MIT License
