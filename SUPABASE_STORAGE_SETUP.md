# Supabase Storage Setup for Assignment Submissions

## Quick Setup (5 minutes)

### 1. Create Storage Bucket

1. Go to your **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name:** `assignment-submissions`
   - **Public bucket:** ✅ **YES** (check this box - allows public access to files)
   - **File size limit:** 10 MB (or your preferred limit)
   - **Allowed MIME types:** Leave empty to allow all types, OR specify:
     - `image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*`
4. Click **"Create bucket"**

### 2. Set Up Storage Policies (RLS)

Go to **Supabase Dashboard** → **Storage** → Click on `assignment-submissions` bucket → **Policies** tab

Click **"New Policy"** and create these policies:

#### Policy 1: Allow authenticated users to upload (Simplified)
**Policy Name:** `Allow authenticated uploads`  
**Allowed Operations:** ✅ INSERT  
**Policy Definition:**
```sql
bucket_id = 'assignment-submissions'
```

#### Policy 2: Allow authenticated users to view files
**Policy Name:** `Allow authenticated downloads`  
**Allowed Operations:** ✅ SELECT  
**Policy Definition:**
```sql
bucket_id = 'assignment-submissions'
```

#### Alternative: Make it fully public (Easiest for testing)
If you want to skip policies entirely, you can make the bucket fully public:
- Go to **Storage** → `assignment-submissions` bucket
- Click **"Edit bucket"**
- Check **"Public bucket"** ✅
- Save

This allows anyone with the URL to access files, but uploads still require authentication.

### 3. Make Bucket Public (Optional but Recommended)

If you want files to be publicly accessible via URL:
- Go to **Storage** → **Policies**
- The bucket should already be public if you checked "Public bucket" during creation
- If not, you can make individual files public via the code

## That's it! 🎉

The code is already updated to use Supabase Storage. Just create the bucket and you're good to go!

## Benefits of Supabase Storage

✅ **Free tier:** 1GB storage, 2GB bandwidth  
✅ **No external service needed** - everything in one place  
✅ **Integrated with your existing Supabase setup**  
✅ **Simple setup** - no API keys or complex configuration  
✅ **Works immediately** - no waiting for preset propagation  

## File Organization

Files will be stored in this structure:
```
assignment-submissions/
├── student_{studentId}/
│   ├── assignment_{assignmentId}/
│   │   ├── {timestamp}_filename.mp3
│   │   └── {timestamp}_filename.pdf
```
