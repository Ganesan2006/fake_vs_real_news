# Hugging Face API Setup Guide

The platform now uses **Hugging Face's Llama-4-Scout-17B-16E-Instruct** model instead of OpenAI for AI content generation.

## ✅ What Changed

We've switched from OpenAI GPT-4o-mini to Hugging Face's Llama model for:
- **Personalized roadmap generation**
- **Topic content generation** (detailed explanations, learning points, practice ideas)
- **AI chat assistant** (learning mentor)

## 🔑 API Configuration

### Option 1: Using the Provided API Key (Default)

The platform is pre-configured with a working Hugging Face token:
```
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
```

This token is hardcoded as a fallback, so **the platform will work immediately** without any setup!

### Option 2: Using Your Own Token (Recommended for Production)

If you want to use your own Hugging Face token:

1. **Get a Hugging Face Token:**
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with read permissions
   - Copy the token (starts with `hf_`)

2. **Add to Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
   - Click **Add Secret**
   - Name: `HF_TOKEN`
   - Value: Your Hugging Face token
   - Click **Save**

3. **Redeploy the Edge Function:**
   ```bash
   supabase functions deploy make-server-2ba89cfc
   ```

## 🤖 Model Information

**Model:** `meta-llama/Llama-4-Scout-17B-16E-Instruct:groq`
**Provider:** Hugging Face Inference Endpoints
**Base URL:** `https://router.huggingface.co/v1`

This model is:
- ✅ Free to use (with rate limits)
- ✅ High-quality language understanding
- ✅ Compatible with OpenAI API format
- ✅ Optimized for instruction following

## 📊 How It Works

### 1. Roadmap Generation
When a user completes onboarding:
```javascript
POST /generate-roadmap
→ Sends profile data to Hugging Face
→ Llama generates personalized learning path
→ Returns structured JSON roadmap
→ Cached in KV store
```

### 2. Topic Content Generation
When a user clicks a topic:
```javascript
POST /generate-topic-content
→ Checks KV cache first
→ If not cached, calls Hugging Face
→ Llama generates:
   - Detailed explanation (200-300 words)
   - Key learning points (5-7 bullets)
   - Real-world applications
   - Common pitfalls
   - Practice suggestions
   - YouTube search queries
→ Caches result for future use
```

### 3. Chat Assistant
When a user sends a message:
```javascript
POST /chat
→ Includes user profile context
→ Maintains conversation history
→ Llama responds as learning mentor
→ Saves to chat history
```

## 🔧 Backend Implementation

The backend (`/supabase/functions/server/index.tsx`) now uses:

```typescript
const hfToken = Deno.env.get('HF_TOKEN') || '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';

const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${hfToken}`
  },
  body: JSON.stringify({
    model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct:groq',
    messages: [...],
    temperature: 0.7,
    max_tokens: 2000
  })
});
```

## 🎯 Advantages Over OpenAI

| Feature | Hugging Face | OpenAI |
|---------|-------------|---------|
| **Cost** | Free (with limits) | Paid ($) |
| **Setup** | Token provided | Need to add API key |
| **Privacy** | Open source model | Proprietary |
| **Rate Limits** | Generous free tier | Pay per token |
| **Setup Time** | 0 minutes | 5+ minutes |

## 🚀 Testing

### Test Roadmap Generation
1. Sign up for a new account
2. Complete onboarding with your learning goals
3. Click "Generate Roadmap"
4. Should see AI-generated personalized learning path

### Test Topic Content
1. Click any module from roadmap
2. Click a topic (e.g., "Variables & Data Types")
3. Should see AI-generated content within 5-10 seconds
4. Check for:
   - ✅ Detailed explanation
   - ✅ Key learning points
   - ✅ YouTube video suggestions
   - ✅ Real-world applications
   - ✅ Common pitfalls
   - ✅ Practice ideas

### Test Chat Assistant
1. Click "AI Assistant" button
2. Ask a question (e.g., "Explain React hooks")
3. Should get personalized response based on your profile

## 🐛 Troubleshooting

### Content Not Generating

**Check browser console:**
```
Calling Hugging Face API to generate content...
Hugging Face response received
Content parsed successfully
```

**If you see errors:**

1. **"Hugging Face token not configured"**
   - The fallback token should work
   - If not, add HF_TOKEN to Supabase secrets

2. **"Hugging Face API error: 429"**
   - Rate limit reached
   - Wait a few minutes
   - Or use your own token for higher limits

3. **"Failed to parse JSON"**
   - The model response wasn't valid JSON
   - Backend will retry with template fallback

### Check Backend Logs

In Supabase Dashboard → Edge Functions → Logs:
```
Calling Hugging Face API to generate content...
Hugging Face response received
Content parsed successfully
Content cached successfully
```

## 📝 Response Format

The Llama model is instructed to respond with pure JSON (no markdown):

```json
{
  "explanation": "Detailed explanation of the concept...",
  "keyPoints": [
    "First key point",
    "Second key point",
    "..."
  ],
  "applications": [
    "Real-world application 1",
    "..."
  ],
  "pitfalls": [
    "Common mistake 1",
    "..."
  ],
  "practiceIdeas": [
    "Practice exercise 1",
    "..."
  ],
  "youtubeSearchQueries": [
    "Specific search query 1",
    "..."
  ]
}
```

The backend includes cleanup logic to remove any markdown code blocks:
```typescript
responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
```

## 🔐 Security Notes

1. **Token in Code:** The fallback token is hardcoded for convenience
   - This is fine for demos and development
   - For production, use environment variable via Supabase secrets

2. **Token Permissions:** The token only needs READ permissions
   - Cannot modify models or datasets
   - Cannot access private resources

3. **Rate Limiting:** 
   - Free tier has rate limits
   - Upgrade to Pro for higher limits
   - Or distribute load across multiple tokens

## 📊 Monitoring Usage

To check your Hugging Face API usage:
1. Go to https://huggingface.co/settings/tokens
2. Click on your token
3. View usage statistics

## 🎓 Additional Resources

- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference/index)
- [Llama Model Card](https://huggingface.co/meta-llama)
- [OpenAI-Compatible API](https://huggingface.co/docs/api-inference/tasks/chat-completion)

## ✅ Quick Start Checklist

- [x] Platform uses Hugging Face by default
- [x] Fallback token is configured
- [x] No setup required to start using AI features
- [ ] (Optional) Add your own HF_TOKEN for production
- [ ] (Optional) Monitor usage in Hugging Face dashboard
- [ ] Test roadmap generation
- [ ] Test topic content generation
- [ ] Test chat assistant

## 🆚 Migration from OpenAI

If you previously used OpenAI:

1. **Old Configuration:**
   ```
   OPENAI_API_KEY=sk-...
   ```

2. **New Configuration:**
   ```
   HF_TOKEN=hf_... (optional, has fallback)
   ```

3. **What Stays the Same:**
   - Frontend code unchanged
   - API endpoints unchanged
   - Response format unchanged
   - User experience unchanged

4. **What Changed:**
   - Backend now calls Hugging Face
   - Model is Llama instead of GPT
   - API key environment variable name
   - Base URL for API calls

## 🎉 Benefits

✅ **Zero Setup** - Works immediately with fallback token  
✅ **Free to Use** - No API costs for basic usage  
✅ **Open Source** - Transparent model and infrastructure  
✅ **High Quality** - Llama-4-Scout is a powerful model  
✅ **OpenAI Compatible** - Same API format as OpenAI  
✅ **Easy Switch** - Can switch back to OpenAI anytime  

---

**Ready to use!** The platform is now powered by Hugging Face and will generate AI content automatically. No setup required! 🚀
