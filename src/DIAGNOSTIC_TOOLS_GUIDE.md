# Comprehensive Diagnostic Tools Guide

## Overview
This guide explains all the diagnostic tools available in your LearnMentor AI platform to help you verify the system is working correctly and troubleshoot issues.

---

## 🔧 Diagnostic Panel (NEW!)

The Diagnostic Panel is your one-stop tool for verifying system health and identifying issues.

### How to Access
1. Login to your dashboard
2. Look for the **"Diagnostics"** button in the top-right header (next to "AI Assistant")
3. Click to open the Diagnostic Panel

### Features

#### 1. Test Results Tab
**What it shows:** Visual results of all system tests with success/warning/error indicators

**Available Tests:**

| Test Name | What It Checks | Duration |
|-----------|---------------|----------|
| Backend Health | Is the Supabase backend deployed and accessible? | ~1 sec |
| AI Content Generation | Can the Hugging Face model generate content? | ~10 sec |
| YouTube Video Recommendations | Are video recommendations properly formatted? | Instant |
| Cache System | Is the caching system working? | ~1 sec |

**How to Use:**
1. Click "Run All Tests" button
2. Wait 10-30 seconds for all tests to complete
3. Review each test result
4. Click "View Details" to see technical information
5. Check timestamp to see when test was run

**Status Indicators:**
- ✅ **SUCCESS (Green)**: Everything working perfectly
- ⚠️ **WARNING (Yellow)**: Working but with issues
- ❌ **ERROR (Red)**: Not working, needs attention
- ⏳ **PENDING (Gray)**: Test is running...

#### 2. Detailed Logs Tab
**What it shows:** Real-time execution logs with timestamps

**Log Format:**
```
[14:32:45] === STARTING DIAGNOSTIC TESTS ===
[14:32:45] Testing backend health...
[14:32:46] ✓ Backend health check passed
[14:32:46] Testing AI content generation...
[14:32:47] Request: {"moduleId":"test-module-diagnostic",...}
[14:32:58] ✓ Content generation successful
...
```

**Log Indicators:**
- ✓ (Green) = Success
- ✗ (Red) = Error
- ⚠ (Yellow) = Warning
- (Gray) = Info

**How to Use:**
1. Switch to "Detailed Logs" tab
2. Scroll through execution timeline
3. Look for ✗ or ⚠ indicators
4. Copy logs if you need to share them

#### 3. Raw Response Tab
**What it shows:** The complete JSON response from the AI content generation API

**Example Response:**
```json
{
  "content": {
    "explanation": "React Hooks are functions that let you...",
    "keyPoints": [
      "useState manages state in functional components",
      "useEffect handles side effects and lifecycle",
      ...
    ],
    "applications": [...],
    "pitfalls": [...],
    "practiceIdeas": [...],
    "youtubeVideos": [
      {
        "title": "React Hooks tutorial beginner",
        "searchUrl": "https://www.youtube.com/results?search_query=...",
        "embedQuery": "React Hooks tutorial beginner"
      }
    ],
    "generatedAt": "2025-11-08T14:32:58.123Z"
  }
}
```

**How to Use:**
1. Switch to "Raw Response" tab
2. Expand the JSON to view structure
3. Verify all expected fields are present
4. Check data quality and completeness
5. Copy JSON if you need to share it

---

## 📊 What Each Test Result Tells You

### 1. Backend Health Test

#### ✅ SUCCESS
```
Status: SUCCESS
Message: Backend is healthy and responding
```

**Means:**
- Supabase backend is deployed
- Network connectivity is working
- CORS is configured correctly
- Environment variables are set

**No action needed** - Everything is working!

#### ❌ ERROR
```
Status: ERROR
Message: Backend is not accessible
Details: Failed to fetch / 404 Not Found
```

**Means:**
- Backend function is not deployed, OR
- Function URL is incorrect, OR
- Network issue

**Action Required:**
```bash
# Redeploy the backend
cd supabase/functions
supabase functions deploy make-server

# Or check the function exists
supabase functions list
```

---

### 2. AI Content Generation Test

#### ✅ SUCCESS
```
Status: SUCCESS
Message: Content generated successfully with all fields
Details: {
  explanationLength: 456,
  keyPointsCount: 6,
  applicationsCount: 4,
  youtubeVideosCount: 3
}
```

**Means:**
- Hugging Face API key is valid
- Model is accessible and responding
- JSON parsing is working correctly
- All content fields are present

**No action needed** - AI is working perfectly!

#### ⚠️ WARNING
```
Status: WARNING
Message: Content generated with issues: Missing YouTube videos
Details: { content: {...}, issues: ["Missing YouTube videos"] }
```

**Means:**
- Model is working
- Content was generated
- Some fields might be incomplete or missing

**Action:**
- Review the "Raw Response" tab
- Check which fields are missing
- This might be OK for basic functionality
- Consider improving the AI prompt if consistent

#### ❌ ERROR
```
Status: ERROR
Message: Hugging Face API error: 403 Forbidden
Details: {...}
```

**Means:**
- Cannot access the Hugging Face model
- Common causes:
  - Invalid API key
  - Model not accessible
  - Rate limit exceeded
  - Network issue

**Action Required:**

1. **Check API Key:**
```
Current key: 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
Verify at: https://huggingface.co/settings/tokens
```

2. **Check Model Access:**
```
Model: mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022:featherless-ai
Check at: https://huggingface.co/mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022
```

3. **Check Backend Logs** in Supabase for specific error

---

### 3. YouTube Video Recommendations Test

#### ⚠️ WARNING (Expected for current system)
```
Status: WARNING
Message: Videos are using search queries as titles (not actual video titles)
Details: {
  totalVideos: 3,
  hasSearchUrls: true,
  hasEmbedQueries: true,
  hasTitles: true,
  sampleVideo: {
    title: "React Hooks tutorial beginner",
    searchUrl: "https://youtube.com/...",
    embedQuery: "React Hooks tutorial beginner"
  }
}
```

**Means:**
- Videos are being generated ✅
- Video structure is correct ✅
- BUT: Titles are search queries, not actual video titles ⚠️

**This is the KNOWN ISSUE** documented in `VIDEO_RECOMMENDATION_TROUBLESHOOTING.md`

**Why This Happens:**
The system generates YouTube search queries with the AI, but doesn't fetch actual video titles from YouTube (which would require YouTube Data API).

**This is OK for:**
- Testing and development
- Proof of concept
- Users who don't mind clicking "Search YouTube"

**Action (Optional):**
See `VIDEO_RECOMMENDATION_TROUBLESHOOTING.md` for three solution options:
1. Improve search query descriptions (quick fix)
2. Use YouTube Data API (better quality, requires API key)
3. Create curated video library (best quality, manual work)

#### ✅ SUCCESS
```
Status: SUCCESS
Message: YouTube video recommendations are properly formatted
```

**Means:**
- Videos have proper structure
- Titles are descriptive
- All fields present

**No action needed!**

#### ❌ ERROR
```
Status: ERROR
Message: No YouTube videos found in content
```

**Means:**
- AI didn't generate video recommendations
- Content structure issue

**Action:**
- Check "Raw Response" tab
- Look for `youtubeVideos` array
- May need to improve AI prompt

---

### 4. Cache System Test

#### ✅ SUCCESS
```
Status: SUCCESS
Message: Cache system working - content was cached from previous test
Details: {
  contentKey: "topic-content:test-module-diagnostic:React Hooks",
  generatedAt: "2025-11-08T14:32:58.123Z"
}
```

**Means:**
- Caching is working correctly
- Previous content was saved
- Subsequent requests will be faster

**No action needed!**

#### ⚠️ WARNING
```
Status: WARNING
Message: No cached content found (this is normal for first run)
```

**Means:**
- No cached content exists yet
- This is expected for first test
- Not an error

**No action needed** - This is normal!

#### ❌ ERROR
```
Status: ERROR
Message: Failed to retrieve cached content
```

**Means:**
- Issue with Supabase KV storage
- Permission issue
- Network issue

**Action:**
- Check Supabase project status
- Verify KV storage is accessible
- Check backend logs

---

## 🎯 Common Diagnostic Scenarios

### Scenario 1: First Time Setup
**What you'll see:**
- ✅ Backend Health: SUCCESS
- ✅ AI Content Generation: SUCCESS
- ⚠️ YouTube Videos: WARNING (expected)
- ⚠️ Cache System: WARNING (no cache yet)

**Interpretation:** ✅ Everything is working correctly!

---

### Scenario 2: Backend Not Deployed
**What you'll see:**
- ❌ Backend Health: ERROR (Backend is not accessible)
- ⏳ Other tests: PENDING (not run)

**Interpretation:** Need to deploy backend

**Fix:**
```bash
supabase functions deploy make-server
```

---

### Scenario 3: Invalid API Key
**What you'll see:**
- ✅ Backend Health: SUCCESS
- ❌ AI Content Generation: ERROR (403 Forbidden)
- ⏳ Other tests: May not run

**Interpretation:** Hugging Face API key issue

**Fix:**
1. Verify API key is valid
2. Check model access permissions
3. Update key if needed:
```typescript
// In /supabase/functions/make-server/index.ts
const HF_TOKEN = 'your_new_key_here';
```

---

### Scenario 4: Slow Content Generation
**What you'll see:**
- ✅ Backend Health: SUCCESS (fast)
- ✅ AI Content Generation: SUCCESS (but takes >20 seconds)
- ⚠️ YouTube Videos: WARNING
- ✅ Cache System: SUCCESS

**Interpretation:** Model is working but slow

**Possible causes:**
- Model is busy/overloaded
- Complex query
- Network latency

**This is usually OK** - first generation is slow, cached loads are fast

---

## 🔍 Reading the Detailed Logs

### Success Pattern
```
[14:32:45] === STARTING DIAGNOSTIC TESTS ===
[14:32:45] Testing backend health...
[14:32:46] ✓ Backend health check passed
[14:32:46] Testing AI content generation...
[14:32:47] Request: {"moduleId":"test-module-diagnostic",...}
[14:32:58] ✓ Content generation successful
[14:32:58] Analyzing YouTube video recommendations...
[14:32:58] Found 3 video recommendations
[14:32:58] ⚠ Issue detected: Video titles are search queries
[14:32:58] Testing cache system...
[14:32:59] ✓ Cache system is working
[14:32:59] === ALL TESTS COMPLETED ===
```

### Error Pattern
```
[14:32:45] === STARTING DIAGNOSTIC TESTS ===
[14:32:45] Testing backend health...
[14:32:50] ✗ Backend health check failed: Failed to fetch
[14:32:50] Backend health check failed. Stopping tests.
[14:32:50] === TESTS FAILED ===
```

### What to Look For
- **✓ markers**: Things that worked
- **✗ markers**: Things that failed (investigate these)
- **⚠ markers**: Warnings (may or may not need attention)
- **Timestamps**: How long things took
- **Error messages**: Specific details about failures

---

## 📋 Diagnostic Workflow

### Daily Health Check (5 minutes)
```
1. Open Diagnostic Panel
2. Click "Run All Tests"
3. Wait for completion
4. Verify all green or expected yellow
5. If any red, investigate
```

### Investigating an Issue (15 minutes)
```
1. Run Diagnostic Panel
2. Identify failing test(s)
3. Switch to "Detailed Logs" tab
4. Find the ✗ error messages
5. Switch to "Raw Response" tab (if AI test)
6. Check browser console for errors
7. Check Supabase backend logs
8. Refer to appropriate troubleshooting guide:
   - Backend issues → MODEL_ACCESS_VERIFICATION.md
   - Video issues → VIDEO_RECOMMENDATION_TROUBLESHOOTING.md
```

### Before Reporting an Issue (10 minutes)
```
1. Run Diagnostic Panel
2. Screenshot "Test Results" tab
3. Copy "Detailed Logs" tab content
4. Copy "Raw Response" tab content
5. Check browser console (F12) for errors
6. Check Supabase logs
7. Document:
   - What you were trying to do
   - What happened
   - What you expected
   - Screenshots and logs
```

---

## 🚀 Advanced Usage

### Testing Specific Topics
The diagnostic panel always tests with "React Hooks" topic. To test other topics:

1. Go to the actual module in your dashboard
2. Click on the specific topic
3. Open browser console (F12)
4. Watch the logs
5. Compare to diagnostic panel results

### Comparing Results
Run diagnostic panel at different times to compare:
- **Before changes**: Baseline
- **After changes**: Verify improvement
- **Different times of day**: Check for consistency

### Performance Benchmarking
Use the timestamps in logs to measure:
- Backend response time
- AI generation time
- Cache retrieval time

Example:
```
[14:32:46] Testing AI content generation...
[14:32:58] ✓ Content generation successful
// Generation took: 12 seconds (58 - 46)
```

---

## 🎓 Understanding the Test Flow

### What Happens When You Click "Run All Tests"

```mermaid
1. Reset all results to PENDING
   ↓
2. Test 1: Backend Health
   ├─ Fetch /health endpoint
   ├─ Check response status
   └─ Update result (SUCCESS/ERROR)
   ↓
3. If backend OK → Test 2: AI Content Generation
   ├─ Call /generate-topic-content with test data
   ├─ Wait for response
   ├─ Validate content structure
   └─ Update result (SUCCESS/WARNING/ERROR)
   ↓
4. If content generated → Test 3: YouTube Videos
   ├─ Analyze video structure
   ├─ Check for common issues
   └─ Update result (SUCCESS/WARNING)
   ↓
5. Test 4: Cache System
   ├─ Try to retrieve cached content
   ├─ Check if content exists
   └─ Update result (SUCCESS/WARNING/ERROR)
   ↓
6. Show final results
```

**Total time:** Usually 10-30 seconds

---

## 🛠️ Troubleshooting the Diagnostic Panel Itself

### Issue: Tests Never Complete
**Symptoms:** Tests stuck on PENDING

**Possible causes:**
- Network timeout
- Backend not responding
- Infinite loop

**Fix:**
1. Close and reopen diagnostic panel
2. Check browser console for errors
3. Try refreshing the page
4. Check if backend is responding manually

### Issue: "Run All Tests" Button Doesn't Work
**Symptoms:** Clicking button does nothing

**Fix:**
1. Check browser console for JavaScript errors
2. Refresh the page
3. Try logging out and back in

### Issue: Logs Don't Show
**Symptoms:** "Detailed Logs" tab is empty

**Fix:**
1. Make sure you clicked "Run All Tests"
2. Switch tabs to refresh
3. Check if tests actually ran

### Issue: Raw Response Shows "No response yet"
**Symptoms:** Raw Response tab is empty even after tests

**Possible reasons:**
- Tests failed before AI generation
- AI generation test was skipped
- Error during generation

**Check:** Look at "Detailed Logs" tab for errors

---

## 📚 Related Documentation

- **For video recommendation issues:** → `VIDEO_RECOMMENDATION_TROUBLESHOOTING.md`
- **For model access verification:** → `MODEL_ACCESS_VERIFICATION.md`
- **For general debugging:** → `HOW_TO_DEBUG.md`
- **For content generation:** → `DEBUGGING_AI_CONTENT.md`

---

## 💡 Pro Tips

1. **Run diagnostics after any change** to backend or configuration
2. **Screenshot results** before making changes for comparison
3. **Save logs** if you encounter recurring issues
4. **Run diagnostics daily** during development
5. **Use "Raw Response"** to understand exact API format
6. **Compare timestamps** to identify slow operations
7. **Keep browser console open** while running tests for more info

---

## ✅ Quick Reference

| Symptom | Test Result | Action |
|---------|-------------|--------|
| Can't generate content | Backend Health: ❌ | Deploy backend |
| Can't generate content | AI Generation: ❌ | Check API key/model |
| Slow content loading | AI Generation: ✅ (slow) | Normal for first load |
| Videos show search queries | YouTube Videos: ⚠️ | See video troubleshooting guide |
| Content incomplete | AI Generation: ⚠️ | Check Raw Response |
| Second load still slow | Cache: ❌ | Check caching system |

---

## 🎯 Success Criteria

Your system is working correctly if:

- ✅ Backend Health: **SUCCESS**
- ✅ AI Content Generation: **SUCCESS** or **WARNING** (with minor issues)
- ⚠️ YouTube Videos: **WARNING** (search queries) is acceptable
- ✅ Cache System: **SUCCESS** or **WARNING** (no cache on first run)

**All tests complete in:** 10-30 seconds

**Content generates when clicking topics in app:** Yes

**No red error messages:** Correct

---

## Summary

The Diagnostic Panel is your first stop for:
- ✅ Verifying system health
- ✅ Identifying issues quickly
- ✅ Understanding what's working and what's not
- ✅ Collecting information for troubleshooting

**Use it whenever:**
- Setting up the system
- After making changes
- When users report issues
- For regular health checks
- Before and after deployments

**Remember:** Some warnings are expected (like YouTube videos). Focus on red ERROR status indicators for things that need immediate attention.
