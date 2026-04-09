# Djembe — Project Defense Guide

> A complete walkthrough of the Djembe music education platform: what it is, how a user experiences it, how every part is built under the hood, and the reasoning behind every meaningful decision. This document is written so that someone who never touched a single line of the code can read it once and confidently answer technical questions about the project.

---

## How to Read This Document

This is not a reference manual you skim. It's a guided tour. Read it linearly. The first half walks you through Djembe the way a real student or teacher would experience it — what they see, what they do, what happens when they click. The second half pulls back the curtain and explains exactly how each of those experiences is built. By the time you reach the end, you should be able to defend any feature, explain any design choice, and answer "but why did you build it this way?" without hesitation.

The document also has an FAQ at the end with the questions that are most likely to come up during the defense, with the answers you should give.

---

## Part 1 — What Djembe Is, and Why It Exists

Djembe is a web-based music education platform built specifically for children aged 5 to 12. It is named after the West African hand drum because the project was born out of a simple observation: most music education software is designed for adults — Pro Tools, Logic, FL Studio. The interfaces are dense, the workflows assume music theory knowledge, and the visual language is intimidating. A nine-year-old who wants to learn what a beat is shouldn't have to navigate the same software a grammy producer uses.

Djembe replaces that with something different. It is a music classroom in a browser. A child logs in, sees a friendly purple dashboard with a drum mascot waving at them, and within thirty seconds they can be dragging a kick drum onto a timeline, hitting play, and hearing themselves make music. Behind that simple front door sits a full multi-tenant school management system: real teachers, real classes, real assignments, real grading, real progress tracking, and a real backend with row-level security keeping every school's data isolated from every other.

The platform serves three different audiences from a single codebase:

- **Students** come to make music, explore 3D worlds where AI-generated instrumentals play through animated musicians, complete challenges from their teachers, and earn XP and badges as they learn.
- **Teachers** come to monitor their students, create assignments, attach starter loops, review submissions, leave feedback with grades, and configure the AI music settings that students hear in the 3D worlds.
- **Admins** come to manage their school as a whole — approving new teachers and students, assigning teachers to classes, and toggling whether self-signup is allowed.

Three roles, three completely different home pages, three completely different sets of capabilities — but one cohesive product. The role-detection logic, the route protection, the database row-level security, and even the navigation menu are all driven by which of three database tables a user's email shows up in.

---

## Part 2 — A Walk Through the App (The User's Experience)

To understand Djembe technically, you first have to understand it experientially. So before any code, here is what someone actually does when they use it.

### 2.1 Landing — The Front Door

A new visitor arrives at the root URL and sees a purple, gradient-soaked landing page. The branding is the word **DJEMBE** spelled out with each letter in a different color — gold, orange, cyan, pink, purple, green — over a deep purple background. A hero image, a rotating carousel of taglines ("Create Your Own Beats", "Explore Immersive 3D Worlds", "Learn Rhythm Through Play"), and floating animated musical notes drifting across the page. Three child testimonials with names like Kwame, Ama, and Kofi are displayed as quotation cards. The whole page is built with Framer Motion: nothing pops in instantly. Things fade up, slide in, scale gently. The animations are slow on purpose — children get distracted by jittery motion.

There are two calls to action in the top nav: **Sign In** and **Sign Up**. The page is sticky-scrolled — when the user scrolls past the hero, the nav background turns translucent purple with a backdrop blur, so the buttons stay readable on top of any content.

### 2.2 Signing Up — A Five-Step Carousel

When a user clicks Sign Up, they don't see a single long form. They see a carousel with five steps and a row of progress dots at the bottom. Each step is one decision so the cognitive load stays small (a deliberate UX choice for the 5-12 age range, but also helpful for parents and teachers who aren't power users).

1. **Step 1 — Pick a role.** Two big illustrated cards: "I'm a Student" and "I'm a Teacher." (Admins are not created through the public signup flow at all — they have to be provisioned via the test script or directly in Supabase. This is intentional. Admins are administrative users, not random sign-ups.)
2. **Step 2 — Name.** First name and last name. The slide animates in from the right.
3. **Step 3 — School.** A dropdown of schools loaded from the `schools` table in the database. When a school is selected, the UI shows the school's `allowed_domains` so the user knows which email domains will be accepted.
4. **Step 4 — Email and password.** This is the gatekeeping step. As the user types their email, the [emailValidation.ts](src/lib/emailValidation.ts) helper checks the email's domain against the selected school's allowed domains. If the school requires `godsgrace.test` and the user types `bob@gmail.com`, they see an inline validation error and the "Next" button stays disabled. The match also accepts subdomains — `bob@science.godsgrace.test` is valid because the email domain ends in `.godsgrace.test`.
5. **Step 5 — Success.** A celebratory animation, the mascot dancing, and (if the school requires admin approval) a message explaining that the account is pending approval.

The whole flow is one component, [Signup.tsx](src/assets/pages/Auth/Signup.tsx). State for the current step is local React state. The slide animation is `AnimatePresence` from Framer Motion with a directional slide variant. The "can advance" check is a function that validates the current step's required fields, and the Next button is disabled until it returns true.

### 2.3 Logging In and the First Decision the App Makes

When a user logs in, the most important question the app asks is: **what role is this person?** Djembe answers this with a deliberate priority order, in [useAuthStore.js](src/store/useAuthStore.js):

1. First, it queries the `admins` table by email. If found, the user is an admin. Stop.
2. If not, it queries the `teachers` table. If found, check `approval_status`. If `approved`, they're a teacher. If `pending` or `rejected`, block the login and return a "your account is pending approval" error message.
3. If not, it queries the `students` table. Same approval check.
4. If none of the three tables contain the email, the user is authenticated against Supabase Auth but has no profile, and the app shows "User profile not found."

This is called *priority-based role detection*. It's not a single column on a single users table. It's three separate tables, checked in order. The reason: the three roles have radically different schemas. Admins don't have an `approval_status` because they don't need approval. Students have `class_id`, `student_id`, and a one-to-one relationship with `student_progress`. Teachers have `school_id` and a many-to-many relationship with `classes` through `class_assignments`. Trying to model all three on one table would mean a lot of nullable columns and a lot of conditional logic. Three tables with role-specific shapes is cleaner and lets row-level security policies be written role by role.

After the role is determined, the user is redirected to their role's home route: admins to `/admin`, teachers to `/students`, students to `/home`. The redirect is enforced by [ProtectedRoute.tsx](src/components/ProtectedRoute.tsx), which wraps every route and checks if the user's `userType` is in the route's `allowedRoles` array. If not, they're bounced back to their own home.

For students, one more thing happens at login: `useProgressStore.loadProgress()` and `recordDailyLogin()` are called immediately. Loading the profile and recording the login happen as part of the same auth side-effect, which is how the daily streak counter advances exactly once per day even if the student logs in multiple times.

### 2.4 The Student Dashboard — Where Most Kids Live

A logged-in student lands on `/home`. The page greets them by their first name ("Hi, Kofi!"), shows quick links to the four big features — Music Studio, Worlds, Challenges, My Journey — and shows a small recent-activity summary. The background is a soft lavender gradient with slow-floating musical note SVGs. Cards animate in with a staggered fade-up.

On the left is the **sidebar**, which is the navigation backbone of the entire app. It's a single component, [Sidebar.tsx](src/components/ui/Sidebar.tsx), but the items it shows are completely different per role. The component receives an `items` prop with the navigation items appropriate for the current user's role, computed in App.tsx based on `userType`. Each nav item has a color associated with it from a hardcoded `itemColors` map: Home is gold, Music Studio is orange, Challenges is cyan, My Journey is pink, Worlds is purple, Tutorials is green. When an item is active, its row background takes on that color. The visual effect is that each section of the app has a personality — kids learn to associate orange with music-making and pink with progress and rewards, even before they can read the labels.

On desktop, the sidebar is a fixed 220px column. On mobile, it collapses to a 60px icon strip and expands to fullscreen with a backdrop overlay when tapped. Hover states use `whileHover={{ scale: 1.04 }}` and tap states use `whileTap={{ scale: 0.96 }}`. The growth-on-hover (rather than shrink) is a deliberate interaction choice: growth feels engaging, shrinking feels like the UI is recoiling from you.

On the very first login, the dashboard is immediately overlaid by the **onboarding tour**. This is built with [react-joyride](src/components/onboarding/OnboardingTour.tsx) and uses a 3×3 sprite sheet of the Djembe mascot. The mascot is illustrated in nine different poses (waving, pointing, dancing, surprised, sleeping, etc.) all in one image, and the tour switches between them by adjusting the CSS `background-position` to show the right cell. Different tour steps use different mascot poses — waving on welcome, pointing when highlighting a button, dancing on completion. The tour content is role-specific (teachers see different steps than students), and a `useOnboarding` hook checks `localStorage` for a per-role completion key (`djembe_onboarding_completed_student`) so the tour only shows once per role per browser. The Settings page has a "Restart Tutorial" button that simply clears that localStorage key.

### 2.5 The Music Studio — Where the Magic Lives

A student clicks "Music Studio" in the sidebar and the immersive view of the **DAW-Lite** opens at `/daw`. This is the heart of Djembe. The navbar disappears (the route is in the `shouldHideNavbar` list in [App.tsx](src/App.tsx)) so the student can focus.

The DAW-Lite has four main areas:

- **The loop library** down the left side, showing draggable, color-coded loop cards (Kick, Snare, Bass, Melody, Bell, Shaker, etc.). Each loop has an emoji icon, a colored background, and a name. Loops are loaded from the `loops` table in Supabase when the page mounts.
- **The transport controls** along the top — a play button, stop button, rewind button, and a BPM input.
- **The timeline grid** in the center — rows of empty cells the student drags loops into. The grid is divided into bars (default 10), each bar is 4 beats, each beat is 4 subdivisions (16th notes). So the grid has 10 × 4 × 4 = 160 columns by default.
- **The project menu** in a corner with Save, Load, Export options.

A child does this: they grab a kick drum from the library, drag it onto the first column of the first row of the timeline. They drag a snare to the third beat. They drag a hi-hat across multiple beats. They hit the play button. A playhead — a vertical orange line — sweeps across the timeline at the project's BPM, and as it crosses each placed loop, that loop *fires* — plays once. Not on a loop, not on a synth — just plays the audio file once at the moment the playhead reaches it.

When they're happy, they hit Export. A second or two later, an MP3 file downloads to their computer with their composition. They can also save the project to Supabase, which serializes the placed loops, BPM, and bar count as JSON and stores it in the `projects` table. They can come back tomorrow, load it, and keep working.

This experience is the result of a surprising amount of engineering. We'll come back to it in detail in Part 4.

### 2.6 The 3D Worlds — Stepping Inside the Music

The most distinctive feature of Djembe is the 3D worlds. From the sidebar, a student opens the Worlds submenu and picks **World 1: Fireside** or **World 2: Auditorium**. They tumble into a Three.js scene rendered to a full-screen `<canvas>`. The Fireside world is a campfire at night with five animated musician characters — a drummer, a pianist, a guitarist, a flutist, and a tambourinist — sitting around the fire. Each musician is a fully rigged 3D model with bone-attached instruments and an idle animation loop. The Auditorium world has the same characters in a theater setting, ready for a concert.

The student can rotate the camera with their mouse (orbit controls), zoom in and out, look around. When they're ready, they tap a button on the side of the screen to slide out the **Voices Panel**.

The Voices Panel is the bridge between the visual world and the audio engine. It has five categories — Rhythm, Bass, Harmony, Melody, Extras — each represented as a stack of buttons. If no music has been generated yet for this session, the panel shows a "Generate" button. When pressed, the panel sends the school's voice settings (BPM, genre, style, mood, custom prompt — all set by the teacher) to the Suno AI music generation service, waits for it to produce a full instrumental track, then sends that track to MVSEP for stem separation. MVSEP returns five separated audio files: drums, bass, piano, guitar, vocals — though we treat them as five educational categories: rhythm, bass, harmony, melody, extras.

Once stems are ready, the student picks one voice in each category and hits play. All five stems start playing in perfect sync (because they were separated from a single track, they're already aligned). The musicians around the campfire animate in time with the music. If the student picks a different voice mid-playback, the new voice doesn't start immediately — it queues, and at the next bar boundary, the old voice stops cleanly and the new voice starts. This is the **beat-synced voice switching** that makes the experience feel professional. The teacher can change the genre between sessions to expose students to afrobeat, lo-fi, jazz, classical, whatever they want.

The session is cached in `sessionStorage` per world, so if a student tabs away and comes back, they don't re-pay for AI generation. They lose the cache when they close the tab.

### 2.7 Challenges — The Assignment Loop

From the sidebar, a student opens **Challenges** at `/assignments`. They see a list of cards — every assignment their teacher has created for their class that is not past its due date. Each card shows the title, the description, the due date, and a status badge: pending or submitted. Tapping a card opens a detail modal with the full instructions and any starter loops the teacher attached.

If the assignment is project-based, tapping "Start Working" launches the DAW with the assignment context loaded. The loops the teacher attached are pre-loaded into the loop library. The student composes their answer and submits. If the assignment is upload-based, they pick a file from their device and upload it.

When the submission is created, two things happen behind the scenes. First, a row is inserted into the `submissions` table with a link to the uploaded file (stored in Supabase Storage). Second, a notification is created in the `notifications` table with `recipient_type = 'teacher'` and `recipient_id` set to the assignment's owner. Because of the way the notification store subscribes to Realtime inserts, the teacher's notification bell badge ticks up immediately, even if the teacher is in a totally different page of the app at that moment.

When the teacher grades the work, a feedback row is inserted in the `feedback` table and another notification fires — this time targeted at the student. The student's bell ticks up, they tap it, and they see "You got 95 on 'Make a Drum Beat'!"

### 2.8 My Journey — The Gamification Loop

`/progress` is the student's reward dashboard. It shows:

- **XP and level.** Total XP earned, current level number, level name (e.g., Rhythm Rookie, Beat Builder, Mix Master, Music Legend), and a progress bar showing how close they are to the next level. Levels are calculated by the formula `100 * level * (1 + level * 0.1)` for the XP needed at each level — so level 1 needs 110 XP, level 2 needs 220, level 5 needs 750, level 10 needs 2000. The growth is roughly quadratic so kids feel rapid early progress but the curve doesn't stay too gentle.
- **Badges.** A grid of unlocked badges and locked badges. Locked badges are grayed out but visible, so kids know there's more to earn.
- **Streak.** Current streak (consecutive days logged in) and longest streak.
- **Recent activity.** A timeline of recent XP-earning events.

The XP is earned from things like submitting an assignment (+50, plus a +20 on-time bonus), exporting a project (+30), creating a project (+10), placing a loop (+2, capped at 25 placements per day so kids can't farm by clicking endlessly), daily login (+10), and active session time (5 XP per 10 minutes, capped at 60 minutes per day). Every one of those activities is logged in `xp_activities` with a timestamp, and daily caps are enforced by counting today's rows before awarding new XP. We'll go into the anti-cheating logic in detail in Part 7.

### 2.9 The Teacher Experience

When a teacher logs in, they land at `/students`. The page shows a roster of every student in their school, with their current XP, level, badge count, streak, and class. Filters let them narrow by class. Clicking a student opens a detail modal with that student's full progress.

The teacher's sidebar has different items: Students, Assignments, Submissions, Analytics, Projects, Worlds (settings), Tutorials, Settings. The most-used routes are:

- **Assignments** (`/teacher/assignments`) — a list of every assignment the teacher has created. They can create new ones with a form that asks for title, description, class, due date, type (upload or project), and optionally a set of starter loops. If the assignment is project-based, they upload audio files via the form, and each upload becomes a row in `assignment_loops` with a color and an icon assigned by index.
- **Submissions** (`/teacher/submissions`) — every student submission for assignments owned by this teacher. Each row has an audio player so the teacher can listen, and a "Give Feedback" button that opens [FeedbackModal.tsx](src/components/teacher/FeedbackModal.tsx). The modal has a comment field and a score field with quick buttons (100, 90, 80, 70, 60, 50) plus a manual input. On submit, it inserts a row into the `feedback` table and triggers a notification to the student.
- **Worlds** (`/teacher/worlds`) — this is the teacher's most powerful feature. They configure the AI music generation parameters (BPM, genre, style, mood, custom prompt) per world, and those settings are stored in the `voice_settings` table scoped to their school. Every student in that school will hear AI music generated with those parameters when they enter the worlds. This is how a teacher running a "this week we're learning about reggae" lesson can put the entire class into a Caribbean musical environment with two clicks.

### 2.10 The Admin Experience

Admins land at `/admin` on a four-tab dashboard:

1. **Overview** — statistics cards: total teachers, total students, total classes, pending approvals. If there are any pending approvals, an alert badge is shown.
2. **Pending Approvals** — every teacher and student with `approval_status = 'pending'`, with approve and reject buttons. Approving sets `approval_status = 'approved'`, `approved_by = adminId`, `approved_at = now()`. Rejecting does the same with status `'rejected'`.
3. **Manage Teachers** — a two-panel view. On the left, a list of approved teachers. On the right, the selected teacher's class assignments, with controls to add them to existing classes, remove them, or create new classes.
4. **Access Control** — three toggles per school: Allow Student Signup, Allow Teacher Signup, Require Admin Approval. These are stored in the `access_controls` table. Disabling student signup, for example, means new students can't even reach the signup page for that school.

That's the whole user experience. Now we go behind the curtain.

---

## Part 3 — System Architecture, From Top to Bottom

Djembe is a single-page React application served as static files from Vercel, talking to a Supabase backend, with a thin layer of Vercel serverless functions in between for things that have to be hidden from the browser (API keys) or that the browser can't do because of CORS.

```
                          ┌──────────────────────────────────┐
                          │      User's Browser              │
                          │                                  │
                          │  React 19 + TypeScript + Vite    │
                          │  ├── React Router v7             │
                          │  ├── Zustand stores (5)          │
                          │  ├── Tailwind CSS                │
                          │  ├── Framer Motion               │
                          │  ├── Tone.js (Web Audio)         │
                          │  └── Three.js (WebGL)            │
                          └────────────┬─────────────────────┘
                                       │ HTTPS
                                       ▼
        ┌─────────────────────────────────────────────────────────┐
        │                Vercel (Hosting)                         │
        │                                                         │
        │  Static dist/  +  Serverless functions in /api          │
        │                       ├── /api/generate                 │
        │                       ├── /api/generate-status          │
        │                       ├── /api/separate                 │
        │                       ├── /api/separate-status          │
        │                       └── /api/proxy-audio              │
        └──────┬──────────────────────────────────────────┬───────┘
               │                                          │
               │ Direct from browser                      │ Server-side
               ▼                                          ▼
   ┌───────────────────────┐                ┌────────────────────────┐
   │      Supabase         │                │   External APIs        │
   │                       │                │                        │
   │  PostgreSQL (RLS)     │                │  Suno (music gen)      │
   │  Auth (JWT)           │                │  MVSEP (stem split)    │
   │  Realtime (WebSocket) │                │                        │
   │  Storage (files)      │                │                        │
   └───────────────────────┘                └────────────────────────┘
```

Two things are worth noticing here.

**The browser talks directly to Supabase.** Auth, queries, mutations, file uploads, and the realtime WebSocket all happen straight from the React app to Supabase using the `@supabase/supabase-js` client. There is no Express server, no Next.js API layer, no GraphQL gateway. This is possible because Supabase enforces row-level security at the database level, so even though the browser has direct access, it can only see and write the rows that RLS policies allow it to see and write. The "anon key" in the React app is safe to expose publicly because it grants no privileges on its own — every privilege has to come from a JWT-based RLS policy.

**The browser does NOT talk directly to Suno or MVSEP.** Both of those services have API keys that need to stay secret, and both serve audio files from CDNs that don't return CORS headers permitting our origin. So Vercel serverless functions sit in the middle. The React app calls `/api/generate`, which forwards to Suno with the secret key attached server-side. It calls `/api/proxy-audio?url=...` to fetch external audio files through a domain-allowlisted proxy that adds the right CORS headers and returns the bytes. This is the only "backend" Djembe has, and it exists purely because of secrets and CORS — not because of business logic.

### State Management — The Five Stores

Djembe has no Redux, no Context-based state container, no React Query. State is split across five **Zustand** stores, each owning a clear domain:

| Store | File | Owns |
|-------|------|------|
| `useAuthStore` | [src/store/useAuthStore.js](src/store/useAuthStore.js) | Current user, role, profile, sign in/up/out |
| `useStore` | [src/store/useStore.js](src/store/useStore.js) | DAW state: library, placedLoops, transport, project |
| `useVoicesStore` | [src/store/useVoicesStore.js](src/store/useVoicesStore.js) | 3D world music: settings, stems, playback, categories |
| `useProgressStore` | [src/store/useProgressStore.js](src/store/useProgressStore.js) | XP, level, badges, streak |
| `useNotificationStore` | [src/store/useNotificationStore.js](src/store/useNotificationStore.js) | Notifications array, unread count, realtime channel |

Three of those stores (`useAuthStore` and `useStore`, plus the others to a lesser extent) use Zustand's `persist` middleware so that important state survives a page reload. The auth store persists the user, userType, and profile so a refresh doesn't bounce you to login. The DAW store persists the current project so a child who accidentally refreshes doesn't lose their work.

Why Zustand instead of Redux or React Context? Three reasons.

1. **Bundle size.** Zustand is roughly 1.5KB minified+gzipped. Redux + Redux Toolkit + React-Redux is about 30KB. For a project where bundle size matters (the 3D worlds already pull in Three.js, which is large), every kilobyte counts.
2. **Boilerplate.** Zustand stores are just objects with state and functions. There are no actions, no reducers, no slices, no dispatch. The mental model is "a store is an object you can read and call methods on." This makes the codebase easier to read for a future maintainer.
3. **Selectors are free.** Components subscribe to slices of state by passing a selector function. `useStore(s => s.transport.isPlaying)` only re-renders when `isPlaying` changes. There is no separate `reselect`, no memoization library — the subscription model is built in.

The trade-off is that Zustand has no built-in time-travel debugging or middleware ecosystem. We accepted that. Djembe is not the kind of app where time-travel debugging would matter — the state changes are short-lived and audio-driven.

---

## Part 4 — The Music Studio (DAW-Lite), in Detail

This is the most engineering-heavy part of Djembe and the most likely to be questioned during the defense. Read this section carefully.

### 4.1 What "DAW-Lite" Means

A DAW (Digital Audio Workstation) is software like Pro Tools or Ableton Live. It lets you arrange audio clips on a timeline, play them back in sync, mix them, and export the result. DAW-Lite is a stripped-down version of that designed for children — no synthesis, no MIDI, no complex routing. Just a grid you drop pre-recorded audio loops onto, a play button, and an export button.

The DAW lives at `/daw` and is composed of:

| Component | File | Job |
|-----------|------|-----|
| `DAWLite` | [src/assets/pages/DAW-Lite/DAWLite.jsx](src/assets/pages/DAW-Lite/DAWLite.jsx) | Page shell, drag-and-drop orchestration, mobile orientation handling |
| `Timeline` | [src/components/ui/DAW-Lite/Timeline.jsx](src/components/ui/DAW-Lite/Timeline.jsx) | The grid, the playhead, loop placement and trimming |
| `LoopLibrary` | [src/components/ui/DAW-Lite/LoopLibrary.jsx](src/components/ui/DAW-Lite/LoopLibrary.jsx) | The draggable loop cards on the left |
| `TransportControls` | [src/components/ui/DAW-Lite/Transportcontrols.jsx](src/components/ui/DAW-Lite/Transportcontrols.jsx) | Play, pause, stop, rewind, BPM input |
| `ProjectMenu` | [src/components/ui/DAW-Lite/Projectmenu.jsx](src/components/ui/DAW-Lite/Projectmenu.jsx) | Save, load, export buttons and dialogs |
| `AILoopGenerator` | [src/components/ui/DAW-Lite/AILoopGenerator.jsx](src/components/ui/DAW-Lite/AILoopGenerator.jsx) | Calls Suno to generate a custom loop on demand |
| `Waveform` | [src/components/ui/DAW-Lite/Waveform.jsx](src/components/ui/DAW-Lite/Waveform.jsx) | Renders a static waveform image of a loop into a placed clip |

All of that is wired through the `useStore` Zustand store at [src/store/useStore.js](src/store/useStore.js).

### 4.2 The Grid: Why 16th-Note Subdivisions

The timeline is laid out as a grid. The smallest unit is one column. Four columns make a beat. Four beats make a bar. The default project is 10 bars long, so the grid is 160 columns wide.

Why 16th-note resolution? Because that's the smallest rhythmic unit kids encounter in beginner music. A 16th note is one quarter of a beat — kick on 1, snare on 2, hi-hat on every 16th. You can teach an 8-year-old "put the snare on the third beat" by saying "drag it to column 8" (column 8 = beat 3 because beats start at columns 0, 4, 8, 12). Going finer (32nd notes) would clutter the grid. Going coarser (8th notes) would limit what can be expressed.

When a loop is placed, its position is stored as `{ col, span, row, ... }` where `col` is the starting column and `span` is how many columns wide it is. The placement snaps to the nearest column on drop. Trimming the right edge of a loop changes its `span`. This grid model is what makes export possible — when we mix everything down, we know exactly where each loop should start in seconds because `seconds = (col / 4) * (60 / bpm)`.

### 4.3 The Playback Engine — How Sound Actually Comes Out

This is the part to understand if you only have time to understand one thing about the DAW.

The store keeps three internal references that are NOT part of React state, captured in a closure inside the Zustand store factory:

```javascript
let rafId = null;          // requestAnimationFrame handle
let startTime = 0;         // Tone.now() when transport started
let lastTriggeredBeat = -1; // last beat we processed (to avoid re-triggering)
const triggeredLoops = new Set();   // "loopId-beatIndex-cycle" keys
const activeAudioElements = new Set(); // Audio elements currently playing
```

Why outside React state? Because a `requestAnimationFrame` loop runs roughly 60 times per second, and updating React state at that rate would cause an unmanageable amount of re-rendering. These references are mutable, fast, and only the things that *should* trigger UI updates (like `currentBeat`) are pushed into Zustand state via `set()`.

When the user hits Play, `startTransport()` runs:

1. If audio isn't initialized yet, it calls `Tone.start()` to satisfy the browser's autoplay policy (audio can only start after a user gesture) and creates Tone.Player instances for each loop in the library.
2. It sets `Tone.Transport.bpm.value` to the project BPM and starts the Tone Transport. This isn't strictly required for our playback (we don't use Tone.Transport for scheduling — we do that ourselves), but it lets any future Tone-synchronized features hook into the same clock.
3. It captures `startTime = Tone.now()`. This is the audio-clock timestamp at the moment playback began.
4. It kicks off the requestAnimationFrame loop.

Now `updateBeatLoop` runs every animation frame. Each call:

1. Reads `Tone.now()` and computes `elapsed = now - startTime`.
2. Computes the current beat: `floatBeat = elapsed / secondsPerBeat`, then `beatIndex = Math.floor(floatBeat) % totalBeats`.
3. If the integer beat changed since the last frame, it updates `transport.currentBeat` in Zustand state (which causes the playhead UI to advance).
4. For every placed loop on the timeline, it computes that loop's *start beat* from its column: `loopStartBeat = Math.floor(col / 4)`. If the current beat equals the loop's start beat, the loop is *triggered* — meaning a brand-new `Audio` element is created with `new Audio(loop.url)` and `.play()` is called.
5. To prevent re-triggering the same loop multiple times when the playhead sits on a beat for several frames, every trigger is keyed as `${loopId}-${startBeat}-${cycle}` and added to a `triggeredLoops` Set. Subsequent frames check the Set before triggering.
6. The `cycle` part of the key is what makes timeline looping work. When the playhead reaches the end of bar 10 and wraps back to beat 0, the cycle counter increments. The same loop now gets a new key — `loop1-0-1` instead of `loop1-0-0` — and so it triggers again on the new pass.
7. To prevent the Set from growing forever, when its size exceeds 500, old keys (more than 2 cycles behind the current cycle) are evicted.

The result is **DAW-style one-shot triggering**: each clip plays exactly once when the playhead crosses its start position, and re-plays every full cycle of the timeline. There's no continuous looping of any individual clip — if you want a clip to play three times across a bar, you place it three times.

This is unusual. A naive implementation would use `Tone.Player` with `loop: true` and let Tone schedule everything. We tried that. The problem: starting and stopping a Tone.Player to make it play once is awkward, the buffer load latency causes audible glitches when you trigger many loops at once, and synchronizing exact start times across multiple Tone.Players is fiddly. Native HTML `Audio` elements, by contrast, are dirt simple: `new Audio(url).play()` and they just go. They're not sample-accurate, but they're "feels-fast" accurate, which is what matters for a child building a beat. Real-world timing offsets are well below the 60ms threshold most listeners can detect.

When the user hits Pause or Stop, the store cancels the rAF, calls `Tone.Transport.pause()` or `.stop()`, and iterates the `activeAudioElements` Set, calling `.pause()` and resetting `currentTime = 0` on each. The Set is then cleared. This is why you can pause mid-beat and not have lingering audio.

### 4.4 The Loop Library and the URL Proxy

The loops shown in the library are loaded once when the DAW page mounts. The store's `loadLoops()` function queries the `loops` table in Supabase, which returns rows with `name`, `url`, `color`, `icon`, `bpm`, etc. There's an interesting bit in the URL handling.

Some loops in the database point to external CDNs — the Box music CDN, Suno's CDN, MVSEP's storage. Browsers refuse to load audio from those URLs because the CDNs don't send permissive CORS headers. To fix this, every loop URL is run through `proxyUrlIfNeeded()` which checks the URL against a whitelist of domains:

```javascript
const needsProxy = [
  "musicfile.api.box",
  "cdn.suno.ai",
  "cdn1.suno.ai",
  "cdn2.suno.ai",
  "mvsep.com",
];
```

If the URL contains any of those, it's rewritten to `/api/proxy-audio?url=<encoded original>`. The Vercel function at [api/proxy-audio.ts](api/proxy-audio.ts) does the fetch on the server, validates the URL is in the allowlist (this is critical — without the allowlist, anyone could turn your Vercel deployment into an open proxy), and streams the bytes back with proper CORS headers. The function also adds a `Cache-Control: public, max-age=3600` so the same proxied loop isn't re-fetched from the origin every time.

In the background, after loading, `preloadDurations(urls)` is called from [src/lib/audioDurationCache.js](src/lib/audioDurationCache.js). This fetches each loop's audio metadata once and caches the duration in memory. The reason: when a user drags a loop onto the timeline, we need to know the loop's duration to pre-set its `span` (so it doesn't default to one column). Without preloading, the first drag would have to wait for the audio to load. With preloading, the duration is already known and the drop is instantaneous.

### 4.5 Project Save and Load

When the user clicks Save in the project menu, the store serializes `{ name, bpm, bars, placedLoops }` and inserts (or updates) a row in the `projects` table:

```sql
INSERT INTO projects (student_id, name, project_data, ...)
VALUES (..., ..., '{"bpm":120,"bars":10,"placedLoops":[...]}'::jsonb, ...);
```

`project_data` is a JSONB column. Storing as JSON has obvious downsides — you can't query the contents efficiently, you can't enforce a schema at the database level — but the trade-off is worth it. The shape of a placed loop changes as the DAW evolves; storing as JSON means we don't have to write a migration every time we add a new field. And we never need to query inside the JSON; we always load the whole project at once.

Load is the inverse: read the row, parse the JSON, set `project.placedLoops` in the store. The DAW-Lite component watches for changes to `placedLoops` and re-renders the timeline accordingly.

### 4.6 Export — Mixing in the Browser with OfflineAudioContext

This is the second most clever part of the DAW.

When the user clicks Export, the audio export pipeline at [src/lib/audioExport.js](src/lib/audioExport.js) runs entirely in the browser:

1. Create a `new AudioContext()`. This is a regular Web Audio context, not an offline one — we use it just for `decodeAudioData`.
2. For every placed loop, fetch the audio file as an `ArrayBuffer`, then call `audioContext.decodeAudioData()` to turn it into an `AudioBuffer`. AudioBuffers contain raw float samples per channel and are extremely fast to manipulate.
3. Compute each loop's start time in seconds and duration in seconds from its column and span using `(col / subdivisionsPerBeat) * (60 / bpm)`.
4. Mix all the buffers into a single output buffer. The mixing is hand-rolled in `mixAudioBuffers()`: it computes the total project duration in samples (`bars * 4 * (60/bpm) * sampleRate`), creates a stereo output buffer of that length, and then for each input buffer, copies its samples into the output buffer at the correct sample offset, *adding* (not replacing) so that overlapping clips sum together. Each sample is multiplied by 0.7 (a gentle volume cut) to leave headroom and prevent clipping when many loops play simultaneously.
5. Trim the mixed buffer to the exact project duration.
6. Encode. If MP3 was requested, the function dynamically imports `lamejs` (a pure-JS MP3 encoder) and encodes the buffer one 1152-sample frame at a time (1152 is the MPEG Layer III frame size). If WAV was requested — or if MP3 encoding throws — the function falls back to a hand-written WAV encoder that writes the standard 44-byte RIFF/WAVE header followed by interleaved 16-bit PCM samples.
7. Return a `Blob`. The DAW page wraps it in an object URL and creates a hidden `<a>` tag with `download` set to trigger a save dialog.

Three things to notice about this design:

- **It's all client-side.** No bytes are uploaded to a server. The browser does the entire mix. This is possible because Web Audio is fast — mixing 20 short loops into a 30-second track takes well under a second on any modern device.
- **MP3 is a soft requirement, not a hard one.** Lamejs is fairly large (about 100KB minified) and is dynamically imported only when the user actually exports. If the encode fails for any reason, the function falls back to WAV. Users always get a working file.
- **The mixing assumes the source loops are already in stereo or mono PCM at compatible sample rates.** Web Audio handles the resampling automatically when you `decodeAudioData` and the sample rate of the output buffer matches the AudioContext's `sampleRate`. The output buffer is created at the AudioContext's native rate (typically 44.1kHz or 48kHz depending on the device).

That's the whole DAW. Drag, drop, snap to grid, requestAnimationFrame loop checking which beat we're on, fire native Audio elements at the right beats, mix everything down with Web Audio when the user wants a file. The total surface area is small — a single Zustand store, six components, one export module — but each piece is doing nontrivial work.

---

## Part 5 — The 3D Worlds and the Voices System

The 3D worlds are the second pillar of Djembe and the most visually distinctive feature. They demonstrate a real integration between an interactive 3D scene, a generative AI service, audio stem separation, and beat-synchronized playback.

### 5.1 Three.js Without React Three Fiber

A common question: "Why didn't you use React Three Fiber?" R3F is a popular library that wraps Three.js in a React-component model — instead of imperatively calling `scene.add(mesh)`, you write JSX like `<mesh><boxGeometry /></mesh>` and R3F reconciles it. It's elegant for many cases.

We use vanilla Three.js. The reasons:

1. **The world scenes are mostly static.** Once the GLB model loads, the scene doesn't restructure. R3F's main benefit — declarative reactive updates to the scene graph — isn't doing much for us.
2. **GLB loading and animation playback work best imperatively.** GLTFLoader callbacks return raw Three.js objects, and binding their AnimationMixer to a render loop is the same code in vanilla as it would be in R3F. There's no win.
3. **Bundle size.** Three.js is already large. R3F adds another ~30KB on top, plus you typically pull in `@react-three/drei` for the helper components, which is more.
4. **Direct control over the render loop.** We need precise control over animation timing and the ability to pause renders when the world is hidden. Vanilla Three.js gives us a single `requestAnimationFrame` loop we own completely.

The world component, [src/components/Worlds/World1.tsx](src/components/Worlds/World1.tsx), is a single React component but uses refs and effects to manage all the Three.js state imperatively. The component is structured like this:

```typescript
const canvasRef = useRef<HTMLCanvasElement | null>(null);
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
const controlsRef = useRef<OrbitControls | null>(null);
const mixersRef = useRef<THREE.AnimationMixer[]>([]);
const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
const timerRef = useRef(new THREE.Timer());
const raycasterRef = useRef(new THREE.Raycaster());
const clickableModelsRef = useRef<Map<string, THREE.Object3D>>(new Map());
```

In a `useEffect` that runs once on mount:

1. Create a `WebGLRenderer` with antialiasing, `SRGBColorSpace` output, and `ACESFilmicToneMapping` (cinematic color grading).
2. Set up the camera (PerspectiveCamera, FOV 75, near 0.1, far 1000) at a hand-tuned starting position so the campfire is in frame.
3. Add lights — an ambient light at 1.2 intensity for a soft fill, plus two directional lights at different positions for key and rim lighting.
4. Add OrbitControls so the user can drag to rotate the camera.
5. Instantiate a single `GLTFLoader` with the meshopt decoder attached. Meshopt is a mesh compression library that lets us ship models 10x smaller than uncompressed glTF. Without meshopt-decoder enabled, the loader would fail to parse our compressed buffers.
6. Load each model in sequence. Each model's animations are extracted, an `AnimationMixer` is created per model, and the idle animation action is stored in `actionsRef` keyed by the model name.
7. Start the render loop: a `requestAnimationFrame` callback that updates each mixer's delta time, updates orbit controls, and renders the scene.

When the component unmounts, every reference is disposed: animations stopped, geometries and materials disposed, the renderer's WebGL context released. This is critical — Three.js does not automatically clean up after itself, and a missed dispose call leaks GPU memory. If you defend this part of the project, you should be ready to say "we explicitly dispose all geometries, materials, and the renderer in the cleanup function of the mount effect."

### 5.2 Compressed Models and the 250MB → 26MB Story

The original 3D models from the artist were uncompressed glTF files with PNG textures. The total size came out to roughly 250MB across both worlds — completely unacceptable for a web app, especially one targeted at children whose devices might have limited bandwidth.

Two compression passes brought the total down to about 26MB:

1. **Texture conversion.** Every PNG/JPG texture was converted to **WebP** using `cwebp`. WebP at quality 80 typically beats JPG at quality 90 by a wide margin and supports both lossless and lossy modes. PNG normal maps and other "data" textures were converted with lossless WebP to preserve precision.
2. **Geometry compression.** The glTF binary buffers were re-encoded with **meshoptimizer** (`gltfpack -cc`), which uses a custom mesh codec that compresses vertex data 5-15x. The decoder is small (~30KB) and runs in the browser via WebAssembly. We bundle the meshopt decoder with our Three.js GLTFLoader so the compressed models can be parsed at runtime.

The compressed models are served from `public/models/` and Vercel adds an immutable cache header (`Cache-Control: public, max-age=31536000, immutable`) so once a user has loaded them, they're cached for a year. The header is set in [vercel.json](vercel.json). This means a returning user pays nothing to enter a world they've visited before — the models come from disk cache instantaneously.

The world components are also wrapped in `React.lazy()` in [App.tsx](src/App.tsx):

```typescript
const World1 = React.lazy(() => import("./components/Worlds/World1"));
const World2 = React.lazy(() => import("./components/Worlds/World2"));
```

This means the Three.js library and the world components are not in the main JavaScript bundle. They're loaded on demand only when the user navigates to a world. The student dashboard, the DAW, the assignments page — none of them include Three.js. This is the difference between a 200KB initial bundle and an 800KB initial bundle, which matters a lot on mobile.

### 5.3 The Voices Panel and Stem Switching

The Voices Panel ([src/components/Voices/VoicesPanel.tsx](src/components/Voices/VoicesPanel.tsx)) is a slide-out panel from the right side of the world canvas. It contains five categories — Rhythm, Bass, Harmony, Melody, Extras — each rendered as a `VoiceCategory` component containing one `VoiceButton` per available stem in that category.

The panel's behavior is driven entirely by the `useVoicesStore` Zustand store at [src/store/useVoicesStore.js](src/store/useVoicesStore.js). The store has these key state fields:

```javascript
worldId: "world1",
settings: { bpm, genre, style, mood, custom_prompt },
stems: { rhythm: [...], bass: [...], harmony: [...], melody: [...], extras: [...] },
isPlaying: false,
isGenerating: false,
generationStage: null,
audioInitialized: false,
stemsLoaded: false,
categories: {
  rhythm: { activeVoice, pendingVoice, pendingStartTime, muted, solo },
  bass: { ... },
  // ...
},
currentBar: 0,
```

The interesting parts of the lifecycle:

**Generation.** When the student clicks "Generate," the store calls `generateAndSeparateStems()` from [src/lib/voicesApi.js](src/lib/voicesApi.js). That function does two things in sequence:

1. **Suno generation.** Builds a long, carefully-tuned prompt from the teacher's settings (genre, BPM, style, mood, plus a hardcoded preamble specifying child-safe instrumental music with no vocals) and POSTs it to `/api/generate`. The Vercel function forwards the request to Suno with the secret API key. Suno returns a task ID. The store then polls `/api/generate-status?taskId=...` every 1-5 seconds (with exponential backoff up to 5 seconds) until Suno reports the track is done, at which point the response includes an `audioUrl`. The polling logic accounts for Vercel's 10-second function timeout — each poll is a fresh function invocation, not a long-running connection, so we can safely poll for up to several minutes.
2. **MVSEP separation.** POSTs the Suno audio URL to `/api/separate`. The Vercel function downloads the audio and uploads it to MVSEP's BS Roformer SW model (`sep_type: 63`), which separates the track into six stems: drums, bass, guitar, piano, vocals, other. MVSEP returns a job hash. The store then polls `/api/separate-status?hash=...` for up to 6 minutes (120 polls × 3 seconds) until separation is done.
3. **Mapping to categories.** The six raw stems are mapped to Djembe's five educational categories by `mapStemsToCategories()`: drums → rhythm, bass → bass, piano + other → harmony, guitar + vocals → melody, extras → empty. The mapping is intentional — children think in terms of "what plays the rhythm" not "what plays the drums alone vs the drums plus percussion."

**Why two separate endpoints for separation?** Because Vercel serverless functions time out after 10 seconds on the hobby plan. A single function that started the job and waited for it to complete would never finish. Splitting into "start the job" and "poll the status" lets the front-end take the polling responsibility, and each individual function call takes well under 10 seconds.

**Caching.** Both the settings and the stems are cached in `sessionStorage` with keys that include the world ID — `djembe_voices_stems_world1` and `djembe_voices_settings_world1`. SessionStorage was chosen over localStorage on purpose. AI-generated music costs Suno credits. We don't want to permanently bind a student to one set of stems. SessionStorage is cleared when the tab closes, so the next time the student opens the world fresh, they get fresh music.

**Loading the players.** Once stems are mapped, `loadStemPlayers()` creates a Tone.Player for each stem with `loop: true`, connects each to a master gain node, and waits for all of them to load (`Promise.all(loadPromises)` where each promise is `player.loaded`). This guarantees that when playback starts, every player is ready and there's no ragged start.

**Synchronized playback.** When the student hits play, `startPlayback()` does:

```javascript
Tone.Transport.bpm.value = settings.bpm;
const secondsPerBar = (60 / settings.bpm) * 4;
barSchedulerId = Tone.Transport.scheduleRepeat(
  (time) => get()._processBarBoundary(time),
  secondsPerBar,
  0
);
Tone.Transport.position = 0;
Tone.Transport.start();

const startTime = Tone.now() + 0.01;
Object.entries(categories).forEach(([category, state]) => {
  if (state.activeVoice && players[category]?.[state.activeVoice]) {
    const player = players[category][state.activeVoice];
    if (player.buffer?.loaded) {
      player.start(startTime, 0);
    }
  }
});
```

Notice the `+ 0.01` on the start time. This is a 10ms safety margin. Tone.js audio scheduling needs the start time to be slightly in the future for the scheduler to deliver it on time. Without this offset, you'd occasionally get a sample-frame of glitch at the moment of start.

All players start at the same `startTime`. Because the stems were separated from a single track, they're already aligned in time. Starting them simultaneously gives perfect synchronization — they sound identical to the original Suno mix.

**Beat-synced switching.** This is the part of the system most worth understanding.

When a student picks a different voice in a category mid-playback, the store doesn't switch immediately. It sets `pendingVoice` on that category and lets the bar scheduler do the switch at the next bar boundary:

```javascript
selectVoice: (category, voiceId) => {
  // ... if not playing, just set activeVoice
  // ... if clicking the same active voice, deselect (and stop at next bar)
  // ... otherwise: queue as pending
  set({ categories: { ...categories, [category]: { ...categoryState, pendingVoice: voiceId, pendingStartTime: Date.now() }}});
},

_processBarBoundary: (time) => {
  Object.entries(categories).forEach(([category, state]) => {
    if (state.pendingVoice !== null && state.pendingVoice !== state.activeVoice) {
      const currentPlayer = players[category]?.[state.activeVoice];
      if (currentPlayer?.state === "started") {
        currentPlayer.stop(time); // Schedule the stop AT the bar
      }
      const newPlayer = players[category]?.[state.pendingVoice];
      if (newPlayer && get()._shouldCategoryPlay(category)) {
        newPlayer.start(time); // Schedule the start AT the same bar
      }
      // Update state: pending becomes active
    }
  });
},
```

The key is that `currentPlayer.stop(time)` and `newPlayer.start(time)` both pass the *same* `time` parameter (the bar boundary timestamp from Tone's scheduler). Tone.js's `Transport.scheduleRepeat` calls the callback slightly ahead of the actual bar boundary so that scheduled events land precisely on it. The result is that the old voice stops and the new voice starts at the exact same audio sample, with no overlap and no gap. To the listener, the change is seamless and musically correct — it always lands on the downbeat.

If the user clicks a voice and changes their mind before the bar arrives, they can click the pending voice again to cancel it (it becomes its own active toggle). All of this is in the `selectVoice` function.

### 5.4 The Animation–Audio Bridge

The 3D characters animate at all times, but their animation speed is tied to whether their corresponding audio category is playing. In World 1, there's a `STEM_TO_MODEL` map:

```javascript
const STEM_TO_MODEL = {
  rhythm: "drummer",
  bass: "guitarist",
  harmony: "pianist",
  melody: "flutist",
  extras: "tambourinist",
};
```

A `useEffect` subscribes to the voices store. Whenever it changes, the effect iterates the map and adjusts each model's animation action:

```javascript
const action = actionsRef.current.get(modelName);
const cat = categories[category];
const shouldPerform = isPlaying && cat.activeVoice && !cat.muted;
action.timeScale = shouldPerform ? 1.0 : 0.2;
```

When a category is playing, that musician animates at full speed (performing). When it's silent, the musician slows to 20% speed (idle breathing). The animation never stops — that would look jarring — it just decelerates. A child watching the screen instantly sees which musicians are "playing" and which are not, and learns to associate "the drummer is moving fast" with "I'm hearing drums."

This is one of the parts of the project I'm most proud of, and it's a great talking point for the defense. The sync feels immersive but is implemented with about 15 lines of code: a Zustand subscription, a map lookup, and a single property assignment per musician.

---

## Part 6 — The Assignment Lifecycle

The assignment system is the connective tissue between the student's creative work and the teacher's pedagogy. It is also the most "normal" piece of the application — close to a typical SaaS CRUD flow with notifications.

### 6.1 Creation (Teacher Side)

The teacher visits `/teacher/assignments` and clicks "New Assignment." The form is [src/components/teacher/AssignmentForm.tsx](src/components/teacher/AssignmentForm.tsx):

- **Title**, **description**, **due date** — standard fields.
- **Class** — a dropdown loaded from `getTeacherClasses(teacherId)` so only the teacher's own classes are selectable.
- **Type** — "upload" or "project". Upload means the student submits any audio file from their device. Project means the student opens the DAW with a curated set of starter loops.
- **BPM** and **Bars** — only shown for project-type assignments.
- **Audio loops** — only shown for project-type assignments. The teacher can select multiple files. Each file is uploaded to Supabase Storage via [storageApi.js](src/lib/storageApi.js), and an `assignment_loops` row is created for each one with a color and icon assigned by index modulo (cycling through a preset palette so each loop has a distinct visual identity).

On submit, `createAssignment()` from [teacherApi.js](src/lib/teacherApi.js) is called, then loops are uploaded and inserted, then `notifyStudentsNewAssignment()` is called which creates one `notifications` row per student in the assigned class with `recipient_type = 'student'` and a payload referencing the new assignment ID.

### 6.2 The Student Sees the Assignment in Real Time

Because every student in the class has the notifications realtime channel subscribed (more on that in Part 8), they see a new notification badge on their bell instantaneously. Tapping it navigates to `/assignments`. The assignments page also has its own realtime subscription that listens for new assignment INSERTs filtered by `class_id = eq.${myClassId}`, so if the page is already open, the new assignment card slides in.

The assignments page also subscribes to assignment DELETE events. If a teacher deletes an assignment while a student is viewing the page, the card vanishes immediately. If the deleted assignment was the one the student had open in a modal, the modal closes. This was added because of a real bug report: students had stale modals open after a teacher deleted an assignment, and clicking submit was failing.

### 6.3 Submission

The student opens the assignment modal, reads the description, and clicks "Start Working." For an upload assignment, this opens a file picker. For a project assignment, it sets `assignmentContext` in the DAW store and navigates to `/daw`. The DAW's `loadAssignmentLoops()` action queries the `assignment_loops` table by assignment ID and replaces the library with the curated loops. The student composes their work in the DAW.

When they click Submit, the DAW exports the project to MP3 (using the same export pipeline described in Part 4), uploads the MP3 to Supabase Storage in the `assignment-submissions` bucket, and creates a row in `submissions` linking the file URL to the assignment and student. A notification fires to the teacher: `notifyTeacherSubmission()`. The notification's `type` is `SUBMISSION_RECEIVED` if it's on time or `LATE_SUBMISSION` if it's past the due date.

### 6.4 Feedback

The teacher's submissions page lists every submission. For each one, an inline audio player lets them listen. When they click "Give Feedback," [FeedbackModal.tsx](src/components/teacher/FeedbackModal.tsx) opens. The modal has:

- A required comment textarea.
- An optional score field (0-100) with quick-select buttons (100, 90, 80, 70, 60, 50) and a manual input.

On save, `createFeedback()` (or `updateFeedback()` if feedback already existed) inserts/updates a row in the `feedback` table. Then `notifyStudentFeedback()` fires a notification to the student. The student sees the badge, taps it, and sees their score.

The whole loop — assignment created → student notified → student submits → teacher notified → teacher grades → student notified — is end-to-end realtime. No polling, no page refreshes. It feels like Slack.

---

## Part 7 — Progress, XP, and the Gamification Loop

Everything in this section is in [useProgressStore.js](src/store/useProgressStore.js) and [useSessionTracker.js](src/hooks/useSessionTracker.js). It is the part of the project that exists purely to keep kids motivated. It's also the part with the most subtle anti-cheating logic.

### 7.1 The XP Table

```javascript
ASSIGNMENT_SUBMIT: 50,
ASSIGNMENT_ON_TIME_BONUS: 20,
PROJECT_CREATE: 10,
PROJECT_SAVE: 5,
PROJECT_EXPORT: 30,
LOOP_PLACE: 2,
DAILY_LOGIN: 10,
BADGE_UNLOCK_BONUS: 25,
```

These numbers were not pulled from a hat. Submitting an assignment is the highest-value action because it's the actual learning outcome. Exporting a project (30) is high because it represents finishing something. Placing a single loop is low (2) because it's tiny — but it adds up. Daily login is 10 to reward consistency without making people feel they have to log in for nothing.

### 7.2 Daily Caps — Why Kids Can't Cheat

This is critical to understand. Without daily caps, a child could earn unlimited XP by clicking the same button over and over. Every action that could be spammed has a cap:

```javascript
LOOP_PLACE_DAILY_CAP: 25,    // Max 25 loop placements per day = 50 XP/day
PROJECT_SAVE_DAILY_CAP: 5,   // Max 5 saves per day = 25 XP/day
ACTIVE_TIME_DAILY_CAP: 60,   // Max 60 minutes counted = 30 XP/day
```

When `trackLoopPlace` is called, it first counts how many `xp_activities` rows of type `loop_place` exist for this student today. If the count is at or above 25, the function returns without awarding XP. The check is server-state: it queries the database directly, so even if the client is hacked, the cap holds.

Active time is the most clever cap. It's enforced inside the `useSessionTracker` hook.

### 7.3 The Session Tracker — Anti-AFK Logic

[useSessionTracker.js](src/hooks/useSessionTracker.js) is a custom hook that runs whenever a student is logged in. It tracks "active time" and awards XP based on it.

The key insight: a child could leave the app open in a tab and let the timer run while they go play outside. To prevent that, the hook only counts time when the user is actually active. Active is defined as: a `mousedown`, `mousemove`, `keydown`, `touchstart`, `scroll`, or `click` event has fired in the last 2 minutes. If 2 minutes pass with no activity, the user is marked idle and time stops accumulating.

Constants:

```javascript
IDLE_THRESHOLD_MS: 120000,     // 2 minutes inactivity = idle
SAVE_INTERVAL_MS: 60000,       // Save active time every 1 minute
XP_INTERVAL_MINUTES: 10,       // Award XP every 10 minutes of active time
XP_PER_INTERVAL: 5,            // 5 XP per interval
DAILY_TIME_CAP_MINUTES: 60,    // Max 60 minutes of XP-counted time per day
```

The hook listens for any activity event and updates a ref. A 1-second interval checks if the user has been idle for more than the threshold and flips the idle flag. A 1-minute interval calls `saveActiveTime()`, which:

1. Computes minutes since the last save (only if the user was active during that time).
2. Updates the `daily_activities` row for today with the new total.
3. If the total time crossed a 10-minute threshold AND we're still under the daily 60-minute cap, calls `awardXP()` with `XP_PER_INTERVAL` × (number of new intervals).

The hook also handles the page lifecycle: on `visibilitychange` to hidden, it saves immediately (the user might be closing the tab). On `beforeunload`, it saves one last time. On unmount, it saves and removes all listeners.

The result: a child can earn at most 30 XP per day from active time (60 minutes ÷ 10 minutes × 5 XP). They have to actually be present and clicking. They can't game the system by leaving the tab open.

### 7.4 Levels and the Curve

```javascript
function calculateXPForLevel(level) {
  return 100 * level * (1 + level * 0.1);
}
```

Level 1 → 110 XP, Level 2 → 220 XP, Level 5 → 750 XP, Level 10 → 2000 XP, Level 20 → 6000 XP, Level 50 → 30,000 XP. The curve is gentle at the start and steepens later, which is the standard "RPG" leveling shape: kids level up fast in their first few sessions and feel rewarded, then the curve naturally rate-limits as they stack levels.

Level names give the curve personality: Rhythm Rookie, Beat Builder, Melody Maker, ..., Music Legend (level 50+). The names are matched in `getLevelInfo()` which returns the title and an emoji icon for display.

### 7.5 Badges

Badges are seeded in the `badge_definitions` table. Each definition has a name, description, icon, and unlock criteria — the criteria are a small JSON blob with a `type` (`count`, `level`, `streak`, `time`) and a threshold.

Whenever XP is awarded, `checkAndAwardBadges()` is called. It fetches every badge definition the student doesn't yet have, checks each one against the student's current state (e.g., for a `count` type with `field: 'projects_created'` and `threshold: 5`, it compares `student_progress.projects_created` to 5), and inserts a `student_badges` row for any that newly unlock. Each unlock awards a `BADGE_UNLOCK_BONUS` of 25 XP, which is itself logged as an activity.

### 7.6 Streaks

The `recordDailyLogin()` function runs once per student per day. It checks if a `daily_activities` row already exists for today. If yes, it does nothing (login is idempotent). If no, it checks yesterday's row to see if the student logged in yesterday. If yes, increment the streak. If no, the streak resets to 1. The `longest_streak` is updated whenever the current streak exceeds it. The student gets `DAILY_LOGIN: 10` XP for the new login.

This means a student who logs in every day for a week sees their streak go 1, 2, 3, 4, 5, 6, 7. If they miss a day, their streak resets to 1 the next time they log in. This is the classic Duolingo / Snapchat streak design, and it works because kids hate breaking streaks.

---

## Part 8 — Real-Time Notifications

Real-time updates are powered by Supabase Realtime, which is a WebSocket-based system that sends `postgres_changes` events to subscribed clients whenever a row is inserted, updated, or deleted in a watched table — provided RLS allows the client to see that row.

[useNotificationStore.js](src/store/useNotificationStore.js) is the bridge:

1. On store initialization (called from a `useEffect` in the `NotificationBell` component), `loadNotifications(userId, userType)` fetches all existing notifications for the current user.
2. Then `subscribeToRealtime(userId, userType)` opens a Supabase Realtime channel `notifications:${userId}` with a filter `recipient_id=eq.${userId}`. The filter is server-side — only matching events are sent over the WebSocket, so a student doesn't get a flood of every notification in the database.
3. When an INSERT event arrives, the store prepends the new notification to its array and increments `unreadCount`. If the browser supports the Notifications API and the user has granted permission, a native OS-level notification is shown via `new Notification(...)`. The notification is tagged with the notification ID so duplicates are deduped automatically.
4. On unmount (sign out, navigate away, etc.), the channel is unsubscribed and removed.

Two implementation details worth knowing:

**Channel cleanup before resubscribe.** If the user signs out and signs back in, the previous channel must be removed before creating a new one, otherwise you leak channels and start receiving duplicate events. The store always calls `supabase.removeChannel(realtimeChannel)` before creating a new one.

**Browser notifications request permission lazily.** We don't ask for permission on app load (which would be aggressive). We ask the first time a notification arrives. The user can deny it without breaking the in-app notification experience.

The bell component, [NotificationBell.tsx](src/components/ui/NotificationBell.tsx), shows the unread count as a small orange badge that animates in with a scale spring. The panel, [NotificationPanel.tsx](src/components/ui/NotificationPanel.tsx), groups notifications by time bucket (Today, This Week, Earlier) and provides a "Mark all as read" button.

---

## Part 9 — The Admin Layer

Admins are the people who provision and govern a school. The admin dashboard at `/admin` is small but does important work:

- **Approvals.** Lists every teacher and student in the admin's school with `approval_status = 'pending'`. Approve and reject buttons call `approveUser()` or `rejectUser()` from [adminApi.js](src/lib/adminApi.js), which update the row with the new status, the admin's ID as `approved_by`, and the current timestamp as `approved_at`. Until a user is approved, they cannot log in (the auth store rejects them at the role-detection step).
- **Teacher management.** A two-panel UI. Left: list of approved teachers. Right: their class assignments. The admin can add or remove a teacher from a class via `assignTeacherToClass()` and `removeTeacherFromClass()`, which write rows to (or delete from) the `class_assignments` table. New classes can be created with `createClass()`.
- **Access controls.** Three toggles per school stored in the `access_controls` table: allow_student_signup, allow_teacher_signup, require_admin_approval. These are read at signup time to decide whether to display the signup form for that role and whether to set new accounts to pending approval.

Two limitations the defense should be honest about:

1. **There's no admin management UI.** Admins are created via the [scripts/create-test-accounts.js](scripts/create-test-accounts.js) script (which uses the Supabase service role key to bypass RLS) or by manually inserting a row in the `admins` table. This is intentional for now — admin creation is a high-trust operation, and a public admin-creation UI would be a security risk. In production, schools would request admin creation through an out-of-band process.
2. **No audit log.** Approvals and rejections are recorded with the admin's ID and timestamp on the user row, but there's no separate audit log table tracking every action. If a defender asks "how would you audit who approved a student two months ago," the answer is "the user row has `approved_by` and `approved_at` columns; we don't track full history."

---

## Part 10 — The Database, Tables, and Row-Level Security

The database has roughly 20 tables grouped into six families:

**Identity and access:**
- `schools` — schools, with `allowed_domains` for email validation
- `admins` — admin accounts (no approval needed)
- `teachers` — teacher accounts with `approval_status`
- `students` — student accounts with `approval_status` and `class_id`
- `classes` — school classes with grade level
- `class_assignments` — many-to-many between teachers and classes
- `student_enrollments` — many-to-many between students and classes
- `access_controls` — per-school signup and approval toggles

**Assignment system:**
- `assignments` — teacher-created assignments
- `assignment_loops` — loops attached to project-type assignments
- `submissions` — student submissions with file URLs
- `feedback` — teacher feedback with comment and score

**Progress and gamification:**
- `student_progress` — per-student row with total XP, level, streak, total time
- `xp_activities` — log of every XP earning event with type and amount
- `badge_definitions` — seeded badge metadata (name, icon, criteria)
- `student_badges` — which badges each student has earned
- `daily_activities` — per-student-per-day row tracking time and login

**Content:**
- `loops` — the audio loop library (name, url, color, icon, bpm)
- `projects` — saved DAW projects (project_data is JSONB)
- `voice_settings` — per-school per-world AI music parameters
- `tutorials` — video tutorial entries

**Communication:**
- `notifications` — every notification with `recipient_id`, `recipient_type`, `type`, `payload`

**Views:**
- `pending_approvals` — UNION of pending teachers and students for the admin dashboard

Every table has RLS enabled. The policies enforce these rules:

- **Students** can SELECT and UPDATE only their own row in `students`, only their own row in `student_progress`, only their own `submissions`, only their own `xp_activities`, etc. They can SELECT `assignments` where the assignment's `class_id` matches their own `class_id`. They cannot read other students' data at all.
- **Teachers** can SELECT all students whose `class_id` is in the teacher's assigned classes (via a join through `class_assignments`). They can INSERT/UPDATE/DELETE assignments, feedback, and voice settings within their school.
- **Admins** can SELECT and UPDATE everything within their school but nothing outside it.

The school-scoping is the most important boundary in the entire system. Every relevant table has a `school_id` column, and every relevant policy checks `school_id = (SELECT school_id FROM admins WHERE id = auth.uid())` (or the equivalent for teachers and students). This means School A's teachers cannot, even if they tried, see School B's students. The browser client cannot bypass this — even if a malicious student opened devtools and sent a query for another school's data, the database would return zero rows.

This is why we can run Djembe as a single multi-tenant application without worrying about leaks between schools.

---

## Part 11 — Deployment, Security, and Performance

### 11.1 Hosting on Vercel

The whole project is deployed on Vercel. The configuration is in [vercel.json](vercel.json):

- **SPA rewrites.** Any non-asset URL is rewritten to `/index.html` so React Router can handle the route. Without this, refreshing on `/daw` would 404.
- **Security headers.** `Strict-Transport-Security` (2-year HSTS preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (prevents the app from being iframed for clickjacking), `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`.
- **Cache headers for models.** `/models/(.*)` gets `Cache-Control: public, max-age=31536000, immutable`. One-year cache for the 26MB of GLB files.

Vercel's free tier is enough to run the app for a school-sized userbase. The serverless functions in `/api` handle the Suno and MVSEP proxy calls and run for less than 10 seconds each (which is the function timeout on the hobby plan).

### 11.2 Secrets

The only secrets in the project are:

- `VITE_SUPABASE_URL` — public, embedded in the client bundle
- `VITE_SUPABASE_ANON_KEY` — public anon key, also embedded; safe because of RLS
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, used by the test account creation script and by a subset of admin server functions if any. NEVER exposed to the client.
- `SUNO_API_KEY` — server-side only, used by `/api/generate`
- `MVSEP_API_KEY` — server-side only, used by `/api/separate`

The fact that the Supabase anon key is publicly visible in the bundle is a deliberate property of the Supabase model, not a leak. RLS makes the anon key safe — without a JWT (which only comes from a successful `signInWithPassword`), the anon key grants no privileges.

### 11.3 Performance Decisions

A short list of performance things worth knowing during defense:

- **Three.js worlds are lazy-loaded** with `React.lazy` and `Suspense`. They are not in the main bundle.
- **3D models are aggressively compressed** with WebP textures and meshopt geometry compression. 250MB → 26MB.
- **Models are immutably cached** for one year via Vercel headers.
- **Audio durations are preloaded** in the background so dragging a loop to the timeline is instant.
- **Loop URLs that need CORS proxying are detected at load time** and rewritten so the runtime overhead is one string check per loop, once.
- **The DAW playback engine uses requestAnimationFrame and native Audio elements** instead of React state updates and Tone.Player scheduling, to avoid unnecessary re-renders.
- **The voices store caches stems in sessionStorage per world** so re-entering a world during the same session is instant.
- **Notifications use a server-side filter** in the realtime subscription so clients only receive their own events.
- **The export pipeline runs entirely in the browser** so no server CPU is consumed and no audio is uploaded.
- **Bundle splitting is implicit** — Vite automatically code-splits dynamic imports, and we leverage that for both the worlds and lamejs (only loaded when exporting).

### 11.4 Error Handling

A top-level [ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) wraps the whole app. If any component throws during render, the boundary catches it and shows a friendly error screen with a 🥁 emoji, a reassuring message ("Don't worry — your progress is saved"), and a "Try Again" button that reloads the page. Errors are logged to the console but not (yet) sent to a remote logging service.

---

## Part 12 — Design Thinking, in Plain English

Some questions during the defense will be about *why* the app looks and feels the way it does. Here is the reasoning, written in plain language so you can explain it.

**Why purple?** Purple is unusual in children's products, which lean heavily on primary reds, yellows, and blues. We wanted Djembe to feel calm and inviting, not loud and overstimulating. Deep purple with warm orange accents is the visual signature. It also feels more "musical" — purple has connotations of creativity and imagination.

**Why rounded corners everywhere?** Sharp corners feel institutional, like a tax form. Rounded corners feel safe and friendly. For a 5-year-old, this matters more than you'd think.

**Why so many animations?** Two reasons. First, animations give visual feedback that something happened — when a child taps a button and it scales briefly, they know the tap was registered. For kids who are still learning that screens respond to their actions, this feedback is critical. Second, animations slow down state transitions so they don't feel jarring. A page that pops in instantly feels abrupt; a page that fades and slides feels smooth.

**Why a mascot?** A character gives the platform an emotional anchor. The Djembe mascot waves at students on first login, dances when they level up, points at things during the tutorial. Kids form a one-way relationship with it. It's the same psychology as Clippy or Duo the owl — except the mascot is genuinely useful because it's only present at moments where its presence helps.

**Why drag-and-drop for the DAW instead of a click-to-place model?** Drag-and-drop is the universal physical metaphor for "move this thing to that place." Even children who can barely read understand it. A click-to-place model requires learning a tool: select the kick, then click where you want it. Drag-and-drop has no tool mode — you just move things.

**Why 3D worlds at all?** Because one of the hardest things to teach a young child about music is the abstract concept that a song is made of *layers* — drums, bass, melody — that play simultaneously. The 3D worlds make the layers concrete: you can see the drummer drumming, the pianist playing, the flutist playing. When you mute the bass, you see the bass player slow down. The visual representation grounds the abstract concept.

**Why beat-synced voice switching?** Because if a child hits a button and the music changes immediately, mid-bar, it sounds wrong. They learn (correctly!) that the change is "broken." By queueing the change to the next bar, the change always sounds intentional and musical. It teaches them, implicitly, that music has a structure and that changes happen on the beat.

**Why kid-only content in AI generation?** The Suno prompt is hard-coded to specify "child-safe and positive, no aggressive, dark, intense, or scary sounds, no vocals, no lyrics, no chanting." This is enforced server-side in [voicesApi.js's buildPrompt function](src/lib/voicesApi.js). Even if a teacher writes a custom prompt, it's appended to the safe preamble, not allowed to override it. The teacher can't accidentally generate something inappropriate.

**Why role-based color coding in the sidebar?** Because pre-readers can't navigate by text labels, and even literate children navigate faster by color than by text. Orange means music. Pink means progress. Cyan means challenges. Children learn the color language within a few sessions.

**Why three roles instead of one with permissions?** Because the three audiences want completely different things. A student opening the app should see music, not class lists. A teacher should see students, not a music studio. An admin should see approvals, not music. Forcing them all into one home page with conditional sections would hurt every audience. Three role-specific home routes give each user the experience that matches their goal.

---

## Part 13 — The Tech Stack, and the Reasoning Behind Each Choice

| Tool | Role | Why |
|------|------|-----|
| **React 19 + TypeScript** | UI framework + types | React is the dominant frontend framework with the largest ecosystem; TypeScript is non-negotiable for a project this size to catch class of bugs at compile time. React 19 specifically for the React Compiler optimizations and improved Suspense behavior. |
| **Vite** | Build tool / dev server | Faster than Webpack or CRA. HMR is near-instant. The dev server doesn't bundle on each request, it transforms files on demand. For a project with many components, this is night and day. |
| **React Router v7** | Routing | The default React routing solution. v7 unifies the old React Router and Remix routing models. We use `BrowserRouter` and `<Routes>`, with a custom `ProtectedRoute` wrapper for role enforcement. |
| **Zustand** | State management | Tiny, simple, no boilerplate. See Part 3 for the long answer. |
| **Tailwind CSS** | Styling | Utility-first CSS. Co-locates styles with markup, eliminates class-name management problems, makes responsive design (`md:`, `lg:`) trivial. The whole design system is expressed as Tailwind tokens in [tailwind.config.js](tailwind.config.js) and CSS variables in [src/index.css](src/index.css). |
| **Framer Motion** | Animations | The best React animation library. Declarative variants, AnimatePresence for entry/exit, layout animations, springs out of the box. Heavier than CSS animations but worth it for the dev velocity. |
| **Radix UI** | Accessible UI primitives | We use a few Radix primitives (Label, Slot) as the foundation for shadcn-style components. Radix gives us correct ARIA attributes, focus management, and keyboard handling for free. |
| **Tone.js** | Audio scheduling and synthesis | A Web Audio wrapper that gives us `Tone.Transport` for precise timing, `Tone.Player` for buffer-based playback, and a full synthesizer API we don't yet use but could. The Transport's bar/beat scheduling is what makes the voices system's beat-synced switching possible. |
| **lamejs** | MP3 encoding | The only mature pure-JS MP3 encoder. Used in DAW export. Dynamically imported so it's not in the main bundle. |
| **Three.js** | 3D rendering | The dominant browser 3D library. Has GLTFLoader, OrbitControls, AnimationMixer, and a meshopt decoder integration. See Part 5 for why we use it directly instead of through React Three Fiber. |
| **Supabase** | Backend (DB + Auth + Realtime + Storage) | Postgres + auth + realtime websockets + file storage in one product. RLS lets us do server-enforced authorization without writing an API layer. Free tier is generous enough for a school deployment. |
| **lucide-react** | Icons | Tree-shakeable SVG icon library. Looks good, consistent line weight, hundreds of icons. |
| **react-joyride** | Onboarding tours | Battle-tested tour library with custom tooltip support. |
| **Vercel** | Hosting + serverless functions | Best DX for React + serverless. Auto-deploys from git, edge cache for static assets, serverless function support for the API proxies. |
| **Suno AI** | Music generation | The leading AI music generation API. Capable of generating high-quality instrumentals from text prompts in 30-60 seconds. |
| **MVSEP** | Stem separation | Multiple state-of-the-art audio source separation models. We use the BS Roformer SW model which separates into drums/bass/guitar/piano/vocals/other. |

---

## Part 14 — The Connective Story

At this point we've seen every part of the system in isolation. Let me put it back together by walking through one end-to-end flow that touches almost every system at once.

A teacher named Mrs. Johnson logs in to Djembe at the start of her music class. She is greeted at `/students` with her roster. She has decided that today's lesson is about call-and-response in afrobeat, so she navigates to **Worlds Settings** at `/teacher/worlds`, picks World 1 (Fireside), and changes the BPM to 110, the genre to "afrobeat", the style to "call-and-response", and the mood to "playful." She hits Save. The settings are upserted into the `voice_settings` table scoped to her `school_id` and `world_id = 1`. RLS enforces that she can only write voice settings for her own school.

She also creates a new assignment titled "Build a 4-bar Afrobeat Pattern." She picks her class, sets the due date to Friday, marks it as a project assignment, sets the BPM to 110 to match, and uploads four starter loops: a kick, a clap, a shaker, and a sub-bass. The assignment is inserted into `assignments`, the four files are uploaded to Supabase Storage, and four `assignment_loops` rows are created. Then `notifyStudentsNewAssignment()` runs and inserts twelve `notifications` rows — one per student in her class.

In another browser, twelve students all see their notification bell badge tick from 0 to 1 simultaneously. The notifications arrive over the Supabase Realtime WebSocket, filtered server-side by `recipient_id`. One student, Kofi, taps his bell, sees "New Assignment: Build a 4-bar Afrobeat Pattern," and taps it. He's navigated to `/assignments`. The new card is at the top of his list because the assignments page also has a realtime subscription.

Kofi taps the card, reads the description, and clicks "Start Working." The DAW store's `setAssignmentContext(...)` is called, then the router pushes him to `/daw`. The DAW's mount effect calls `loadAssignmentLoops(assignmentId)` which queries `assignment_loops` and loads the four starter loops as the library. The library shows: a yellow Kick, a pink Clap, an orange Shaker, a purple Sub-Bass.

He drags the kick to columns 0, 4, 8, 12 (every beat). Each drop calls `addPlacedLoop()`, and as a side effect `useProgressStore.trackLoopPlace(studentId)` is called. The progress store queries today's `xp_activities` for `loop_place` events; he's done 4 today, well under the cap of 25, so it inserts an `xp_activities` row with +2 XP and updates `student_progress.total_xp` by 8.

He hits play. The DAW store's `startTransport()` calls `Tone.start()` (since it's the first user gesture), starts the requestAnimationFrame loop, and at every animation frame the `updateBeatLoop` function checks which beat the playhead is on and triggers any loops whose start beat matches. A new `Audio` element is created for each trigger and `.play()` is called. He hears his pattern.

He spends 15 minutes making it more interesting. During those 15 minutes, the `useSessionTracker` hook is silently tracking his activity. Every minute it saves accumulated time to the database. After 10 minutes of active time (since he's been clicking and dragging the whole time, no idle), it awards him 5 active-time XP. After his 15-minute session, he's earned 5 active-time XP plus around 30 loop-place XP plus the 10 daily-login XP from earlier — total ~45 XP.

He hits Save in the project menu. The DAW serializes his project as JSON, inserts a row in `projects` with `project_data = {...}`, and shows a confirmation. `useProgressStore.trackProjectSave()` runs, awards 5 XP if under the daily cap.

Later, he's confident his beat is good. He hits Submit in the assignment context. The DAW calls `exportProjectAsBlob(placedLoops, bpm, bars, 'mp3')`. The export pipeline:

1. Creates an `AudioContext`.
2. For each placed loop, fetches the URL (which goes through `/api/proxy-audio` since the kick and shaker are stored on Supabase storage), decodes to an `AudioBuffer`.
3. Computes the start time of each loop in seconds: `(col / 4) * (60 / 110)`.
4. Mixes all the buffers into a single stereo output buffer at the AudioContext's sample rate.
5. Trims to the project duration.
6. Dynamically imports lamejs and encodes to MP3.
7. Returns a `Blob`.

The blob is then uploaded to Supabase Storage in the `assignment-submissions` bucket via [storageApi.js](src/lib/storageApi.js). A new `submissions` row is inserted linking the file URL to the assignment and Kofi. `useProgressStore` awards him 50 XP for submitting (plus a 20 XP on-time bonus if the due date hasn't passed). `notifyTeacherSubmission()` creates a notification for Mrs. Johnson with `recipient_type = 'teacher'`, `recipient_id = teacherId`, and the type is `SUBMISSION_RECEIVED`.

In her browser, Mrs. Johnson's bell badge ticks up. She taps it, navigates to `/teacher/submissions`, finds Kofi's submission, hits the play button on the inline audio player to listen, and is impressed. She clicks "Give Feedback," types "Beautiful work, Kofi! Try adding a snare next time for more drive." in the comment field, clicks the 95 quick button, and saves.

A row is inserted in `feedback`. `notifyStudentFeedback()` creates a notification for Kofi. Kofi sees his bell tick. He taps it. He sees "Mrs. Johnson gave feedback on 'Build a 4-bar Afrobeat Pattern' — 95/100." He grins.

That single 30-minute interaction touched the auth system, the role-based routing, the realtime notifications, the assignments table, the assignment_loops table, the progress store with anti-cheat caps, the session tracker with idle detection, the DAW playback engine with requestAnimationFrame and Tone, the audio export pipeline with Web Audio mixing and lamejs encoding, the Supabase Storage bucket, the submissions table, the feedback table, the realtime channel back to the teacher, and the gamification XP loop. Every layer of the system played its role, each layer doing only what it was responsible for, nothing more.

---

## Part 15 — Frequently Asked Defense Questions

Here are the questions you should expect, with answers you should be ready to give. These are based on what someone evaluating this project would naturally ask after seeing a demo.

**Q: Why did you build your own DAW instead of using one off the shelf?**
A: Because every off-the-shelf web DAW is built for adults. They have synthesizers, MIDI, automation curves, mixing buses — features that a 5-12 year old would find overwhelming. Djembe's DAW deliberately omits all of those and exposes only the four mechanics that matter for learning rhythm: a grid, a transport, draggable loops, and an export button. Building from scratch let us match the cognitive load to the audience.

**Q: How does the timeline playback stay in sync?**
A: A `requestAnimationFrame` loop runs at ~60Hz. Each frame, it asks Tone.js for the current audio-clock time, computes the elapsed time since playback began, divides by `60/bpm` to get the current beat, and triggers any placed loops whose start beat matches. To avoid re-triggering the same loop multiple times when the playhead sits on a beat for several frames, every trigger is keyed by `loopId-startBeat-cycle` and stored in a Set. The cycle counter handles timeline looping — when the playhead wraps around bar 10 to bar 0, the cycle increments and the same loop fires again with a new key. (Reference: [src/store/useStore.js](src/store/useStore.js) lines 54-129.)

**Q: Why use native HTML Audio for triggering instead of Tone.Player?**
A: Three reasons. First, native Audio elements have lower load latency and are simpler to instantiate (`new Audio(url).play()`). Second, Tone.Player synchronization across many instances is fiddly and the buffer load timing causes audible glitches when triggering many loops at once. Third, the timing accuracy of native Audio is good enough for our use case — well below the perceptual threshold for rhythmic accuracy at the BPMs we use. We do still use Tone.js for the Transport clock and for the Voices system's stem playback, where loop-true synchronization across multiple players is essential.

**Q: How does the export work?**
A: The export pipeline runs entirely in the browser using Web Audio. It creates an AudioContext, fetches and decodes each placed loop into an AudioBuffer, then hand-mixes them into a single output buffer by computing each loop's start time in samples and adding its samples to the output buffer at that offset. Each sample is multiplied by 0.7 to leave headroom. The mixed buffer is trimmed to the project duration. If MP3 was requested, lamejs is dynamically imported (so it's not in the main bundle) and encodes the buffer one 1152-sample frame at a time. If MP3 fails, it falls back to a hand-written WAV encoder. The result is a Blob that's downloaded via a hidden anchor element. (Reference: [src/lib/audioExport.js](src/lib/audioExport.js).)

**Q: How does the 3D world's beat-synced voice switching work?**
A: Tone.js's Transport runs the audio clock. When playback starts, the voices store calls `Tone.Transport.scheduleRepeat` to schedule a callback at every bar boundary (computed as `(60/bpm) * 4` seconds per bar). When a user picks a different voice mid-playback, the store sets that category's `pendingVoice` field but doesn't actually change anything yet. At the next bar boundary, the scheduler callback runs `_processBarBoundary(time)`, which iterates the categories. For any category with a pending voice, it calls `currentPlayer.stop(time)` and `newPlayer.start(time)` — passing the *same* time parameter so Tone.js schedules both events to happen at the exact same audio sample. The result is a seamless, sample-accurate switch on the downbeat. (Reference: [src/store/useVoicesStore.js](src/store/useVoicesStore.js) lines 245-310 and 460-500.)

**Q: Why split the Suno generation and MVSEP separation into two endpoints each?**
A: Because Vercel serverless functions on the hobby plan have a 10-second timeout, and a single function that started a job and waited for it to complete would never finish (Suno takes 30-90 seconds, MVSEP takes 1-3 minutes). The split — one endpoint to start the job and return a hash, one endpoint to poll for completion — pushes the wait responsibility to the front-end. Each individual function call returns in well under 10 seconds, and the front-end polls with backoff until done.

**Q: How does the role detection work? Why three tables instead of one users table with a role column?**
A: The auth store checks tables in priority order: admins, then teachers, then students. The first match determines the user's role. We use three tables instead of a single users table because the three roles have meaningfully different schemas — admins have no `approval_status`, students have a `class_id` and a one-to-one relationship with `student_progress`, teachers have many-to-many class assignments. Forcing them onto one table would require many nullable columns and a lot of conditional logic. Three role-specific tables let RLS policies be written role by role without conditionals, and let each role evolve its schema independently.

**Q: How does row-level security prevent a student from reading another student's data?**
A: Every relevant table has RLS enabled with a policy that says, in effect, "the row is visible to the user identified by `auth.uid()` only if their student_id matches the row's student_id, or if they're a teacher whose assigned class contains this student, or if they're an admin in the same school." The check happens at the database level on every query. The browser client sends a JWT with every request, Supabase decodes it to find `auth.uid()`, and the policy uses that UID to filter rows. Even if a malicious student opened devtools and crafted a custom query for another student's data, the database would return zero rows. There is no way to bypass it from the client.

**Q: Why isn't there an Express server?**
A: Because Supabase removes the need for one. The browser talks directly to Postgres through PostgREST (Supabase's auto-generated REST API) and to Realtime through a WebSocket. RLS provides authorization. Auth provides authentication. Storage provides file uploads. The only "server code" we have is the handful of Vercel serverless functions in `/api`, and they exist purely to hide secrets and bridge CORS, not to implement business logic. Building an Express server would have added complexity, latency, and a deployment surface for no benefit.

**Q: How does the gamification prevent cheating?**
A: Three mechanisms. First, every XP-earning activity that could be spammed has a daily cap enforced server-side: loop placements (25/day), project saves (5/day), active time (60 min/day). Before awarding XP for one of these activities, the progress store queries today's `xp_activities` count and refuses to award if the cap is reached. Second, "active time" is gated by an idle detector: if no mouse, keyboard, scroll, or touch event has fired in the last 2 minutes, time stops accumulating. A child can't leave the tab open and farm XP. Third, all XP grants go through Supabase calls that hit the database — they're not local-only — so a hacked client can't lie about how much XP they have without lying to RLS-protected database rows that it can't write to anyway.

**Q: Why Zustand instead of Redux?**
A: Smaller bundle (1.5KB vs 30KB), no boilerplate (no actions, reducers, slices), built-in persistence, built-in selector subscriptions for free re-render optimization, and a much simpler mental model for new developers reading the codebase. Zustand's only real downside is no time-travel debugging, which we don't need.

**Q: Why Three.js directly instead of React Three Fiber?**
A: The world scenes are mostly static — once the GLB loads, the scene graph doesn't restructure. R3F's main benefit (declarative reactive scene updates) isn't earning its weight here. R3F also adds bundle size (~30KB plus the typical drei add-ons). And direct Three.js gives us complete control over the render loop, which we want for animation timing precision.

**Q: How do you handle bundle size?**
A: Several techniques. Three.js and the world components are lazy-loaded with `React.lazy` so they're not in the main bundle. Lamejs is dynamically imported only when the user exports. 3D models are aggressively compressed with WebP textures and meshopt geometry compression (250MB → 26MB). Vercel adds immutable cache headers to model files for one-year browser caching. Tailwind purges unused classes at build time. The result is an initial bundle that's reasonable on mobile, with progressive loading for the heavy parts.

**Q: How does the notification system stay real-time?**
A: Supabase Realtime is a WebSocket layer on top of Postgres logical replication. When a row is inserted into the `notifications` table, Postgres publishes a change event, Supabase Realtime forwards it to any subscribed clients whose filter matches. Each user's notification store opens a channel `notifications:${userId}` with the filter `recipient_id=eq.${userId}` so each client only receives its own events. When an event arrives, the store prepends the new notification to its array and increments the unread count. The bell component re-renders because it's subscribed to the unread count.

**Q: How do you prevent inappropriate AI music?**
A: The Suno prompt is built server-side in `/api/generate` using `buildPrompt(settings)` which prepends a long, hardcoded child-safe preamble specifying "no aggressive, dark, intense, or scary sounds, no vocals, no lyrics, no chanting, child-safe and positive." Even if a teacher writes a custom prompt in the worlds settings, it's appended to the safe preamble — it can't override the safety constraints. Suno also has its own content moderation that rejects inappropriate prompts.

**Q: What happens if Suno or MVSEP is down?**
A: The voices store catches generation errors and shows an error state in the panel. Students can still use the world (the 3D scene works fine), they just can't generate new stems. If old stems are cached in sessionStorage, they can still use those. The DAW is unaffected because it doesn't depend on Suno or MVSEP.

**Q: What's the worst part of the architecture? What would you change if you could start over?**
A: A few things. (1) Project data is stored as a single JSONB blob, which means we can't query inside it efficiently — we'd want a normalized schema with `placed_loops` as its own table. (2) The admin layer doesn't have an audit log — approve and reject actions only stamp the user row with `approved_by` and `approved_at`, so we can't reconstruct full history. (3) The DAW playback engine is hand-rolled with `requestAnimationFrame`; in retrospect, scheduling all triggers ahead of time with `Tone.Transport.schedule` would be more sample-accurate, but it would require more upfront engineering for a marginal quality gain. (4) The voices system's Suno + MVSEP pipeline has no queueing — if two students hit Generate at the exact same instant, both calls go through. A small queue with credit checks would be nicer.

**Q: How is this multi-tenant safe? Could a teacher from one school see another school's students?**
A: No. Every relevant table has a `school_id` column, and every RLS policy includes a `school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())` check. The database never returns rows from another school. This is enforced at the data layer, not at the application layer, so even a hacked client can't bypass it.

**Q: How did you test this?**
A: A combination of manual end-to-end testing on real devices (desktop and mobile, multiple browsers) and Vitest unit tests for critical pure functions in `src/lib/__tests__/` and `src/store/__tests__/`. The test accounts script ([scripts/create-test-accounts.js](scripts/create-test-accounts.js)) provisions an admin, a teacher, and 12 students under "God's Grace International School" so that the full multi-role flow can be exercised quickly. Manual testing covered every role's main flows on both desktop and mobile.

**Q: How much of this was written with AI?**
A: A meaningful amount. The disclosure is in [AI_USE_DOCUMENTATION.md](AI_USE_DOCUMENTATION.md) and is honest about it. The high-AI-involvement features include the stem separation pipeline, the notification system, the onboarding tour, the tutorials system, and parts of the audio sync engine. The low-AI-involvement parts are the React app setup, the auth flow, the Supabase configuration, the 3D world scene setup, all visual styling and the design language, the database schema, and all visual assets. AI was a pair programmer — the design decisions, the product decisions, the architecture choices, and the testing were all human.

---

## Part 16 — A Quick Reference Map

If during the defense you need to point to the file that does X, this is your map.

| Concern | File |
|---------|------|
| Auth, role detection, sign in/up/out | [src/store/useAuthStore.js](src/store/useAuthStore.js) |
| Login form | [src/assets/pages/Auth/Login.tsx](src/assets/pages/Auth/Login.tsx) |
| Signup form (5-step carousel) | [src/assets/pages/Auth/Signup.tsx](src/assets/pages/Auth/Signup.tsx) |
| Email domain validation | [src/lib/emailValidation.ts](src/lib/emailValidation.ts) |
| Role-based route protection | [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) |
| Top-level routing and navbar | [src/App.tsx](src/App.tsx) |
| Sidebar (role-aware nav) | [src/components/ui/Sidebar.tsx](src/components/ui/Sidebar.tsx) |
| DAW page shell | [src/assets/pages/DAW-Lite/DAWLite.jsx](src/assets/pages/DAW-Lite/DAWLite.jsx) |
| DAW timeline grid + playhead | [src/components/ui/DAW-Lite/Timeline.jsx](src/components/ui/DAW-Lite/Timeline.jsx) |
| DAW transport controls | [src/components/ui/DAW-Lite/Transportcontrols.jsx](src/components/ui/DAW-Lite/Transportcontrols.jsx) |
| DAW loop library | [src/components/ui/DAW-Lite/LoopLibrary.jsx](src/components/ui/DAW-Lite/LoopLibrary.jsx) |
| DAW project menu (save/load/export) | [src/components/ui/DAW-Lite/Projectmenu.jsx](src/components/ui/DAW-Lite/Projectmenu.jsx) |
| DAW state, playback engine, RAF loop | [src/store/useStore.js](src/store/useStore.js) |
| Audio export (mix + MP3/WAV encode) | [src/lib/audioExport.js](src/lib/audioExport.js) |
| Audio duration preload cache | [src/lib/audioDurationCache.js](src/lib/audioDurationCache.js) |
| World 1 (Fireside) | [src/components/Worlds/World1.tsx](src/components/Worlds/World1.tsx) |
| World 2 (Auditorium) | [src/components/Worlds/World2.tsx](src/components/Worlds/World2.tsx) |
| Voices Panel | [src/components/Voices/VoicesPanel.tsx](src/components/Voices/VoicesPanel.tsx) |
| Voices store, beat-synced switching | [src/store/useVoicesStore.js](src/store/useVoicesStore.js) |
| Voices API (Suno + MVSEP pipeline) | [src/lib/voicesApi.js](src/lib/voicesApi.js) |
| Suno proxy | [api/generate.ts](api/generate.ts), [api/generate-status.ts](api/generate-status.ts) |
| MVSEP proxy | [api/separate.ts](api/separate.ts), [api/separate-status.ts](api/separate-status.ts) |
| CORS audio proxy | [api/proxy-audio.ts](api/proxy-audio.ts) |
| Assignment form (teacher) | [src/components/teacher/AssignmentForm.tsx](src/components/teacher/AssignmentForm.tsx) |
| Feedback modal (teacher) | [src/components/teacher/FeedbackModal.tsx](src/components/teacher/FeedbackModal.tsx) |
| Student assignments page | [src/assets/pages/Assignments.tsx](src/assets/pages/Assignments.tsx) |
| Teacher API | [src/lib/teacherApi.js](src/lib/teacherApi.js) |
| Admin API (approvals, classes) | [src/lib/adminApi.js](src/lib/adminApi.js) |
| Admin Dashboard | [src/assets/pages/AdminDashboard.tsx](src/assets/pages/AdminDashboard.tsx) |
| Progress store (XP, levels, badges) | [src/store/useProgressStore.js](src/store/useProgressStore.js) |
| Session tracker (active time + idle) | [src/hooks/useSessionTracker.js](src/hooks/useSessionTracker.js) |
| Notification store + realtime | [src/store/useNotificationStore.js](src/store/useNotificationStore.js) |
| Notification bell | [src/components/ui/NotificationBell.tsx](src/components/ui/NotificationBell.tsx) |
| Notification panel | [src/components/ui/NotificationPanel.tsx](src/components/ui/NotificationPanel.tsx) |
| Notification API | [src/lib/notificationApi.js](src/lib/notificationApi.js) |
| Onboarding tour | [src/components/onboarding/OnboardingTour.tsx](src/components/onboarding/OnboardingTour.tsx) |
| Onboarding completion hook | [src/hooks/useOnboarding.ts](src/hooks/useOnboarding.ts) |
| Error boundary | [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) |
| Supabase client init | [src/lib/supabase.js](src/lib/supabase.js) |
| Storage (file upload) helper | [src/lib/storageApi.js](src/lib/storageApi.js) |
| Test accounts script | [scripts/create-test-accounts.js](scripts/create-test-accounts.js) |
| Vite config + dev API plugin | [vite.config.js](vite.config.js) |
| Tailwind config | [tailwind.config.js](tailwind.config.js) |
| Vercel deployment config | [vercel.json](vercel.json) |
| Public documentation | [DOCUMENTATION.md](DOCUMENTATION.md) |
| AI use disclosure | [AI_USE_DOCUMENTATION.md](AI_USE_DOCUMENTATION.md) |

---

## Closing

Djembe is, at its heart, an attempt to take the most adult, technical, intimidating part of music — the production studio — and make it something a 7-year-old can use to make their first song. Everything in the codebase is downstream of that goal. The purple color palette, the rounded corners, the mascot, the 3D worlds, the daily caps on XP, the beat-synced voice switching, the role-based color coding in the sidebar — none of it is decoration. Each one is a deliberate answer to a question about how children learn and how they engage with screens.

The technical work was hard in places, especially the audio engine and the 3D worlds, but the harder work was deciding what *not* to build. Every feature in Djembe earned its place by making the experience clearer or more engaging for the target audience. Every feature we considered and rejected — MIDI, synthesis, user-to-user messaging, social feeds, leaderboards, friend systems — was rejected because it would have made the app more complex without making it more useful for a child learning to make their first beat.

When you stand to defend this project, the most important thing to remember is that the code is in service of that vision. You're not defending lines of code. You're defending an answer to the question: *what would music education software look like if you designed it for the people who actually need it most?*

The answer is Djembe.
