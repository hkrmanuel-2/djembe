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
│   │   └── utils.ts               # General utilities
│   │
│   ├── store/                     # Zustand stores
│   │   ├── useAuthStore.js        # Authentication state
│   │   └── useStore.js            # DAW state management
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

**Documentation Version:** 2.0
**Last Updated:** January 19, 2026
**Maintained by:** Development Team
