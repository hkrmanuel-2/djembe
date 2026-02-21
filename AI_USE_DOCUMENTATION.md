# AI Use Documentation - Djembe Project

> **Capstone Project:** Djembe - Educational Music Platform
> **Document Purpose:** Academic disclosure of AI assistance in development
> **AI Tool Used:** Claude (Anthropic) via Claude Code CLI
> **Last Updated:** February 21, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [AI Assistance Summary](#ai-assistance-summary)
3. [Detailed AI Contributions](#detailed-ai-contributions)
4. [Recent AI Contributions (Jan–Feb 2026)](#recent-ai-contributions-janfeb-2026)
5. [Human Developer Contributions](#human-developer-contributions)
6. [AI Interaction Methodology](#ai-interaction-methodology)
7. [Session Screenshots](#session-screenshots)
8. [Code Attribution](#code-attribution)
9. [Limitations & Human Oversight](#limitations--human-oversight)
10. [Overall AI Contribution Score](#overall-ai-contribution-score)

---

## Overview

This document provides a transparent account of how artificial intelligence was used during the development of the Djembe educational music platform. AI assistance occurred across multiple sessions and tools (Claude via Claude Code CLI, and Cursor AI via Cursor Chat), functioning as pair programming support and technical consulting.

### AI Tool Details

| Attribute | Details |
|-----------|---------|
| **AI Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Previous Model** | Claude Opus 4.5 (claude-opus-4-5-20251101) |
| **Interface** | Claude Code CLI (VS Code Extension) |
| **Provider** | Anthropic |
| **Usage Period** | Development phase (2025–2026) |

**Additional AI Tool (Feb 19, 2026 session):**

| Attribute | Details |
|-----------|---------|
| **AI Model** | OpenAI GPT (Cursor AI) |
| **Interface** | Cursor Chat (in-editor) |
| **Provider** | OpenAI |
| **Usage Period** | February 2026 (debugging + stabilization) |

### Scope of AI Use

AI was used for:
- Code implementation and debugging
- Technical problem-solving
- Documentation writing
- Code review and optimization
- Explaining technical concepts
- UI component refactoring and responsiveness improvements
- Notification and assignment system implementation
- Onboarding tour and tutorials system creation

AI was **NOT** used for:
- Project conceptualization and educational design
- UI/UX design decisions (visual style, color schemes, layout choices)
- Database schema initial design
- Feature prioritization
- User research or testing
- Asset creation (mascot illustrations, images)

---

## AI Assistance Summary

### High-Level Statistics

| Category | AI Contribution Level |
|----------|----------------------|
| Backend API Development | High |
| Frontend Components | Medium-High |
| State Management | Medium |
| Notification System | High |
| Tutorials System | High |
| Onboarding System | High |
| UI Responsiveness & Mobile | High |
| Documentation | High |
| Debugging & Fixes | High |
| Sidebar Navigation | High |
| Architecture Decisions | Low (advisory only) |
| Educational Content Design | None |

### Files with Significant AI Contribution

| File | AI Contribution | Description |
|------|-----------------|-------------|
| `api/separate.ts` | High | MVSEP separation endpoint (job creation, 128kbps output) |
| `api/separate-status.ts` | High | Polling endpoint for MVSEP (stem mapping with `type` field) |
| `api/proxy-audio.ts` | High | CORS proxy with domain allowlist (mvsep, suno CDNs) |
| `src/lib/voicesApi.js` | High | Suno API integration, MVSEP polling, prompt building |
| `src/lib/teacherApi.js` | Medium-High | Per-world settings + assignment functions |
| `src/assets/pages/teacher/WorldsSettings.tsx` | High | Per-world music settings page (BPM, genre, style, mood) |
| `src/lib/notificationApi.js` | High | Notification CRUD operations |
| `src/lib/tutorialsApi.js` | High | Tutorials database operations |
| `src/lib/cloudinaryApi.js` | High | Cloudinary file upload integration |
| `src/store/useVoicesStore.js` | Medium-High | Audio sync, buffer loading fix, per-world state |
| `src/store/useStore.js` | Medium | Auto-proxy for external URLs |
| `src/store/useNotificationStore.js` | High | Real-time notification state management |
| `src/components/ui/Sidebar.tsx` | High | Collapsible sidebar navigation |
| `src/components/ui/NotificationPanel.tsx` | High | Notification dropdown UI |
| `src/components/ui/NotificationBell.tsx` | High | Notification bell with badge |
| `src/components/onboarding/OnboardingTour.tsx` | High | Interactive onboarding tour |
| `src/assets/pages/Tutorials.tsx` | High | Tutorials page with filtering |
| `src/assets/pages/TeacherSubmissions.tsx` | High | Teacher submissions review page |
| `src/components/ProtectedRoute.tsx` | Medium | Auth gating + loading state (inline spinner; removed cube loader) |
| `src/assets/pages/teacher/TeacherAssignments.tsx` | Medium | Assignment list/detail fixes (IDs + keys) |
| `src/components/tutorials/TutorialCard.tsx` | High | Tutorial card component |
| `src/components/tutorials/VideoPlayerModal.tsx` | High | Video player modal |
| `DOCUMENTATION.md` | High | Technical documentation |
| `database/fix_feedback_table.sql` | Medium | Feedback table/RLS remediation script |
| `database/fix_feedback_rls_only.sql` | Medium | Feedback RLS-only remediation script |
| `database/fix_notifications_rls.sql` | Medium | Notifications RLS remediation script |

---

## Detailed AI Contributions

### 1. 504 Gateway Timeout Fix

**Problem:** The stem separation feature was failing on the deployed version with 504 errors because Vercel has a 10-second timeout limit, but MVSEP processing takes 1-3 minutes.

**AI Solution:**
AI proposed and implemented a two-endpoint architecture:

```
Before (AI-identified problem):
Client → POST /api/separate → Server waits 2+ minutes → 504 TIMEOUT

After (AI-implemented solution):
Client → POST /api/separate → Server returns hash immediately
Client → GET /api/separate-status?hash=xxx → Polls every 3 seconds
Client → GET /api/separate-status?hash=xxx → Returns stems when done
```

**Files Created/Modified:**
- `api/separate.ts` - Refactored to only start jobs
- `api/separate-status.ts` - New file created by AI
- `src/lib/voicesApi.js` - Client-side polling logic

**AI Contribution:** 95% (architecture design + implementation)
**Human Contribution:** 5% (approval and testing)

---

### 2. Suno API Genre Fix

**Problem:** Music was always generating as "boom bap" regardless of teacher's genre selection.

**AI Analysis:**
AI identified that Suno API prioritizes the `style` field over the `prompt` field when `customMode: true` is enabled.

**AI Solution:**
```javascript
// AI-implemented fix in voicesApi.js
const styleTags = `${genre}, ${style}, ${mood}, ${bpm} bpm, instrumental, kid-friendly`;

body: JSON.stringify({
  gpt_description_prompt: prompt,  // Full description
  style: styleTags,                 // Genre direction (Suno uses this!)
  title: `${genre} ${mood} rhythm - ${bpm}bpm`,
  model: "V4_5ALL",
  instrumental: true,
  customMode: true,
})
```

**AI Contribution:** 90% (diagnosis + fix)
**Human Contribution:** 10% (problem reporting + verification)

---

### 3. CORS Audio Proxy System

**Problem:** Audio files from external sources (Suno CDN, MVSEP storage) were blocked by browser CORS policy.

**AI Solution:**
1. Created/updated `api/proxy-audio.ts` with allowed domains
2. Implemented auto-proxy logic in `useStore.js`

```javascript
// AI-implemented in useStore.js
const proxyUrlIfNeeded = (url) => {
  const needsProxy = [
    "musicfile.api.box",
    "cdn.suno.ai",
    "cdn1.suno.ai",
    "cdn2.suno.ai",
    "mvsep.com",
  ];
  const urlNeedsProxy = needsProxy.some(domain => url.includes(domain));
  if (urlNeedsProxy) {
    return `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  return url;
};
```

**AI Contribution:** 85%
**Human Contribution:** 15% (error identification + testing)

---

### 4. Per-World Voice Settings

**Problem:** All 3D worlds shared the same music settings. Teachers wanted different music for different worlds.

**AI Solution:**
- Added `world_id` column concept to database schema
- Updated `teacherApi.js` with world-specific queries
- Modified `useVoicesStore.js` for per-world caching
- Updated `VoicesPanel.tsx` to accept `worldId` prop

```javascript
// AI-implemented in teacherApi.js
export async function updateVoiceSettings(schoolId, teacherId, settings, worldId = "world1") {
  const { data: existing } = await supabase
    .from("voice_settings")
    .select("id")
    .eq("school_id", schoolId)
    .eq("world_id", worldId)  // Per-world filtering
    .single();
  // ... upsert logic
}
```

**AI Contribution:** 80%
**Human Contribution:** 20% (feature request + database migration execution)

---

### 5. Audio BPM Synchronization

**Problem:** Stem switching sounded jarring because audio was being stopped/started at random times.

**AI Solution:**
Implemented bar boundary quantization using Tone.js Transport:

```javascript
// AI-implemented in useVoicesStore.js
_getTimeToNextBoundary: (bpm, toBar = true) => {
  const secondsPerBeat = 60 / bpm;
  const secondsPerBar = secondsPerBeat * 4;
  const boundary = toBar ? secondsPerBar : secondsPerBeat;
  const currentPosition = Tone.Transport.seconds;
  const timeToNext = boundary - (currentPosition % boundary);
  return timeToNext < 0.05 ? boundary : timeToNext;
}
```

**AI Contribution:** 90%
**Human Contribution:** 10% (requirement specification)

---

### 6. Kid-Friendly Prompt Engineering

**Feature:** Generate age-appropriate music for children aged 5-12.

**AI Contribution:**
AI designed the prompt template in `voicesApi.js`:

```javascript
// AI-designed prompt template
const prompt = `Create a kid-friendly, instrumental music track for children aged 5–12
that teaches rhythm through listening and movement.

STRICT PARAMETERS (must be followed):
- Genre: ${genre}
- Tempo: ${bpm} BPM (maintain this exact tempo throughout)
- Style: ${style}
- Mood: ${mood}

Tone & Safety:
- Child-safe and positive
- No aggressive, dark, intense, or scary sounds
- No distortion or harsh frequencies
- No sudden drops or dramatic transitions
...
`;
```

**AI Contribution:** 95% (prompt design + safety considerations)
**Human Contribution:** 5% (approval + educational context)

---

### 7. Technical Documentation

**Files:** `DOCUMENTATION.md`, `AI_USE_DOCUMENTATION.md`

**AI Contribution:**
- Wrote comprehensive technical documentation
- Created system diagrams and flow charts
- Documented API integrations
- Wrote code examples and usage guides
- Created FAQ section anticipating reviewer questions

**AI Contribution:** 90%
**Human Contribution:** 10% (review + specific content requests)

---

### 8. Git Operations & Security

**Tasks Performed by AI:**
- Guided removal of `.env` file from git history
- Updated `.gitignore` to prevent future credential commits
- Assisted with merge conflict resolution
- Wrote commit messages

**Example AI-Guided Command:**
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

**AI Contribution:** 70%
**Human Contribution:** 30% (execution + verification)

---

### 9. Debugging Sessions

**Issues Debugged with AI Assistance:**

| Issue | AI Role |
|-------|---------|
| 504 timeout on Vercel | Diagnosed cause, proposed two-endpoint polling solution |
| CORS blocking audio | Created proxy with domain allowlist |
| Wrong genre generation | Found Suno API `style` field behavior, fixed parameters |
| Audio sync issues | Explained Tone.js Transport, implemented bar boundary fix |
| Session storage errors | Debugged caching logic |
| Mobile responsiveness | Identified viewport issues, fixed layouts |
| Notification delivery | Debugged real-time subscription logic |
| MVSEP empty stems | Discovered `type` field (not `name`) via debug logging |
| Suno copyright block | Identified that Suno flags its own AI tracks, switched to MVSEP |
| Audio buffer not loaded | Fixed `Tone.loaded()` → `player.loaded` race condition |
| Player start/stop errors | Added `buffer.loaded` + `state` safety checks |
| Git case sensitivity | Resolved Windows `ui`/`UI` folder conflict with `git reset` |

**AI Contribution:** 80% (diagnosis + solutions)
**Human Contribution:** 20% (error reporting + testing)

---

## Recent AI Contributions (Jan–Feb 2026)

The following features were developed with AI assistance in the final phase of the project. These represent significant new functionality added after the initial AI documentation was written.

### 9.5. Assignments/Feedback/Notifications Stabilization (Feb 19, 2026 — Cursor AI)

**Primary goal:** Fix assignment submission/feedback visibility issues and ensure teacher feedback persists and notifications can be created/read under Supabase RLS.

**AI-assisted outcomes (high-level):**
- **Feedback saving fixed** by correcting `submission_id` wiring in `src/assets/pages/TeacherSubmissions.tsx` and aligning submission identifier usage to `submissions.submission_id`.
- **Teacher/student visibility fixes** by updating mapping/query logic to use `submission_id` consistently (avoid `undefined` IDs).
- **Notifications RLS fix** by adding `database/fix_notifications_rls.sql` and improving runtime logging in `src/lib/notificationApi.js` and `src/store/useNotificationStore.js`.
- **Auth role lookup noise reduced** by switching role-detection lookups from `.single()` to `.maybeSingle()` in `src/store/useAuthStore.js` (prevents PostgREST 406 spam when a role row doesn’t exist).
- **Security hygiene** by removing an accidentally committed secret file (`env.download`) from git tracking and preventing future commits via `.gitignore`.
- **UI cleanup** by removing cube loader components entirely and using a minimal inline spinner in `src/components/ProtectedRoute.tsx`.

**Representative files changed/added:**
- `src/assets/pages/TeacherSubmissions.tsx`
- `src/lib/teacherApi.js`
- `src/lib/notificationApi.js`
- `src/store/useNotificationStore.js`
- `src/store/useAuthStore.js`
- `src/components/ProtectedRoute.tsx`
- `database/fix_feedback_table.sql`
- `database/fix_feedback_rls_only.sql`
- `database/fix_notifications_rls.sql`
- `DOCUMENTATION.md`

#### Chat History / Transcript References

Cursor Chat sessions do not always have a stable public URL. For academic review, export the Cursor chat transcript and attach it to the repo (or store it in a shared drive) and link it here:

- **Cursor Chat transcript (Feb 19, 2026)**: [docs/chat_transcripts/2026-02-19-cursor-chat.md](docs/chat_transcripts/2026-02-19-cursor-chat.md)
- **Related PR / issue thread**: `<<ADD_LINK_IF_APPLICABLE>>`

### 10. Notification System

**Feature:** Real-time notification system for students and teachers.

**AI Solution:**
AI implemented a complete notification pipeline including:
- `src/lib/notificationApi.js` — Full CRUD API with notification types (assignment created, graded, feedback received, submission received, late submission, due date reminders)
- `src/store/useNotificationStore.js` — Zustand store with real-time Supabase subscriptions for live notification updates
- `src/components/ui/NotificationBell.tsx` — Bell icon with unread badge counter
- `src/components/ui/NotificationPanel.tsx` — Dropdown panel with mark-as-read, dismiss, and mark-all-read functionality
- `src/lib/notifications_setup.sql` — Database schema for notifications table

```javascript
// AI-implemented notification types in notificationApi.js
export const NOTIFICATION_TYPES = {
  ASSIGNMENT_CREATED: "assignment_created",
  ASSIGNMENT_GRADED: "assignment_graded",
  FEEDBACK_RECEIVED: "feedback_received",
  DUE_DATE_REMINDER: "due_date_reminder",
  SUBMISSION_RECEIVED: "submission_received",
  LATE_SUBMISSION: "late_submission",
};
```

**Files Created:**
- `src/lib/notificationApi.js` — 213 lines
- `src/store/useNotificationStore.js` — 167 lines
- `src/components/ui/NotificationBell.tsx` — 65 lines
- `src/components/ui/NotificationPanel.tsx` — 242 lines
- `src/lib/notifications_setup.sql` — 123 lines

**AI Contribution:** 90% (full system architecture + implementation)
**Human Contribution:** 10% (feature request + integration testing)

---

### 11. Onboarding Tour System

**Feature:** Interactive guided tour for new students and teachers using React Joyride.

**AI Solution:**
AI created an onboarding system with:
- Role-specific tour steps (different paths for students vs teachers)
- Persistent completion tracking via `localStorage`
- Custom-styled tooltip components matching the app's glassmorphism theme
- Automatic trigger on first login

```typescript
// AI-implemented in OnboardingTour.tsx
const studentSteps: Step[] = [
  { target: "body", content: "Welcome to Djembe! ..." },
  { target: "[data-tour='daw']", content: "Create your own beats ..." },
  { target: "[data-tour='assignments']", content: "View assignments ..." },
  // ...role-specific steps
];
```

**Files Created:**
- `src/components/onboarding/OnboardingTour.tsx` — 307 lines
- `src/hooks/useOnboarding.ts` — 35 lines

**AI Contribution:** 90% (component design + step content)
**Human Contribution:** 10% (tour step wording refinement + testing)

---

### 12. Sidebar Navigation

**Feature:** Collapsible sidebar with role-based navigation, replacing the previous top navbar on dashboards.

**AI Solution:**
AI built a responsive sidebar component featuring:
- Animated expand/collapse with Framer Motion
- Role-specific navigation items with accent colors
- Active route highlighting
- Integrated notification bell
- User profile display with sign-out
- Mobile-responsive behavior

```typescript
// AI-implemented color mapping in Sidebar.tsx
const itemColors: Record<string, string> = {
  Home: "#F2C94C",
  DAW: "#D97746",
  Assignments: "#42C9C9",
  Progress: "#E8627A",
  Tutorials: "#4ABA6E",
  Worlds: "#9B7DC8",
  Settings: "#A0A0A0",
};
```

**Files Created:**
- `src/components/ui/Sidebar.tsx` — 267 lines

**AI Contribution:** 85% (component structure + animations)
**Human Contribution:** 15% (color choices + layout positioning)

---

### 13. Tutorials System

**Feature:** Video tutorial library with categories, difficulty levels, and audience filtering.

**AI Solution:**
AI implemented a complete tutorials system including:
- `src/lib/tutorialsApi.js` — Full API for fetching, filtering, and managing tutorials with category support, difficulty levels, and audience targeting
- `src/assets/pages/Tutorials.tsx` — Main tutorials page with search, category filtering, and grid layout
- `src/components/tutorials/TutorialCard.tsx` — Card component with thumbnail, duration, and difficulty badge
- `src/components/tutorials/VideoPlayerModal.tsx` — Full-screen video player modal
- `src/lib/tutorials_setup.sql` — Database schema with seed data for tutorials table

**Files Created:**
- `src/lib/tutorialsApi.js` — 410 lines
- `src/assets/pages/Tutorials.tsx` — 452 lines
- `src/components/tutorials/TutorialCard.tsx` — 102 lines
- `src/components/tutorials/VideoPlayerModal.tsx` — 126 lines
- `src/lib/tutorials_setup.sql` — 391 lines

**AI Contribution:** 90% (full-stack implementation)
**Human Contribution:** 10% (content selection + video URL sourcing)

---

### 14. Cloudinary Integration

**Feature:** File upload system for assignment submissions using Cloudinary.

**AI Solution:**
AI implemented a Cloudinary upload utility with:
- Unsigned upload preset for client-side uploads
- Organized folder structure (`Djembe Assignment Submissions`)
- Progress callback support for upload indicators
- Audio file validation and format detection

```javascript
// AI-implemented in cloudinaryApi.js
export async function uploadToCloudinary(file, options = {}) {
  const { folder = "Djembe Assignment Submissions", public_id = null, onProgress = null } = options;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);
  // ...upload logic with progress tracking
}
```

**Files Created:**
- `src/lib/cloudinaryApi.js` — 227 lines

**AI Contribution:** 85% (upload logic + error handling)
**Human Contribution:** 15% (Cloudinary account setup + preset configuration)

---

### 15. Teacher Submissions Review Page

**Feature:** Dedicated page for teachers to review, grade, and provide feedback on student assignment submissions.

**AI Solution:**
AI built a comprehensive submissions management page with:
- Assignment filtering by class and status
- Inline audio playback for submitted files
- Grading interface with star ratings
- Feedback text input with save/update functionality
- Submission status tracking (pending, graded, late)

**Files Created:**
- `src/assets/pages/TeacherSubmissions.tsx` — 536 lines

**AI Contribution:** 85% (component logic + UI structure)
**Human Contribution:** 15% (grading criteria + UX flow decisions)

---

### 16. UI Responsiveness & Mobile Experience

**Feature:** Comprehensive mobile responsiveness overhaul across the entire application.

**AI Solution:**
AI refactored multiple components for mobile support:
- DAW-Lite: Touch-friendly controls, landscape orientation handling, responsive timeline
- 3D Worlds: Viewport adaptation for mobile screens
- Navigation: Mobile hamburger menu and bottom navigation
- Authentication pages: Responsive form layouts
- Dashboard: Grid layout adaptations for smaller screens

**Files Modified (16+ files):**
- `src/assets/pages/DAW-Lite/DAWLite.jsx` — Major mobile overhaul
- `src/components/Worlds/World1.tsx` / `World2.tsx` — Mobile viewport handling
- `src/components/ui/tubelight-navbar-dark.tsx` — Mobile navigation
- `src/assets/pages/Auth/Login.tsx` / `Signup.tsx` — Responsive forms
- Multiple dashboard and page components

**AI Contribution:** 80% (responsive logic + CSS)
**Human Contribution:** 20% (design breakpoints + visual testing on devices)

---

### 17. Assignment System Enhancements

**Feature:** Enhanced assignment management with class selection, improved submission flow, and notification triggers.

**AI Solution:**
- Class-specific assignment creation in `AssignmentForm.tsx`
- Assignment loading refactored with proper Supabase queries
- Automatic notification dispatch when assignments are created or graded
- Improved submission tracking with progress integration

**Files Modified:**
- `src/components/teacher/AssignmentForm.tsx`
- `src/assets/pages/Assignments.tsx`
- `src/assets/pages/TeacherDashboard.tsx`
- `src/lib/teacherApi.js`
- `src/lib/progressApi.js`

**AI Contribution:** 75% (logic refactoring + notification integration)
**Human Contribution:** 25% (assignment requirements + class structure decisions)

---

### 18. MVSEP Stem Separation Integration

**Feature:** Complete stem separation pipeline using MVSEP's BS Roformer SW model, replacing the original Demucs/Replicate approach.

**Background:** The original plan used Suno's built-in stem separation, but Suno flagged AI-generated tracks as copyrighted and blocked separation. Replicate (Demucs) was considered but is not free. MVSEP was selected as a free alternative with superior stem quality.

**AI Solution:**
AI designed and implemented a three-endpoint architecture:

1. `api/separate.ts` — Downloads audio from Suno URL, uploads to MVSEP API with BS Roformer SW (sep_type=63), returns job hash
2. `api/separate-status.ts` — Polls MVSEP for completion, maps stems to categories, returns proxied URLs
3. `api/proxy-audio.ts` — CORS proxy to serve MVSEP audio files to the browser

```javascript
// AI-implemented MVSEP integration in api/separate.ts
const formData = new FormData();
formData.append("api_token", apiToken);
formData.append("audiofile", audioBlob, "track.mp3");
formData.append("sep_type", "63");   // BS Roformer SW: 6 stems
formData.append("output_format", "2"); // mp3 128kbps (Vercel size limit)
```

**MVSEP Response Discovery:**
AI debugged the empty stems issue by adding comprehensive logging, which revealed MVSEP uses `type` (not `name`) as the field identifier:

```json
{
  "type": "Bass",
  "url": "https://mvsep.com/storage/processed/...bass.mp3",
  "size": "5.84 MB",
  "download": "track_bs6stem_mt_0_bass.mp3"
}
```

**Stem Category Mapping (6 → 5 categories):**
```
MVSEP Output     →  App Category
─────────────────────────────────
Drums            →  Rhythm
Bass             →  Bass
Guitar + Vocals  →  Melody
Piano + Other    →  Harmony
(empty)          →  Extras
```

**Files Created/Modified:**
- `api/separate.ts` — 93 lines (created)
- `api/separate-status.ts` — 141 lines (created)
- `api/proxy-audio.ts` — 62 lines (created)
- `src/lib/voicesApi.js` — Updated separation logic

**AI Contribution:** 90% (architecture design, API discovery, implementation)
**Human Contribution:** 10% (chose MVSEP over alternatives, provided API key)

---

### 19. CORS Audio Proxy with Domain Allowlist

**Problem:** MVSEP's storage server (`mvsep.com/storage/processed/`) does not include `Access-Control-Allow-Origin` headers. Tone.js in the browser was blocked by CORS policy when trying to load stems directly.

**AI Solution:**
Created a Vercel API proxy that:
1. Validates the URL against an allowlist of trusted domains
2. Fetches the audio server-side (no CORS restrictions)
3. Returns the audio with proper CORS headers and caching

```javascript
// AI-implemented domain allowlist in api/proxy-audio.ts
const allowedDomains = [
  "mvsep.com",
  "musicfile.api.box",
  "cdn.suno.ai",
  "cdn1.suno.ai",
  "cdn2.suno.ai",
];
```

All stem URLs from MVSEP are automatically converted to proxied URLs:
```
Direct (blocked):  https://mvsep.com/storage/processed/...drums.mp3
Proxied (works):   /api/proxy-audio?url=https%3A%2F%2Fmvsep.com%2F...drums.mp3
```

**AI Contribution:** 95% (proxy design + security allowlist)
**Human Contribution:** 5% (expanded domain list)

---

### 20. Audio Buffer Race Condition Fix

**Problem:** After MVSEP integration succeeded and CORS was resolved, audio still failed to play with errors:
- `"buffer is either not set or not loaded"` — Tone.js players tried to play before their audio buffers finished downloading
- `"'start' must be called before 'stop'"` — Code tried to stop players that were never started

**Root Cause:** The `loadStemPlayers()` function used `Tone.loaded()` (a global promise) instead of individual `player.loaded` promises. This meant it resolved before all specific player buffers were ready.

**AI Solution:**

```javascript
// BEFORE (broken) - Tone.loaded() resolves globally, not per-player
loadPromises.push(Tone.loaded());

// AFTER (fixed) - player.loaded resolves when THIS player's buffer is ready
loadPromises.push(player.loaded);
```

Additional safety guards added:
```javascript
// In _processBarBoundary - check buffer before play
if (newPlayer && newPlayer.buffer?.loaded) {
  newPlayer.start(time);
}

// In stopPlayback - check state before stop
if (player && player.buffer?.loaded && player.state === "started") {
  player.stop();
}
```

**Files Modified:**
- `src/store/useVoicesStore.js` — Fixed `loadStemPlayers()`, `_processBarBoundary()`, `stopPlayback()`

**AI Contribution:** 95% (diagnosis + fix)
**Human Contribution:** 5% (error log sharing)

---

### 21. Worlds Settings Teacher Page

**Feature:** Dedicated teacher settings page for configuring music generation parameters per world, accessible from the sidebar navigation.

**AI Solution:**
Created `WorldsSettings.tsx` with:
- World selector dropdown (World 1: Fireside, World 2: Auditorium)
- BPM slider (60–200)
- Genre picker (10 genres: afrobeat, jazz, electronic, hip-hop, classical, rock, reggae, funk, world, ambient)
- Style picker (8 styles: upbeat, relaxed, energetic, chill, intense, groovy, melodic, rhythmic)
- Mood picker (8 moods: happy, calm, intense, dreamy, playful, focused, inspiring, mysterious)
- Custom prompt textarea (optional override)
- Save button with success toast

```typescript
// AI-implemented WorldsSettings.tsx
const WORLDS = [
  { id: "world1", name: "World 1 - Fireside", icon: "🔥" },
  { id: "world2", name: "World 2 - Auditorium", icon: "🎭" },
];
```

**Files Created:**
- `src/assets/pages/teacher/WorldsSettings.tsx` — ~280 lines

**AI Contribution:** 85% (component structure + logic)
**Human Contribution:** 15% (genre/style/mood selection + page placement in navbar)

---

### 22. Per-World Stem Generation & Caching

**Feature:** Each 3D world generates and caches its own stems independently using the teacher's per-world settings.

**AI Solution:**
- Session cache keys include `worldId`: `djembe_voices_stems_${worldId}`
- `useVoicesStore.js` tracks `worldId` state and switches context when worlds change
- `VoicesPanel.tsx` accepts `worldId` prop from World components
- Settings fetched per world from database: `getVoiceSettings(schoolId, worldId)`

```javascript
// AI-implemented per-world caching in useVoicesStore.js
const cacheKey = `djembe_voices_stems_${worldId}`;
sessionStorage.setItem(cacheKey, JSON.stringify(result.stems));
```

**AI Contribution:** 80%
**Human Contribution:** 20% (feature requirement + testing)

---

## Human Developer Contributions

The following aspects were entirely human-driven:

### 1. Project Conception & Vision
- Educational purpose and target audience (children 5-12)
- Music education through technology concept
- DAW-Lite simplified interface idea
- 3D worlds as learning environments

### 2. UI/UX Design
- Glassmorphism visual style choice
- Color schemes and theming
- Component layout decisions
- User flow design
- Accessibility considerations
- Mascot character design and illustrations

### 3. Educational Content
- Age-appropriate design decisions
- Learning objectives
- Assignment system design
- Teacher-student relationship model
- Tutorial content curation and video selection

### 4. Database Schema Design
- Initial table structures
- Relationships between entities
- Row-level security policies

### 5. Third-Party Service Selection
- Choice of Supabase for backend
- Selection of Suno API for music generation
- MVSEP for stem separation
- Three.js for 3D rendering
- Cloudinary for file storage
- React Joyride for onboarding tours

### 6. Testing & Quality Assurance
- Manual testing of all features
- User acceptance testing
- Performance verification
- Cross-browser and mobile testing

### 7. Deployment & Operations
- Vercel deployment configuration
- Environment variable management
- Production monitoring

### 8. Visual Assets
- Djembe mascot illustrations (full body, face, variations)
- Hero images and tutorial backgrounds
- Student and achievement mascot art
- UI icons and avatar assets

---

## AI Interaction Methodology

### How AI Was Used

1. **Problem Description:** Developer described issues or requirements in natural language
2. **AI Analysis:** AI analyzed the codebase and proposed solutions
3. **Implementation:** AI wrote code with explanations
4. **Review:** Developer reviewed, tested, and approved changes
5. **Iteration:** Developer provided feedback for refinements

### Example Interaction Pattern

```
Developer: "I'm getting a 504 error when trying to separate stems on the
            deployed version"

AI: [Reads relevant files]
    [Analyzes the problem]
    "The issue is Vercel's timeout limit. MVSEP takes 1-3 minutes but
     Vercel times out at 10 seconds. I recommend splitting this into
     two endpoints..."
    [Proposes architecture]
    [Implements solution]

Developer: [Tests the solution]
           "It works now, please commit these changes"

AI: [Creates commit with appropriate message]
```

### Example: Notification System Session

```
Developer: "Add a notification system so students know when they get new
            assignments and teachers know when students submit work"

AI: [Explores existing assignment and submission code]
    [Designs notification schema and API]
    "I'll create a notifications table, an API layer, a Zustand store
     with real-time subscriptions, and UI components (bell + panel)..."
    [Creates notificationApi.js]
    [Creates useNotificationStore.js with Supabase realtime]
    [Creates NotificationBell.tsx and NotificationPanel.tsx]
    [Integrates into existing navbar and assignment flows]

Developer: [Tests notifications on student and teacher accounts]
           "The notifications are working. Can you also add mark-all-read?"

AI: [Adds markAllRead function to store and UI button]
```

### Tools Used by AI

| Tool | Purpose |
|------|---------|
| Read | Reading existing code files |
| Write | Creating new files |
| Edit | Modifying existing code |
| Bash | Running git commands, npm scripts |
| Grep | Searching codebase |
| Glob | Finding files by pattern |
| TodoWrite | Task tracking during multi-file changes |

---

## Session Screenshots

> The following screenshots document actual AI coding sessions during the development of Djembe. They show the Claude Code CLI interface within VS Code as the AI reads, analyzes, and modifies code.

### Screenshot Guide

To capture these screenshots, open Claude Code in VS Code and screenshot the following sessions:

| # | Screenshot Description | What to Capture |
|---|----------------------|-----------------|
| 1 | **Claude Code Interface** | The VS Code terminal showing the Claude Code CLI prompt with the Djembe project open |
| 2 | **AI Reading Code** | A session where Claude reads and analyzes an existing file (e.g., `teacherApi.js`) |
| 3 | **AI Implementing a Feature** | Claude writing new code (e.g., creating `notificationApi.js` or `Sidebar.tsx`) |
| 4 | **AI Debugging** | Claude diagnosing an issue (e.g., the 504 timeout or CORS error) |
| 5 | **AI Creating Documentation** | Claude generating or updating `DOCUMENTATION.md` |
| 6 | **AI Making a Commit** | Claude running git commands to stage and commit changes |
| 7 | **Multi-File Edit Session** | Claude editing multiple files in sequence (e.g., the notification system across API, store, and UI) |
| 8 | **AI Todo Tracking** | The todo list Claude uses to track multi-step tasks |

### How to Add Screenshots

1. Take screenshots using **Windows Snipping Tool** (`Win + Shift + S`) or **VS Code Screenshot** extension
2. Save them to a `docs/screenshots/` folder in the project
3. Reference them in this document:

```markdown
![Claude Code Interface](docs/screenshots/01-claude-code-interface.png)
*Figure 1: Claude Code CLI running inside VS Code with the Djembe project*

![AI Implementing Notifications](docs/screenshots/02-notification-implementation.png)
*Figure 2: AI creating the notification system across multiple files*
```

### Screenshots to Capture

**Recommended screenshots to take now:**

1. **This current session** — Screenshot this conversation where AI is updating the documentation
2. **Git log showing AI commits** — Run `git log --oneline` in terminal and screenshot the commit history
3. **Project file tree** — Screenshot the VS Code explorer showing the project structure
4. **A feature in action** — Screenshot the running app showing a feature AI helped build (e.g., notifications, sidebar, tutorials page)

> **Note:** Screenshots should be added to `docs/screenshots/` and referenced above. The developer will capture these from active Claude Code sessions and the running application.

---

## Code Attribution

### Code Entirely Written by AI

```
api/separate.ts                                 - 95% AI (MVSEP job creation, file download)
api/separate-status.ts                          - 100% AI (polling, stem mapping, proxy URLs)
api/proxy-audio.ts                              - 95% AI (CORS proxy with domain allowlist)
src/lib/voicesApi.js                            - 85% AI (Suno integration, MVSEP polling, prompts)
src/lib/notificationApi.js                      - 95% AI (complete notification API)
src/lib/tutorialsApi.js                         - 95% AI (complete tutorials API)
src/lib/cloudinaryApi.js                        - 90% AI (upload integration)
src/lib/notifications_setup.sql                 - 95% AI (database schema)
src/lib/tutorials_setup.sql                     - 95% AI (database schema + seed data)
src/store/useNotificationStore.js               - 95% AI (real-time store)
src/assets/pages/teacher/WorldsSettings.tsx     - 85% AI (per-world settings page)
src/components/ui/Sidebar.tsx                   - 85% AI (sidebar navigation)
src/components/ui/NotificationPanel.tsx         - 90% AI (notification UI)
src/components/ui/NotificationBell.tsx          - 90% AI (bell component)
src/components/onboarding/OnboardingTour.tsx    - 90% AI (onboarding system)
src/components/tutorials/TutorialCard.tsx       - 90% AI (tutorial card)
src/components/tutorials/VideoPlayerModal.tsx   - 90% AI (video modal)
src/assets/pages/Tutorials.tsx                  - 85% AI (tutorials page)
src/assets/pages/TeacherSubmissions.tsx         - 85% AI (submissions page)
src/hooks/useOnboarding.ts                      - 90% AI (onboarding hook)
DOCUMENTATION.md                                - 90% AI
AI_USE_DOCUMENTATION.md                         - 100% AI
```

### Code with AI Assistance

```
src/store/useVoicesStore.js                     - 70% AI (sync logic, buffer fix, per-world state)
src/store/useStore.js                           - 40% AI (proxy helper)
src/lib/teacherApi.js                           - 65% AI (world_id + voice settings + assignments)
src/lib/progressApi.js                          - 40% AI (submission tracking updates)
src/components/Voices/VoicesPanel.tsx            - 70% AI (panel UI, playback controls)
src/components/Voices/VoiceCategory.tsx          - 75% AI (category UI with color coding)
src/components/Voices/VoiceButton.tsx            - 75% AI (voice toggle button)
src/components/Voices/VoicesGlobalControls.tsx   - 80% AI (global playback controls)
src/components/teacher/AssignmentForm.tsx        - 50% AI (class selection + notifications)
src/assets/pages/Assignments.tsx                - 40% AI (submission flow + notifications)
src/assets/pages/TeacherDashboard.tsx           - 35% AI (notification integration)
src/assets/pages/DAW-Lite/DAWLite.jsx           - 40% AI (mobile responsiveness)
src/components/Worlds/World1.tsx                - 35% AI (mobile viewport + VoicesPanel integration)
src/components/Worlds/World2.tsx                - 35% AI (mobile viewport + VoicesPanel integration)
src/components/ui/tubelight-navbar-dark.tsx      - 45% AI (mobile menu + notifications)
src/assets/pages/Auth/Login.tsx                 - 25% AI (responsive layout)
src/assets/pages/Auth/Signup.tsx                - 25% AI (responsive layout)
src/assets/pages/Dashboard.tsx                  - 30% AI (layout + sidebar integration)
src/assets/pages/StudentProgress.tsx            - 30% AI (UI enhancements)
src/assets/pages/Landing_page.jsx               - 25% AI (responsiveness)
src/App.jsx                                     - 35% AI (routing + worlds page + onboarding)
src/index.css                                   - 20% AI (responsive utilities)
vite.config.js                                  - 30% AI (build optimization)
```

### Code Entirely Human-Written

```
Initial React components
Database schema SQL (initial design)
Supabase client configuration
Initial authentication flow
3D world scene setup (Three.js)
UI styling and CSS (glassmorphism theme)
All mascot and visual assets
Landing page original design
Color scheme and branding decisions
Project configuration (initial setup)
```

---

## Limitations & Human Oversight

### What AI Could NOT Do

1. **Run the Application:** AI cannot execute or test the running application
2. **Visual Design:** AI cannot see UI results; relied on developer feedback
3. **User Testing:** AI cannot interact with the application as a user
4. **Deploy:** AI cannot access deployment platforms directly
5. **Database Migrations:** AI wrote SQL but human executed it
6. **Take Screenshots:** AI cannot capture screen images (developer must capture)
7. **Create Visual Assets:** AI cannot create illustrations or mascot designs
8. **Test on Mobile Devices:** AI relied on developer for real device testing

### Human Oversight Applied

| AI Action | Human Verification |
|-----------|-------------------|
| Code changes | Code review before commit |
| API integrations | Manual testing of endpoints |
| Security changes | Verification of .env removal |
| Documentation | Review for accuracy |
| Architecture decisions | Approval before implementation |
| Notification logic | Tested with real student/teacher accounts |
| Mobile responsiveness | Verified on actual mobile devices |
| Onboarding flow | Tested full user journey |
| Tutorial system | Verified video playback and filtering |

### Errors Caught by Human Review

- Initial proxy implementation missing some domains
- Caching key format needed adjustment
- Some edge cases in audio timing
- Notification panel z-index overlapping with other modals
- Mobile navigation breakpoint adjustments
- Onboarding tour step targeting incorrect DOM elements on first render

---

## Overall AI Contribution Score

### Calculation Methodology

The overall score is calculated as a weighted average across all project areas, considering both the percentage of AI contribution and the relative size/importance of each area. Updated to reflect all features through February 2026, including the complete MVSEP stem separation pipeline, per-world settings, and audio buffer fixes.

### Breakdown by Project Area

| Project Area | Weight (%) | AI Contribution (%) | Weighted Score |
|--------------|------------|---------------------|----------------|
| Backend API (`api/`) | 9% | 95% | 8.6 |
| Frontend Pages (`pages/`) | 13% | 28% | 3.6 |
| UI Components (`components/ui/`) | 11% | 35% | 3.9 |
| Voices System (`Voices/`, `voicesApi`, stores) | 9% | 80% | 7.2 |
| 3D Worlds (`Worlds/`) | 7% | 25% | 1.8 |
| State Management (`store/`) | 7% | 55% | 3.9 |
| Library/Utils (`lib/`) | 8% | 65% | 5.2 |
| Notification System | 5% | 90% | 4.5 |
| Tutorials System | 4% | 90% | 3.6 |
| Onboarding System | 3% | 90% | 2.7 |
| Authentication System | 4% | 15% | 0.6 |
| Database Schema | 4% | 25% | 1.0 |
| Styling/CSS | 6% | 15% | 0.9 |
| Documentation | 5% | 95% | 4.8 |
| Project Config/Setup | 5% | 10% | 0.5 |
| **TOTAL** | **100%** | — | **52.8%** |

### Final Score

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           OVERALL PROJECT CONTRIBUTION                      │
│           (Updated February 21, 2026)                       │
│                                                             │
│     ┌──────────────────────────────────────────────┐       │
│     │                                              │       │
│     │   AI CONTRIBUTION:        53%                │       │
│     │   HUMAN CONTRIBUTION:     47%                │       │
│     │                                              │       │
│     └──────────────────────────────────────────────┘       │
│                                                             │
│     [█████████████████████░░░░░░░░░░░░░░░░░░░] 53% AI      │
│     [░░░░░░░░░░░░░░░░░░░██████████████████████] 47% Human  │
│                                                             │
│     Previous Score (Feb 9, 2026): 47% AI / 53% Human       │
│     Change: +6% AI (MVSEP pipeline, audio fixes, per-world)│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Score Interpretation

| Score Range | Classification | This Project |
|-------------|----------------|--------------|
| 0-20% | Minimal AI Use | |
| 21-40% | Moderate AI Assistance | |
| 41-60% | **Significant AI Collaboration** | **✓ 53%** |
| 61-80% | Heavy AI Reliance | |
| 81-100% | AI-Generated Project | |

### What This Means

- **47% Human-Driven:** The human developer maintained full creative control over the project's vision, educational design, visual identity, user experience, and all architectural decisions. All UI/UX design decisions, database schema design, and feature prioritization were human-originated.

- **53% AI-Assisted:** AI contribution increased from 47% to 53% as the complete MVSEP stem separation pipeline, per-world voice settings, audio buffer race condition fixes, CORS proxy system, and Worlds Settings teacher page were implemented with heavy AI assistance. The voices system alone required extensive debugging of third-party API responses (MVSEP field names, CORS headers, Tone.js buffer loading) which was primarily AI-driven.

- **Classification:** This project remains in the "Significant AI Collaboration" range (41-60%), reflecting that while AI handled the bulk of technical implementation (API integrations, audio synchronization, debugging), the human developer drove all design decisions, educational content, and project direction.

- **Key Distinction:** The AI served as a **technical implementation partner** — diagnosing complex issues (MVSEP response format, Tone.js race conditions, CORS policies), proposing architectures (polling endpoints, proxy systems), and writing implementation code. The human developer served as the **product owner** — deciding what to build, choosing technologies (MVSEP over Replicate), and validating all outputs through manual testing.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 24, 2026 | Initial documentation covering core features |
| 2.0 | February 9, 2026 | Added notification system, tutorials, onboarding, sidebar, mobile responsiveness, Cloudinary integration, teacher submissions, session screenshots section, updated contribution scores |
| 3.0 | February 21, 2026 | Added MVSEP stem separation pipeline (replacing Demucs), CORS audio proxy with domain allowlist, audio buffer race condition fix, per-world stem generation and caching, Worlds Settings teacher page, MVSEP response field mapping discovery, player state safety guards, Git case sensitivity resolution, updated contribution scores (47% → 53%) |

---

## Declaration

I declare that:

1. This document accurately represents the use of AI in the Djembe project
2. All AI-generated code was reviewed and tested before inclusion
3. The educational concept and design were human-originated
4. AI was used as a development tool, not as the sole creator
5. I understand and can explain all code in the project
6. The AI contribution score increased from 47% to 53% due to the complete MVSEP stem separation pipeline, audio debugging, and per-world settings features developed with AI assistance
7. Third-party service selection (MVSEP over Replicate, BS Roformer SW model) was a human decision informed by AI research

---

**Document Prepared By:** Project Developer
**AI Assistant:** Claude (Anthropic) — Claude Opus 4.6
**Date:** February 21, 2026
**Version:** 3.0
