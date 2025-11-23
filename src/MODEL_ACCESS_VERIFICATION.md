# How to Verify Model Access & System Status

## Quick Status Check (2 Minutes)

### Method 1: Use the Diagnostic Panel (Easiest)

1. **Login to your dashboard**
2. **Click "Diagnostics"** button (top-right, next to AI Assistant)
3. **Click "Run All Tests"**
4. **Wait 10-30 seconds**
5. **Check results:**

| Test | Expected Result | What It Means |
|------|----------------|---------------|
| ✅ Backend Health | SUCCESS (Green) | Backend is deployed and accessible |
| ✅ AI Content Generation | SUCCESS (Green) | Model is working perfectly |
| ⚠️ AI Content Generation | WARNING (Yellow) | Model works but some fields missing |
| ❌ AI Content Generation | ERROR (Red) | Model is not accessible |
| ⚠️ YouTube Videos | WARNING (Yellow) | Normal - see video troubleshooting |
| ✅ Cache System | SUCCESS (Green) | Caching works |

**If all tests are GREEN or YELLOW:** ✅ System is working!

**If Backend Health is RED:** ❌ Backend deployment issue

**If AI Content Generation is RED:** ❌ Model access issue

---

## Method 2: Manual Backend Test (3 Minutes)

### Step 1: Test Health Endpoint

Open your browser and navigate to:
```
https://wfibplpezqwcaomwmpxp.supabase.co/functions/v1/make-server-2ba89cfc/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceKey": true,
    "supabaseUrl": "configured"
  }
}
```

✅ **If you see this:** Backend is deployed and healthy

❌ **If you see 404 or error:** Backend is not deployed or URL is wrong

### Step 2: Test AI Generation

Use this curl command (replace `YOUR_ACCESS_TOKEN`):

```bash
curl -X POST \
  https://wfibplpezqwcaomwmpxp.supabase.co/functions/v1/make-server-2ba89cfc/generate-topic-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "moduleId": "test-module",
    "moduleTitle": "Test Module",
    "topic": "React Hooks",
    "difficulty": "beginner",
    "targetGoal": "Full-Stack Developer"
  }'
```

**Expected Response:**
```json
{
  "content": {
    "explanation": "React Hooks are...",
    "keyPoints": ["Point 1", "Point 2", ...],
    "applications": ["App 1", ...],
    "pitfalls": ["Pitfall 1", ...],
    "practiceIdeas": ["Idea 1", ...],
    "youtubeVideos": [
      {
        "title": "React Hooks tutorial beginner",
        "searchUrl": "https://www.youtube.com/results?search_query=...",
        "embedQuery": "React Hooks tutorial beginner"
      }
    ],
    "generatedAt": "2025-11-08T..."
  }
}
```

✅ **If you see this:** Model is working!

❌ **If you see error:** Check the error message

---

## Method 3: Check Browser Console (1 Minute)

### While Using the App:

1. **Open browser console** (Press F12)
2. **Click on a topic** in any module
3. **Watch the console logs**

**What to Look For:**

✅ **Good logs (Model is working):**
```
[API] POST /generate-topic-content
[API] Response status: 200 OK
[API] ✓ Success: /generate-topic-content
✓ Generated content response: { content: { ... } }
Content generated successfully!
```

❌ **Bad logs (Model NOT working):**
```
[API] Response status: 500 Internal Server Error
[API] Request failed: { error: "Hugging Face API error: ..." }
❌ Error generating content
```

⚠️ **Using Fallback (Backend unavailable):**
```
⚠️ Generating fallback content locally...
✓ Fallback content generated
Using offline content. Backend deployment may be needed.
```

---

## Method 4: Check Supabase Logs (5 Minutes)

### View Real-Time Backend Logs:

1. **Go to:** https://supabase.com/dashboard
2. **Select your project:** wfibplpezqwcaomwmpxp
3. **Navigate to:** Functions → make-server-2ba89cfc → Logs
4. **Click on a topic** in your app
5. **Watch logs appear**

**What to Look For:**

✅ **Model is working:**
```
=== TOPIC CONTENT GENERATION STARTED ===
📝 Request details: { moduleId: ..., topic: "React Hooks" }
🤖 Calling Hugging Face API to generate content...
✓ Hugging Face response received
✓ Content parsed successfully
🎥 Processing YouTube search queries...
✓ Created 3 YouTube video entries
=== TOPIC CONTENT GENERATION COMPLETED ===
```

❌ **Model is NOT accessible:**
```
=== TOPIC CONTENT GENERATION STARTED ===
🤖 Calling Hugging Face API to generate content...
❌ Hugging Face API error: 403 Forbidden
=== TOPIC CONTENT GENERATION FAILED ===
```

❌ **Other errors:**
```
❌ Failed to parse JSON: Unexpected token
Could not extract valid JSON from response
```

---

## Understanding Error Messages

### Common Errors & What They Mean:

#### Error: "Unauthorized" or "401"
**Problem:** Not logged in or session expired
**Solution:** Log out and log back in

#### Error: "Hugging Face API error: 403 Forbidden"
**Problem:** API key is invalid or quota exceeded
**Solution:** 
1. Verify API key in backend: `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`
2. Check key at: https://huggingface.co/settings/tokens
3. Check model access at: https://huggingface.co/mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022

#### Error: "Hugging Face API error: 429 Too Many Requests"
**Problem:** Rate limit exceeded
**Solution:** Wait a few minutes and try again

#### Error: "Could not parse JSON from response"
**Problem:** Model returned malformed JSON
**Solution:** This should be handled by backend cleanup. Check backend logs for raw response.

#### Error: "No response from AI model"
**Problem:** Model didn't return any content
**Solution:** Model might be overloaded. Try again.

#### Error: "Backend is not accessible" or "404 Not Found"
**Problem:** Backend function is not deployed
**Solution:** Deploy the backend:
```bash
cd supabase/functions
supabase functions deploy make-server
```

#### Warning: "Using offline content. Backend deployment may be needed."
**Problem:** Frontend is using fallback content because backend failed
**Solution:** This is OK for testing, but backend needs fixing for production

---

## Verification Checklist

Use this checklist to verify everything is working:

### Backend Verification:
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend logs show in Supabase dashboard
- [ ] No 403 or 500 errors in logs

### Model Verification:
- [ ] AI Content Generation test passes (green or yellow)
- [ ] Content has all fields (explanation, keyPoints, etc.)
- [ ] YouTube videos are generated (even if just search queries)
- [ ] No "Hugging Face API error" in logs

### Frontend Verification:
- [ ] Topics load without errors
- [ ] Content displays on screen
- [ ] No red error toasts
- [ ] Browser console shows success logs

### End-to-End Verification:
- [ ] Can login successfully
- [ ] Dashboard loads with roadmap
- [ ] Can click on a module
- [ ] Can click on a topic
- [ ] Topic content loads (even if slowly)
- [ ] Can see explanation and key points
- [ ] Can see YouTube video recommendations
- [ ] Can click "Watch" on videos

---

## Quick Troubleshooting Decision Tree

```
Does the Diagnostic Panel "Backend Health" test pass?
│
├─ YES → Does "AI Content Generation" test pass?
│   │
│   ├─ YES → ✅ Everything is working!
│   │         Issue is probably just video titles (see VIDEO_RECOMMENDATION_TROUBLESHOOTING.md)
│   │
│   └─ NO → ❌ Model access issue
│             1. Check Hugging Face API key
│             2. Check model availability
│             3. Review backend logs for specific error
│
└─ NO → ❌ Backend deployment issue
          1. Redeploy backend function
          2. Check Supabase project is active
          3. Check function URL is correct
```

---

## Performance Indicators

### Normal Performance:
- Backend health check: < 1 second
- Content generation (first time): 5-15 seconds
- Content loading (cached): < 1 second
- YouTube video list: Immediate (part of content)

### Slow Performance (Investigate):
- Content generation > 30 seconds
- Backend health > 5 seconds
- Frequent timeouts

### Failed Performance (Fix Required):
- Any 403, 404, 500 errors
- "Backend is not accessible"
- Consistent failures to generate content

---

## Model Information

**Current Model:**
- Provider: Hugging Face
- Model: `mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022:featherless-ai`
- API Key: `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`
- Endpoint: Via Hugging Face Inference API

**Model Capabilities:**
- ✅ Text generation
- ✅ JSON formatting
- ✅ Technical explanations
- ✅ Educational content
- ❌ Cannot access external APIs (YouTube, etc.)
- ❌ Cannot browse the internet
- ❌ Cannot fetch real video information

**Expected Response Time:**
- Simple query: 3-8 seconds
- Complex query: 10-20 seconds
- Very complex: Up to 30 seconds

**Timeout Settings:**
- Frontend timeout: 60 seconds
- Backend timeout: 120 seconds
- Hugging Face timeout: Default (usually 60s)

---

## Testing the Model Directly (Advanced)

### Test with Hugging Face Inference Client:

```javascript
// Run in browser console or Node.js
const HF_TOKEN = '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';
const HF_MODEL = 'mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022:featherless-ai';

fetch('https://api-inference.huggingface.co/models/' + HF_MODEL + '/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + HF_TOKEN,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: HF_MODEL,
    messages: [
      {
        role: 'user',
        content: 'Say "Hello, I am working!" in JSON format: {"message": "..."}'
      }
    ],
    stream: false
  })
})
.then(r => r.json())
.then(data => {
  console.log('Model response:', data);
  if (data.choices && data.choices[0]) {
    console.log('✅ Model is accessible!');
    console.log('Response:', data.choices[0].message.content);
  } else {
    console.log('❌ Unexpected response format');
  }
})
.catch(err => {
  console.log('❌ Error:', err);
});
```

**Expected Output:**
```
Model response: { choices: [ { message: { content: '{"message": "Hello, I am working!"}' } } ] }
✅ Model is accessible!
Response: {"message": "Hello, I am working!"}
```

---

## What "Working" Looks Like

### Complete Success (All Green):
1. ✅ Backend health passes
2. ✅ AI content generates successfully
3. ✅ All content fields present
4. ✅ YouTube videos present
5. ⚠️ Videos are search queries (this is normal/expected)

### Partial Success (Some Yellow):
1. ✅ Backend health passes
2. ⚠️ AI content generates but missing some fields
3. ⚠️ Some content using fallback values
4. ✅ Core functionality works

### Failure (Red):
1. ❌ Backend health fails
2. ❌ AI content generation fails
3. ❌ Error messages in logs
4. ❌ Cannot load topics

---

## Daily Health Check Routine

**Recommended: Run once per day**

1. **Open Diagnostic Panel** (2 minutes)
2. **Run All Tests** (30 seconds)
3. **Review Results** (1 minute)
4. **Check one topic manually** (30 seconds)
5. **Review Supabase logs** (1 minute)

**Total time: ~5 minutes**

**What to watch for:**
- Any new errors
- Increased generation time
- Failed tests that previously passed
- Changes in content quality

---

## Summary: Is My Model Working?

**YES, if:**
- ✅ Diagnostic Panel shows all green or yellow
- ✅ Topics generate content when clicked
- ✅ Content includes explanation and key points
- ✅ No red error messages
- ✅ Backend logs show successful generations

**NO, if:**
- ❌ Diagnostic Panel shows red for "AI Content Generation"
- ❌ Backend health check fails
- ❌ Topics show "Error generating content"
- ❌ Logs show "Hugging Face API error"
- ❌ Constant timeouts or failures

**NEED TO INVESTIGATE, if:**
- ⚠️ Content loads but seems incomplete
- ⚠️ Very slow generation (>30 seconds)
- ⚠️ Frequent fallback content usage
- ⚠️ Intermittent failures

---

## Getting Help

If you've followed this guide and still have issues:

1. **Run Diagnostic Panel** and screenshot results
2. **Check backend logs** in Supabase and copy errors
3. **Open browser console** and copy error messages
4. **Note what was working vs. what changed**
5. Share all the above information for troubleshooting

**Information to Provide:**
- Diagnostic Panel screenshots (all 3 tabs)
- Backend logs from Supabase
- Browser console errors
- When the issue started
- What actions trigger the issue
- Whether it's consistent or intermittent
