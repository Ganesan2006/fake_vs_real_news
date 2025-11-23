# How to Debug Content & YouTube Issues

## Quick Start

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or right-click → Inspect)
2. Go to the Console tab
3. Click on a topic to load content
4. Look for these log patterns:

**✅ Success Flow:**
```
=== TOPIC CONTENT LOADING STARTED ===
Checking for cached content...
⟳ Generating new content with AI...
✓ Generated content response: {...}
Content structure: {
  hasYoutubeVideos: true,
  youtubeVideosCount: 3
}
=== TOPIC CONTENT LOADING COMPLETED ===
```

**❌ Error Flow:**
```
=== TOPIC CONTENT LOADING STARTED ===
=== TOPIC CONTENT LOADING FAILED ===
Error details: {...}
```

### Step 2: Check Supabase Backend Logs

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Edge Functions → `server`
4. Click on "Logs" tab
5. Look for your topic request

**✅ Success Flow:**
```
=== GENERATE TOPIC CONTENT ENDPOINT CALLED ===
📝 Request details: {...}
🤖 Calling Hugging Face API to generate content...
✓ Hugging Face response received
✓ Content parsed successfully
🎥 Processing YouTube search queries...
✓ Created 3 YouTube video entries
✓ Content cached successfully
=== TOPIC CONTENT GENERATION COMPLETED ===
```

## Common Issues & Quick Fixes

### Issue 1: "No YouTube videos available"

**What you'll see:**
- Content loads successfully
- All other sections show (Explanation, Key Points, etc.)
- YouTube section shows empty state message

**Debug Steps:**

1. **Check Frontend Console:**
   ```
   Content structure: {
     hasYoutubeVideos: false,  // ← Problem!
     youtubeVideosCount: 0
   }
   ```

2. **Check Backend Logs:**
   Look for:
   ```
   🎥 Processing YouTube search queries...
   YouTube search queries: []  // ← Empty array!
   ```
   or
   ```
   ⚠️  No YouTube search queries in generated content, creating defaults...
   ✓ Created 3 YouTube video entries
   ```

3. **Solution:**
   - If you see the warning and "Created X entries", videos SHOULD show
   - If they don't, the cached content might be old
   - Try clicking a different topic, then come back
   - Or refresh the page

### Issue 2: Content Not Loading

**What you'll see:**
- Loading spinner forever
- Error toast message
- Console shows error

**Debug Steps:**

1. **Check Console for Error:**
   ```
   Error details: {...}
   Error message: "Failed to load topic content"
   ```

2. **Check Backend Logs for:**
   - `❌ Unauthorized request` → You're not logged in
   - `❌ Hugging Face token not configured` → Token missing
   - `❌ Hugging Face API error` → API issue
   - `❌ Failed to parse JSON` → AI returned invalid format

3. **Solutions:**
   - **Unauthorized**: Sign out and sign back in
   - **Token missing**: Check Supabase secrets have `HF_TOKEN`
   - **API error**: Wait a moment and try again (rate limits)
   - **Parse error**: System should recover, but if not, try different topic

### Issue 3: Only Cached Content Shows

**What you'll see:**
- Same content for different topics
- Content never updates
- Old structure (missing new features)

**Debug Steps:**

1. **Check Console:**
   ```
   ✓ Using cached content
   ```
   This is normal! Caching saves time and API costs.

2. **To Force Regeneration:**
   - Backend caches at: `topic-content:{userId}:{moduleId}:{topic}`
   - Changing any of these creates new cache entry
   - Currently no UI to clear cache

3. **Workaround:**
   - Edit the module (if you're testing)
   - Or wait for content to expire (no TTL set currently)

## Using the Debug Panel (Optional)

We've created a visual debug panel component you can add to help troubleshoot.

### To Enable:

1. **Edit `/components/CoursePageEnhanced.tsx`:**

Add at the top:
```typescript
import { DebugPanel, useDebugLogger } from './DebugPanel';
```

Add at the start of the component:
```typescript
const debug = useDebugLogger();
```

Replace console.log calls with:
```typescript
debug.info('Message here', { data });
debug.success('Success message');
debug.warning('Warning message');
debug.error('Error message');
```

Add at the end of the return statement (before the final `</div>`):
```typescript
<DebugPanel logs={debug.logs} onClear={debug.clear} />
```

### Features:
- ✅ Floating debug button in bottom-right
- ✅ Shows count of logs
- ✅ Expandable panel with all logs
- ✅ Color-coded by severity
- ✅ Click log to see detailed data
- ✅ Copy individual logs or all logs
- ✅ Clear logs button

## What to Share When Asking for Help

When reporting an issue, please provide:

### 1. Frontend Console Logs
```
=== TOPIC CONTENT LOADING STARTED ===
[Copy everything from here]
...
=== TOPIC CONTENT LOADING COMPLETED ===
[To here]
```

### 2. Backend Logs
```
=== GENERATE TOPIC CONTENT ENDPOINT CALLED ===
[Copy everything from here]
...
=== TOPIC CONTENT GENERATION COMPLETED ===
[To here]
```

### 3. Context
- Which topic caused the issue?
- Which module?
- What did you expect to see?
- What did you actually see?
- Screenshots if helpful

## Advanced Debugging

### Check Network Requests

1. Open DevTools → Network tab
2. Filter to "Fetch/XHR"
3. Click a topic
4. Look for these requests:

**GET `/topic-content/[moduleId]/[topic]`**
- This checks for cached content
- Response: `{ content: {...} }` or `{ content: null }`

**POST `/generate-topic-content`**
- This generates new content
- Request body: `{ moduleId, moduleTitle, topic, difficulty, targetGoal }`
- Response: `{ content: {...} }` or `{ error: "..." }`

5. Click on the request
6. Go to "Response" tab
7. Verify the structure

### Expected Content Structure

The response should look like:
```json
{
  "content": {
    "explanation": "Detailed text here...",
    "keyPoints": [
      "Point 1",
      "Point 2",
      "Point 3",
      "Point 4",
      "Point 5"
    ],
    "applications": [
      "Application 1",
      "Application 2",
      "Application 3"
    ],
    "pitfalls": [
      "Pitfall 1",
      "Pitfall 2",
      "Pitfall 3"
    ],
    "practiceIdeas": [
      "Idea 1",
      "Idea 2",
      "Idea 3"
    ],
    "youtubeVideos": [
      {
        "title": "Search query 1",
        "searchUrl": "https://www.youtube.com/results?search_query=...",
        "embedQuery": "Search query 1"
      },
      {
        "title": "Search query 2",
        "searchUrl": "https://www.youtube.com/results?search_query=...",
        "embedQuery": "Search query 2"
      },
      {
        "title": "Search query 3",
        "searchUrl": "https://www.youtube.com/results?search_query=...",
        "embedQuery": "Search query 3"
      }
    ],
    "topic": "Topic name",
    "moduleId": "module-id",
    "moduleTitle": "Module title",
    "difficulty": "beginner",
    "generatedAt": "2025-11-02T..."
  }
}
```

### YouTube Video Structure

Each video object should have:
```json
{
  "title": "Python Lists tutorial beginner",
  "searchUrl": "https://www.youtube.com/results?search_query=Python%20Lists%20tutorial%20beginner",
  "embedQuery": "Python Lists tutorial beginner"
}
```

When clicked, it opens YouTube search results in a new tab.

## Testing Checklist

Before reporting an issue, verify:

- [ ] I'm logged in to the platform
- [ ] I have a profile created (completed onboarding)
- [ ] I have a roadmap generated
- [ ] I clicked on a module
- [ ] I clicked on a topic
- [ ] I waited at least 15 seconds for loading
- [ ] I checked the browser console for errors
- [ ] I checked Supabase function logs
- [ ] I tried a different topic
- [ ] I tried refreshing the page

## Quick Reference: Log Emoji Meanings

Backend logs use emojis for quick scanning:

- `=== ... ===` - Major section dividers
- `📝` - Request information
- `✓` - Success
- `❌` - Error/Failure
- `⚠️` - Warning
- `🤖` - AI/Hugging Face related
- `📄` - AI response data
- `🧹` - Data cleaning/processing
- `🎥` - YouTube video processing
- `📦` - Final packaged data
- `⟳` - Loading/Generating

Frontend logs use:
- `===` - Major sections
- `✓` - Success
- `❌` - Error

## Tips for Efficient Debugging

1. **Keep Console Open:** Always have DevTools open when testing
2. **Clear Console:** Use `console.clear()` or Ctrl+L to start fresh
3. **Filter Logs:** Use the filter box to search for specific terms
4. **Preserve Log:** Enable "Preserve log" in DevTools settings
5. **Check Both:** Always check both frontend AND backend logs
6. **Copy Early:** Copy logs as soon as you see an issue
7. **Screenshot:** Screenshots help, but logs are better

## Known Limitations

1. **No Cache Clear UI:** Currently can't clear cached content from UI
2. **No Retry Button:** Must click topic again to retry
3. **Rate Limits:** Hugging Face free tier has limits
4. **Long Loading:** AI can take 10-20 seconds to generate
5. **JSON Parsing:** AI might not always return perfect JSON

## Getting Better Logs

The enhanced logging system now shows:

✅ Every major step in the process
✅ Data structure at each step  
✅ Exactly what the AI returned
✅ How data was parsed
✅ What was cached
✅ What went wrong if there's an error

This makes it much easier to identify where in the pipeline the issue occurs.

## Summary

**Most common issue:** YouTube videos not showing
**Most common cause:** AI didn't generate search queries
**Automatic fix:** System creates default queries
**If still broken:** Check logs for specific error

**Remember:** The system is now much more verbose with logging. Use that to your advantage! The logs will tell you exactly what's happening at each step.
