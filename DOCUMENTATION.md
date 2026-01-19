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

- **State Management**: Zustand with persistence middleware
- **Component Architecture**: Functional components with hooks
- **Routing**: React Router with protected routes
- **Audio Processing**: Tone.js for transport, Web Audio API for playback
- **3D Rendering**: Three.js with React Three Fiber

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

Interactive 3D educational environments:
- **World 1**: Low poly forest scene
- **World 2**: Historical scene (Viola Desmond - Roseland Theatre)
- Orbit controls for navigation
- GLTF model loading

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
│   │   │   ├── DAW-Lite/          # DAW-specific components
│   │   │   │   ├── AILoopGenerator.jsx
│   │   │   │   ├── Loopbutton.jsx
│   │   │   │   ├── LoopLibrary.jsx
│   │   │   │   ├── Projectmenu.jsx
│   │   │   │   ├── Timeline.jsx
│   │   │   │   ├── Transportcontrols.jsx
│   │   │   │   ├── Waveform.jsx
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── signup-form.tsx
│   │   │   └── Worlds/            # 3D world components
│   │   │       ├── World1.tsx
│   │   │       └── World2.tsx
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

Interactive 3D educational environments built with Three.js and React Three Fiber.

### World 1: Low Poly Forest

**File:** `src/components/Worlds/World1.tsx`

**Features:**
- Low poly forest scene
- Orbit controls for navigation
- Ambient and directional lighting
- GLTF model loading

**Components:**
- Scene setup
- Camera positioning
- Lighting configuration
- Model loading and positioning
- Orbit controls

### World 2: Viola Desmond - Roseland Theatre

**File:** `src/components/Worlds/World2.tsx`

**Features:**
- Historical scene recreation
- Educational content
- Interactive navigation

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

**Documentation Version:** 1.0  
**Last Updated:** 2024  
**Maintained by:** Development Team
