# Djembe - Music Education Platform

An interactive music education platform for children aged 5-12 that teaches rhythm through 3D immersive worlds and AI-generated music.

## Features

### 3D Worlds
Students can explore interactive 3D environments:
- **Fireside World** (`world1`) - A cozy campfire setting
- **Auditorium World** (`world2`) - A grand performance space

### Voices Panel
Each world includes a Voices Panel for interactive music:
- AI-generated music stems (rhythm, bass, harmony, melody)
- Beat-synced voice switching using Tone.js
- Per-world settings configured by teachers

### Teacher Dashboard
Teachers can configure music generation settings per world:
- **Genre**: afrobeat, jazz, electronic, hip-hop, classical, rock, reggae, funk, world, ambient
- **Style**: upbeat, relaxed, energetic, chill, intense, groovy, melodic, rhythmic
- **Mood**: happy, calm, intense, dreamy, playful, focused, inspiring, mysterious
- **BPM**: 60-200 (tempo)
- **Custom Prompt**: Additional instructions for music generation

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Audio**: Tone.js for beat-synchronized playback
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Music Generation**: Suno API
- **Stem Separation**: Replicate Demucs

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUNO_API_KEY=your_suno_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

### 3. Database Setup
Run the SQL in `database/voice_settings_setup.sql` in your Supabase SQL editor.

If you have an existing `voice_settings` table, run the migration:
```sql
ALTER TABLE voice_settings ADD COLUMN IF NOT EXISTS world_id VARCHAR(50) NOT NULL DEFAULT 'world1';
ALTER TABLE voice_settings DROP CONSTRAINT IF EXISTS voice_settings_school_id_key;
ALTER TABLE voice_settings ADD CONSTRAINT voice_settings_school_world_unique UNIQUE(school_id, world_id);
```

### 4. Run Development Server
```bash
npm run dev
```

## Project Structure

```
src/
├── assets/pages/
│   ├── teacher/
│   │   └── WorldsSettings.tsx    # Teacher settings for world music
│   └── ...
├── components/
│   ├── Voices/
│   │   ├── VoicesPanel.tsx       # Music control panel in worlds
│   │   ├── VoiceButton.tsx       # Individual voice toggle
│   │   ├── VoiceCategory.tsx     # Category container
│   │   └── VoicesGlobalControls.tsx
│   └── Worlds/
│       ├── World1.tsx            # Fireside World
│       └── World2.tsx            # Auditorium World
├── lib/
│   ├── voicesApi.js              # Suno + Demucs API integration
│   └── teacherApi.js             # Database API functions
├── store/
│   ├── useVoicesStore.js         # Voices state management
│   └── useAuthStore.js           # Auth state management
└── ...

api/
├── separate.ts                   # Stem separation API route
└── ...

database/
└── voice_settings_setup.sql      # Database schema
```

## Music Generation Prompt

The platform generates kid-friendly music using the following template:

```
Create a kid-friendly, instrumental music track for children aged 5-12
that teaches rhythm through listening and movement.

STRICT PARAMETERS:
- Genre: {teacher's selected genre}
- Tempo: {BPM} BPM
- Style: {teacher's selected style}
- Mood: {teacher's selected mood}

Instrumentation:
- Use instruments typical of the selected genre
- Supporting instruments: light percussion
- No vocals, no lyrics, no chanting

Guidelines:
- Child-safe and positive
- Simple, repetitive rhythmic patterns
- Clear rhythmic loop, predictable patterns
- Clean and warm mix
```

## Audio Timing

The Voices system uses BPM-quantized playback:
- All stems start synchronized at transport position 0
- Voice switches are queued for the next bar boundary
- Seamless transitions without audio glitches

## License

Private - All rights reserved
