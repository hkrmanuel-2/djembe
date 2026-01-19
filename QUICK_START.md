# Quick Start Guide - New Sign-In Pages

## 🚀 What's New

Your Djembe app now has beautiful animated login and signup pages with CloudShader backgrounds!

## 🎯 What Changed

### Routes (Automatic)
- `/login` → Now shows [LoginNew.tsx](src/assets/pages/Auth/LoginNew.tsx) with CloudShader
- `/signup` → Now shows [SignupNew.tsx](src/assets/pages/Auth/SignupNew.tsx) with CloudShader

### Old Pages (Still Available)
Your original forms are preserved at:
- `src/assets/pages/Auth/Login.jsx` (old)
- `src/assets/pages/Auth/Signup.jsx` (old)

## ✅ Ready to Use

All dependencies are installed. Just run:

```bash
npm run dev
```

Then visit:
- http://localhost:5173/login
- http://localhost:5173/signup

## 🎨 Key Features

### Login Page
- Email/password authentication
- CloudShader animated background
- "Remember this device" option
- Google sign-in placeholder
- Smooth animations

### Signup Page
- Student/Teacher selection
- School dropdown
- Email domain validation
- First/Last name fields
- CloudShader animated background
- "Remember this device" option
- Google sign-in placeholder

## 🔄 To Revert to Old Design

Edit [src/App.jsx](src/App.jsx) and change:

```jsx
// Current (new design)
import Login from './assets/pages/Auth/LoginNew';
import Signup from './assets/pages/Auth/SignupNew';

// Change to (old design)
import Login from './assets/pages/Auth/Login';
import Signup from './assets/pages/Auth/Signup';
```

## 🎨 Quick Customizations

### Change Background Speed
In [LoginNew.tsx](src/assets/pages/Auth/LoginNew.tsx) or [SignupNew.tsx](src/assets/pages/Auth/SignupNew.tsx):

```tsx
<CloudShader
  speed={0.3}  // Change this (0.1 = slow, 1.0 = fast)
  octaves={5}
  scale={2.5}
  className="w-full h-full opacity-40"
/>
```

### Change Background Opacity
```tsx
className="w-full h-full opacity-40"  // Change opacity-40 to opacity-20, opacity-60, etc.
```

### Change Button Colors
```tsx
// White button → Black button
className="bg-white text-black"
// Change to:
className="bg-black text-white"
```

## 📁 File Structure

```
src/
├── assets/pages/Auth/
│   ├── Login.jsx              (old - preserved)
│   ├── Signup.jsx             (old - preserved)
│   ├── LoginNew.tsx           (new - active) ⭐
│   └── SignupNew.tsx          (new - active) ⭐
├── components/ui/
│   ├── cloud-shader.tsx       (background animation)
│   └── sign-in-flow-1.tsx     (reference component)
└── App.jsx                    (routes updated)
```

## 🧪 Test It

1. Start dev server: `npm run dev`
2. Go to http://localhost:5173/login
3. Try logging in with existing credentials
4. Try navigating to signup page
5. Test responsive design (resize browser)

## 🆘 Issues?

### CloudShader not showing?
- Check browser console for errors
- Try refreshing the page
- Ensure WebGL is enabled in your browser

### Can't login?
- Check Supabase connection
- Verify credentials are correct
- Check browser console for auth errors

### Styling looks off?
- Clear browser cache
- Restart dev server
- Check that Tailwind is running

## 📖 Full Documentation

See [SIGN_IN_INTEGRATION.md](SIGN_IN_INTEGRATION.md) for complete details.

---

**You're all set! Enjoy your new sign-in pages! 🎉**
