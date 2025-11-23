# Deployment Troubleshooting Guide

## Current Issue: 403 Error on Edge Function Deployment

### Problem
When trying to deploy the `make-server` edge function to Supabase, you're getting a 403 (Forbidden) error:

```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" failed with status 403
```

### Why This Happens
The 403 error typically occurs due to one of these reasons:

1. **Permissions Issue**: The Supabase project may not have the correct permissions set
2. **Direct Deployment from Figma Make**: Figma Make might not have full deployment access
3. **Supabase API Key Limitations**: The API keys being used might have restricted permissions

### Current Workaround
✅ **Fallback Content System Active**

We've implemented a fallback content generation system in the frontend (`CoursePageEnhanced.tsx`) that will:
- Automatically generate educational content locally when the backend fails
- Provide YouTube search links for learning resources
- Display a warning toast: "Using offline content. Backend deployment may be needed."
- Log all attempts to help with debugging

This allows the app to function while the deployment issue is being resolved.

### Solution: Deploy via Supabase CLI

The recommended approach is to deploy the edge function using the Supabase CLI:

#### Step 1: Install Supabase CLI
```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use npm
npm install -g supabase
```

#### Step 2: Login to Supabase
```bash
supabase login
```

#### Step 3: Link Your Project
```bash
# Get your project ref from: https://supabase.com/dashboard/project/_/settings/general
supabase link --project-ref your-project-ref
```

#### Step 4: Deploy the Edge Function
```bash
# Deploy the make-server function
supabase functions deploy make-server
```

#### Step 5: Verify Deployment
```bash
# Check function logs
supabase functions logs make-server

# Test the function
curl -L -X GET 'https://your-project-ref.supabase.co/functions/v1/make-server-2ba89cfc/health'
```

### Alternative: Manual Deployment via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Edge Functions** → **make-server**
3. Click **Deploy new version**
4. Copy the contents of `/supabase/functions/make-server/index.ts`
5. Paste into the editor
6. Click **Deploy**

### Environment Variables Required

Make sure these environment variables are set in your Supabase project:

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The Hugging Face API key is hardcoded in the function for now:
- Model: `mlfoundations-dev/oh-dcft-v3.1-claude-3-5-sonnet-20241022:featherless-ai`
- Token: `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`

### Verifying the Backend Update

Once deployed, test these endpoints:

#### 1. Health Check
```bash
curl https://your-project.supabase.co/functions/v1/make-server-2ba89cfc/health
```

Expected response:
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

#### 2. Test Topic Content Generation
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/make-server-2ba89cfc/generate-topic-content \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "test-module",
    "moduleTitle": "Test Module",
    "topic": "JavaScript Basics",
    "difficulty": "beginner",
    "targetGoal": "Full-Stack Developer"
  }'
```

### What's in the Updated Backend

The `/supabase/functions/make-server/index.ts` file now includes:

1. ✅ **Hugging Face Integration**: Using `@huggingface/inference` library
2. ✅ **Updated Roadmap Generation**: AI-powered personalized roadmaps
3. ✅ **Updated Chat Assistant**: Context-aware AI mentor
4. ✅ **Topic Content Generation**: Comprehensive learning materials with:
   - Detailed explanations
   - Key learning points
   - Real-world applications
   - Common pitfalls
   - Practice suggestions
   - YouTube video recommendations
5. ✅ **Enhanced Logging**: Detailed console logs for debugging
6. ✅ **Error Handling**: Graceful fallbacks and error messages
7. ✅ **Content Caching**: Stores generated content in KV store

### Monitoring and Debugging

Once deployed, monitor the function:

```bash
# Stream real-time logs
supabase functions logs make-server --follow

# Check specific time range
supabase functions logs make-server --since=1h
```

### Next Steps

1. **Deploy the function** using one of the methods above
2. **Test the endpoints** to verify they work
3. **Check the logs** for any errors
4. **Remove fallback content** (optional) once backend is working

### Need Help?

If deployment continues to fail:

1. Check Supabase service status: https://status.supabase.com/
2. Review Supabase docs: https://supabase.com/docs/guides/functions
3. Check project permissions in Supabase Dashboard
4. Verify your account has the necessary roles

### Current Status

- ✅ Backend code updated and ready to deploy
- ✅ Frontend has fallback content system
- ⚠️  Edge function needs deployment
- 📝 Waiting for 403 permission issue resolution
