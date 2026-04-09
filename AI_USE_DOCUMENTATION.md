# AI Use Documentation - Djembe Project

**Capstone Project:** Djembe - Educational Music Platform  
**Author:** Emmanuel Adotey Acquaye  
**Last Updated:** April 2026

---

## Purpose of This Document

This document discloses how I used AI tools during the development of Djembe. It covers what tools I used, what I used them for, and where the line is between my own work and AI-assisted work. I've tried to be as honest and specific as possible.

---

## What AI Tools I Used

| Tool | Model | How I Used It |
|------|-------|---------------|
| Claude Code (VS Code Extension) | Claude Opus 4.6 (Anthropic) | Primary development assistant - writing code, debugging, refactoring |
| Cursor AI (Chat) | OpenAI GPT | Used in one session (Feb 2026) for debugging assignment/feedback issues |

I used AI throughout the development process, mainly through the Claude Code CLI integrated in VS Code. It functioned as a pair programmer - I'd describe what I needed, it would suggest code, and I'd review and test everything before committing.

---

## What AI Helped With

- Writing and debugging code (API integrations, component logic, state management)
- Technical problem-solving (CORS issues, audio sync bugs, API timeout workarounds)
- Building out features I designed but needed help implementing (notifications, onboarding, tutorials)
- Responsive design and mobile adaptations
- Documentation drafts (which I then reviewed and edited)

## What I Did Myself

- Came up with the project concept and all the educational design decisions
- All UI/UX design - the visual style, colours, layout, how things should look and feel
- Chose the tech stack and third-party services (Supabase, Suno, MVSEP, Three.js)
- Designed the database schema
- Created all visual assets (mascot illustrations, images)
- Made all product decisions - what features to build and how they should work
- Tested everything manually on real devices
- Set up deployment and managed the production environment

---

## Feature-by-Feature Breakdown

### High AI Involvement (70-95%)

These features were mostly implemented by AI based on my requirements. I described what I wanted, reviewed the code, and tested the results.

**Stem Separation Pipeline (MVSEP Integration)**  
The original plan used Suno's built-in separation, but it flagged AI-generated tracks as copyrighted. I chose MVSEP as an alternative. AI designed the two-endpoint polling architecture to work around Vercel's 10-second timeout, implemented the job creation/status endpoints, and figured out the MVSEP API response format through debugging.  
Files: `api/separate.ts`, `api/separate-status.ts`, `api/proxy-audio.ts`, `src/lib/voicesApi.js`

**Notification System**  
I asked for a real-time notification system so students and teachers would know about new assignments, submissions, and feedback. AI built the entire pipeline - database API, Zustand store with Supabase Realtime subscriptions, and the UI components (bell icon with badge, notification panel).  
Files: `src/lib/notificationApi.js`, `src/store/useNotificationStore.js`, `src/components/ui/NotificationBell.tsx`, `src/components/ui/NotificationPanel.tsx`

**Onboarding Tours**  
I wanted a guided walkthrough for new users. AI implemented it using React Joyride with role-specific steps and persistent completion tracking.  
Files: `src/components/onboarding/OnboardingTour.tsx`, `src/hooks/useOnboarding.ts`

**Tutorials System**  
Full tutorials page with video playback, category filtering, and difficulty indicators. I sourced the tutorial content and videos.  
Files: `src/lib/tutorialsApi.js`, `src/assets/pages/Tutorials.tsx`, `src/components/tutorials/`

**CORS Audio Proxy**  
AI created a Vercel serverless proxy with domain allowlisting to serve external audio files (from MVSEP and Suno CDNs) without CORS blocking.  
File: `api/proxy-audio.ts`

**Audio Sync & Buffer Fixes**  
AI debugged and fixed race conditions with Tone.js audio buffer loading and implemented bar-boundary quantization for smooth stem switching.  
File: `src/store/useVoicesStore.js`

**Sidebar Navigation**  
Responsive collapsible sidebar with role-based navigation items and Framer Motion animations.  
File: `src/components/ui/Sidebar.tsx`

### Medium AI Involvement (40-70%)

These were collaborative - I had existing code or a clear structure, and AI helped extend, refactor, or fix things.

**Teacher API & Voice Settings** - AI added per-world settings queries and assignment management functions to my existing API layer.  
**Voices Panel & 3D World Integration** - AI handled the audio playback logic and per-world caching; I set up the 3D scenes and UI layout.  
**Assignment System Enhancements** - I built the initial assignment flow; AI helped with class-based filtering, notification triggers, and submission tracking.  
**Mobile Responsiveness** - AI refactored multiple components for mobile support based on my breakpoint decisions and device testing feedback.

### Low AI Involvement (0-30%)

These are primarily my own work. AI may have helped with minor things like fixing a CSS issue or suggesting a syntax fix.

- Initial React application setup and routing
- Authentication flow and Supabase client configuration
- 3D world scene setup (Three.js model loading, animations, camera)
- All visual styling and the glassmorphism design theme
- Database schema design
- Landing page design
- All mascot illustrations and visual assets
- Colour palette and branding
- Feature prioritisation and product direction

---

## Specific Debugging Sessions

AI was particularly useful for diagnosing problems I couldn't easily solve alone:

| Problem | What AI Did |
|---------|-------------|
| 504 timeouts on Vercel | Diagnosed the Vercel timeout limit and proposed a polling architecture |
| CORS blocking audio playback | Created a proxy with an allowlist of trusted domains |
| Music always generating as "boom bap" | Found that Suno prioritises the `style` field over the `prompt` field |
| Audio stems not playing | Identified a race condition in Tone.js buffer loading (`Tone.loaded()` vs `player.loaded`) |
| Feedback not saving | Traced the issue to mismatched submission IDs in the database queries |
| MVSEP returning empty stems | Discovered MVSEP uses `type` (not `name`) as the stem identifier field |

---

## How I Used AI in Practice

My typical workflow:

1. I'd describe what I wanted to build or what problem I was facing
2. AI would read the relevant code and suggest an approach
3. I'd review the suggestion - sometimes accepting it, sometimes asking for changes
4. AI would write the code
5. I'd test it in the browser and on mobile devices
6. If something was wrong, I'd describe the issue and we'd iterate

I always reviewed code before committing. AI can't run the app, see the UI, or test on real devices - that was all me. Several times I caught issues AI missed: wrong z-index values, mobile breakpoints that didn't feel right, onboarding steps targeting elements that hadn't rendered yet.

---

## File Attribution Summary

### Primarily AI-Written
```
api/separate.ts, api/separate-status.ts, api/proxy-audio.ts
src/lib/voicesApi.js, notificationApi.js, tutorialsApi.js, cloudinaryApi.js
src/store/useNotificationStore.js, useVoicesStore.js
src/components/ui/Sidebar.tsx, NotificationPanel.tsx, NotificationBell.tsx
src/components/onboarding/OnboardingTour.tsx
src/components/tutorials/TutorialCard.tsx, VideoPlayerModal.tsx
src/assets/pages/Tutorials.tsx, TeacherSubmissions.tsx
src/assets/pages/teacher/WorldsSettings.tsx
```

### Collaborative (AI + Me)
```
src/lib/teacherApi.js, progressApi.js, storageApi.js
src/store/useStore.js, useAuthStore.js, useProgressStore.js
src/components/Voices/VoicesPanel.tsx, VoiceCategory.tsx, VoiceButton.tsx
src/components/teacher/AssignmentForm.tsx
src/assets/pages/Assignments.tsx, DAW-Lite/DAWLite.jsx
src/components/Worlds/World1.tsx, World2.tsx
```

### Primarily My Own Work
```
Initial project setup and configuration
Database schema design
3D world scenes (Three.js)
All UI/UX design and styling
Authentication system
Landing page
All visual assets and illustrations
```

---

## Overall Contribution Estimate

Based on a weighted breakdown across all project areas:

| | Contribution |
|---|---|
| **AI** | ~53% |
| **Human (Me)** | ~47% |

This puts the project in the "Significant AI Collaboration" range. The split reflects that AI handled much of the technical implementation (API integrations, audio debugging, backend logic), while I drove all design decisions, chose the technologies, created the visual identity, designed the user experience, and tested everything.

The AI functioned as a technical implementation partner. I was the product owner - deciding what to build, how it should look, and validating that it actually worked.

---

## What AI Could Not Do

- Run or test the application
- See the UI or verify visual design
- Test on mobile devices
- Deploy to production
- Create illustrations or visual assets
- Make product or educational design decisions
- Execute database migrations (I ran all SQL myself in Supabase)

---

## Declaration

I confirm that:

1. This document honestly represents how AI was used in this project
2. All AI-generated code was reviewed and tested by me before inclusion
3. The educational concept, design, and visual identity are my own work
4. I understand and can explain all the code in this project
5. AI was used as a development tool, not as the sole creator

---

**Date:** April 2026  
**Version:** 4.0
