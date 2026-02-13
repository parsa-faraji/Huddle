# Huddle

A campus study spot discovery, rating, and group matching app for students.

## About

Huddle helps students discover and evaluate study locations on campus, find compatible study groups, and get personalized recommendations. Users can explore maps of study spots, rate them on multiple metrics (noise, seating, lighting, power, WiFi, crowdedness, etc.), and review community insights.

## Features

- **Study Spot Discovery** — View study locations on a map or list with details like noise level, WiFi quality, and seating availability
- **Ratings & Reviews** — Rate study spots across multiple metrics and leave notes for the community
- **Study Group Formation** — Join or create study groups based on shared preferences and availability
- **Location Recommendations** — Groups receive recommended spots based on aggregated preferences
- **User Profiles & Preferences** — Set study preferences to power matching and recommendations
- **Search & Filtering** — Filter spots by criteria (quiet, has outlets, open late, etc.)

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React, TailwindCSS |
| Backend | Node.js (Serverless / API Routes) |
| Database & Auth | Firebase (Firestore, Auth) |
| Hosting | Vercel |
| Data / Logic | JavaScript / TypeScript |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Firebase project configured

### Installation

```bash
git clone https://github.com/parsa-faraji/Huddle.git
cd Huddle
npm install
```

### Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

## Project Structure

```
Huddle/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components / routes
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase & API service layer
│   ├── utils/           # Helper functions & matching logic
│   ├── styles/          # Global styles
│   └── App.jsx          # App entry point
├── .env.example         # Environment variable template
└── package.json
```

## Team

Built by the Huddle team — 8-12 members across frontend, backend, design, and data.

## License

This project is for educational purposes.
