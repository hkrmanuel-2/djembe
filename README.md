# Djembe - Music Education Platform

A web-based music education platform designed for children aged 5-12, built as a capstone project. Students learn music production through a simplified DAW (Digital Audio Workstation), explore 3D interactive worlds with AI-generated music, complete teacher-assigned challenges, and track their progress through a gamified XP system.

## Key Features

- **Music Studio (DAW-Lite)** - A simplified digital audio workstation where students create beats by dragging loops onto a timeline, with playback, export, and project saving
- **3D Worlds** - Two immersive Three.js environments (Fireside and Auditorium) where students explore AI-generated music with interactive stem mixing
- **Assignment System** - Teachers create assignments (file upload or project-based), students submit work, and teachers provide feedback with scores
- **Progress & Gamification** - XP system, badges, daily streaks, and level tracking to keep students motivated
- **Role-Based Access** - Three user roles (Admin, Teacher, Student) with Supabase Row Level Security
- **Real-Time Notifications** - Live notifications for new assignments, submissions, and feedback via Supabase Realtime
- **Onboarding Tours** - Guided walkthroughs for first-time users using React Joyride

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion, Radix UI |
| State Management | Zustand |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Audio | Tone.js, Web Audio API, lamejs (MP3 export) |
| 3D Graphics | Three.js |
| AI Music | Suno API (generation), MVSEP (stem separation) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js v18+
- A Supabase project (free tier works)
- Suno API key (optional, for AI music generation)
- MVSEP API key (optional, for stem separation)

### Installation

```bash
git clone <repo-url>
cd djembe
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUNO_API_KEY=your_suno_key
MVSEP_API_KEY=your_mvsep_key
```

### Running the App

```bash
npm run dev        # Start development server (localhost:5173)
npm run build      # Production build
npm run test       # Run tests
```

### Test Accounts

Run `node scripts/create-test-accounts.js` to create test users:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@godsgrace.test` | `djembe2026` |
| Teacher | `teacher@godsgrace.test` | `djembe2026` |
| Students | `student1@godsgrace.test` - `student12@godsgrace.test` | `djembe2026` |

## Project Structure

```
djembe/
├── api/                    # Vercel serverless functions (CORS proxy, API routes)
├── public/models/          # Compressed 3D GLB models
├── src/
│   ├── assets/pages/       # Page components (Dashboard, DAW, Auth, etc.)
│   ├── components/         # Reusable UI, 3D Worlds, Voices, DAW controls
│   ├── store/              # Zustand state management
│   ├── lib/                # API functions and utilities
│   └── hooks/              # Custom React hooks
├── scripts/                # Test account creation
└── docs/                   # Screenshots and additional documentation
```

## Documentation

- [DOCUMENTATION.md](DOCUMENTATION.md) - Full technical documentation covering architecture, features, database schema, API reference, and deployment
- [AI_USE_DOCUMENTATION.md](AI_USE_DOCUMENTATION.md) - Disclosure of AI tool usage during development

## Deployment

The project is deployed on Vercel with:
- SPA routing rewrites for client-side navigation
- Security headers (HSTS, CSP, X-Frame-Options)
- Long-lived cache for 3D model assets
- Serverless functions for external API proxying

## License

Private - All rights reserved
