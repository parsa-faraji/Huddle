# Huddle

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: Educational](https://img.shields.io/badge/License-Educational-blue?style=flat-square)](LICENSE)

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

## Vercel Node API Setup (Team Runbook)

Use this when you want to initialize the backend pipeline end to end on Vercel.

### 1) Create a basic API route

```bash
mkdir -p api
cat > api/hello.js <<'EOF'
module.exports = (req, res) => {
  res.status(200).json({ ok: true, message: "hello world" });
};
EOF
```

### 2) Add a minimal `package.json`

Create `package.json` in the repo root:

```json
{
  "name": "huddle",
  "private": true,
  "type": "commonjs",
  "engines": { "node": ">=18" },
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "devDependencies": {
    "vercel": "^48.0.5"
  }
}
```

### 3) Install and test locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/api/hello` and confirm:

```json
{"ok":true,"message":"hello world"}
```

### 4) Push to GitHub

```bash
git add .
git commit -m "Scaffold Vercel Node API hello world"
git push origin main
```

### 5) Deploy in Vercel

1. Vercel Dashboard -> `Add New Project`
2. Import this GitHub repo
3. Framework Preset: `Other`
4. Root Directory: repo root
5. Click `Deploy`

### 6) Verify deployed endpoint

Open:

`https://<your-vercel-domain>/api/hello`

If this works, the backend deployment pipeline is wired correctly.

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
