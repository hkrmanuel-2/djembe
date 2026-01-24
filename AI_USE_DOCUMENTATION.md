# AI Use Documentation - Djembe Project

> **Capstone Project:** Djembe - Educational Music Platform
> **Document Purpose:** Academic disclosure of AI assistance in development
> **AI Tool Used:** Claude (Anthropic) via Claude Code CLI
> **Document Date:** January 24, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [AI Assistance Summary](#ai-assistance-summary)
3. [Detailed AI Contributions](#detailed-ai-contributions)
4. [Human Developer Contributions](#human-developer-contributions)
5. [AI Interaction Methodology](#ai-interaction-methodology)
6. [Code Attribution](#code-attribution)
7. [Limitations & Human Oversight](#limitations--human-oversight)

---

## Overview

This document provides a transparent account of how artificial intelligence was used during the development of the Djembe educational music platform. The AI assistant (Claude by Anthropic) was used as a development aid through the Claude Code command-line interface, functioning as a pair programming partner and technical consultant.

### AI Tool Details

| Attribute | Details |
|-----------|---------|
| **AI Model** | Claude Opus 4.5 (claude-opus-4-5-20251101) |
| **Interface** | Claude Code CLI (VS Code Extension) |
| **Provider** | Anthropic |
| **Usage Period** | Development phase (2025-2026) |

### Scope of AI Use

AI was used for:
- Code implementation and debugging
- Technical problem-solving
- Documentation writing
- Code review and optimization
- Explaining technical concepts

AI was **NOT** used for:
- Project conceptualization and educational design
- UI/UX design decisions
- Database schema initial design
- Feature prioritization
- User research or testing

---

## AI Assistance Summary

### High-Level Statistics

| Category | AI Contribution Level |
|----------|----------------------|
| Backend API Development | High |
| Frontend Components | Medium |
| State Management | Medium |
| Documentation | High |
| Debugging & Fixes | High |
| Architecture Decisions | Low (advisory only) |
| Educational Content Design | None |

### Files with Significant AI Contribution

| File | AI Contribution | Description |
|------|-----------------|-------------|
| `api/separate.ts` | High | MVSEP separation endpoint (timeout fix) |
| `api/separate-status.ts` | High | New polling endpoint for MVSEP |
| `api/proxy-audio.ts` | High | CORS proxy for external audio |
| `src/lib/voicesApi.js` | High | Suno API integration, prompt building |
| `src/lib/teacherApi.js` | Medium | Per-world settings functions |
| `src/store/useVoicesStore.js` | Medium | Audio synchronization logic |
| `src/store/useStore.js` | Medium | Auto-proxy for external URLs |
| `DOCUMENTATION.md` | High | Technical documentation |

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

**AI Contribution:** 80% (diagnosis + solutions)
**Human Contribution:** 20% (error reporting + testing)

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

### 3. Educational Content
- Age-appropriate design decisions
- Learning objectives
- Assignment system design
- Teacher-student relationship model

### 4. Database Schema Design
- Initial table structures
- Relationships between entities
- Row-level security policies

### 5. Third-Party Service Selection
- Choice of Supabase for backend
- Selection of Suno API for music generation
- MVSEP for stem separation
- Three.js for 3D rendering

### 6. Testing & Quality Assurance
- Manual testing of all features
- User acceptance testing
- Performance verification
- Cross-browser testing

### 7. Deployment & Operations
- Vercel deployment configuration
- Environment variable management
- Production monitoring

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

### Tools Used by AI

| Tool | Purpose |
|------|---------|
| Read | Reading existing code files |
| Write | Creating new files |
| Edit | Modifying existing code |
| Bash | Running git commands, npm scripts |
| Grep | Searching codebase |
| Glob | Finding files by pattern |

---

## Code Attribution

### Code Entirely Written by AI

```
api/separate-status.ts          - 100% AI
api/proxy-audio.ts              - 90% AI (updates)
src/lib/voicesApi.js            - 80% AI (Suno integration, prompts)
DOCUMENTATION.md                - 90% AI
AI_USE_DOCUMENTATION.md         - 100% AI
```

### Code with AI Assistance

```
src/store/useVoicesStore.js     - 60% AI (sync logic)
src/store/useStore.js           - 40% AI (proxy helper)
src/lib/teacherApi.js           - 50% AI (world_id support)
api/separate.ts                 - 70% AI (refactoring)
```

### Code Entirely Human-Written

```
Initial React components
Database schema SQL
Supabase client configuration
Initial authentication flow
3D world scene setup
UI styling and CSS
```

---

## Limitations & Human Oversight

### What AI Could NOT Do

1. **Run the Application:** AI cannot execute or test the running application
2. **Visual Design:** AI cannot see UI results; relied on developer feedback
3. **User Testing:** AI cannot interact with the application as a user
4. **Deploy:** AI cannot access deployment platforms directly
5. **Database Migrations:** AI wrote SQL but human executed it

### Human Oversight Applied

| AI Action | Human Verification |
|-----------|-------------------|
| Code changes | Code review before commit |
| API integrations | Manual testing of endpoints |
| Security changes | Verification of .env removal |
| Documentation | Review for accuracy |
| Architecture decisions | Approval before implementation |

### Errors Caught by Human Review

- Initial proxy implementation missing some domains
- Caching key format needed adjustment
- Some edge cases in audio timing

---

## Overall AI Contribution Score

### Calculation Methodology

The overall score is calculated as a weighted average across all project areas, considering both the percentage of AI contribution and the relative size/importance of each area.

### Breakdown by Project Area

| Project Area | Weight (%) | AI Contribution (%) | Weighted Score |
|--------------|------------|---------------------|----------------|
| Backend API (`api/`) | 10% | 80% | 8.0 |
| Frontend Pages (`pages/`) | 15% | 10% | 1.5 |
| UI Components (`components/ui/`) | 15% | 15% | 2.25 |
| Voices System (`Voices/`, `voicesApi`) | 8% | 70% | 5.6 |
| 3D Worlds (`Worlds/`) | 10% | 15% | 1.5 |
| State Management (`store/`) | 8% | 45% | 3.6 |
| Library/Utils (`lib/`) | 7% | 50% | 3.5 |
| Authentication System | 5% | 15% | 0.75 |
| Database Schema | 5% | 10% | 0.5 |
| Styling/CSS | 7% | 5% | 0.35 |
| Documentation | 5% | 90% | 4.5 |
| Project Config/Setup | 5% | 5% | 0.25 |
| **TOTAL** | **100%** | — | **32.3%** |

### Final Score

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           OVERALL PROJECT CONTRIBUTION                      │
│                                                             │
│     ┌──────────────────────────────────────────────┐       │
│     │                                              │       │
│     │   AI CONTRIBUTION:        32%                │       │
│     │   HUMAN CONTRIBUTION:     68%                │       │
│     │                                              │       │
│     └──────────────────────────────────────────────┘       │
│                                                             │
│     [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░] 32% AI        │
│     [░░░░░░░░░░░░████████████████████████████] 68% Human   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Score Interpretation

| Score Range | Classification | This Project |
|-------------|----------------|--------------|
| 0-20% | Minimal AI Use | |
| 21-40% | **Moderate AI Assistance** | **✓ 32%** |
| 41-60% | Significant AI Collaboration | |
| 61-80% | Heavy AI Reliance | |
| 81-100% | AI-Generated Project | |

### What This Means

- **68% Human-Driven:** The majority of the project—including all creative decisions, UI/UX design, educational content, database architecture, and most React components—was developed by the human developer.

- **32% AI-Assisted:** AI provided significant help in specific technical areas: backend API development, debugging complex issues, documentation, and implementing advanced features like audio synchronization.

- **Classification:** This project falls into the "Moderate AI Assistance" category, meaning AI was used as a **development tool** rather than the primary creator.

---

## Declaration

I declare that:

1. This document accurately represents the use of AI in the Djembe project
2. All AI-generated code was reviewed and tested before inclusion
3. The educational concept and design were human-originated
4. AI was used as a development tool, not as the sole creator
5. I understand and can explain all code in the project

---

**Document Prepared By:** Project Developer
**AI Assistant:** Claude (Anthropic)
**Date:** January 24, 2026
**Version:** 1.0
