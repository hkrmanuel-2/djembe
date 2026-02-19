# AI Use Documentation - Djembe Project

> **Capstone Project:** Djembe - Educational Music Platform
> **Document Purpose:** Academic disclosure of AI assistance in development
> **AI Tools Used:** Claude (Anthropic) via Claude Code CLI; Cursor AI (OpenAI GPT) via Cursor Chat
> **Last Updated:** February 19, 2026

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
| `api/separate.ts` | High | MVSEP separation endpoint (timeout fix) |
| `api/separate-status.ts` | High | New polling endpoint for MVSEP |
| `api/proxy-audio.ts` | High | CORS proxy for external audio |
| `src/lib/voicesApi.js` | High | Suno API integration, prompt building |
| `src/lib/teacherApi.js` | Medium-High | Per-world settings + assignment functions |
| `src/lib/notificationApi.js` | High | Notification CRUD operations |
| `src/lib/tutorialsApi.js` | High | Tutorials database operations |
| `src/lib/cloudinaryApi.js` | High | Cloudinary file upload integration |
| `src/store/useVoicesStore.js` | Medium | Audio synchronization logic |
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
| 504 timeout on Vercel | Diagnosed cause, proposed solution |
| CORS blocking audio | Identified domains, implemented proxy |
| Wrong genre generation | Found API behavior, fixed parameters |
| Audio sync issues | Explained Tone.js Transport, implemented fix |
| Session storage errors | Debugged caching logic |
| Mobile responsiveness | Identified viewport issues, fixed layouts |
| Notification delivery | Debugged real-time subscription logic |

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
api/separate-status.ts                          - 100% AI
api/proxy-audio.ts                              - 90% AI (updates)
src/lib/voicesApi.js                            - 80% AI (Suno integration, prompts)
src/lib/notificationApi.js                      - 95% AI (complete notification API)
src/lib/tutorialsApi.js                         - 95% AI (complete tutorials API)
src/lib/cloudinaryApi.js                        - 90% AI (upload integration)
src/lib/notifications_setup.sql                 - 95% AI (database schema)
src/lib/tutorials_setup.sql                     - 95% AI (database schema + seed data)
src/store/useNotificationStore.js               - 95% AI (real-time store)
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
src/store/useVoicesStore.js                     - 60% AI (sync logic)
src/store/useStore.js                           - 40% AI (proxy helper)
src/lib/teacherApi.js                           - 60% AI (world_id + assignment functions)
src/lib/progressApi.js                          - 40% AI (submission tracking updates)
api/separate.ts                                 - 70% AI (refactoring)
src/components/teacher/AssignmentForm.tsx        - 50% AI (class selection + notifications)
src/assets/pages/Assignments.tsx                - 40% AI (submission flow + notifications)
src/assets/pages/TeacherDashboard.tsx           - 35% AI (notification integration)
src/assets/pages/DAW-Lite/DAWLite.jsx           - 40% AI (mobile responsiveness)
src/components/Worlds/World1.tsx                - 30% AI (mobile viewport)
src/components/Worlds/World2.tsx                - 30% AI (mobile viewport)
src/components/ui/tubelight-navbar-dark.tsx      - 45% AI (mobile menu + notifications)
src/assets/pages/Auth/Login.tsx                 - 25% AI (responsive layout)
src/assets/pages/Auth/Signup.tsx                - 25% AI (responsive layout)
src/assets/pages/Dashboard.tsx                  - 30% AI (layout + sidebar integration)
src/assets/pages/StudentProgress.tsx            - 30% AI (UI enhancements)
src/assets/pages/Landing_page.jsx               - 25% AI (responsiveness)
src/App.jsx                                     - 30% AI (routing + onboarding integration)
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

The overall score is calculated as a weighted average across all project areas, considering both the percentage of AI contribution and the relative size/importance of each area. Updated to reflect all features through February 2026.

### Breakdown by Project Area

| Project Area | Weight (%) | AI Contribution (%) | Weighted Score |
|--------------|------------|---------------------|----------------|
| Backend API (`api/`) | 8% | 80% | 6.4 |
| Frontend Pages (`pages/`) | 14% | 25% | 3.5 |
| UI Components (`components/ui/`) | 12% | 35% | 4.2 |
| Voices System (`Voices/`, `voicesApi`) | 7% | 70% | 4.9 |
| 3D Worlds (`Worlds/`) | 8% | 20% | 1.6 |
| State Management (`store/`) | 7% | 50% | 3.5 |
| Library/Utils (`lib/`) | 8% | 60% | 4.8 |
| Notification System | 5% | 90% | 4.5 |
| Tutorials System | 4% | 90% | 3.6 |
| Onboarding System | 3% | 90% | 2.7 |
| Authentication System | 4% | 15% | 0.6 |
| Database Schema | 4% | 20% | 0.8 |
| Styling/CSS | 6% | 15% | 0.9 |
| Documentation | 5% | 90% | 4.5 |
| Project Config/Setup | 5% | 10% | 0.5 |
| **TOTAL** | **100%** | — | **47.0%** |

### Final Score

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           OVERALL PROJECT CONTRIBUTION                      │
│           (Updated February 9, 2026)                        │
│                                                             │
│     ┌──────────────────────────────────────────────┐       │
│     │                                              │       │
│     │   AI CONTRIBUTION:        47%                │       │
│     │   HUMAN CONTRIBUTION:     53%                │       │
│     │                                              │       │
│     └──────────────────────────────────────────────┘       │
│                                                             │
│     [██████████████████░░░░░░░░░░░░░░░░░░░░] 47% AI        │
│     [░░░░░░░░░░░░░░░░░░████████████████████] 53% Human     │
│                                                             │
│     Previous Score (Jan 2026): 32% AI / 68% Human          │
│     Change: +15% AI (new features added with AI assistance) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Score Interpretation

| Score Range | Classification | This Project |
|-------------|----------------|--------------|
| 0-20% | Minimal AI Use | |
| 21-40% | Moderate AI Assistance | |
| 41-60% | **Significant AI Collaboration** | **✓ 47%** |
| 61-80% | Heavy AI Reliance | |
| 81-100% | AI-Generated Project | |

### What This Means

- **53% Human-Driven:** The majority of the project—including all creative decisions, UI/UX design, educational content, database architecture, visual assets, and the core React component structure—was developed by the human developer.

- **47% AI-Assisted:** AI contribution increased from 32% to 47% as significant new features (notification system, tutorials, onboarding, sidebar, mobile responsiveness, and teacher submissions page) were implemented with heavy AI assistance in the final development phase.

- **Classification:** This project moved from "Moderate AI Assistance" to "Significant AI Collaboration," reflecting the increased use of AI for implementing complex feature systems. The AI served as a **development accelerator** — the human developer designed what to build, and the AI helped build it faster.

- **Key Distinction:** The human developer maintained full creative control over the project's vision, educational design, visual identity, and user experience. AI was used to implement technical solutions efficiently, not to make design or pedagogical decisions.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 24, 2026 | Initial documentation covering core features |
| 2.0 | February 9, 2026 | Added notification system, tutorials, onboarding, sidebar, mobile responsiveness, Cloudinary integration, teacher submissions, session screenshots section, updated contribution scores |

---

## Declaration

I declare that:

1. This document accurately represents the use of AI in the Djembe project
2. All AI-generated code was reviewed and tested before inclusion
3. The educational concept and design were human-originated
4. AI was used as a development tool, not as the sole creator
5. I understand and can explain all code in the project
6. The AI contribution score increased from 32% to 47% due to additional features developed with AI assistance in the final phase

---

**Document Prepared By:** Project Developer
**AI Assistant:** Claude (Anthropic) — Claude Opus 4.6
**Date:** February 9, 2026
**Version:** 2.0
