# Djembe - Project Documentation

> A music education platform featuring a simplified DAW, 3D interactive worlds, AI-powered music generation, and comprehensive school management tools.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [User Roles](#user-roles)
5. [Student Features](#student-features)
6. [Teacher Features](#teacher-features)
7. [Admin Features](#admin-features)
8. [DAW-Lite (Music Studio)](#daw-lite-music-studio)
9. [3D Worlds](#3d-worlds)
10. [Assignment System](#assignment-system)
11. [Progress & Gamification](#progress--gamification)
12. [Notifications](#notifications)
13. [Onboarding](#onboarding)
14. [Database Schema](#database-schema)
15. [State Management](#state-management)
16. [API Reference](#api-reference)
17. [Project Structure](#project-structure)
18. [Environment Variables](#environment-variables)
19. [Deployment](#deployment)
20. [Test Accounts](#test-accounts)

---

## Overview

**Djembe** is a web-based music education platform for schools. Students learn music production through an intuitive DAW, explore 3D worlds with AI-generated music, complete assignments, and track progress with XP and badges. Teachers manage classes, create assignments, review submissions, and monitor analytics. Admins oversee school-wide settings, user approvals, and access controls.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion, Radix UI |
| State | Zustand (persistent stores) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Audio | Tone.js, Web Audio API, lamejs (MP3 export) |
| 3D | Three.js (vanilla, not R3F) |
| AI Music | Suno API (generation), MVSEP (stem separation) |
| Hosting | Vercel |

---

## Architecture

```
Frontend (React + Vite)
├── Pages ─────────── Landing, Login, Signup, Dashboard, DAW, Worlds, Settings
├── Zustand Stores ── Auth, DAW, Voices, Progress, Notifications
├── Components ────── Sidebar, Timeline, VoicesPanel, AssignmentForm, etc.
└── API Lib ───────── teacherApi, adminApi, progressApi, voicesApi, etc.
        │
        ▼
Supabase (Backend-as-a-Service)
├── PostgreSQL ────── 20+ tables with Row Level Security
├── Auth ──────────── JWT-based, role detection (admin → teacher → student)
├── Realtime ──────── WebSocket subscriptions for notifications
└── Storage ───────── Assignment file uploads
        │
        ▼
External APIs
├── Suno API ──────── AI music generation (kid-friendly instrumentals)
├── MVSEP ─────────── Audio stem separation (rhythm, bass, harmony, melody)
└── Vercel Serverless  CORS proxy for external audio CDNs
```

### Design Patterns

- **State**: Zustand stores with `persist` middleware (localStorage)
- **Routing**: React Router v7 with `ProtectedRoute` wrapper for role-based access
- **Audio**: Tone.js Transport for beat sync, native `Audio` elements for playback
- **3D**: Vanilla Three.js with `GLTFLoader` + meshopt decoder (not React Three Fiber)
- **UI**: Glassmorphism dark theme, Framer Motion transitions, Fredoka font for headings

---

## Getting Started

### Prerequisites

- Node.js v18+
- Supabase project (free tier works)
- Suno API key (optional, for AI music)
- MVSEP API key (optional, for stem separation)

### Setup

```bash
git clone <repo-url>
cd djembe
npm install
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # for scripts only
SUNO_API_KEY=your_suno_key                         # optional
MVSEP_API_KEY=your_mvsep_key                       # optional
```

Run the database SQL files in Supabase SQL Editor (see [Database Schema](#database-schema)).

```bash
npm run dev     # Development server at localhost:5173
npm run build   # Production build
```

### Create Test Accounts

```bash
node scripts/create-test-accounts.js
```

This creates an admin, teacher, and 12 student accounts for testing (see [Test Accounts](#test-accounts)).

---

## User Roles

The platform has three user roles, determined by which database table contains a matching email:

| Role | Home Route | Detection Priority |
|------|-----------|-------------------|
| Admin | `/admin` | Checked first — `admins` table |
| Teacher | `/students` | Checked second — `teachers` table |
| Student | `/home` | Checked last — `students` table |

Authentication flow (`useAuthStore.js`):
1. User signs in via Supabase Auth (email/password)
2. `loadUserProfile()` checks tables in order: `admins` → `teachers` → `students`
3. First match determines `userType` and `userProfile`
4. `ProtectedRoute` enforces `allowedRoles` per route

Teachers and students have an `approval_status` field (`pending`, `approved`, `rejected`). Only approved users can log in. Admins have no approval requirement.

---

## Student Features

### Dashboard (`/home`)
- Welcome message with first name
- Quick links to Music Studio, Worlds, Assignments
- Recent activity and progress summary

### Music Studio (`/daw`)
- Full DAW-Lite interface (see [DAW-Lite](#daw-lite-music-studio))

### Challenges (`/assignments`)
- View assigned challenges from teachers
- Submit completed projects (audio file upload)
- See feedback and grades from teacher

### My Journey (`/progress`)
- XP and level tracking
- Badge collection
- Daily streak counter
- Session time tracking (5 XP per 10 minutes, capped at 60 min/day)

### 3D Worlds (`/world1`, `/world2`)
- Immersive 3D environments with interactive musicians
- Voices Panel for AI-generated music exploration
- See [3D Worlds](#3d-worlds) for details

### Tutorials (`/tutorials`)
- Video tutorial library with category filtering
- Difficulty level indicators

### Settings (`/settings`)
- Account information display

---

## Teacher Features

### Student Dashboard (`/students`)
- Overview of all students in the teacher's school
- Filter by class, search by name
- View individual student progress, XP, badges, and streaks

### Assignment Management (`/teacher/assignments`)
- Create assignments with title, description, due date
- Attach specific loops from the library for students to use
- Set difficulty level and instructions
- Edit or delete existing assignments

### Submission Review (`/teacher/submissions`)
- View all student submissions
- Play submitted audio
- Provide feedback comments and numerical scores via `FeedbackModal`
- Track grading progress

### Analytics (`/teacher/analytics`)
- Student difficulty detection (identifies struggling students)
- Class-wide statistics
- Individual student breakdowns

### Student Projects (`/teacher/projects`)
- Browse student-created DAW projects

### World Settings (`/teacher/worlds`)
- Configure AI music generation parameters per world
- Settings: BPM (60-200), Genre, Style, Mood, Custom Prompt
- World selector to configure World 1 and World 2 independently
- Settings stored per-school in `voice_settings` table
- Students automatically use these settings when generating music

---

## Admin Features

### Admin Dashboard (`/admin`)

The admin dashboard has 4 tabs:

#### Overview
- Statistics cards: Total Teachers, Total Students, Total Classes, Pending Approvals
- Alert badge when pending approvals exist

#### Pending Approvals
- Lists all teachers and students with `approval_status = 'pending'`
- Approve or reject each user individually
- Records who approved and when (`approved_by`, `approved_at`)

#### Manage Teachers
- Left panel: scrollable list of all approved teachers
- Right panel: class assignments for selected teacher
  - Add teacher to existing classes
  - Remove teacher from classes
  - Create new classes (name + grade level)

#### Access Control
- Toggle settings per school:
  - **Allow Student Signup** — students can self-register
  - **Allow Teacher Signup** — teachers can self-register
  - **Require Admin Approval** — new signups need admin approval before login

### Admin API Functions (`src/lib/adminApi.js`)

| Function | Purpose |
|----------|---------|
| `getAdminByEmail(email)` | Fetch admin profile |
| `createAdmin(adminData)` | Create new admin record |
| `getPendingApprovals(schoolId)` | Get pending teachers & students |
| `approveUser(userType, userId, adminId)` | Approve a pending user |
| `rejectUser(userType, userId, adminId)` | Reject a pending user |
| `getSchoolTeachers(schoolId)` | List approved teachers |
| `getTeacherClasses(teacherId)` | Get teacher's assigned classes |
| `assignTeacherToClass(teacherId, classId, adminId)` | Assign teacher to class |
| `removeTeacherFromClass(teacherId, classId)` | Unassign teacher |
| `getSchoolClasses(schoolId)` | List all classes |
| `createClass(classData)` | Create a new class |
| `getSchoolStatistics(schoolId)` | Dashboard stats |
| `getAccessControls(schoolId)` | Fetch access control settings |
| `upsertAccessControl(schoolId, feature, settings, adminId)` | Update access control |

### Admin Limitations
- No admin management UI — admins must be created via SQL or the test script
- No bulk approve/reject
- No audit trail logging
- All admins have equal permissions (no super-admin hierarchy)

---

## DAW-Lite (Music Studio)

The DAW-Lite is a simplified digital audio workstation for music creation.

### Components

| Component | File | Purpose |
|-----------|------|---------|
| DAWLite | `src/assets/pages/DAW-Lite/DAWLite.jsx` | Main page, drag/drop handling |
| Timeline | `src/components/ui/DAW-Lite/Timeline.jsx` | Grid with loop placement, trim handles |
| LoopLibrary | `src/components/ui/DAW-Lite/LoopLibrary.jsx` | Browse and drag loops |
| TransportControls | `src/components/ui/DAW-Lite/Transportcontrols.jsx` | Play, pause, stop, BPM |
| Waveform | `src/components/ui/DAW-Lite/Waveform.jsx` | Audio waveform visualization |
| ProjectMenu | `src/components/ui/DAW-Lite/Projectmenu.jsx` | Save, load, export |
| AILoopGenerator | `src/components/ui/DAW-Lite/AILoopGenerator.jsx` | Generate loops via Suno AI |

### How It Works

1. **Loop Library**: Loops are fetched from the `loops` table on mount. Audio durations are pre-cached in background for instant timeline drops.
2. **Timeline Grid**: 4 subdivisions per beat (16th notes). Loops snap to grid. Drag to place, drag to reposition, edge handles to trim.
3. **Playback**: Uses `requestAnimationFrame` loop synchronized to `Tone.Transport`. Each placed loop triggers a `new Audio()` at its start beat. All audio elements are tracked and stopped on pause/stop.
4. **Projects**: Saved to Supabase `projects` table as JSON (placed loops, BPM, bars, track count).
5. **Export**: Uses Web Audio API `OfflineAudioContext` to mix all loops, then encodes to MP3 (lamejs) or WAV.

### State (`useStore.js`)

Key state fields:
- `library` — available loops from database
- `placedLoops` — loops placed on the timeline (id, row, col, span, url, etc.)
- `transport` — { isPlaying, bpm, bars, currentBeat }
- `project` — { name, id, createdAt }

---

## 3D Worlds

Two immersive Three.js environments where students explore AI-generated music.

### World 1 — Fireside World (`/world1`)
- Campfire scene with animated musicians (drummer, pianist, tambourinist, flutist, guitarist)
- Each musician has bone-attached instruments and idle animations
- 11 models total, loaded via shared `GLTFLoader` with meshopt decoder

### World 2 — Auditorium World (`/world2`)
- Theater auditorium with the same musician characters in a concert setting
- 9 models total, shared `GLTFLoader` with meshopt decoder

### Voices Panel
- Slide-out panel accessible from both worlds
- Fetches teacher-configured settings (BPM, genre, style, mood) from `voice_settings` table
- Generates music via Suno API, separates into stems via MVSEP
- 5 stem categories: Rhythm, Bass, Harmony, Melody, Extras
- Students select voices per category and mix in real-time
- Beat-synced voice switching at bar boundaries using Tone.js Transport
- Session caching in `sessionStorage` (per world)

### Performance Optimizations
- Models compressed with WebP textures + meshopt (250MB → 26MB total)
- Lazy loaded via `React.lazy()` — not in main JS bundle
- Vercel cache headers: 1-year immutable cache for `/models/**`
- Shared `GLTFLoader` instance per world (reuses parser cache)

---

## Assignment System

### Flow

1. **Teacher creates assignment** (`/teacher/assignments`)
   - Title, description, due date, difficulty
   - Optionally attaches specific loops from the library
2. **Students see assignment** (`/assignments`)
   - View instructions, attached loops, due date
3. **Student submits** — uploads audio file (Supabase Storage or Cloudinary)
4. **Teacher reviews** (`/teacher/submissions`)
   - Plays submitted audio
   - Provides feedback comment + score via `FeedbackModal`
5. **Student gets notified** — real-time notification with feedback

### Database Tables
- `assignments` — teacher-created assignments
- `submissions` — student submissions with file URLs
- `feedback` — teacher feedback with comments and scores
- `assignment_loops` — loop library per assignment

---

## Progress & Gamification

### XP System
- Students earn XP for actions (completing assignments, session time, etc.)
- 5 XP per 10 minutes of active session time (capped at 60 min/day)
- XP thresholds determine level (stored in `student_progress` table)

### Badges
- Predefined badge definitions seeded in `badge_definitions` table
- Awarded automatically based on criteria (first project, streak milestones, etc.)
- Displayed on student progress page

### Streaks
- Tracks consecutive days of activity
- `current_streak` and `longest_streak` in `student_progress`
- Resets if a day is missed

### Session Tracking (`useSessionTracker` hook)
- Tracks active time while student is on the platform
- Awards XP at intervals
- Respects daily cap to prevent gaming

---

## Notifications

### Architecture
- `notifications` table with Supabase Realtime subscription
- `useNotificationStore` loads initial notifications and subscribes to inserts
- `NotificationBell` component shows unread count badge
- `NotificationPanel` shows notification list with read/unread state

### Notification Types
- New assignment created
- Submission received (for teachers)
- Feedback/grade received (for students)

### Browser Notifications
- Requests permission on first notification
- Shows native OS notification when app is in background

---

## Onboarding

- Implemented via React Joyride (`OnboardingTour.tsx`)
- Role-specific tours (different steps for teachers vs students)
- Shows on first login (tracked via `useOnboarding` hook with localStorage)
- Highlights key UI elements: sidebar navigation, worlds, assignments, etc.

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `schools` | School records with `allowed_domains` |
| `admins` | Admin accounts (email, name, school_id) |
| `teachers` | Teacher accounts with `approval_status` |
| `students` | Student accounts with `approval_status`, `class_id` |
| `classes` | School classes with grade level |

### Assignment Tables

| Table | Purpose |
|-------|---------|
| `assignments` | Teacher-created assignments |
| `submissions` | Student assignment submissions |
| `feedback` | Teacher feedback on submissions |
| `assignment_loops` | Loops attached to assignments |

### Progress Tables

| Table | Purpose |
|-------|---------|
| `student_progress` | XP, level, streak tracking per student |
| `badge_definitions` | Predefined badge types (seeded) |
| `student_badges` | Badges earned by students |
| `xp_transactions` | XP earning history with daily caps |

### Content Tables

| Table | Purpose |
|-------|---------|
| `loops` | Audio loop library (name, url, bpm, color) |
| `projects` | Saved DAW projects (JSON state) |
| `voice_settings` | Per-world music settings (BPM, genre, style, mood) |
| `tutorials` | Video tutorial entries |

### System Tables

| Table | Purpose |
|-------|---------|
| `notifications` | User notifications with read/unread state |
| `class_assignments` | Teacher-to-class mapping |
| `student_enrollments` | Student-to-class enrollment |
| `access_controls` | School access settings (signup, approval toggles) |

### Views

| View | Purpose |
|------|---------|
| `pending_approvals` | Union of pending teachers + students |

### Row Level Security

All tables have RLS enabled. Key policies:
- Students can only read/write their own data
- Teachers can read students in their school, manage assignments
- Admins can manage all records in their school
- Voice settings: teachers write, students read (school-scoped)

### Database Setup

All database tables, Row Level Security policies, and seed data are managed directly in the Supabase dashboard. Refer to the table descriptions above when setting up a new environment.

---

## State Management

All state is managed with Zustand stores:

### `useAuthStore` (`src/store/useAuthStore.js`)
- `isAuthenticated`, `userType`, `userProfile`
- `initAuth()` — check session, load profile
- `signIn()`, `signUp()`, `signOut()`
- Persisted: remembers auth state across refreshes

### `useStore` (`src/store/useStore.js`)
- DAW state: `library`, `placedLoops`, `transport`, `project`
- Actions: `loadLoops()`, `addPlacedLoop()`, `startTransport()`, `pauseTransport()`, `stop()`
- Persisted: saves current project state

### `useVoicesStore` (`src/store/useVoicesStore.js`)
- 3D Worlds music: `worldId`, `settings`, `stems`, `isPlaying`, `categories`
- Actions: `fetchSettings()`, `generateStems()`, `selectVoice()`, `startPlayback()`
- Session cached: stems and settings per world in `sessionStorage`

### `useProgressStore` (`src/store/useProgressStore.js`)
- `xp`, `level`, `currentStreak`, `longestStreak`, `badges`
- Actions: `fetchProgress()`, `addXP()`

### `useNotificationStore` (`src/store/useNotificationStore.js`)
- `notifications`, `unreadCount`
- Actions: `loadNotifications()`, `markAsRead()`, `subscribeToRealtime()`

---

## API Reference

### Client-Side API Modules

| Module | File | Key Functions |
|--------|------|--------------|
| Teacher API | `src/lib/teacherApi.js` | `getStudents`, `createAssignment`, `getSubmissions`, `submitFeedback`, `getVoiceSettings`, `updateVoiceSettings` |
| Admin API | `src/lib/adminApi.js` | `getPendingApprovals`, `approveUser`, `rejectUser`, `getSchoolClasses`, `createClass`, `getAccessControls` |
| Progress API | `src/lib/progressApi.js` | `getStudentProgress`, `getClassProgress` |
| Voices API | `src/lib/voicesApi.js` | `generateAndSeparateStems` (Suno → MVSEP pipeline) |
| Notification API | `src/lib/notificationApi.js` | `createNotification`, `getNotifications`, `markAsRead` |
| Storage API | `src/lib/storageApi.js` | `uploadSubmission` (Supabase Storage) |
| Audio Export | `src/lib/audioExport.js` | `exportProject` (mix to MP3/WAV) |
| Duration Cache | `src/lib/audioDurationCache.js` | `preloadDurations`, `getCachedDuration` |

### Server-Side (Vercel Functions)

| Endpoint | Purpose |
|----------|---------|
| `/api/proxy-audio` | CORS proxy for external audio CDNs (Suno, Box, MVSEP) |
| `/api/suno-*` | Suno API proxy (generation, polling) |

---

## Project Structure

```
djembe/
├── public/
│   └── models/              # 3D GLB models (~26MB compressed)
├── src/
│   ├── assets/pages/        # Page components
│   │   ├── Auth/            # Login.tsx, Signup.tsx
│   │   ├── DAW-Lite/        # DAWLite.jsx
│   │   ├── teacher/         # TeacherAssignments, WorldsSettings, etc.
│   │   ├── Dashboard.tsx    # Student dashboard
│   │   ├── AdminDashboard.tsx
│   │   ├── Tutorials.tsx
│   │   └── ...
│   ├── components/
│   │   ├── ui/              # Reusable UI (button, card, Sidebar, NotificationBell)
│   │   │   └── DAW-Lite/    # Timeline, LoopLibrary, TransportControls, etc.
│   │   ├── Worlds/          # World1.tsx, World2.tsx (lazy loaded)
│   │   ├── Voices/          # VoicesPanel, VoiceCategory, VoiceButton
│   │   ├── teacher/         # AssignmentForm, FeedbackModal
│   │   ├── onboarding/      # OnboardingTour
│   │   ├── ProtectedRoute.tsx
│   │   └── ErrorBoundary.tsx
│   ├── store/               # Zustand stores
│   ├── lib/                 # API functions, utilities
│   ├── hooks/               # useOnboarding, useSessionTracker
│   └── contexts/            # LoadingContext
├── scripts/                 # create-test-accounts.js
├── api/                     # Vercel serverless functions
├── vercel.json              # Vercel config (rewrites, headers)
└── vite.config.js           # Vite build config
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts only | Admin Supabase key (server-side only) |
| `SUNO_API_KEY` | Optional | Suno AI music generation |
| `MVSEP_API_KEY` | Optional | MVSEP stem separation |
| `ALLOWED_ORIGIN` | Optional | CORS origin (defaults to `http://localhost:5173`) |

---

## Deployment

### Vercel (Production)

The project is configured for Vercel:
- `vercel.json` handles SPA routing rewrites and security headers
- Model assets get 1-year immutable cache headers
- Serverless functions in `/api` handle CORS proxy and API proxying

```bash
npm run build   # Creates dist/ folder
vercel deploy   # Or push to connected Git repo
```

### Key Vercel Config

- **Rewrites**: All non-asset routes → `index.html` (SPA)
- **Headers**: HSTS, X-Content-Type-Options, X-Frame-Options, CSP basics
- **Model Cache**: `/models/**` → `Cache-Control: public, max-age=31536000, immutable`

---

## Test Accounts

Created by running `node scripts/create-test-accounts.js`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@godsgrace.test` | `djembe2026` |
| Teacher | `teacher@godsgrace.test` | `djembe2026` |
| Student 1-12 | `student1@godsgrace.test` ... `student12@godsgrace.test` | `djembe2026` |

All accounts are under **God's Grace International School** and are pre-approved.
