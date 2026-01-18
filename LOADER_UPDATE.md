# 🎨 CubeLoader Dark Theme Update

## ✨ What Changed

The loading screen now matches your dark aesthetic!

---

## 📁 New File

**[src/components/ui/cube-loader-dark.tsx](src/components/ui/cube-loader-dark.tsx)**

A dark-themed version of your 3D cube loader with:
- ☁️ **CloudShader background** (matching all other pages)
- 🌑 **Black background** with gradient overlays
- ⚪ **White/glass cube** with glowing edges
- ✨ **Animated dots** below the text
- 💫 **White core glow** (instead of yellow)

---

## 🎨 Design Features

### Background
```tsx
- CloudShader animated background (opacity 30%)
- Black base color
- Radial gradient overlay for depth
- Dark gradient layers
```

### 3D Cube
```tsx
- White/glass transparent faces (bg-white/10)
- White borders with varying opacity (20-40%)
- White glow shadows
- Slower, more elegant rotation (8s vs 6s)
- Subtle breathing animation
```

### Core
```tsx
- White glowing sphere center
- Soft white shadow (0_0_40px_rgba(255,255,255,0.6))
- Pulse animation with glow effect
```

### Text
```tsx
- White text (instead of purple)
- White/60 subtext
- Text shadow with glow effect
- Animated bouncing dots
```

---

## 🎭 Visual Comparison

### Old (Light Theme)
```
Background: Sky blue gradient
Cube: Cyan/Pink/Yellow colors
Core: Yellow glow
Text: Purple
Shadow: Purple
```

### New (Dark Theme)
```
Background: Black + CloudShader
Cube: White/glass with glow
Core: White glow
Text: White
Shadow: White/subtle
+ Animated dots
```

---

## 💾 Updated Files

1. **[src/components/ui/cube-loader-dark.tsx](src/components/ui/cube-loader-dark.tsx)** - New dark loader
2. **[src/App.jsx](src/App.jsx)** - Updated to use dark loader

### Changes in App.jsx

**Before:**
```jsx
import CubeLoader from './components/ui/cube-loader';

<div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm">
  <CubeLoader
    message="Loading"
    subMessage="Taking you somewhere awesome!"
    className="min-h-screen"
  />
</div>
```

**After:**
```jsx
import CubeLoaderDark from './components/ui/cube-loader-dark';

<div className="fixed inset-0 z-[9999]">
  <CubeLoaderDark
    message="Loading"
    subMessage="Taking you somewhere awesome!"
  />
</div>
```

---

## 🎨 Customization Options

### Change Cube Colors

In [cube-loader-dark.tsx](src/components/ui/cube-loader-dark.tsx):

```tsx
// More opaque cube
bg-white/20  // Instead of bg-white/10

// Brighter borders
border-white/50  // Instead of border-white/30

// Stronger glow
shadow-[0_0_30px_rgba(255,255,255,0.5)]
```

### Change Animation Speed

```tsx
// Faster rotation
.animate-cube-spin {
  animation: cubeSpin 5s linear infinite;  // 5s instead of 8s
}

// Faster breathing
@keyframes breathe {
  // Adjust timing
}
```

### Change Background

```tsx
// Faster clouds
<CloudShader speed={0.5} />  // Instead of 0.3

// More visible clouds
className="w-full h-full opacity-50"  // Instead of opacity-30
```

### Add Color Accent

```tsx
// Tint the cube with color
bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]
```

---

## 🔄 To Use Old Loader

Edit [App.jsx](src/App.jsx):

```jsx
// Change back to:
import CubeLoader from './components/ui/cube-loader';

<div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm">
  <CubeLoader
    message="Loading"
    subMessage="Taking you somewhere awesome!"
    className="min-h-screen"
  />
</div>
```

---

## ✨ Special Features

### Animated Dots
Three bouncing dots appear below the text with staggered animation:

```jsx
<div className="flex gap-1 mt-4">
  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-0"></div>
  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-1"></div>
  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-2"></div>
</div>
```

### Layered Background
Multiple overlays for depth:
1. CloudShader base
2. Gradient overlay (black 70% to 80%)
3. Radial gradient for vignette effect

### Glowing Text
Text has a subtle glow shadow:
```tsx
drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]
```

---

## 🎯 Animation Timings

| Element | Duration | Easing |
|---------|----------|--------|
| Cube Rotation | 8s | linear |
| Face Breathing | 3s | ease-in-out |
| Core Pulse | 2s | ease-in-out |
| Shadow Breathing | 3s | ease-in-out |
| Dot Bounce | 1.4s | ease-in-out |

---

## 📊 Performance

**Same as original loader:**
- Uses CSS animations (GPU accelerated)
- 3D transforms with hardware acceleration
- CloudShader adds ~5-10% CPU (same as other pages)
- Optimized for smooth 60fps

---

## 🎨 Color Palette

```css
Background: #000000 (Black)
Cube Faces: rgba(255,255,255,0.1-0.15)
Borders: rgba(255,255,255,0.2-0.4)
Core: #FFFFFF with glow
Text Primary: #FFFFFF
Text Secondary: rgba(255,255,255,0.6)
Shadow: rgba(255,255,255,0.2)
Dots: rgba(255,255,255,0.6)
```

---

## ✅ Matches Platform Aesthetic

The dark loader now matches:
- ✅ Login page
- ✅ Signup page
- ✅ Home page
- ✅ Assignments page
- ✅ World 1
- ✅ World 2
- ✅ Navigation bar

**Everything is now consistently dark with CloudShader! 🎉**

---

## 🚀 Try It

The loader appears when:
1. App is initializing
2. Navigating between protected routes
3. Any loading state triggered by LoadingContext

**You can trigger it by refreshing the page or navigating between routes!**

---

**Your entire platform now has a cohesive, professional dark aesthetic from start to finish! 🌑✨**
