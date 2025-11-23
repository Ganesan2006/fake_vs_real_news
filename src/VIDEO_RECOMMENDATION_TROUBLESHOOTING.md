# Video Recommendation Troubleshooting Guide

## Overview
This guide helps you understand and fix issues with YouTube video recommendations in the LearnMentor AI platform.

## The Current Issue

### What's Happening
When users click on a topic to learn, they see YouTube video recommendations that display **search queries** instead of **actual video titles**. For example:
- ❌ "React Hooks tutorial beginner" (search query)
- ✅ "React Hooks Explained - Complete Tutorial for Beginners" (actual video title)

### Why This Happens
The backend generates YouTube **search queries** using the AI model, then converts them to YouTube search URLs. However, it uses the search query itself as the video "title" rather than fetching actual video information from YouTube.

## How to Diagnose the Issue

### Step 1: Use the Diagnostic Panel

1. **Access the Diagnostic Panel**
   - Log into your dashboard
   - Click the **"Diagnostics"** button in the top-right corner (next to "AI Assistant")

2. **Run All Tests**
   - Click "Run All Tests" button
   - Wait for all 4 tests to complete (takes ~10-30 seconds)

3. **Review Results**
   - **Backend Health**: Should show ✓ SUCCESS (green)
   - **AI Content Generation**: Should show ✓ SUCCESS or ⚠ WARNING (yellow)
   - **YouTube Video Recommendations**: Will likely show ⚠ WARNING
   - **Cache System**: Should show ✓ SUCCESS or ⚠ WARNING

### Step 2: Check the Detailed Logs

1. Switch to the **"Detailed Logs"** tab in the Diagnostic Panel
2. Look for these key indicators:

```
✓ Backend health check passed
✓ Content generation successful
⚠ Issue detected: Video titles are search queries, not actual video titles
```

### Step 3: Inspect Raw Response

1. Switch to the **"Raw Response"** tab
2. Look for the `youtubeVideos` array in the JSON
3. Check if video titles match the `embedQuery` values (this indicates the problem)

## What Each Test Tells You

### 1. Backend Health Test ✓
**What it checks:** Can the frontend communicate with the Supabase backend?

**Success means:**
- ✅ Backend is deployed and running
- ✅ CORS is configured correctly
- ✅ Network connection is working

**Failure means:**
- ❌ Backend might not be deployed
- ❌ Deployment might have failed (403 error)
- ❌ Network/CORS issues

**How to fix:**
```bash
# Redeploy the backend
cd supabase/functions
supabase functions deploy make-server
```

### 2. AI Content Generation Test 🤖
**What it checks:** Is the Hugging Face model generating content correctly?

**Success means:**
- ✅ Hugging Face API key is valid
- ✅ Model is accessible and responding
- ✅ JSON parsing is working
- ✅ All content fields are present

**Warning means:**
- ⚠️ Some content fields might be missing
- ⚠️ Content quality might be lower than expected

**Failure means:**
- ❌ Hugging Face API key is invalid
- ❌ Model is not accessible
- ❌ JSON parsing failed
- ❌ Network issues

**Common errors and fixes:**

#### Error: "Hugging Face API error: 403 Forbidden"
```
Solution: Check if your HF API key is valid
- Key: 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
- Test it at: https://huggingface.co/settings/tokens
```

#### Error: "Could not parse JSON response"
```
Solution: The model might be returning markdown-formatted JSON
- The backend already has cleanup logic for this
- Check the "Raw Response" tab to see what the model returned
```

### 3. YouTube Video Recommendations Test 📺
**What it checks:** Are video recommendations properly formatted?

**Success means:**
- ✅ YouTube videos are present
- ✅ Video titles are descriptive (not just queries)
- ✅ Search URLs are properly formatted

**Warning means:**
- ⚠️ Videos are using search queries as titles (CURRENT ISSUE)
- ⚠️ Video structure is correct but quality is low

**This is the KNOWN ISSUE** - see "How to Fix" section below.

### 4. Cache System Test 💾
**What it checks:** Is the caching system working?

**Success means:**
- ✅ Content is being cached properly
- ✅ Subsequent requests use cached data

**Warning means:**
- ⚠️ No cached content (normal for first run)

**Failure means:**
- ❌ Caching is broken
- ❌ Storage access issues

## How the Current System Works

### Backend Flow (Simplified)

```
1. Frontend requests topic content
   ↓
2. Backend checks cache
   ↓
3. If not cached, call Hugging Face API
   ↓
4. AI generates:
   - explanation
   - keyPoints
   - applications
   - pitfalls
   - practiceIdeas
   - youtubeSearchQueries ← Array of search queries
   ↓
5. Backend converts search queries to video objects:
   {
     title: "React Hooks tutorial",        ← THE PROBLEM
     searchUrl: "https://youtube.com/...",
     embedQuery: "React Hooks tutorial"
   }
   ↓
6. Return to frontend
   ↓
7. Frontend displays video titles (shows search queries)
```

## Solutions

### Option 1: Improve Search Query Descriptions (Quick Fix)

**Modify backend to make queries more descriptive:**

In `/supabase/functions/make-server/index.ts` around line 599-611:

```typescript
// CURRENT CODE (line 599-611):
for (const query of searchQueries) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    youtubeVideos.push({
      title: query,  // ← Shows "React Hooks tutorial"
      searchUrl: searchUrl,
      embedQuery: query
    });
  }
}

// IMPROVED VERSION:
for (const query of searchQueries) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    youtubeVideos.push({
      title: `Search YouTube: "${query}"`,  // ← Shows "Search YouTube: React Hooks tutorial"
      description: `Click to find videos about: ${query}`,
      searchUrl: searchUrl,
      embedQuery: query,
      isSearchQuery: true  // Flag to show in UI differently
    });
  }
}
```

### Option 2: Use YouTube Data API (Better Quality)

**Requires YouTube API Key:**

1. Get a YouTube Data API key from Google Cloud Console
2. Add it to your Supabase secrets:
```bash
supabase secrets set YOUTUBE_API_KEY=your_key_here
```

3. Modify backend to fetch real video IDs and titles:

```typescript
// In backend
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

async function searchYouTubeVideos(query: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&q=${encodeURIComponent(query)}&` +
    `type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    const video = data.items[0];
    return {
      title: video.snippet.title,  // Real video title!
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.medium.url,
      channel: video.snippet.channelTitle,
      searchUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`
    };
  }
  return null;
}
```

### Option 3: Curated Video Library (Most Reliable)

**Create a curated database of high-quality videos:**

```typescript
// In backend, create a mapping of topics to curated videos
const CURATED_VIDEOS = {
  'React Hooks': [
    {
      title: 'React Hooks Tutorial - All React Hooks Explained',
      channel: 'Web Dev Simplified',
      videoId: 'TNhaISOUy6Q',
      embedUrl: 'https://www.youtube.com/embed/TNhaISOUy6Q'
    },
    // ... more curated videos
  ],
  // ... more topics
};

// In content generation, check curated library first
function getVideosForTopic(topic: string) {
  // Try to find curated videos
  const curated = CURATED_VIDEOS[topic];
  if (curated) return curated;
  
  // Fall back to AI-generated search queries
  return generateSearchQueries(topic);
}
```

## Verification Steps

After applying any fix:

1. **Clear the cache**
   - Delete cached topic content from Supabase KV store
   - Or use a new test topic that hasn't been cached

2. **Re-run Diagnostic Tests**
   - Click "Diagnostics" → "Run All Tests"
   - Check if "YouTube Video Recommendations" shows SUCCESS

3. **Manual Test**
   - Go to a module
   - Click on a topic
   - Check if video titles are improved

4. **Check the logs**
   - Open browser console (F12)
   - Look for YouTube-related logs
   - Verify the video structure

## Console Debugging Commands

Open browser console (F12) and try these:

```javascript
// Check what content was generated
console.log('Last topic content:', localStorage.getItem('debug-topic-content'));

// Force a fresh content generation (bypass cache)
// Go to topic, open console before clicking:
window.DEBUG_FORCE_REGENERATE = true;

// Check API connectivity
fetch('https://wfibplpezqwcaomwmpxp.supabase.co/functions/v1/make-server-2ba89cfc/health')
  .then(r => r.json())
  .then(console.log);
```

## Backend Logs

To check backend logs in Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Functions" → "make-server-2ba89cfc"
4. Click "Logs"
5. Look for:
   - "🎥 Processing YouTube search queries..."
   - "✓ Created X YouTube video entries"
   - Any error messages

## Understanding the Model's Capabilities

The Hugging Face model (`mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022:featherless-ai`) can:

✅ **What it CAN do:**
- Generate comprehensive explanations
- Create learning points and practice ideas
- Generate relevant search queries
- Understand technical topics

❌ **What it CANNOT do:**
- Access external APIs (like YouTube)
- Fetch real video titles
- Browse the internet
- Get current video information

This is why we need one of the solutions above to get real video data.

## Performance Considerations

### Current System
- **Speed:** ⚡ Fast (no external API calls)
- **Quality:** ⚠️ Medium (generic search queries)
- **Cost:** 💰 Free (no YouTube API quota)

### With YouTube API
- **Speed:** 🐌 Slower (external API calls)
- **Quality:** ✅ High (real video titles)
- **Cost:** 💰💰 Uses YouTube API quota (10,000 units/day free)

### With Curated Library
- **Speed:** ⚡⚡ Fastest (no API calls)
- **Quality:** ✅✅ Highest (hand-picked videos)
- **Cost:** 💰 Free (but requires manual curation)
- **Scalability:** ⚠️ Limited (manual work needed)

## Recommended Approach

**For Production:**
1. Start with **Option 1** (Improved descriptions) - Quick win
2. Build a **Option 3** (Curated library) for popular topics
3. Use **Option 2** (YouTube API) as fallback for uncurated topics

**Implementation Priority:**
```
Phase 1: Improve UI to show these are search queries (1 hour)
Phase 2: Add 20-30 curated videos for most common topics (2-3 hours)
Phase 3: Implement YouTube API for dynamic content (4-6 hours)
```

## Testing Checklist

After implementing a fix:

- [ ] Run Diagnostic Panel tests
- [ ] All 4 tests show SUCCESS or expected WARNING
- [ ] Detailed logs show no errors
- [ ] Raw response has proper video structure
- [ ] Manual test: Click on 3 different topics
- [ ] Videos display with good titles
- [ ] Clicking "Watch" opens correct YouTube page
- [ ] Cache works (second load is instant)
- [ ] No console errors
- [ ] Backend logs show successful generation

## Common Questions

**Q: Why not use the video title from YouTube's search results page?**
A: That would require scraping, which violates YouTube's ToS and is unreliable.

**Q: Can we embed videos directly in the app?**
A: Yes, with real video IDs from YouTube API. Current system only has search URLs.

**Q: How much does YouTube API cost?**
A: Free tier: 10,000 units/day. 1 search = 100 units = 100 searches/day free.

**Q: Can the AI model access YouTube directly?**
A: No, AI models cannot make external API calls or browse the internet.

## Next Steps

1. **Immediate:** Use the Diagnostic Panel to verify your current setup
2. **Short-term:** Implement Option 1 (improved descriptions)
3. **Medium-term:** Build curated video library for top 50 topics
4. **Long-term:** Integrate YouTube Data API with caching

## Support

If you're still experiencing issues:
1. Check all test results in Diagnostic Panel
2. Review backend logs in Supabase dashboard
3. Look at browser console for errors
4. Share the "Raw Response" JSON for analysis
