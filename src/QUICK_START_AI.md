# 🚀 Quick Start - Test AI Features

## 5-Minute Test Guide

Follow these steps to verify that AI content generation is working:

---

## Step 1: Sign Up (30 seconds)

1. Open the application
2. Click **"Get Started"**
3. Enter:
   - Email: `test@example.com` (or any email)
   - Password: `Test123!` (or any password)
   - Name: `Test User`
4. Click **"Sign Up"**

---

## Step 2: Complete Onboarding (2 minutes)

### Page 1: Background
- **Educational Background:** Select any (e.g., "Computer Science")
- **Current Role:** Select any (e.g., "Student")
- **Years of Experience:** Enter any (e.g., "1")
- Click **Next**

### Page 2: Skills
- **Known Technologies:** Select 2-3 (e.g., "HTML", "CSS", "JavaScript")
- Click **Next**

### Page 3: Goals
- **Target Goal:** Select any (e.g., "Full-Stack Developer")
- **Preferred Language:** Select any (e.g., "JavaScript")
- Click **Next**

### Page 4: Preferences
- **Learning Pace:** Select any (e.g., "Moderate")
- **Hours per Week:** Enter any (e.g., "10")
- **Learning Style:** Select any (e.g., "Hands-on Practice")
- Click **Complete Setup**

---

## Step 3: Wait for AI Roadmap (10-15 seconds)

You should see a loading message:
```
🤖 Generating your personalized learning roadmap...
```

**What's happening:**
- Backend sends your profile to Hugging Face API
- Llama AI analyzes your data
- Generates custom learning path
- Saves to database

**Expected result:**
- Dashboard appears
- Roadmap tab shows personalized phases
- Multiple modules visible

---

## Step 4: Test Topic Content Generation (30 seconds)

1. **Find a module** in the Roadmap tab
2. **Click on any module card** (e.g., "JavaScript Fundamentals")
3. **In the Overview tab**, you'll see topics listed
4. **Click on any topic** (e.g., "Variables & Data Types")
5. **Switch to Content tab** (or it switches automatically)

**Expected loading:**
```
⏳ Loading content...
```

**Expected result (5-10 seconds):**
- ✅ Detailed explanation appears (200-300 words)
- ✅ Key Learning Points (5-7 bullet points)
- ✅ YouTube Videos (3-5 cards with search links)
- ✅ Real-World Applications
- ✅ Common Pitfalls
- ✅ Practice Suggestions

---

## Step 5: Test Chat Assistant (1 minute)

1. **Click "AI Assistant"** button in header
2. **Type a question** (e.g., "What are React hooks?")
3. **Press Enter** or click send

**Expected result (5-10 seconds):**
- ✅ AI responds with personalized answer
- ✅ Response considers your profile/goals
- ✅ Helpful, concise explanation

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Signed up successfully
- [ ] Completed onboarding
- [ ] AI roadmap generated (not template)
- [ ] Can see multiple phases and modules
- [ ] Clicked a module and saw topics
- [ ] Clicked a topic and content loaded
- [ ] See all 6 content sections
- [ ] YouTube videos appear
- [ ] Can mark topics complete
- [ ] Chat assistant responds
- [ ] No error messages

**If all checked:** ✅ AI features are working perfectly!

---

## 🔍 Debugging

### Check Browser Console

Press **F12** to open DevTools, then check Console tab:

**Good logs (everything working):**
```
CoursePageEnhanced mounted with: {...}
Topic clicked: {...}
Checking for cached content...
Generating new content with AI...
Request data: {...}
Hugging Face response received
Content parsed successfully
✅ Content generated successfully!
```

**Bad logs (something wrong):**
```
❌ Hugging Face API error: ...
❌ Failed to parse JSON
❌ Unauthorized
```

### Check Network Tab

In DevTools → Network tab:

1. Click a topic
2. Look for requests to:
   - `generate-topic-content` (should be Status 200)
   - `topic-content` (cache check)

### Common Issues

| Problem | Solution |
|---------|----------|
| "Unauthorized" error | Refresh page, login again |
| Content not loading | Check browser console for errors |
| "Hugging Face API error" | Check Supabase Edge Function logs |
| No topics in module | Roadmap wasn't generated properly, try refreshing |
| Blank content sections | Check that response has data in console |

---

## 📊 What to Test

### Test 1: Different Profiles
Create multiple accounts with different:
- Backgrounds (Student vs Professional)
- Goals (Data Scientist vs Frontend Developer)
- Experience levels (Beginner vs Advanced)

**Expected:** Each gets different roadmap and content

### Test 2: Content Caching
1. Click a topic (takes 5-10 seconds)
2. Click another topic
3. Click back to first topic

**Expected:** First topic loads instantly (cached)

### Test 3: Multiple Topics
Click 5+ different topics in a module

**Expected:** Each generates unique, relevant content

### Test 4: Chat Context
1. Ask: "What should I learn first?"
2. Ask: "Why is that important for my goal?"

**Expected:** AI remembers your profile and previous messages

---

## 🎯 Advanced Testing

### Test API Directly (Browser Console)

```javascript
// Get current access token
const token = (await supabase.auth.getSession()).data.session.access_token;

// Test topic content generation
const result = await api.generateTopicContent({
  moduleId: 'module-1-1',
  moduleTitle: 'JavaScript Fundamentals',
  topic: 'Variables and Data Types',
  difficulty: 'beginner',
  targetGoal: 'Full-Stack Developer'
}, token);

console.log('Generated content:', result);
```

**Expected output:**
```javascript
{
  content: {
    explanation: "...",
    keyPoints: [...],
    applications: [...],
    pitfalls: [...],
    practiceIdeas: [...],
    youtubeVideos: [...],
    topic: "Variables and Data Types",
    moduleId: "module-1-1",
    generatedAt: "2025-11-02T..."
  }
}
```

### Test Hugging Face Directly (Terminal)

```bash
curl -X POST https://router.huggingface.co/v1/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-4-Scout-17B-16E-Instruct:groq",
    "messages": [
      {
        "role": "user",
        "content": "Explain React hooks in one sentence."
      }
    ],
    "max_tokens": 100
  }'
```

**Expected:** JSON response with AI-generated text

---

## ⏱️ Performance Benchmarks

| Action | Expected Time |
|--------|--------------|
| Sign up | < 1 second |
| Onboarding | 2-3 minutes |
| Roadmap generation | 10-15 seconds |
| First topic content | 5-10 seconds |
| Cached topic content | < 1 second |
| Chat response | 5-10 seconds |
| Module navigation | Instant |

---

## 🎓 Understanding the Flow

### Roadmap Generation Flow
```
User completes onboarding
    ↓
Profile saved to KV store
    ↓
Backend calls /generate-roadmap
    ↓
Sends profile to Hugging Face
    ↓
Llama generates JSON roadmap
    ↓
Roadmap cached in KV store
    ↓
Frontend displays dashboard
```

### Topic Content Flow
```
User clicks topic
    ↓
Frontend checks cache (GET /topic-content)
    ↓
If cached → Display immediately
    ↓
If not cached:
    ↓
Call POST /generate-topic-content
    ↓
Backend calls Hugging Face
    ↓
Llama generates content
    ↓
Cache in KV store
    ↓
Return to frontend
    ↓
Display content
```

---

## 🚨 What to Report

If you find issues, report:

1. **Error message** (exact text)
2. **Browser console logs** (screenshot or copy)
3. **Network request details** (from DevTools)
4. **Steps to reproduce**
5. **User profile details** (background, goal, etc.)

---

## ✅ Success Criteria

The platform is working correctly if:

✅ Users can sign up  
✅ Onboarding completes  
✅ Roadmap generates (not template)  
✅ Topics generate unique content  
✅ Content has all 6 sections  
✅ YouTube videos appear  
✅ Chat assistant responds  
✅ Content caches properly  
✅ No console errors  
✅ Response times < 15 seconds  

---

## 🎉 You're Done!

If everything works, you now have a fully functional AI-powered learning platform with:

- ✅ Personalized roadmap generation
- ✅ Dynamic topic content
- ✅ AI chat assistant
- ✅ Smart caching
- ✅ Zero configuration needed

**Next steps:**
- Customize the platform
- Add more features
- Deploy to production
- Share with users!

---

**Need help?** Check these docs:
- `/DEBUGGING_AI_CONTENT.md` - Troubleshooting guide
- `/HUGGINGFACE_SETUP.md` - AI setup details
- `/API.md` - API reference

**Happy learning!** 🚀
