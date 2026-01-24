# Djembe - Project Documentation

> **A comprehensive music education platform featuring a simplified Digital Audio Workstation (DAW-Lite), 3D interactive worlds, and AI-powered music generation.**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Core Features](#core-features)
5. [Technical Stack](#technical-stack)
6. [Project Structure](#project-structure)
7. [State Management](#state-management)
8. [Authentication System](#authentication-system)
9. [DAW-Lite Module](#daw-lite-module)
10. [Database Schema](#database-schema)
11. [API Integrations](#api-integrations)
12. [3D Worlds](#3d-worlds)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)

---

## 🎯 Project Overview

**Djembe** is an educational music platform designed to teach students music production through an intuitive, simplified Digital Audio Workstation (DAW-Lite). The platform combines traditional DAW functionality with modern web technologies, 3D interactive environments, and AI-powered music generation.

### Key Features

- **DAW-Lite**: Simplified digital audio workstation for music creation
- **User Authentication**: Separate teacher and student accounts with role-based access
- **Project Management**: Save, load, and manage music projects
- **AI Loop Generation**: Generate music loops using Suno API
- **3D Interactive Worlds**: Educational 3D environments using Three.js
- **Audio Export**: Export projects as MP3 or WAV files
- **Real-time Playback**: Beat-accurate audio playback with transport controls

### Target Audience

- **Students**: Learn music production through hands-on DAW experience
- **Teachers**: Manage classes, assign projects, and track student progress

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   DAW-Lite   │  │    Worlds    │  │    Auth      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Zustand State Management                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (Backend Services)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │   Auth API   │  │   Storage    │  │
│  │   Database   │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External APIs                               │
│  ┌──────────────┐                                       │
│  │  Suno API    │  (AI Music Generation)                 │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

- **State Management**: Zustand with persistence middleware + React Context API
- **Component Architecture**: Functional components with hooks
- **Routing**: React Router with protected routes
- **Audio Processing**: Tone.js for transport, Web Audio API for playback
- **3D Rendering**: Three.js with native WebGL (not React Three Fiber)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **UI Design**: Glassmorphism with dark theme and backdrop blur effects

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Supabase Account**: For backend services
- **Suno API Key** (optional): For AI loop generation

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd djembe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install all required packages including:

   **Core Framework:**
   ```bash
   npm install react@^19.1.1 react-dom@^19.1.1 react-router-dom@^7.9.4
   ```

   **State Management:**
   ```bash
   npm install zustand@^5.0.9
   ```

   **UI & Styling:**
   ```bash
   npm install tailwindcss@^3.4.19 autoprefixer@^10.4.23 postcss@^8.5.6
   npm install @radix-ui/react-label@^2.1.8 @radix-ui/react-slot@^1.2.4
   npm install class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.4.0 tailwindcss-animate@^1.0.7
   npm install lucide-react@^0.562.0 framer-motion@^12.26.2
   ```

   **Audio Processing:**
   ```bash
   npm install tone@^15.1.22 lamejs@^1.2.1
   ```

   **3D Graphics:**
   ```bash
   npm install three@^0.180.0 @react-three/fiber@^9.5.0 @react-three/drei@^10.7.7
   ```

   **Backend:**
   ```bash
   npm install @supabase/supabase-js@^2.83.0
   ```

   **Development Dependencies:**
   ```bash
   npm install -D vite@^7.1.7 @vitejs/plugin-react@^5.0.4
   npm install -D eslint@^9.36.0 @eslint/js@^9.36.0 eslint-plugin-react-hooks@^5.2.0 eslint-plugin-react-refresh@^0.4.22
   npm install -D @types/react@^19.1.16 @types/react-dom@^19.1.9 globals@^16.4.0
   ```

   **Or install everything at once (recommended):**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUNO_API_KEY=your_suno_api_key (optional)
   ```

4. **Database Setup**
   
   Run the SQL schema from `src/lib/supabase.js` in your Supabase SQL Editor. This creates:
   - `loops` table
   - `projects` table
   - `teachers` table
   - `students` table
   - `schools` table
   - Row Level Security policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🎨 Core Features

### 1. DAW-Lite

A simplified Digital Audio Workstation that allows users to:
- Drag and drop audio loops onto a timeline
- Arrange loops in a grid-based timeline (16th note subdivisions)
- Play, pause, stop, and rewind playback
- Adjust BPM (beats per minute)
- Save and load projects
- Export projects as audio files

**Key Components:**
- `DAWLite.jsx`: Main container component
- `Timeline.jsx`: Grid-based timeline for loop placement
- `LoopLibrary.jsx`: Library of available audio loops
- `TransportControls.jsx`: Playback controls
- `ProjectMenu.jsx`: Project save/load interface
- `AILoopGenerator.jsx`: AI-powered loop generation

### 2. Authentication System

Role-based authentication with two user types:
- **Teachers**: Full access to admin features
- **Students**: Access to DAW-Lite and Worlds

**Features:**
- Email/password authentication via Supabase Auth
- Session persistence with "Remember this device"
- Protected routes for authenticated users
- User profile management

### 3. Project Management

- **Save Projects**: Store projects in Supabase database
- **Load Projects**: Retrieve and restore saved projects
- **Delete Projects**: Remove projects from database
- **Project Metadata**: Name, BPM, bars, placed loops

### 4. AI Loop Generation

Integration with Suno API to generate custom music loops:
- Text-to-music generation
- BPM matching
- Automatic loop addition to library
- Credit tracking

### 5. 3D Worlds

Interactive 3D educational environments built with Three.js:
- **World 1 - Fireside World**: Cozy campfire forest scene for storytelling and acoustic sessions
- **World 2 - Auditorium World**: Historic Roseland Theatre (Viola Desmond) for large performances
- Advanced orbit controls with damping for smooth navigation
- GLTF model loading with progress tracking
- Fullscreen mode support
- Camera reset functionality
- Interactive info panels with usage instructions
- Professional lighting setup (ambient + multiple directional lights)
- Modern glassmorphism UI with backdrop blur effects
- Responsive controls and animations

### 6. Audio Export

Export completed projects as audio files:
- **MP3 Export**: Compressed audio format (using lamejs)
- **WAV Export**: Uncompressed audio format
- Automatic mixing of all placed loops
- Beat-accurate timing preservation

---

## 🛠️ Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| Vite | 7.1.7 | Build tool and dev server |
| React Router | 7.9.4 | Client-side routing |
| Zustand | 5.0.9 | State management |
| Tailwind CSS | 3.4.19 | Styling framework |
| Radix UI | Latest | Accessible UI components |
| Framer Motion | 12.26.2 | Animation library |
| Lucide React | 0.562.0 | Icon library |

### Audio

| Technology | Version | Purpose |
|------------|---------|---------|
| Tone.js | 15.1.22 | Audio transport and timing |
| Web Audio API | Native | Audio playback and processing |
| lamejs | 1.2.1 | MP3 encoding |

### 3D Graphics

| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | 0.180.0 | 3D rendering engine |
| @react-three/fiber | 9.5.0 | React renderer for Three.js |
| @react-three/drei | 10.7.7 | Useful helpers for R3F |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase Storage | File storage for audio loops |

### External APIs

| Service | Purpose |
|---------|---------|
| Suno API | AI music generation |
| Replicate Demucs | Audio stem separation (rhythm, bass, harmony, melody) |

---

## 📁 Project Structure

```
djembe/
├── public/
│   ├── models/              # 3D model files (.glb)
│   │   ├── low_poly_forest.glb
│   │   └── viola_desmond_the_roseland_theatre.glb
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │   ├── pages/           # Page components
│   │   │   ├── Admin/       # Admin pages
│   │   │   │   ├── AdminProfile.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   └── Settings.jsx
│   │   │   ├── Auth/        # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── DAW-Lite/
│   │   │   │   └── DAWLite.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── To-Do.jsx
│   │   │   └── Worlds.jsx
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Route protection
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── field.tsx
│   │   │   ├── input.tsx
│   │   │   ├── cube-loader-dark.tsx       # 3D cube loading animation
│   │   │   ├── tubelight-navbar-dark.tsx  # Dark navigation bar
│   │   │   └── DAW-Lite/                  # DAW-specific components
│   │   │       ├── AILoopGenerator.jsx
│   │   │       ├── Loopbutton.jsx
│   │   │       ├── LoopLibrary.jsx
│   │   │       ├── Projectmenu.jsx
│   │   │       ├── Timeline.jsx
│   │   │       ├── Transportcontrols.jsx
│   │   │       ├── Waveform.jsx
│   │   │       ├── login-form.tsx
│   │   │       └── signup-form.tsx
│   │   ├── Voices/                        # Voices/Music components
│   │   │   ├── VoicesPanel.tsx            # Music control panel in worlds
│   │   │   ├── VoiceButton.tsx            # Individual voice toggle
│   │   │   ├── VoiceCategory.tsx          # Category container
│   │   │   └── VoicesGlobalControls.tsx   # Global playback controls
│   │   └── Worlds/                        # 3D world components
│   │       ├── World1.tsx                 # Fireside World
│   │       └── World2.tsx                 # Auditorium World
│   │
│   ├── contexts/                  # React contexts
│   │   └── LoadingContext.tsx     # Global loading state
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── audioExport.js         # Audio export functionality
│   │   ├── emailValidation.ts     # Email domain validation
│   │   ├── sunoApi.js             # Suno API integration
│   │   ├── supabase.js            # Supabase client & schema
│   │   ├── teacherApi.js          # Teacher dashboard API functions
│   │   ├── voicesApi.js           # Suno + Demucs API integration
│   │   └── utils.ts               # General utilities
│   │
│   ├── store/                     # Zustand stores
│   │   ├── useAuthStore.js        # Authentication state
│   │   ├── useStore.js            # DAW state management
│   │   └── useVoicesStore.js      # Voices/music state management
│   │
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Global styles
│   ├── index.css                  # Base styles
│   └── main.jsx                   # Application entry point
│
├── .env                           # Environment variables (not in repo)
├── components.json                # shadcn/ui configuration
├── DATABASE_SETUP.md              # Database setup instructions
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML template
├── jsconfig.json                  # JavaScript configuration
├── package.json                   # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── TROUBLESHOOTING_SCHOOLS.md     # Troubleshooting guide
├── vite.config.js                 # Vite configuration
└── README.md                      # Project readme
```

---

## 🔄 State Management

### React Context

#### LoadingContext (`src/contexts/LoadingContext.tsx`)

Global loading state management using React Context API.

**Purpose:**
- Centralized loading state across the application
- Smooth page transitions with loading overlays
- Consistent loading UI throughout the app

**Provider:**
```typescript
<LoadingProvider>
  <App />
</LoadingProvider>
```

**Hook Usage:**
```typescript
const { isLoading, setIsLoading } = useLoading();

// Show loading
setIsLoading(true);

// Hide loading
setIsLoading(false);
```

**Features:**
- Global loading overlay with 3D cube animation
- Customizable loading messages
- Automatic z-index management (z-[9999])
- Framer Motion animations for smooth transitions

### Zustand Stores

The application uses Zustand for state management with persistence middleware.

#### 1. `useAuthStore` (`src/store/useAuthStore.js`)

Manages authentication state and user profiles.

**State:**
```javascript
{
  user: null,                    // Supabase auth user
  userType: null,                // 'teacher' or 'student'
  userProfile: null,             // Teacher or Student record
  isLoading: false,              // Loading state
  error: null,                   // Error messages
  isAuthenticated: false          // Auth status
}
```

**Actions:**
- `initAuth()`: Initialize auth state from session
- `loadUserProfile(authUser)`: Load user profile from database
- `signUp(email, password, userType, firstName, lastName, schoolId)`: Register new user
- `signIn(email, password)`: Authenticate user
- `signOut()`: Sign out current user
- `clearError()`: Clear error state

**Persistence:**
- Persists: `user`, `userType`, `userProfile`, `isAuthenticated`
- Storage key: `"auth-storage"`

#### 2. `useStore` (`src/store/useStore.js`)

Manages DAW-Lite state including transport, projects, and loops.

**State:**
```javascript
{
  transport: {
    bpm: 120,                    // Beats per minute
    isPlaying: false,             // Playback state
    currentBeat: 0                // Current beat position
  },
  library: [],                   // Available loops from database
  project: {
    id: null,                    // Project ID
    name: "Untitled Project",    // Project name
    bpm: 120,                    // Project BPM
    placedLoops: [],             // Loops placed on timeline
    bars: 10                     // Number of bars
  },
  players: {},                   // Tone.js players (not persisted)
  audioInitialized: false,       // Audio context ready
  isLoading: false,              // Loading state
  error: null,                   // Error messages
  userProjects: []               // User's saved projects
}
```

**Actions:**

**Audio Control:**
- `initAudio()`: Initialize Tone.js audio context
- `startTransport()`: Start playback
- `pauseTransport()`: Pause playback
- `togglePlay()`: Toggle play/pause
- `stop()`: Stop and reset to beginning
- `rewind()`: Reset to beginning
- `setBpm(bpm)`: Update BPM
- `setCurrentBeat(beat)`: Set current beat position

**Loop Management:**
- `loadLoops()`: Load loops from database
- `addPlacedLoop(loop)`: Add loop to timeline
- `removePlacedLoop(id)`: Remove loop from timeline
- `updatePlacedLoop(id, updates)`: Update loop properties

**Project Management:**
- `newProject()`: Create new project
- `setProjectName(name)`: Update project name
- `updateProjectDimensions(bars, rows)`: Update timeline size
- `saveProject()`: Save project to database
- `loadProject(projectId)`: Load project from database
- `loadUserProjects()`: Load all user projects
- `deleteProject(projectId)`: Delete project

**Persistence:**
- Persists: `transport`, `project`, `userProjects`
- Storage key: `"daw-storage"`

#### 3. `useVoicesStore` (`src/store/useVoicesStore.js`)

Manages the Voices Panel state for 3D worlds, including audio playback, stem management, and per-world settings.

**State:**
```javascript
{
  worldId: "world1",               // Current world identifier
  voices: {},                      // Voice stem URLs { rhythm, bass, harmony, melody }
  activeVoices: {},                // Currently playing voices per category
  isPlaying: false,                // Global playback state
  bpm: 120,                        // Current BPM for synchronization
  settings: null,                  // Voice settings from database
  isLoading: false,                // Loading state
  error: null                      // Error messages
}
```

**Actions:**

**World Management:**
- `setWorldId(worldId)`: Set current world (triggers settings reload)
- `fetchSettings(schoolId, worldId)`: Load voice settings from database

**Playback Control:**
- `startPlayback()`: Start all active voices synchronized
- `stopPlayback()`: Stop all voices
- `togglePlayback()`: Toggle play/pause

**Voice Selection:**
- `selectVoice(category, voiceName)`: Select a voice for a category
- `toggleVoice(category)`: Toggle voice on/off for category

**Timing:**
- `_getTimeToNextBoundary(bars)`: Calculate time to next bar boundary for synchronized switching

**Session Caching:**
- Stems cached per-world in sessionStorage
- Key format: `djembe_voices_stems_${worldId}`
- Automatic cache invalidation on settings change

### State Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
State Update
    ↓
Component Re-render (via selector)
    ↓
UI Update
```

---

## 🧭 Navigation System

### NavBarDark Component

**File:** [src/components/ui/tubelight-navbar-dark.tsx](src/components/ui/tubelight-navbar-dark.tsx)

Modern navigation bar with glassmorphism design and smooth animations.

**Features:**
- Dark theme with backdrop blur effects
- Fixed bottom positioning for easy access
- Icon-based navigation with labels
- Active route highlighting
- Smooth hover animations
- Responsive design

**Props:**
```typescript
interface NavItem {
  name: string;           // Display name
  url: string;            // Route path
  icon: LucideIcon;       // Icon component
}

interface NavBarDarkProps {
  items: NavItem[];       // Navigation items array
}
```

**Usage in App:**
```typescript
const navItems = [
  { name: 'Home', url: '/', icon: HomeIcon },
  { name: 'DAW', url: '/daw', icon: Music },
  { name: 'Assignments', url: '/assignments', icon: FileText },
  { name: 'Worlds', url: '/world1', icon: Globe },
];

<NavBarDark items={navItems} />
```

**Styling:**
- Background: `bg-black/30` with `backdrop-blur-lg`
- Border: `border border-white/10`
- Active state: `bg-white/10` background
- Hover state: `text-white` with scale transform
- Rounded corners: `rounded-full`

**Dynamic Items:**
- Conditionally shows "Assignments" for students only
- Authentication-based visibility
- User type-specific navigation

### User Profile Badge

**Location:** Top-right corner of authenticated pages

**Features:**
- Displays user's first name
- Logout button with icon
- Glassmorphism styling matching nav bar
- Fixed positioning (z-index 50)

**Styling:**
- Position: `fixed top-6 right-6`
- Background: `bg-black/40` with `backdrop-blur-md`
- Border: `border border-white/10`
- Layout: Horizontal flex with divider

---

## 🔐 Authentication System

### Architecture

The authentication system uses Supabase Auth with custom user profiles stored in separate `teachers` and `students` tables.

### Flow

1. **Sign Up**
   ```
   User submits form
       ↓
   Create Supabase Auth user
       ↓
   Create profile in Teachers/Students table
       ↓
   Load user profile
       ↓
   Set authenticated state
   ```

2. **Sign In**
   ```
   User submits credentials
       ↓
   Supabase Auth sign in
       ↓
   Load user profile from Teachers/Students
       ↓
   Set authenticated state
   ```

3. **Session Management**
   - Sessions are stored in `localStorage`
   - Auto-refresh enabled
   - Session persistence based on "Remember this device" preference

### User Types

#### Teachers
- Access to admin dashboard
- Can view all students
- Can create assignments
- Full project access

#### Students
- Access to DAW-Lite
- Access to 3D Worlds
- Can save/load own projects
- Limited admin access

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```

**Behavior:**
- Checks authentication status
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated
- Renders children if authenticated

### Database Tables

#### Teachers Table
```sql
CREATE TABLE teachers (
  teacher_id UUID PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  school_id UUID REFERENCES schools(school_id),
  created_at TIMESTAMP
);
```

#### Students Table
```sql
CREATE TABLE students (
  student_id UUID PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  school_id UUID REFERENCES schools(school_id),
  created_at TIMESTAMP
);
```

---

## 🎵 DAW-Lite Module

### Overview

DAW-Lite is a simplified digital audio workstation that allows users to create music by arranging audio loops on a timeline.

### Components

#### 1. DAWLite.jsx (Main Container)

**Responsibilities:**
- Orchestrates all DAW components
- Manages drag-and-drop state
- Handles loop placement logic
- Calculates loop spans based on audio duration

**Key Functions:**
- `calculateSpan(audioUrl, targetBars)`: Calculate grid span for loop
- `handleDragStart(loop)`: Initiate drag operation
- `handleDrop(row, col)`: Place loop on timeline
- `handlePlacedLoopDrag(loopId, newRow, newCol)`: Move placed loop
- `handleLoopTrim(loopId, updates)`: Trim loop duration

#### 2. Timeline.jsx

**Features:**
- Grid-based timeline (16th note subdivisions)
- Visual beat indicators
- Playhead visualization
- Drag-and-drop zones
- Loop placement and editing
- Timeline extension

**Grid System:**
- **Subdivisions per beat**: 4 (16th notes)
- **Beats per bar**: 4
- **Default bars**: 10
- **Total grid units**: `bars × 4 × 4`

**Visual Elements:**
- Beat markers
- Bar separators
- Playhead indicator
- Loop blocks with icons

#### 3. LoopLibrary.jsx

**Features:**
- Displays available loops from database
- Drag-and-drop source
- Loop preview on click
- Visual loop cards with icons

**Loop Properties:**
- `id`: Unique identifier
- `name`: Loop name
- `url`: Audio file URL
- `color`: Background color
- `hoverColor`: Hover state color
- `border`: Border color
- `icon`: Emoji icon
- `bpm`: Loop BPM

#### 4. TransportControls.jsx

**Controls:**
- **Play/Pause**: Toggle playback
- **Stop**: Stop and reset
- **Rewind**: Return to beginning
- **BPM Control**: Adjust tempo

**Visual Feedback:**
- Play/pause icon state
- Current beat indicator
- BPM display

#### 5. ProjectMenu.jsx

**Features:**
- Save current project
- Load saved projects
- Delete projects
- Project list display

**Project Data:**
```javascript
{
  project_id: UUID,
  title: string,
  bpm: number,
  placed_loops: Array,
  bars: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 6. AILoopGenerator.jsx

**Features:**
- Text input for music prompt
- BPM selection
- Generate button
- Progress indicator
- Automatic library update

**Integration:**
- Uses Suno API (`src/lib/sunoApi.js`)
- Polls for generation completion
- Adds generated loop to database
- Updates library automatically

### Playback System

#### Transport Mechanism

The playback system uses a combination of:
- **Tone.js Transport**: For BPM synchronization
- **requestAnimationFrame**: For beat tracking
- **Web Audio API**: For actual audio playback

#### Beat Calculation

```javascript
const secondsPerBeat = 60 / bpm;
const elapsed = Tone.now() - startTime;
const floatBeat = elapsed / secondsPerBeat;
const beatIndex = Math.floor(floatBeat) % totalBeats;
```

#### Loop Triggering

Loops are triggered when the playhead reaches their start beat:

```javascript
const loopStartBeat = Math.floor(loop.col / subdivisionsPerBeat);
if (beatIndex === loopStartBeat) {
  playLoopOnce(loop);
}
```

**Prevention of Retriggering:**
- Uses a `Set` to track triggered loops
- Key format: `${loopId}-${beatIndex}-${cycle}`
- Cleans up old triggers to prevent memory buildup

### Audio Export

The export system (`src/lib/audioExport.js`) provides:

**Functions:**
- `exportProjectAsAudio(placedLoops, bpm, bars, filename, format)`

**Process:**
1. Load all audio files as AudioBuffers
2. Calculate start times based on grid positions
3. Mix all buffers into single buffer
4. Trim to project duration
5. Encode as MP3 (with WAV fallback) or WAV
6. Trigger download

**Formats:**
- **MP3**: Compressed (128 kbps) using lamejs
- **WAV**: Uncompressed PCM

---

## 📚 Assignments System

### Overview

Student assignment management system integrated with the DAW-Lite module.

**File:** [src/assets/pages/Assignments.jsx](src/assets/pages/Assignments.jsx)

### Features

- View assigned music projects
- Submit completed assignments
- Track submission status
- View assignment details and requirements
- Filter assignments by status

### Database Integration

**Recent Update (January 2026):**
- Migrated from `assignment_submissions` table to `submissions` table
- Simplified data structure
- Improved query performance
- Better relationship mapping

**Submissions Table Structure:**
```sql
CREATE TABLE submissions (
  submission_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(assignment_id),
  student_id UUID REFERENCES students(student_id),
  project_id UUID REFERENCES projects(project_id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  grade INTEGER,
  feedback TEXT
);
```

### User Experience

**Student View:**
- Dashboard showing all assignments
- Due dates and status indicators
- Direct links to DAW-Lite for completion
- Submission confirmation
- Grade and feedback viewing

**Teacher View (Admin):**
- Assignment creation interface
- Student submission tracking
- Grading interface
- Feedback submission

### Integration with DAW-Lite

- Assignments can specify required loops or BPM
- Students use DAW-Lite to complete assignments
- Projects linked to assignment submissions
- Automatic project saving on submission

---

## 🗄️ Database Schema

### Tables

#### 1. Loops Table

Stores available audio loops for the DAW.

```sql
CREATE TABLE loops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🎵',
  color VARCHAR(50) DEFAULT 'bg-purple-400',
  hover_color VARCHAR(50) DEFAULT 'hover:bg-purple-500',
  border VARCHAR(50) DEFAULT 'border-purple-600',
  bpm INTEGER DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Loop name
- `url`: Audio file URL (Supabase Storage)
- `icon`: Emoji icon
- `color`: Tailwind CSS color class
- `hover_color`: Hover state color
- `border`: Border color class
- `bpm`: Beats per minute
- `created_at`: Creation timestamp

#### 2. Projects Table

Stores user music projects.

```sql
CREATE TABLE projects (
  project_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  bpm INTEGER NOT NULL DEFAULT 120,
  placed_loops JSONB NOT NULL DEFAULT '[]',
  bars INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `project_id`: Unique identifier
- `student_id`: Owner student ID
- `title`: Project name
- `bpm`: Project BPM
- `placed_loops`: JSON array of placed loops
- `bars`: Number of bars
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Placed Loop Structure:**
```json
{
  "id": 1234567890,
  "loopId": "uuid",
  "type": "KICK",
  "color": "bg-purple-400",
  "border": "border-purple-600",
  "icon": "🥁",
  "url": "https://...",
  "row": 0,
  "col": 0,
  "span": 64
}
```

#### 3. Teachers Table

Stores teacher profiles.

```sql
CREATE TABLE teachers (
  teacher_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(school_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Students Table

Stores student profiles.

```sql
CREATE TABLE students (
  student_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(school_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Schools Table

Stores school information.

```sql
CREATE TABLE schools (
  school_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  allowed_domains TEXT[],  -- Array of allowed email domains
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. Submissions Table

Stores student assignment submissions.

```sql
CREATE TABLE submissions (
  submission_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  grade INTEGER,
  feedback TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `submission_id`: Unique identifier
- `assignment_id`: Reference to assignment
- `student_id`: Reference to student
- `project_id`: Reference to submitted project
- `submitted_at`: Submission timestamp
- `status`: Submission status (pending, graded, etc.)
- `grade`: Numerical grade
- `feedback`: Teacher feedback text
- `updated_at`: Last update timestamp

#### 7. Assignments Table

Stores teacher-created assignments.

```sql
CREATE TABLE assignments (
  assignment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `assignment_id`: Unique identifier
- `teacher_id`: Reference to creating teacher
- `title`: Assignment title
- `description`: Assignment details
- `due_date`: Due date
- `requirements`: JSON requirements (BPM, loops, duration, etc.)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### 8. Voice Settings Table

Stores per-world music generation settings configured by teachers.

```sql
CREATE TABLE voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  world_id VARCHAR(50) NOT NULL DEFAULT 'world1',
  genre VARCHAR(50) DEFAULT 'afrobeat',
  bpm INTEGER DEFAULT 120,
  style VARCHAR(50) DEFAULT 'upbeat',
  mood VARCHAR(50) DEFAULT 'happy',
  custom_prompt TEXT,
  stems_url TEXT,
  original_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, world_id)
);
```

**Fields:**
- `id`: Unique identifier
- `school_id`: Reference to school
- `world_id`: Which world these settings apply to ('world1', 'world2', etc.)
- `genre`: Musical genre (afrobeat, jazz, electronic, etc.)
- `bpm`: Tempo in beats per minute (60-200)
- `style`: Musical style (upbeat, relaxed, energetic, etc.)
- `mood`: Emotional tone (happy, calm, intense, etc.)
- `custom_prompt`: Additional AI generation instructions
- `stems_url`: URL to separated audio stems (JSON)
- `original_url`: URL to original generated audio
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Unique Constraint:**
Each school can have one settings entry per world, enforced by `UNIQUE(school_id, world_id)`.

**Migration for Existing Tables:**
```sql
-- Add world_id column if upgrading from single-world setup
ALTER TABLE voice_settings ADD COLUMN IF NOT EXISTS world_id VARCHAR(50) NOT NULL DEFAULT 'world1';
ALTER TABLE voice_settings DROP CONSTRAINT IF EXISTS voice_settings_school_id_key;
ALTER TABLE voice_settings ADD CONSTRAINT voice_settings_school_world_unique UNIQUE(school_id, world_id);
```

### Row Level Security (RLS)

All tables have RLS enabled. Current policies allow all operations for authenticated users. Production should implement more restrictive policies.

**Example Policy:**
```sql
CREATE POLICY "Allow all on loops" ON loops
  FOR ALL USING (true) WITH CHECK (true);
```

**Recommended Production Policies:**
- Users can only read loops
- Users can only modify their own projects
- Teachers can view all students
- Students can only view their own data

### Indexes

```sql
CREATE INDEX loops_name_idx ON loops(name);
CREATE INDEX projects_student_id_idx ON projects(student_id);
CREATE INDEX projects_updated_at_idx ON projects(updated_at DESC);
CREATE INDEX submissions_student_id_idx ON submissions(student_id);
CREATE INDEX submissions_assignment_id_idx ON submissions(assignment_id);
CREATE INDEX assignments_teacher_id_idx ON assignments(teacher_id);
CREATE INDEX assignments_due_date_idx ON assignments(due_date);
```

### Triggers

**Auto-update timestamp:**
```sql
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 API Integrations

### Suno API

**Purpose:** AI-powered music generation

**Configuration:**
- Base URL: `https://api.sunoapi.org`
- Authentication: Bearer token (API key)

**Functions** (`src/lib/sunoApi.js`):

1. **generateMusic(prompt, bpm, apiKey)**
   - Generates music from text prompt
   - Matches specified BPM
   - Returns audio URL

2. **pollForCompletion(taskId, apiKey)**
   - Polls for generation completion
   - Exponential backoff
   - Max 60 attempts

3. **getRemainingCredits(apiKey)**
   - Checks remaining API credits

**Usage Example:**
```javascript
import { generateMusic } from '@/lib/sunoApi';

const result = await generateMusic(
  "upbeat electronic beat",
  120,
  apiKey
);

if (result.success) {
  const audioUrl = result.data.audio_url;
  // Add to library
}
```

**Response Format:**
```javascript
{
  success: true,
  data: {
    audio_url: "https://...",
    // ... other metadata
  }
}
```

### Replicate Demucs API

**Purpose:** Audio stem separation for the Voices Panel

**Configuration:**
- API endpoint: Via Vercel API route (`/api/separate`)
- Model: `cjwbw/demucs` on Replicate
- Authentication: `REPLICATE_API_TOKEN` environment variable

**Stem Separation:**
The Demucs model separates audio into four stems:
- **drums** → Rhythm track
- **bass** → Bass track
- **other** → Harmony track
- **vocals** → Melody track (instrumental content)

**API Route** (`api/separate.ts`):
```typescript
// POST /api/separate
// Body: { audioUrl: string }
// Returns: { drums, bass, other, vocals } URLs
```

**Usage in voicesApi.js:**
```javascript
export async function separateStems(audioUrl) {
  const response = await fetch('/api/separate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioUrl })
  });
  return response.json();
}
```

### Supabase API

**Purpose:** Backend services (database, auth, storage)

**Client Configuration** (`src/lib/supabase.js`):
```javascript
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
```

**Usage:**
- Database queries via `.from()` method
- Auth operations via `.auth` namespace
- Storage operations via `.storage` namespace

---

## 🌍 3D Worlds

### Overview

Interactive 3D educational environments built with Three.js (not React Three Fiber). Each world provides an immersive educational experience with professional-grade rendering and intuitive controls.

### World 1: Fireside World 🔥

**File:** [src/components/Worlds/World1.tsx](src/components/Worlds/World1.tsx)

**Theme:** Cozy campfire forest environment perfect for storytelling, acoustic sessions, and intimate musical performances.

**Features:**
- Low poly forest scene with campfire setting
- Model source: Supabase Cloud Storage
  - URL: `https://dtghqnhhsgbvhxlmtwwn.supabase.co/storage/v1/object/public/World%201/scene.gltf`
- Interactive orbit controls with damping (0.05 factor)
- Fullscreen mode toggle
- Camera reset to default position (-8, 1.5, -10)
- Loading progress bar with fire theme (orange-yellow gradient)
- Info panel with control instructions
- Bottom control hints with auto-hide behavior

**UI Components:**
- Glassmorphism top bar with title and controls
- Three action buttons:
  - Info toggle (shows/hides help panel)
  - Reset camera (returns to default view)
  - Fullscreen toggle (expands to full screen)
- Animated loading overlay with progress percentage
- Bottom hint panel (drag to explore • scroll to zoom)

**Technical Details:**
- Scene background: Sky blue (`0x87ceeb`)
- Camera: 75° FOV perspective camera
- Lighting setup:
  - Ambient light: White 1.2 intensity
  - Directional light 1: Position (5, 10, 7.5), intensity 1.0
  - Directional light 2: Position (-5, 5, -5), intensity 0.5
- Renderer settings:
  - SRGB color space
  - ACES Filmic tone mapping
  - 1.0 tone mapping exposure
  - Antialiasing enabled
- Material processing: Automatic SRGB color space application to textures

### World 2: Auditorium World 🎭

**File:** [src/components/Worlds/World2.tsx](src/components/Worlds/World2.tsx)

**Theme:** Grand auditorium (Viola Desmond - Roseland Theatre) designed for spectacular performances, concerts, recitals, and large ensemble presentations.

**Features:**
- Historic Roseland Theatre recreation
- Model source: Local public folder
  - Path: `/models/viola_desmond_the_roseland_theatre.glb`
- Identical control scheme to World 1
- Educational historical context
- Professional auditorium acoustics aesthetic
- Theater theme with purple-blue gradient
- Same advanced UI as World 1

**UI Components:**
- Same glassmorphism interface as World 1
- Theater emoji (🎭) branding
- Purple-blue gradient loading bar
- Identical control layout for consistency

**Technical Details:**
- Same scene and camera setup as World 1
- Same lighting configuration
- Same renderer settings
- Model positioning:
  - Scale: (1, 1, 1)
  - Position: (0, 0, 1)
  - Rotation: 45° on Y-axis (π/4)

---

## 🎵 Voices Panel System - Complete Technical Deep Dive

This section provides a comprehensive breakdown of how the Voices Panel system works, from teacher configuration to student playback. This covers the entire data flow, audio synchronization, AI music generation, and caching mechanisms.

### System Overview

The Voices Panel is an interactive music system integrated into 3D worlds that allows students to mix AI-generated music stems in real-time. The system consists of:

1. **Teacher Dashboard** - Where teachers configure music generation settings per-world
2. **Database Layer** - Stores settings with per-world granularity
3. **Music Generation Pipeline** - Suno API generates music, Demucs separates stems
4. **Audio Playback Engine** - Tone.js handles BPM-synchronized playback
5. **Caching System** - Session storage prevents redundant API calls

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEACHER FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Teacher Dashboard]                                                        │
│        │                                                                    │
│        ▼                                                                    │
│  ┌──────────────────┐    ┌──────────────────┐                              │
│  │ WorldsSettings   │───▶│ World Selector   │                              │
│  │ Component        │    │ (Dropdown)       │                              │
│  └──────────────────┘    └──────────────────┘                              │
│        │                        │                                           │
│        │ User selects:          │ selectedWorld = "world1" or "world2"     │
│        │ - Genre                │                                           │
│        │ - BPM                  ▼                                           │
│        │ - Style         ┌──────────────────┐                              │
│        │ - Mood          │ updateVoiceSettings()                           │
│        │ - Custom Prompt │ in teacherApi.js │                              │
│        │                 └──────────────────┘                              │
│        │                        │                                           │
│        ▼                        ▼                                           │
│  ┌──────────────────────────────────────────┐                              │
│  │            Supabase Database              │                              │
│  │  ┌────────────────────────────────────┐  │                              │
│  │  │ voice_settings table               │  │                              │
│  │  │ ─────────────────────────────────  │  │                              │
│  │  │ school_id │ world_id │ genre │ bpm │  │                              │
│  │  │ uuid-123  │ world1   │ jazz  │ 100 │  │                              │
│  │  │ uuid-123  │ world2   │ rock  │ 140 │  │                              │
│  │  └────────────────────────────────────┘  │                              │
│  └──────────────────────────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Student enters World1 or World2]                                          │
│        │                                                                    │
│        ▼                                                                    │
│  ┌──────────────────┐                                                      │
│  │ VoicesPanel      │◀──── worldId="world1" or "world2" (prop from World)  │
│  │ Component        │                                                       │
│  └──────────────────┘                                                      │
│        │                                                                    │
│        │ useEffect on mount                                                │
│        ▼                                                                    │
│  ┌──────────────────┐                                                      │
│  │ 1. setWorldId()  │ ◀── Store worldId in Zustand state                   │
│  │ 2. fetchSettings()│ ◀── Load settings from DB for this world           │
│  │ 3. checkCachedStems()│ ◀── Check sessionStorage for existing stems      │
│  │ 4. initAudio()   │ ◀── Initialize Tone.js context                       │
│  └──────────────────┘                                                      │
│        │                                                                    │
│        │ If no cached stems, student clicks "Generate"                     │
│        ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                  MUSIC GENERATION PIPELINE                        │      │
│  │                                                                   │      │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │      │
│  │  │ buildPrompt │───▶│ Suno API   │───▶│ Full Audio Track    │  │      │
│  │  │ (settings)  │    │ Generation │    │ (MP3, ~30 seconds)  │  │      │
│  │  └─────────────┘    └─────────────┘    └─────────────────────┘  │      │
│  │                                               │                   │      │
│  │                                               ▼                   │      │
│  │                     ┌─────────────────────────────────────────┐  │      │
│  │                     │ Replicate Demucs API                    │  │      │
│  │                     │ (Stem Separation)                       │  │      │
│  │                     │                                         │  │      │
│  │                     │ Input: Full audio track                 │  │      │
│  │                     │ Output: 4 separate stems                │  │      │
│  │                     │   ├── drums.mp3   → "Rhythm"            │  │      │
│  │                     │   ├── bass.mp3    → "Bass"              │  │      │
│  │                     │   ├── other.mp3   → "Harmony"           │  │      │
│  │                     │   └── vocals.mp3  → "Melody"            │  │      │
│  │                     └─────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│        │                                                                    │
│        │ Stems cached in sessionStorage                                    │
│        ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                  AUDIO PLAYBACK ENGINE                            │      │
│  │                                                                   │      │
│  │  ┌─────────────────────────────────────────────────────────────┐ │      │
│  │  │ Tone.js Transport                                           │ │      │
│  │  │ ─────────────────────────────────────────────────────────── │ │      │
│  │  │ BPM: 120 (from teacher settings)                            │ │      │
│  │  │ Time Signature: 4/4                                         │ │      │
│  │  │ Position: 0:0:0 ────────────────────────────▶ loops         │ │      │
│  │  └─────────────────────────────────────────────────────────────┘ │      │
│  │                          │                                        │      │
│  │  Bar Boundary Scheduler  │                                        │      │
│  │  (scheduleRepeat every   │                                        │      │
│  │   secondsPerBar)         ▼                                        │      │
│  │              ┌───────────────────────────────────────────────┐   │      │
│  │              │ Per-Category Tone.Players                     │   │      │
│  │              │                                               │   │      │
│  │              │ rhythm:  [Tone.Player] ──┐                    │   │      │
│  │              │ bass:    [Tone.Player] ──┼──▶ masterGain ──▶ 🔊│   │      │
│  │              │ harmony: [Tone.Player] ──┤                    │   │      │
│  │              │ melody:  [Tone.Player] ──┘                    │   │      │
│  │              └───────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│ World1.tsx / World2.tsx                                            │
│ ────────────────────────────────────────────────────────────────── │
│ - Renders 3D environment (Three.js)                                │
│ - Manages showVoicesPanel state                                    │
│ - Passes worldId prop to VoicesPanel                               │
│                                                                    │
│   <VoicesPanel                                                     │
│     isOpen={showVoicesPanel}                                       │
│     onClose={() => setShowVoicesPanel(false)}                      │
│     worldId="world1"  ◀── THIS IS THE KEY DIFFERENTIATION          │
│   />                                                               │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ VoicesPanel.tsx                                                    │
│ ────────────────────────────────────────────────────────────────── │
│ Props: { isOpen, onClose, worldId }                                │
│                                                                    │
│ On Mount (useEffect):                                              │
│   1. setWorldId(worldId)     // Store in Zustand                   │
│   2. fetchSettings(schoolId, worldId)  // Load from DB             │
│   3. checkCachedStems()      // Check sessionStorage               │
│   4. initAudio()             // Initialize Tone.js                 │
│                                                                    │
│ Renders:                                                           │
│   ├── VoicesGlobalControls (Play/Pause, BPM display)               │
│   ├── VoiceCategory (for each: rhythm, bass, harmony, melody)      │
│   │     └── VoiceButton (for each stem in category)                │
│   └── Generate Button (if no stems cached)                         │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│ useVoicesStore.js (Zustand Store)                                  │
│ ────────────────────────────────────────────────────────────────── │
│                                                                    │
│ STATE:                                                             │
│   worldId: "world1"          // Current world                      │
│   settings: { bpm, genre, style, mood, custom_prompt }             │
│   stems: { rhythm: [], bass: [], harmony: [], melody: [] }         │
│   categories: {                                                    │
│     rhythm:  { activeVoice, pendingVoice, muted }                  │
│     bass:    { activeVoice, pendingVoice, muted }                  │
│     harmony: { activeVoice, pendingVoice, muted }                  │
│     melody:  { activeVoice, pendingVoice, muted }                  │
│   }                                                                │
│   isPlaying: false                                                 │
│   stemsLoaded: false                                               │
│   isGenerating: false                                              │
│                                                                    │
│ ACTIONS:                                                           │
│   setWorldId(id)           // Set current world                    │
│   fetchSettings(schoolId, worldId)  // Load settings from DB       │
│   generateStems()          // Call Suno + Demucs APIs              │
│   startPlayback()          // Start Tone.js transport              │
│   stopPlayback()           // Stop all audio                       │
│   selectVoice(category, voiceId)  // Queue voice change            │
│   _getTimeToNextBoundary() // Calculate sync timing                │
│   _processBarBoundary()    // Handle voice switches on beat        │
└────────────────────────────────────────────────────────────────────┘
```

### Teacher Settings Flow - Step by Step

**Step 1: Teacher Opens WorldsSettings Page**

When a teacher navigates to the Worlds settings page, the component loads:

```typescript
// WorldsSettings.tsx
const [selectedWorld, setSelectedWorld] = useState("world1");
const [settings, setSettings] = useState({
  genre: "afrobeat",
  bpm: 120,
  style: "upbeat",
  mood: "happy",
  custom_prompt: "",
});
```

**Step 2: Teacher Selects a World**

The dropdown allows switching between worlds:

```typescript
const WORLD_OPTIONS = [
  { id: "world1", name: "Fireside World", emoji: "🔥" },
  { id: "world2", name: "Auditorium World", emoji: "🎭" },
];

// When world changes, load that world's settings
useEffect(() => {
  const loadSettings = async () => {
    const result = await getVoiceSettings(userProfile.school_id, selectedWorld);
    if (result.data) {
      setSettings(result.data);  // Populate form with existing settings
    }
  };
  loadSettings();
}, [selectedWorld]);  // Re-run when selectedWorld changes
```

**Step 3: Teacher Modifies Settings**

Each setting has a dedicated input that updates local state:

```typescript
<select
  value={settings.genre}
  onChange={(e) => setSettings({ ...settings, genre: e.target.value })}
>
  <option value="afrobeat">Afrobeat</option>
  <option value="jazz">Jazz</option>
  {/* ... more options */}
</select>
```

**Step 4: Teacher Saves Settings**

The save function writes to the database with the selected world:

```typescript
const handleSave = async () => {
  // Get teacher ID from profile (might be teacher_id or id)
  const teacherId = userProfile.teacher_id || userProfile.id;

  // Call API with school ID, teacher ID, settings, AND world ID
  const result = await updateVoiceSettings(
    userProfile.school_id,
    teacherId,
    settings,
    selectedWorld  // ◀── This is the key: which world to save to
  );

  if (result.error) {
    setError(result.error);
  } else {
    setSaveSuccess(true);
  }
};
```

**Step 5: Database Update**

The `updateVoiceSettings` function in `teacherApi.js` performs an upsert:

```javascript
export async function updateVoiceSettings(schoolId, teacherId, settings, worldId = "world1") {
  // First, check if settings exist for this school + world combination
  const { data: existing } = await supabase
    .from("voice_settings")
    .select("id")
    .eq("school_id", schoolId)
    .eq("world_id", worldId)  // ◀── Filter by BOTH school AND world
    .single();

  if (existing) {
    // UPDATE existing row
    const { data, error } = await supabase
      .from("voice_settings")
      .update({
        bpm: settings.bpm,
        genre: settings.genre,
        style: settings.style,
        mood: settings.mood,
        custom_prompt: settings.custom_prompt,
        updated_at: new Date().toISOString(),
      })
      .eq("school_id", schoolId)
      .eq("world_id", worldId)  // ◀── Update only this world's settings
      .select()
      .single();
    return { data, error: null };
  } else {
    // INSERT new row
    const { data, error } = await supabase
      .from("voice_settings")
      .insert([{
        school_id: schoolId,
        teacher_id: teacherId,
        world_id: worldId,  // ◀── Store which world this is for
        bpm: settings.bpm,
        genre: settings.genre,
        style: settings.style,
        mood: settings.mood,
        custom_prompt: settings.custom_prompt,
      }])
      .select()
      .single();
    return { data, error: null };
  }
}
```

### Database Schema Explained

The `voice_settings` table uses a **composite unique constraint** to allow multiple settings per school:

```sql
CREATE TABLE voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(school_id),
  world_id VARCHAR(50) NOT NULL DEFAULT 'world1',  -- ◀── Key field
  genre VARCHAR(50) DEFAULT 'afrobeat',
  bpm INTEGER DEFAULT 120,
  style VARCHAR(50) DEFAULT 'upbeat',
  mood VARCHAR(50) DEFAULT 'happy',
  custom_prompt TEXT,
  stems_url TEXT,
  original_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- This constraint ensures ONE row per school+world combination
  UNIQUE(school_id, world_id)
);
```

**Example Data:**
| id | school_id | world_id | genre | bpm | style | mood |
|----|-----------|----------|-------|-----|-------|------|
| abc-123 | school-001 | world1 | jazz | 100 | relaxed | calm |
| def-456 | school-001 | world2 | rock | 140 | energetic | happy |
| ghi-789 | school-002 | world1 | afrobeat | 120 | upbeat | playful |

**Why this design?**
- Each school can have different settings for each world
- Teachers can customize Fireside World (world1) to be calm/acoustic
- Teachers can customize Auditorium World (world2) to be energetic/orchestral
- Students in the same school see consistent settings per-world

### Music Generation Pipeline - Detailed Breakdown

When a student clicks "Generate Music", this sequence occurs:

**Stage 1: Build the Prompt**

The `buildPrompt()` function in `voicesApi.js` constructs an AI prompt from teacher settings:

```javascript
export function buildPrompt(settings) {
  const genre = settings.genre || "afrobeat";
  const bpm = settings.bpm || 120;
  const style = settings.style || "upbeat";
  const mood = settings.mood || "happy";
  const customPrompt = settings.custom_prompt || "";

  // This prompt is carefully crafted to produce child-appropriate music
  const prompt = `Create a kid-friendly, instrumental music track for children aged 5–12
that teaches rhythm through listening and movement.

STRICT PARAMETERS:
- Genre: ${genre}
- Tempo: ${bpm} BPM
- Style: ${style}
- Mood: ${mood}

Instrumentation:
- Use instruments typical of the ${genre} genre
- Supporting instruments: light percussion
- No vocals, no lyrics, no chanting

Guidelines:
- Child-safe and positive
- Simple, repetitive rhythmic patterns
- Clear rhythmic loop, predictable patterns
- Clean and warm mix
${customPrompt ? `\nAdditional Instructions:\n${customPrompt}` : ""}`;

  return prompt;
}
```

**Why this prompt structure?**
- **STRICT PARAMETERS** ensures the AI follows the teacher's choices
- **No vocals/lyrics** because we want instrumentals for stem separation
- **Simple, repetitive patterns** because children learn rhythm through repetition
- **Child-safe** ensures appropriate content

**Stage 2: Call Suno API**

The prompt and style tags are sent to Suno's AI music generation API. **Important:** Suno uses `style` tags more heavily than long prompts, so we send both:

```javascript
// In voicesApi.js - generateTrack()
export async function generateTrack(settings) {
  const prompt = buildPrompt(settings);  // Full detailed prompt
  const genre = settings.genre || "afrobeat";
  const style = settings.style || "upbeat";
  const mood = settings.mood || "happy";
  const bpm = settings.bpm || 120;

  // Build style tags - Suno weights these heavily for genre direction
  const styleTags = `${genre}, ${style}, ${mood}, ${bpm} bpm, instrumental, kid-friendly, educational, rhythmic, loopable`;

  const response = await fetch('https://api.sunoapi.org/api/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gpt_description_prompt: prompt,  // Full description for AI context
      style: styleTags,                 // Style TAGS - Suno uses this for genre!
      title: `${genre} ${mood} rhythm - ${bpm}bpm`,
      model: "V4_5ALL",
      instrumental: true,
      customMode: true,
      callBackUrl: "https://example.com/callback"
    })
  });

  // Returns { taskId: "..." } - must poll for completion
}
```

**Why both `gpt_description_prompt` AND `style`?**
- `style`: Comma-separated tags that Suno uses for genre/mood direction (most important!)
- `gpt_description_prompt`: Full detailed prompt for additional context
- Without `style` tags, Suno often defaults to generic music regardless of prompt

**Stage 3: Separate into Stems (MVSEP)**

The full audio track is sent to MVSEP (mvsep.com) for stem separation using their BS Roformer SW model.

**Why two endpoints?** Vercel has a 10-second timeout on the free tier. MVSEP processing takes 1-3 minutes. So we split into:
1. `POST /api/separate` - Starts the job, returns immediately with a hash
2. `GET /api/separate-status?hash=...` - Client polls this until done

```javascript
// STEP 1: Start the job (api/separate.ts)
export default async function handler(req, res) {
  const { audioUrl } = req.body;

  // Download audio and send to MVSEP
  const audioBlob = await downloadAudio(audioUrl);

  const formData = new FormData();
  formData.append("api_token", MVSEP_API_KEY);
  formData.append("audiofile", audioBlob, "track.mp3");
  formData.append("sep_type", "63");  // BS Roformer SW model
  formData.append("output_format", "2");  // MP3 128kbps

  const response = await fetch("https://mvsep.com/api/separation/create", {
    method: "POST",
    body: formData
  });

  const { data } = await response.json();

  // Return hash immediately - client will poll for completion
  return res.json({
    success: true,
    status: "processing",
    hash: data.hash  // Client uses this to check status
  });
}

// STEP 2: Check status (api/separate-status.ts)
export default async function handler(req, res) {
  const { hash } = req.query;

  const response = await fetch(`https://mvsep.com/api/separation/get?hash=${hash}`);
  const data = await response.json();

  if (data.status === "done") {
    // Extract stem URLs from response
    const stems = extractStems(data.data.files);

    // Proxy URLs to avoid CORS issues
    return res.json({
      success: true,
      status: "done",
      stems: {
        drums: `/api/proxy-audio?url=${encodeURIComponent(stems.drums)}`,
        bass: `/api/proxy-audio?url=${encodeURIComponent(stems.bass)}`,
        // ... other stems
      }
    });
  }

  return res.json({ success: true, status: "processing" });
}
```

**Client-side polling (voicesApi.js):**
```javascript
export async function separateStems(audioUrl, onProgress) {
  // Step 1: Start the job
  const startResponse = await fetch("/api/separate", {
    method: "POST",
    body: JSON.stringify({ audioUrl })
  });
  const { hash } = await startResponse.json();

  // Step 2: Poll every 3 seconds until done
  for (let attempt = 0; attempt < 120; attempt++) {
    await wait(3000);

    const statusResponse = await fetch(`/api/separate-status?hash=${hash}`);
    const statusData = await statusResponse.json();

    if (statusData.status === "done") {
      return { success: true, stems: statusData.stems };
    }

    onProgress(`Processing audio... ${Math.round((attempt / 120) * 100)}%`);
  }
}
```

**Why MVSEP instead of Demucs?**
- MVSEP's BS Roformer SW model separates into 6 stems (drums, bass, guitar, piano, vocals, other)
- Better separation quality for educational content
- No need to manage Replicate API
- More stem options for richer mixing

**Stage 4: Cache the Results**

Stems are cached in sessionStorage to avoid regenerating:

```javascript
// In useVoicesStore.js
generateStems: async () => {
  const { settings, worldId } = get();

  // ... generation code ...

  // Cache with world-specific key
  const cacheKey = `djembe_voices_stems_${worldId}`;  // ◀── Per-world cache
  sessionStorage.setItem(cacheKey, JSON.stringify(result.stems));

  set({
    stems: result.stems,
    stemsLoaded: true,
  });
}
```

**Cache Key Structure:**
- `djembe_voices_stems_world1` - Fireside World stems
- `djembe_voices_stems_world2` - Auditorium World stems
- `djembe_voices_settings_world1` - Fireside World settings
- `djembe_voices_settings_world2` - Auditorium World settings

### Audio Synchronization System - How BPM-Locked Playback Works

The most complex part of the system is ensuring all stems play in perfect sync and voice changes happen on beat boundaries.

**Understanding the Problem:**

If you simply start/stop audio players randomly:
- Stems will be out of sync with each other
- Transitions will sound jarring (audio cuts mid-beat)
- The musical groove is destroyed

**The Solution: Bar Boundary Quantization**

All audio operations are synchronized to bar boundaries using Tone.js Transport.

**Step 1: Initialize the Transport**

```javascript
// In startPlayback()
startPlayback: async () => {
  const { settings } = get();

  // Set the BPM from teacher settings
  Tone.Transport.bpm.value = settings.bpm;  // e.g., 120 BPM

  // Calculate seconds per bar (4 beats per bar in 4/4 time)
  const secondsPerBar = (60 / settings.bpm) * 4;
  // At 120 BPM: (60/120) * 4 = 0.5 * 4 = 2 seconds per bar

  // Schedule a callback that fires at every bar boundary
  barSchedulerId = Tone.Transport.scheduleRepeat(
    (time) => {
      get()._processBarBoundary(time);  // Handle pending voice changes
    },
    secondsPerBar,  // Repeat interval
    0               // Start immediately
  );

  // Reset to beginning
  Tone.Transport.position = 0;

  // Start the transport
  Tone.Transport.start();

  // Start all active voices at the SAME TIME
  const startTime = Tone.now() + 0.01;  // Tiny delay for scheduling
  Object.entries(categories).forEach(([category, state]) => {
    if (state.activeVoice && players[category]?.[state.activeVoice]) {
      const player = players[category][state.activeVoice];
      player.start(startTime, 0);  // Start from beginning, all at same time
    }
  });
}
```

**Step 2: Calculate Time to Next Boundary**

When a student wants to change a voice, we calculate when the next bar starts:

```javascript
_getTimeToNextBoundary: (bpm, toBar = true) => {
  const secondsPerBeat = 60 / bpm;            // At 120 BPM: 0.5 seconds
  const secondsPerBar = secondsPerBeat * 4;    // 2 seconds per bar
  const boundary = toBar ? secondsPerBar : secondsPerBeat;

  // Get current position in the transport
  const currentPosition = Tone.Transport.seconds;  // e.g., 3.7 seconds

  // Calculate time remaining until next boundary
  const timeToNext = boundary - (currentPosition % boundary);
  // e.g., 2 - (3.7 % 2) = 2 - 1.7 = 0.3 seconds until next bar

  // If very close to boundary, wait for the NEXT one
  return timeToNext < 0.05 ? boundary : timeToNext;
}
```

**Visual Example:**
```
Time:     0s    1s    2s    3s    4s    5s    6s
          |     |     |     |     |     |     |
Bars:     |  Bar 1   |  Bar 2   |  Bar 3   |
          ▲         ▲         ▲         ▲
          │         │         │         │
          Bar       Bar       Bar       Bar
          Boundary  Boundary  Boundary  Boundary

If user clicks "change voice" at 3.7s:
- Current bar boundary was at 2s
- Next bar boundary is at 4s
- Time to next boundary: 4 - 3.7 = 0.3 seconds
- Voice change is QUEUED and will execute at 4s
```

**Step 3: Queue Voice Changes**

When a student selects a different voice, it's queued (not immediate):

```javascript
selectVoice: (category, voiceId) => {
  const { categories, isPlaying, settings } = get();
  const categoryState = categories[category];

  // If not currently playing, just set it immediately
  if (!isPlaying) {
    set({
      categories: {
        ...categories,
        [category]: {
          ...categoryState,
          activeVoice: voiceId,  // Set immediately
        },
      },
    });
    return;
  }

  // If playing, QUEUE the change for next bar
  set({
    categories: {
      ...categories,
      [category]: {
        ...categoryState,
        pendingVoice: voiceId,       // ◀── Queued, not active yet
        pendingStartTime: Date.now(),
      },
    },
  });
}
```

**Step 4: Process Bar Boundaries**

At each bar boundary, pending changes are executed:

```javascript
_processBarBoundary: (time) => {
  const { categories, settings } = get();

  Object.entries(categories).forEach(([category, state]) => {
    // Check if there's a pending voice change
    if (state.pendingVoice !== null) {
      // Stop the currently playing voice
      if (state.activeVoice && players[category]?.[state.activeVoice]) {
        players[category][state.activeVoice].stop(time);
      }

      // Start the new voice AT THE BAR BOUNDARY
      if (players[category]?.[state.pendingVoice]) {
        players[category][state.pendingVoice].start(time, 0);
      }

      // Update state: pending becomes active
      set({
        categories: {
          ...categories,
          [category]: {
            ...state,
            activeVoice: state.pendingVoice,
            pendingVoice: null,
            pendingStartTime: null,
          },
        },
      });
    }
  });
}
```

**Result:** Voice changes happen exactly on the beat, creating seamless transitions.

### Caching System Explained

The caching system prevents expensive API calls on every world visit.

**Cache Structure:**

```
sessionStorage
├── djembe_voices_stems_world1    → { rhythm: [...], bass: [...], ... }
├── djembe_voices_stems_world2    → { rhythm: [...], bass: [...], ... }
├── djembe_voices_settings_world1 → { bpm: 100, genre: "jazz", ... }
└── djembe_voices_settings_world2 → { bpm: 140, genre: "rock", ... }
```

**Cache Lookup Flow:**

```javascript
// On VoicesPanel mount
useEffect(() => {
  const init = async () => {
    // 1. Set the world ID
    setWorldId(worldId);

    // 2. Fetch settings (checks cache first, then DB)
    await fetchSettings(schoolId, worldId);

    // 3. Check if stems are already cached
    const hasCachedStems = checkCachedStems();

    if (hasCachedStems) {
      // Great! No generation needed
      // Student can start playing immediately
    } else {
      // Show "Generate Music" button
      // Student must click to generate new stems
    }

    // 4. Initialize Tone.js
    await initAudio();
  };

  init();
}, [isOpen, schoolId, worldId]);
```

**Why sessionStorage instead of localStorage?**
- sessionStorage clears when browser tab closes
- This ensures fresh stems for each session
- Prevents stale audio from being used
- Students get fresh experience each visit (unless same session)

### Teacher Dashboard (WorldsSettings) - Complete Walkthrough

**Component State:**

```typescript
function WorldsSettings() {
  const { userProfile } = useAuthStore();

  // Which world is currently being edited
  const [selectedWorld, setSelectedWorld] = useState("world1");

  // The settings form values
  const [settings, setSettings] = useState({
    genre: "afrobeat",
    bpm: 120,
    style: "upbeat",
    mood: "happy",
    custom_prompt: "",
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
```

**Settings Load on World Change:**

```typescript
useEffect(() => {
  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);

    if (!userProfile?.school_id) {
      setIsLoading(false);
      return;
    }

    // Load settings for the SELECTED world
    const result = await getVoiceSettings(
      userProfile.school_id,
      selectedWorld  // ◀── Load settings for THIS world
    );

    if (result.data) {
      setSettings({
        genre: result.data.genre || "afrobeat",
        bpm: result.data.bpm || 120,
        style: result.data.style || "upbeat",
        mood: result.data.mood || "happy",
        custom_prompt: result.data.custom_prompt || "",
      });
    }

    setIsLoading(false);
  };

  loadSettings();
}, [userProfile?.school_id, selectedWorld]);  // Re-run when world changes
```

**Save Handler:**

```typescript
const handleSave = async () => {
  // Validate user profile exists
  if (!userProfile?.school_id) {
    setError("No school ID found. Please contact support.");
    return;
  }

  // Get teacher ID (field name varies)
  const teacherId = userProfile.teacher_id || userProfile.id;
  if (!teacherId) {
    setError("No teacher ID found. Please contact support.");
    return;
  }

  setIsSaving(true);
  setError(null);
  setSaveSuccess(false);

  // Save to database with world ID
  const result = await updateVoiceSettings(
    userProfile.school_id,
    teacherId,
    settings,
    selectedWorld  // ◀── Save to THIS world's settings
  );

  if (result.error) {
    setError(result.error);
  } else {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);  // Hide after 3s
  }

  setIsSaving(false);
};
```

### Configuration Options Reference

| Setting | Options | Effect on Music |
|---------|---------|-----------------|
| **Genre** | afrobeat, jazz, electronic, hip-hop, classical, rock, reggae, funk, world, ambient | Determines instruments and musical style |
| **Style** | upbeat, relaxed, energetic, chill, intense, groovy, melodic, rhythmic | Affects energy level and playing style |
| **Mood** | happy, calm, intense, dreamy, playful, focused, inspiring, mysterious | Sets emotional tone |
| **BPM** | 60-200 | Tempo (beats per minute). 60-80: slow, 80-120: moderate, 120-160: fast, 160+: very fast |
| **Custom Prompt** | Free text | Additional instructions for AI (e.g., "include marimba", "avoid minor keys") |

---

## ❓ Technical FAQ - Anticipated Questions

This section answers technical questions that might be asked by supervisors, lecturers, or reviewers.

### Architecture & Design Decisions

**Q: Why use Tone.js instead of the native Web Audio API?**

A: While the Web Audio API is powerful, it's low-level and requires significant code to handle:
- Beat synchronization
- Precise scheduling of audio events
- Transport controls (play, pause, seek)
- BPM management

Tone.js provides:
- A built-in Transport with BPM control
- `scheduleRepeat()` for bar-aligned callbacks
- High-level Player objects with buffer management
- Automatic audio context handling
- Cross-browser compatibility

Example of the complexity difference:

```javascript
// Native Web Audio API (complex)
const audioContext = new AudioContext();
const source = audioContext.createBufferSource();
source.buffer = await fetchAndDecodeAudio(url);
source.connect(audioContext.destination);
const startTime = audioContext.currentTime;
// Manual BPM calculation needed...

// Tone.js (simple)
const player = new Tone.Player(url).toDestination();
Tone.Transport.bpm.value = 120;
player.sync().start(0);  // Automatically synced to transport
```

**Q: Why use sessionStorage instead of localStorage for caching?**

A: This was a deliberate design choice:

| Storage Type | Persistence | Use Case |
|--------------|-------------|----------|
| localStorage | Permanent until cleared | User preferences, auth tokens |
| sessionStorage | Cleared when tab closes | Temporary data, cached API responses |

For stems:
- We WANT them to clear when the session ends
- This ensures students get fresh content periodically
- Prevents stale or corrupted audio from persisting
- Reduces storage bloat on student devices

**Q: Why store settings per-world instead of globally?**

A: Educational design reasoning:
1. **Contextual Learning**: Fireside World (cozy campfire) benefits from calm, acoustic music. Auditorium World (theater) suits grand, orchestral music.
2. **Variety**: Students experience different genres as they explore different worlds
3. **Teacher Control**: Teachers can curate the musical experience per environment
4. **Scalability**: Adding new worlds automatically supports independent settings

**Q: Why use Zustand instead of Redux or Context API?**

A: Zustand offers advantages for this use case:

| Feature | Redux | Context API | Zustand |
|---------|-------|-------------|---------|
| Boilerplate | High | Medium | Low |
| Bundle Size | Large | None | Small (1KB) |
| Async Actions | Requires middleware | Manual | Built-in |
| DevTools | Yes | Limited | Yes |
| Performance | Good with selectors | Re-renders all consumers | Automatic selector optimization |

Zustand code is concise:
```javascript
const useVoicesStore = create((set, get) => ({
  isPlaying: false,
  startPlayback: () => set({ isPlaying: true }),
  // No action creators, no reducers, no dispatch
}));
```

### Audio Processing

**Q: How does stem separation work technically?**

A: The Demucs model uses a deep neural network trained on thousands of songs:

1. **Input**: Full mixed audio (MP3/WAV)
2. **Processing**: U-Net architecture analyzes frequency patterns
3. **Output**: 4 isolated stems

The model learned to identify:
- **Drums**: Transient sounds, percussion frequencies
- **Bass**: Low frequency content (20-250 Hz)
- **Other**: Mid-range instruments (guitars, keys, synths)
- **Vocals**: Human voice patterns (in our case, lead instruments)

```
Full Mix ──▶ [Demucs Neural Network] ──▶ ├── drums.mp3
                                         ├── bass.mp3
                                         ├── other.mp3
                                         └── vocals.mp3
```

**Q: Why is bar boundary quantization important?**

A: Music is structured in bars (measures). In 4/4 time at 120 BPM:
- Each beat = 0.5 seconds (60/120)
- Each bar = 4 beats = 2 seconds

If you stop audio mid-bar:
```
Bar 1                    Bar 2
|  1  |  2  |  3  |  4  |  1  |  2  |  3  |  4  |
      ▲
      └── Audio stops here = jarring cut
```

With bar quantization:
```
Bar 1                    Bar 2
|  1  |  2  |  3  |  4  |  1  |  2  |  3  |  4  |
                        ▲
                        └── Audio stops here = clean transition
```

**Q: What happens if Suno API is unavailable?**

A: The system handles failures gracefully:

```javascript
generateStems: async () => {
  try {
    set({ isGenerating: true, generationMessage: "Starting..." });

    const result = await generateAndSeparateStems(settings, (stage, msg) => {
      set({ generationStage: stage, generationMessage: msg });
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Success path...
  } catch (error) {
    set({
      isGenerating: false,
      generationStage: "error",
      generationMessage: `Failed: ${error.message}`,
    });
    // User sees error message, can retry
  }
}
```

The UI shows:
1. Progress messages during generation
2. Error message if API fails
3. "Retry" button to attempt again

### Database Design

**Q: Why use a composite unique constraint (school_id, world_id)?**

A: This prevents data corruption:

```sql
UNIQUE(school_id, world_id)
```

Without it:
```sql
-- Could accidentally create duplicate settings
INSERT INTO voice_settings (school_id, world_id, genre) VALUES ('school1', 'world1', 'jazz');
INSERT INTO voice_settings (school_id, world_id, genre) VALUES ('school1', 'world1', 'rock');
-- Now which one is correct? 🤔
```

With it:
```sql
-- Second insert fails with unique constraint violation
INSERT INTO voice_settings (school_id, world_id, genre) VALUES ('school1', 'world1', 'jazz'); -- ✓
INSERT INTO voice_settings (school_id, world_id, genre) VALUES ('school1', 'world1', 'rock'); -- ✗ Error
```

**Q: Why reference school_id instead of teacher_id for settings?**

A: School-level settings ensure consistency:
- Multiple teachers at the same school see the same settings
- If a teacher leaves, settings aren't lost
- Students see consistent experience regardless of which teacher set it up
- Simplifies queries (one lookup per school+world)

### Performance

**Q: How does the system handle multiple concurrent users?**

A: Several strategies:

1. **Client-side caching**: Each student's browser caches stems locally
2. **No shared state**: Students don't share audio players
3. **Stateless API**: API routes don't maintain session state
4. **Database connection pooling**: Supabase handles concurrent connections

**Q: What's the estimated latency for voice switching?**

A: Latency components:

| Operation | Latency |
|-----------|---------|
| User click → JavaScript handler | ~1ms |
| State update (Zustand) | ~1ms |
| Wait for bar boundary | 0-2 seconds (depending on BPM and current position) |
| Audio stop/start | ~10ms |

Total perceived latency: User clicks, and within 0-2 seconds (at the next bar), the voice changes. This feels musical, not laggy.

**Q: How much storage does caching use?**

A: Estimated per-world:
- Settings JSON: ~200 bytes
- Stems URLs JSON: ~500 bytes
- Audio files are NOT stored locally (streamed from URLs)

Total per session: ~1.5 KB per world visited.

### Security

**Q: How is teacher-only access enforced?**

A: Multiple layers:

1. **Frontend routing**: Only teachers see WorldsSettings in navigation
2. **Component-level check**: WorldsSettings checks `userType === 'teacher'`
3. **Database RLS (Row Level Security)**: Can be configured to restrict writes

```javascript
// Frontend check
if (userType !== 'teacher') {
  return <Navigate to="/home" />;
}
```

**Q: Are API keys exposed to the client?**

A: No, API keys are protected:

- `VITE_SUPABASE_ANON_KEY`: This is meant to be public (read-only by default)
- `SUNO_API_KEY`: Only used server-side in API routes
- `REPLICATE_API_TOKEN`: Only used server-side in API routes

The `/api/separate` route runs on the server (Vercel), so tokens stay secret.

### Educational Design

**Q: Why separate into these 4 stem categories?**

A: Pedagogical reasoning:

| Stem | Musical Concept Taught |
|------|------------------------|
| **Rhythm** (drums) | Beat, tempo, time signature, pulse |
| **Bass** | Harmonic foundation, low frequencies |
| **Harmony** | Chords, accompaniment, texture |
| **Melody** | Lead lines, musical phrases |

Students can:
1. Listen to each part in isolation
2. Learn how parts combine to form a whole
3. Experiment with mixing (e.g., just rhythm + bass)
4. Develop ear training skills

**Q: Why is the prompt designed for ages 5-12?**

A: The prompt includes specific constraints for child-appropriate content:

```
- No vocals, no lyrics, no chanting  // Avoids inappropriate language
- Child-safe and positive            // No dark/scary themes
- Simple, repetitive patterns        // Appropriate complexity level
- Clean and warm mix                 // Not harsh or aggressive sounds
```

This ensures:
- Content is always school-appropriate
- Complexity matches developmental stage
- Patterns are learnable through repetition
- Sound quality is pleasant, not fatiguing

### Implementation Details

**Three.js Setup:**
```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
```

**Model Loading:**
```javascript
const loader = new GLTFLoader();
loader.load('/models/model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

**Controls:**
```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

---

## 🏗️ Component Hierarchy

### Application Structure

```
App (Router + LoadingProvider)
├── LoadingOverlay (Global loading state)
├── NavBarDark (Bottom navigation)
├── User Profile Badge (Top-right)
└── Routes
    ├── /login → Login
    ├── /signup → Signup
    ├── / → Home (Protected)
    ├── /daw → DAWLite (Protected)
    │   ├── Timeline
    │   ├── LoopLibrary
    │   ├── TransportControls
    │   ├── ProjectMenu
    │   └── AILoopGenerator
    ├── /assignments → Assignments (Protected, Students only)
    ├── /world1 → World1 (Protected)
    └── /world2 → World2 (Protected)
```

### Component Relationships

**DAWLite Module:**
```
DAWLite (Main Container)
├── Controls Section
│   ├── TransportControls (Play/Pause/Stop/BPM)
│   ├── ProjectMenu (Save/Load/Export)
│   └── AILoopGenerator (AI Music Generation)
├── Content Section
│   ├── LoopLibrary (Draggable loops)
│   └── Timeline (Drop zones, placed loops, playhead)
└── State Management
    └── useStore (Zustand)
```

**3D Worlds:**
```
World1/World2
├── Three.js Scene
│   ├── Camera (PerspectiveCamera)
│   ├── Lights (Ambient + Directional)
│   ├── GLTF Model
│   └── Renderer (WebGL)
├── Controls (OrbitControls)
└── UI Overlay
    ├── Top Bar (Title + Control Buttons)
    ├── Loading Overlay (Progress indicator)
    ├── Info Panel (Instructions)
    └── Bottom Hints (Control guide)
```

**State Flow:**
```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store / Context API
    ↓
State Update
    ↓
Subscribed Components Re-render
    ↓
UI Update + Side Effects
```

---

## 💻 Development Guide

### Code Style

- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: One component per file
- **Imports**: Absolute imports using `@/` alias

### Adding New Features

#### 1. Adding a New Page

1. Create component in `src/assets/pages/`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/new-page" element={
     <ProtectedRoute>
       <NewPage />
     </ProtectedRoute>
   } />
   ```
3. Add navigation link if needed

#### 2. Adding a New Loop

**Via Database:**
```sql
INSERT INTO loops (name, url, icon, color, hover_color, border, bpm)
VALUES ('New Loop', 'https://...', '🎵', 'bg-blue-400', 'hover:bg-blue-500', 'border-blue-600', 120);
```

**Via UI:**
- Use AILoopGenerator component
- Or manually add via Supabase dashboard

#### 3. Adding a New Store Action

```javascript
// In useStore.js
newAction: (param) => {
  set((state) => ({
    // Update state
  }));
}
```

### Debugging

**Common Issues:**

1. **Audio not playing**
   - Check browser autoplay policies
   - Ensure user interaction before audio
   - Check audio file URLs

2. **State not persisting**
   - Check localStorage in DevTools
   - Verify Zustand persist configuration
   - Clear storage and retry

3. **Database errors**
   - Verify Supabase credentials
   - Check RLS policies
   - Verify table structure

4. **Build errors**
   - Clear `node_modules` and reinstall
   - Check for version conflicts
   - Verify environment variables

### Testing

**Manual Testing Checklist:**
- [ ] User authentication (sign up, sign in, sign out)
- [ ] Loop drag and drop
- [ ] Playback controls
- [ ] Project save/load
- [ ] AI loop generation
- [ ] Audio export
- [ ] 3D world navigation

### Performance Optimization

**Current Optimizations:**
- Zustand selectors for minimal re-renders
- requestAnimationFrame for smooth playback
- Lazy loading for 3D models
- Audio buffer caching

**Future Optimizations:**
- Virtual scrolling for large timelines
- Web Workers for audio processing
- Code splitting for routes
- Image/audio compression

---

## 🚢 Deployment

### Build Process

1. **Environment Variables**
   - Ensure all `.env` variables are set
   - Use production Supabase project
   - Set production API keys

2. **Build Command**
   ```bash
   npm run build
   ```
   Output: `dist/` directory

3. **Preview Build**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure environment variables in dashboard

#### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

#### Traditional Hosting

1. Build project: `npm run build`
2. Upload `dist/` contents to web server
3. Configure server for SPA routing (all routes → `index.html`)

### Environment Variables

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Optional:**
- `VITE_SUNO_API_KEY`

### Post-Deployment

1. **Verify Database**
   - Run schema migrations
   - Test RLS policies
   - Verify indexes

2. **Test Authentication**
   - Test sign up/sign in
   - Verify session persistence
   - Test protected routes

3. **Test Core Features**
   - DAW-Lite functionality
   - Project save/load
   - Audio export
   - AI generation

---

## 📝 Additional Notes

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user interaction for audio)
- **Mobile**: Limited support (audio may be restricted)

### Known Limitations

1. **Audio Autoplay**: Requires user interaction
2. **Mobile Performance**: 3D worlds may be slow on mobile
3. **Audio Export**: Large projects may take time to export
4. **AI Generation**: Dependent on Suno API availability

### Future Enhancements

- [ ] Real-time collaboration
- [ ] MIDI support
- [ ] More audio effects
- [ ] Advanced timeline features
- [ ] Mobile app
- [ ] Offline mode
- [ ] More 3D worlds
- [ ] Student progress tracking

---

## 📚 Resources

### Documentation Links

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Tone.js Documentation](https://tonejs.github.io)
- [Three.js Documentation](https://threejs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Suno API Documentation](https://docs.sunoapi.org)

### Project Files

- `DATABASE_SETUP.md`: Database setup instructions
- `TROUBLESHOOTING_SCHOOLS.md`: Troubleshooting guide
- `README.md`: Quick start guide

---

---

## 🆕 Recent Updates

### January 2026

#### Major UI/UX Enhancements

**Navigation System Overhaul**
- Implemented new dark tubelight navigation bar ([NavBarDark](src/components/ui/tubelight-navbar-dark.tsx))
- Added glassmorphism design with backdrop blur effects
- Integrated Lucide React icons for better visual consistency
- Dynamic navigation items based on user role and authentication status

**Loading Experience**
- Added new [LoadingContext](src/contexts/LoadingContext.tsx) for global loading state management
- Implemented [CubeLoaderDark](src/components/ui/cube-loader-dark.tsx) component with 3D cube animation
- Full-screen loading overlays with smooth transitions using Framer Motion
- Contextual loading messages and sub-messages

**User Profile Display**
- Added fixed top-right user profile badge showing first name
- Integrated logout functionality directly in the UI
- Glassmorphism styling consistent with navigation theme

#### 3D Worlds Enhancements

**World 1: Fireside World** ([World1.tsx](src/components/Worlds/World1.tsx))
- Complete UI redesign with modern glassmorphism interface
- Added loading progress indicator with branded animations
- Implemented fullscreen mode toggle
- Camera reset functionality
- Interactive info panel with controls guide
- Updated theming: Fire emoji (🔥) with orange-yellow gradient
- Model source: Supabase cloud storage for optimized loading
- Enhanced lighting setup with multiple directional lights
- Improved material handling with proper SRGB color space

**World 2: Auditorium World** ([World2.tsx](src/components/Worlds/World2.tsx))
- New historical 3D environment: Viola Desmond - Roseland Theatre
- Theater emoji (🎭) with purple-blue gradient theme
- Identical control scheme to World 1 for consistency
- Local model loading from `/public/models/` directory
- Professional auditorium scene for educational content
- Same advanced UI features as World 1

**Shared World Features:**
- Responsive top bar with title and controls
- Three control buttons: Info, Reset Camera, Fullscreen
- Smooth animations using Framer Motion
- Bottom control hints that auto-hide when info is shown
- Orbit controls with damping for smooth navigation
- Optimized Three.js renderer settings:
  - ACES Filmic tone mapping
  - SRGB color space for accurate colors
  - Antialiasing enabled
  - Responsive canvas sizing

#### DAW-Lite Module Updates

**Project Export Feature**
- Added project export functionality to [ProjectMenu](src/components/ui/DAW-Lite/Projectmenu.jsx)
- Export projects as MP3 or WAV audio files
- Automatic mixing and rendering of all placed loops
- Beat-accurate timing preservation
- Download trigger with custom filename

**Loop Library Filtering**
- Updated [LoopLibrary](src/components/ui/DAW-Lite/LoopLibrary.jsx) to filter loops by project BPM
- Shows only compatible loops for current project tempo
- Improved user experience by reducing loop clutter
- Better performance with filtered rendering

**AI Loop Generation**
- Enhanced AI loop generation integration
- Progress tracking and user feedback
- Automatic addition to loop library after generation
- BPM matching with project settings

**Timeline Improvements**
- Added zoom controls for better timeline navigation
- Dynamic dimension calculations for responsive timeline
- Timeline extension capability for longer projects
- Visual beat and bar indicators
- Improved playhead visualization

**Loading States**
- Added loading overlays to DAW-Lite main component
- Better feedback during project loading and saving
- Smooth transitions using Framer Motion

#### Assignment System Updates

**Submissions Table Integration**
- Refactored [Assignments](src/assets/pages/Assignments.jsx) component
- Changed from `assignment_submissions` to `submissions` table
- Simplified database queries
- Better data structure for tracking student work

#### Authentication & Routing

**Enhanced App Component** ([App.jsx](src/App.jsx))
- Integrated LoadingProvider for global loading states
- Enhanced navigation with user profile display
- Improved route protection logic
- Added conditional Worlds navigation (visible to all authenticated users)
- Student-specific assignment routing
- Cleaner sign-out flow with navigation

**Removed Legacy Components**
- Deprecated old Login and Signup components
- Removed Home page legacy code
- Cleaner codebase with reduced technical debt

#### Styling & Design System

**Google Fonts Integration**
- Updated [index.html](index.html) to include Google Fonts
- Better typography across the application
- Consistent font loading

**Framer Motion Integration**
- Added `framer-motion` dependency (v12.26.2)
- Smooth page transitions
- Animated loading states
- Professional micro-interactions throughout the app

**Dark Theme Consistency**
- Unified dark theme across all components
- Glassmorphism effects with `backdrop-blur-md`
- Consistent color palette:
  - Background: `bg-black/40` for glass panels
  - Borders: `border-white/10` for subtle separation
  - Text: `text-white/60` for secondary text
  - Accents: Gradient colors for branding

#### Performance & Technical Improvements

**Dependency Updates**
- React upgraded to v19.1.1
- Three.js updated to v0.180.0
- Vite updated to v7.1.7
- All major dependencies on latest stable versions

**Code Quality**
- Better TypeScript integration for component files
- Improved component organization
- Cleaner state management patterns
- Enhanced error handling

### Migration Notes

**Breaking Changes:**
- Database: `assignment_submissions` → `submissions` table
- Components: Old auth components removed, use new Login/Signup

**Upgrade Path:**
1. Run database migration to rename/create `submissions` table
2. Update environment variables if needed
3. Clear browser localStorage for clean state
4. Reinstall dependencies: `npm install`
5. Rebuild project: `npm run build`

---

### January 2026 - Voices Panel & Per-World Settings Update

#### Per-World Voice Settings

**New Feature:** Each 3D world now has independent voice/music settings.

**Files Modified:**
- [WorldsSettings.tsx](src/assets/pages/teacher/WorldsSettings.tsx) - Added world selector dropdown
- [teacherApi.js](src/lib/teacherApi.js) - Updated API functions for world_id parameter
- [useVoicesStore.js](src/store/useVoicesStore.js) - Added worldId to state management
- [VoicesPanel.tsx](src/components/Voices/VoicesPanel.tsx) - Added worldId prop
- [World1.tsx](src/components/Worlds/World1.tsx) - Passes worldId="world1"
- [World2.tsx](src/components/Worlds/World2.tsx) - Passes worldId="world2"

**Teacher Dashboard Changes:**
- World selector dropdown at top of settings panel
- Settings persist per-world to database
- Each world can have different genre, style, mood, BPM, and custom prompt

**Database Changes:**
- Added `world_id` column to `voice_settings` table
- Changed unique constraint from `school_id` to `(school_id, world_id)`

#### Audio Timing Fix (BPM-Synchronized Playback)

**Problem Solved:** Stems now play on beat and merge seamlessly based on BPM.

**Implementation:**
- Bar boundary quantization for stem switching
- All stems start synchronized at transport position 0
- Voice switches queued for next bar boundary
- Uses Tone.js Transport for precise timing

**Key Functions in useVoicesStore.js:**
```javascript
// Calculate time to next bar boundary
_getTimeToNextBoundary: (bars = 1) => {
  const { bpm } = get();
  const beatsPerBar = 4;
  const secondsPerBar = (60 / bpm) * beatsPerBar;
  const currentTime = Tone.Transport.seconds;
  const currentBar = Math.floor(currentTime / secondsPerBar);
  const nextBarTime = (currentBar + bars) * secondsPerBar;
  return Math.max(0.01, nextBarTime - currentTime);
}

// Schedule stop at next bar for seamless transitions
selectVoice: (category, voiceName) => {
  // ... if switching voices, schedule stop at bar boundary
  const timeToNextBar = get()._getTimeToNextBoundary(1);
  currentPlayer.stop(`+${timeToNextBar}`);
}
```

#### Kid-Friendly Music Generation Prompt

**New Prompt Template:** Updated `buildPrompt()` in voicesApi.js with comprehensive kid-friendly template.

**Template Features:**
- Designed for children aged 5-12
- Teaches rhythm through listening and movement
- No vocals, lyrics, or chanting
- Simple, repetitive rhythmic patterns
- Clean and warm audio mix
- Genre-appropriate instrumentation

**Dynamic Variables:**
- `{genre}` - Teacher-selected genre
- `{bpm}` - Teacher-selected tempo
- `{style}` - Teacher-selected style
- `{mood}` - Teacher-selected mood
- `{customPrompt}` - Additional teacher instructions

#### Session Storage Caching

**Per-World Caching:**
- Cache keys now include worldId: `djembe_voices_stems_${worldId}`
- Each world's stems cached independently
- Improved performance on world switching

---

### January 24, 2026 - Critical Fixes

#### 504 Timeout Fix for Stem Separation

**Problem:** Vercel serverless functions have a 10-second timeout (free tier) or 60-second timeout (Pro). MVSEP stem separation takes 1-3 minutes, causing 504 Gateway Timeout errors.

**Solution:** Split into two endpoints with client-side polling:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OLD (Broken) Approach                            │
├─────────────────────────────────────────────────────────────────────┤
│  Client ──POST /api/separate──▶ Server waits 2 mins ──▶ 504 TIMEOUT │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    NEW (Working) Approach                           │
├─────────────────────────────────────────────────────────────────────┤
│  Client ──POST /api/separate──▶ Server returns hash (fast!)         │
│  Client ──GET /api/separate-status?hash=xxx──▶ "processing"         │
│  Client ──GET /api/separate-status?hash=xxx──▶ "processing"         │
│  ... (polls every 3 seconds) ...                                    │
│  Client ──GET /api/separate-status?hash=xxx──▶ "done" + stems       │
└─────────────────────────────────────────────────────────────────────┘
```

**Files Changed:**
- `api/separate.ts` - Now only starts the job and returns hash
- `api/separate-status.ts` - New endpoint for checking job status
- `src/lib/voicesApi.js` - Client polls for completion

#### Suno API Genre Fix

**Problem:** Music was always generating as "boom bap" regardless of teacher's genre selection.

**Cause:** Suno API ignores long prompts when using `customMode: true`. It prioritizes the `style` field for genre direction.

**Solution:** Now sending both `style` (tags) and `gpt_description_prompt` (detailed instructions):

```javascript
// OLD (Broken)
body: JSON.stringify({
  prompt: longDetailedPrompt,  // ← Suno ignores this!
  customMode: true,
  instrumental: true,
})

// NEW (Working)
body: JSON.stringify({
  style: "jazz, relaxed, calm, 100 bpm, instrumental, kid-friendly",  // ← Suno uses this!
  gpt_description_prompt: longDetailedPrompt,  // ← Additional context
  title: "jazz calm rhythm - 100bpm",
  customMode: true,
  instrumental: true,
})
```

**Result:** Music now correctly matches teacher's genre selection (jazz, rock, afrobeat, etc.)

#### CORS Audio Proxy Fix

**Problem:** DAW loops from external sources (Suno CDN, musicfile.api.box) were blocked by CORS policy, causing "Failed to initialize audio" errors.

**Solution:**
1. Updated `api/proxy-audio.ts` to allow more domains
2. Updated `useStore.js` to automatically proxy external URLs

**Allowed Domains:**
```javascript
const allowedDomains = [
  "https://mvsep.com/",
  "https://musicfile.api.box/",
  "https://cdn.suno.ai/",
  "https://cdn1.suno.ai/",
  "https://cdn2.suno.ai/",
];
```

**How It Works:**
```javascript
// In useStore.js - loadLoops()
const proxyUrlIfNeeded = (url) => {
  const needsProxy = ["musicfile.api.box", "cdn.suno.ai", "mvsep.com"];
  const urlNeedsProxy = needsProxy.some(domain => url.includes(domain));

  if (urlNeedsProxy) {
    return `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// External URL → Proxied through our server → No CORS issues
```

#### Environment Variables Update

**Required for Production:**
```env
# Supabase (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Suno API (required for music generation)
VITE_SUNO_API_KEY=your_suno_api_key

# MVSEP (required for stem separation - server-side only)
MVSEP_API_KEY=your_mvsep_api_key
```

**Important:** Never commit `.env` to git! Add to `.gitignore`:
```
.env
.env.*
!.env.example
```

#### Supabase URL Configuration

**Problem:** Email confirmation links were redirecting to `localhost:3000` instead of deployed URL.

**Solution:** Update Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** Add `https://your-app.vercel.app/**`

---

#### Migration Steps for This Update

1. **Database Migration:**
   ```sql
   ALTER TABLE voice_settings ADD COLUMN IF NOT EXISTS world_id VARCHAR(50) NOT NULL DEFAULT 'world1';
   ALTER TABLE voice_settings DROP CONSTRAINT IF EXISTS voice_settings_school_id_key;
   ALTER TABLE voice_settings ADD CONSTRAINT voice_settings_school_world_unique UNIQUE(school_id, world_id);
   ```

2. **Clear Session Storage:** Old cached stems will be refreshed automatically with new world-specific keys.

3. **Environment Variables:** Add if not present:
   ```env
   MVSEP_API_KEY=your_mvsep_api_key
   ```

4. **Supabase URL Configuration:** Update redirect URLs in Supabase Dashboard.

---

**Documentation Version:** 2.2
**Last Updated:** January 24, 2026
**Maintained by:** Development Team
