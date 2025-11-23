# Debugging Content & YouTube Video Issues

## Overview
This guide helps you debug issues with AI-generated content and YouTube videos not displaying in the Learning Mentor Platform.

## Enhanced Logging

We've added comprehensive logging throughout the content generation pipeline:

### Frontend Logging (CoursePageEnhanced.tsx)
When you click on a topic, check the browser console for:

```
=== TOPIC CONTENT LOADING STARTED ===
Checking for cached content...
Module ID: [module-id]
Topic: [topic-name]
```

Then you'll see either:
- **Cached content found**: `✓ Using cached content`
- **Generating new**: `⟳ Generating new content with AI...`

After loading, you'll see a detailed content structure:
```
Content structure: {
  hasExplanation: true/false,
  hasKeyPoints: true/false,
  keyPointsCount: X,
  hasApplications: true/false,
  applicationsCount: X,
  hasYoutubeVideos: true/false,
  youtubeVideosCount: X
}
```

### Backend Logging (Supabase Functions)
Check your Supabase Function logs for:

```
=== GENERATE TOPIC CONTENT ENDPOINT CALLED ===
📝 Request details: { moduleId, topic, ... }
```

Then look for:
- `✓ Returning cached content` - Content was cached
- `🤖 Calling Hugging Face API` - Generating new content
- `✓ Hugging Face response received` - AI responded
- `📄 Raw AI response` - Shows what the AI returned
- `🧹 Cleaned response` - After removing markdown
- `✓ Content parsed successfully` - JSON parsing worked
- `🎥 Processing YouTube search queries` - Creating video links
- `✓ Created X YouTube video entries` - Video links created
- `✓ Content cached successfully` - Saved to database

## Common Issues & Solutions

### Issue 1: YouTube Videos Not Showing

**Symptoms:**
- Content loads but YouTube section shows "No YouTube videos available"
- Console shows `youtubeVideosCount: 0`

**Debugging Steps:**

1. **Check Backend Logs**
   - Go to Supabase Dashboard → Edge Functions → server logs
   - Look for: `🎥 Processing YouTube search queries...`
   - Check: `YouTube search queries: [...]`

2. **Possible Causes:**
   - AI didn't generate `youtubeSearchQueries` in response
   - JSON parsing failed before reaching YouTube section
   - KV store caching old content without videos

3. **Solutions:**

   **Solution A: Clear the cache**
   ```typescript
   // In Supabase SQL Editor, run:
   // This clears all topic content cache
   // (Note: KV store doesn't have SQL access, need to regenerate)
   ```
   - Delete the topic content by clicking on the topic again
   - The system will regenerate with new structure

   **Solution B: Check AI response format**
   - Look in backend logs for `📄 Raw AI response`
   - Verify it contains `"youtubeSearchQueries": [...]`
   - If missing, the AI model might need better prompting

   **Solution C: Default fallback is working**
   - Check backend logs for: `⚠️  No YouTube search queries in generated content, creating defaults...`
   - System should create 3 default queries based on topic
   - If you see `✓ Created X YouTube video entries` where X > 0, videos are being created

### Issue 2: Content Not Loading At All

**Symptoms:**
- Loading spinner shows indefinitely
- Error toast appears
- Console shows error messages

**Debugging Steps:**

1. **Check Authentication**
   - Look for: `❌ Unauthorized request`
   - Ensure you're logged in
   - Check access token is valid

2. **Check HF Token**
   - Look for: `❌ Hugging Face token not configured`
   - Verify `HF_TOKEN` is set in Supabase secrets
   - Current token: `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`

3. **Check API Response**
   - Look for: `❌ Hugging Face API error:`
   - Could be rate limiting, invalid token, or model issue
   - Check Hugging Face status: https://status.huggingface.co/

4. **Check JSON Parsing**
   - Look for: `❌ Failed to parse JSON:`
   - The AI might be returning invalid JSON
   - Check the "Full cleaned response" in logs

### Issue 3: Partial Content Missing

**Symptoms:**
- Explanation shows but no key points
- Some sections empty

**Debugging Steps:**

1. **Check Content Structure in Logs**
   ```
   📦 Final content structure: {
     hasExplanation: true,
     keyPointsCount: 0,  // ← Problem here
     ...
   }
   ```

2. **Look for Warnings**
   - `⚠️  Warning: No keyPoints in generated content`
   - `⚠️  Warning: No applications in generated content`
   - These indicate the AI didn't generate that section

3. **Solutions:**
   - System adds fallback content: `["Content generation incomplete. Please try again."]`
   - Try regenerating by clicking the topic again
   - Clear browser cache and KV store cache

### Issue 4: Old Content Stuck in Cache

**Symptoms:**
- Content never updates
- Same content shows for different topics
- Generated content doesn't match current AI model

**Solution:**
The system caches content at: `topic-content:{userId}:{moduleId}:{topic}`

To force regeneration:
1. Change the topic name slightly (this changes the cache key)
2. Or wait for a backend update that clears the cache
3. Or manually delete from KV store (requires Supabase dashboard access)

## Step-by-Step Debugging Process

### When YouTube Videos Don't Show:

1. **Open Browser Console** (F12 → Console tab)

2. **Click on a topic** and watch for logs:
   ```
   === TOPIC CONTENT LOADING STARTED ===
   ```

3. **Check the content structure output:**
   ```
   Content structure: {
     hasYoutubeVideos: false,  // ← This is the issue
     youtubeVideosCount: 0
   }
   ```

4. **Go to Supabase Dashboard:**
   - Projects → Your Project → Edge Functions → server
   - Click "Logs" tab
   - Filter to recent requests

5. **Find your topic generation request:**
   - Look for: `=== GENERATE TOPIC CONTENT ENDPOINT CALLED ===`
   - Follow the logs through the process

6. **Check YouTube processing:**
   - Look for: `🎥 Processing YouTube search queries...`
   - Check: `YouTube search queries: [...]`
   - Should see: `✓ Created X YouTube video entries`

7. **If "No YouTube search queries" warning:**
   - Should see: `⚠️  No YouTube search queries in generated content, creating defaults...`
   - System creates 3 default queries
   - Check if they were created successfully

8. **Verify final structure:**
   ```
   📦 Final content structure: {
     youtubeVideosCount: 3  // ← Should be > 0
   }
   ```

### Expected Successful Flow:

```
FRONTEND:
=== TOPIC CONTENT LOADING STARTED ===
⟳ Generating new content with AI...
Request data: { moduleId, topic, ... }

BACKEND:
=== GENERATE TOPIC CONTENT ENDPOINT CALLED ===
📝 Request details: { ... }
🤖 Calling Hugging Face API to generate content...
✓ Hugging Face response received
📄 Raw AI response (first 500 chars): { ... }
🧹 Cleaned response (first 500 chars): { ... }
✓ Content parsed successfully
Parsed content keys: ["explanation", "keyPoints", ...]
🎥 Processing YouTube search queries...
YouTube search queries: ["query 1", "query 2", "query 3"]
✓ Created YouTube video entry: { title, searchUrl }
✓ Created YouTube video entry: { title, searchUrl }
✓ Created YouTube video entry: { title, searchUrl }
✓ Created 3 YouTube video entries
📦 Final content structure: {
  hasExplanation: true,
  keyPointsCount: 5,
  youtubeVideosCount: 3
}
✓ Content cached successfully
=== TOPIC CONTENT GENERATION COMPLETED ===

FRONTEND:
✓ Generated content response: { content: { ... } }
Content structure: {
  hasYoutubeVideos: true,
  youtubeVideosCount: 3
}
YouTube Videos: [{ title, searchUrl, embedQuery }, ...]
=== TOPIC CONTENT LOADING COMPLETED ===
```

## Testing Checklist

- [ ] Can see topic list on Overview tab
- [ ] Clicking a topic switches to Content tab
- [ ] Loading spinner appears
- [ ] Content loads within 10-15 seconds
- [ ] Explanation section shows text
- [ ] Key Points section shows 3+ points
- [ ] Applications section shows items
- [ ] Pitfalls section shows items
- [ ] Practice Ideas section shows items
- [ ] YouTube Videos section shows videos
- [ ] Can click "Watch" to open YouTube search
- [ ] Can mark topic as complete
- [ ] Progress updates correctly

## Getting Help

If issues persist:

1. **Copy Frontend Console Logs:**
   - Filter to show only your app's logs
   - Copy everything from `=== TOPIC CONTENT LOADING STARTED ===` to `=== COMPLETED ===`

2. **Copy Backend Logs:**
   - Go to Supabase → Edge Functions → server → Logs
   - Copy logs from the same time period

3. **Provide:**
   - Topic name that failed
   - Module name
   - What you expected vs. what you got
   - Both frontend and backend logs

## Quick Fixes

### Fix 1: Refresh Content Generation
```typescript
// The system now has better fallbacks:
// - If no YouTube queries, creates defaults based on topic
// - If parsing fails, provides helpful error messages
// - If sections missing, adds placeholder content
```

### Fix 2: Check Hugging Face Token
```bash
# In Supabase Dashboard → Settings → Edge Functions → Secrets
# Verify HF_TOKEN = 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
```

### Fix 3: Monitor Rate Limits
Hugging Face free tier has rate limits. If getting errors:
- Wait a few minutes
- Try again
- System will show specific error messages

## Advanced Debugging

### Check Network Tab

1. Open DevTools → Network tab
2. Filter to "Fetch/XHR"
3. Click a topic
4. Look for requests to:
   - `/topic-content/...` (check cache)
   - `/generate-topic-content` (generate new)
5. Click on the request → Response tab
6. Verify the response structure

### Inspect KV Store

Unfortunately, KV store doesn't have a UI. Content is stored at:
- Key pattern: `topic-content:{userId}:{moduleId}:{topic}`
- To clear: Must regenerate or update backend to clear

### Test HF API Directly

```bash
curl https://router.huggingface.co/v1/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-4-Scout-17B-16E-Instruct:groq",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 100
  }'
```

Should return valid JSON response.

## System Improvements Made

1. ✅ **Enhanced Frontend Logging**: Detailed console output for debugging
2. ✅ **Enhanced Backend Logging**: Comprehensive logs with emojis for easy scanning
3. ✅ **Better Error Handling**: Specific error messages for each failure point
4. ✅ **Fallback YouTube Videos**: Creates defaults if AI doesn't provide queries
5. ✅ **JSON Parsing Improvements**: Multiple attempts to extract valid JSON
6. ✅ **Content Validation**: Checks all required fields and provides fallbacks
7. ✅ **Better Visual Feedback**: Shows "No videos" message instead of hiding section
8. ✅ **Detailed Structure Logging**: Shows exactly what data is present/missing

## Next Steps

After following this guide:

1. Deploy the updated backend to Supabase
2. Refresh your application
3. Click on a topic
4. Watch the console logs
5. Follow the logging flow
6. Identify exactly where the issue occurs
7. Share the specific logs for targeted help
