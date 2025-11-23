# Debug Quick Reference Card

## 🚀 Quick Start

1. Open DevTools (F12) → Console
2. Click on a topic
3. Watch for these logs:

### ✅ Success Pattern:
```
=== TOPIC CONTENT LOADING STARTED ===
⟳ Generating new content with AI...
✓ Generated content response
Content structure: { all true, counts > 0 }
=== COMPLETED ===
```

### ❌ Error Pattern:
```
=== TOPIC CONTENT LOADING STARTED ===
=== TOPIC CONTENT LOADING FAILED ===
Error: [reason]
```

---

## 🔍 What Each Log Means

| Log | Meaning | Status |
|-----|---------|--------|
| `=== STARTED ===` | Process began | 🟡 In progress |
| `✓ Using cached content` | Found in cache, fast load | 🟢 Good |
| `⟳ Generating new content` | Calling AI, will take 10-20s | 🟡 Normal |
| `✓ Generated content response` | AI responded successfully | 🟢 Good |
| `Content structure: {...}` | Shows what data is present | 🔵 Info |
| `youtubeVideosCount: 3` | YouTube videos present | 🟢 Good |
| `youtubeVideosCount: 0` | No YouTube videos | 🔴 Problem |
| `=== COMPLETED ===` | Success! | 🟢 Done |
| `=== FAILED ===` | Error occurred | 🔴 Problem |

---

## 🎯 Issue → Solution Map

### YouTube Videos Not Showing

**See in logs:**
```
Content structure: { youtubeVideosCount: 0 }
```

**Check backend for:**
```
YouTube search queries: []
⚠️  No YouTube search queries, creating defaults...
✓ Created 3 YouTube video entries
```

**If you see warnings + "Created X entries" but still no videos:**
- Old cached content might be shown
- Try a different topic
- Check if content object has `youtubeVideos` array

**Quick fix:** Click a different topic, then come back

---

### Content Won't Load

**See in logs:**
```
=== FAILED ===
Error: [message]
```

**Common causes:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `Unauthorized` | Not logged in | Sign in again |
| `Hugging Face API error` | API issue or rate limit | Wait 1 minute, try again |
| `Failed to parse JSON` | AI response invalid | System should recover, try again |
| `Request failed` | Network issue | Check internet connection |

---

### Some Sections Missing

**See in logs:**
```
Content structure: {
  keyPointsCount: 0,  // ❌
  applicationsCount: 1  // ⚠️  Too few
}
```

**Check backend for:**
```
⚠️  Warning: No keyPoints in generated content
```

**What happens:** System adds fallback: `["Content generation incomplete. Please try again."]`

**Fix:** Regenerate content (clear cache or try different topic)

---

## 📍 Where to Look

### Frontend (Browser Console)
- Shows user-facing flow
- API calls and responses
- Content structure
- What's being displayed

### Backend (Supabase Dashboard)
- Go to: Edge Functions → server → Logs
- Shows AI interaction
- JSON parsing
- YouTube video creation
- What's being cached

**Pro tip:** Check BOTH logs - they show different parts of the process!

---

## 🎬 YouTube Section States

### ✅ Working (Shows videos)
```html
<Card> YouTube Videos
  <Card> Video 1: [Title] [Watch button]
  <Card> Video 2: [Title] [Watch button]
  <Card> Video 3: [Title] [Watch button]
```

**Logs show:**
```
youtubeVideosCount: 3
YouTube Videos: [{...}, {...}, {...}]
```

### ⚠️  Empty (Shows message)
```html
<Card> YouTube Videos
  <div> No YouTube videos available
  <p> Check console for debug info
```

**Logs show:**
```
youtubeVideosCount: 0
```

**Backend should show either:**
- `✓ Created X YouTube video entries` where X > 0, OR
- `⚠️  No YouTube search queries...` with fallback creation

---

## 🏃‍♂️ Quick Tests

### Test 1: Basic Load (30 seconds)
1. Click topic → Wait → Should show content
2. Check: All 6 sections present?
3. Check: YouTube section shows videos?

### Test 2: Cache (5 seconds)  
1. Click same topic again → Should load fast
2. Check: Logs show "Using cached content"?

### Test 3: Different Topic (30 seconds)
1. Click different topic → Should generate new content
2. Check: Content is different?

---

## 🎨 Log Emoji Guide

| Emoji | Meaning |
|-------|---------|
| ✓ | Success |
| ❌ | Error/Failure |
| ⚠️  | Warning |
| 🤖 | AI/Hugging Face |
| 📝 | Request data |
| 📄 | Raw response |
| 🧹 | Cleaned/processed |
| 🎥 | YouTube processing |
| 📦 | Final packaged data |
| ⟳ | Loading/Generating |

---

## 📋 Before Asking for Help

Copy and share:

1. **Frontend logs:**
   ```
   [Copy from === STARTED === to === COMPLETED/FAILED ===]
   ```

2. **Backend logs:**
   ```
   [Copy from === GENERATE TOPIC CONTENT === section]
   ```

3. **Context:**
   - Topic name: _______________
   - Module name: ______________
   - Expected: _________________
   - Got: ______________________

---

## ⚡ Most Common Issues

### #1: YouTube videos don't show
- **Why:** AI didn't generate search queries
- **Fix:** System creates defaults, check backend logs
- **Expected:** Should see "Created 3 entries" in logs

### #2: Content loads forever
- **Why:** API timeout or error
- **Fix:** Check network, wait for rate limits
- **Expected:** Should load in 10-20 seconds max

### #3: Same content for all topics
- **Why:** Caching issue or generation problem
- **Fix:** Try different topics, check if they differ
- **Expected:** Each topic should have unique content

---

## 🔧 Quick Actions

### Clear Console
```javascript
console.clear()
```
Or press Ctrl+L

### Test Backend Health
```bash
curl https://[your-project].supabase.co/functions/v1/make-server-2ba89cfc/health
```
Should return: `{ "status": "ok" }`

### Check If Logged In
```javascript
// In console:
localStorage.getItem('supabase.auth.token')
// Should show token if logged in
```

---

## 📚 Full Documentation

- **Quick Help:** `/HOW_TO_DEBUG.md`
- **Deep Dive:** `/DEBUGGING_CONTENT_ISSUES.md`
- **Testing Guide:** `/TESTING_CONTENT_GENERATION.md`
- **Overview:** `/CONTENT_DEBUG_SUMMARY.md`

---

## ✨ Expected Performance

| Action | Time | Status |
|--------|------|--------|
| First generation | 10-20s | 🟡 Generating |
| Cached load | <1s | 🟢 Fast |
| YouTube videos | 3-5 | 🟢 Normal |
| Key points | 5-7 | 🟢 Normal |
| All sections | 6 | 🟢 Complete |

---

## 🎯 Success Checklist

- [ ] Content generates in <20s
- [ ] All 6 sections show
- [ ] YouTube section has 3+ videos
- [ ] Can click "Watch" button
- [ ] Cache works (2nd load fast)
- [ ] Can mark complete
- [ ] Progress updates
- [ ] Logs are clear

If all checked ✅ = Working perfectly! 🎉

---

## 💡 Pro Tips

1. **Always check both logs** (frontend + backend)
2. **Look for emojis** in backend logs (easy scanning)
3. **Check youtubeVideosCount** first for video issues
4. **Give it time** - first generation takes 10-20s
5. **Try different topics** - some might work better
6. **Copy logs immediately** when you see an issue

---

**Remember:** The logs will tell you EXACTLY what's happening at every step!
