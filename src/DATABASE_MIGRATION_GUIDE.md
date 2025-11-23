# Database Migration Guide

## Overview

Your AI-Powered Personalized Learning Mentor Platform now uses a proper **SQL database schema** instead of the key-value store for more efficient data management and scalability.

## Database Schema

You've successfully created the following tables in Supabase:

### Core Tables

1. **users** - Store user profile information
   - `user_id` (UUID, Primary Key)
   - `email` (VARCHAR, Unique)
   - `name` (VARCHAR)
   - `created_at` (TIMESTAMP)

2. **roadmaps** - Store personalized learning roadmaps
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users)
   - `title` (VARCHAR)
   - `content` (JSONB) - Stores the complete roadmap structure
   - `status` (VARCHAR) - e.g., 'active', 'completed', 'archived'
   - `created_at`, `updated_at` (TIMESTAMP)

3. **modules** - Individual learning modules within roadmaps
   - `id` (UUID, Primary Key)
   - `roadmap_id` (UUID, Foreign Key → roadmaps)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `order` (INTEGER) - For ordering modules
   - `content` (JSONB) - Module details
   - `created_at` (TIMESTAMP)

4. **topics** - Individual topics within modules
   - `id` (UUID, Primary Key)
   - `module_id` (UUID, Foreign Key → modules)
   - `title` (VARCHAR)
   - `difficulty` (VARCHAR) - 'beginner', 'intermediate', 'advanced'
   - `content` (JSONB) - Topic content, videos, resources
   - `created_at` (TIMESTAMP)

5. **quizzes** - Assessment quizzes for roadmaps
   - `id` (UUID, Primary Key)
   - `roadmap_id` (UUID, Foreign Key → roadmaps)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `content` (JSONB)
   - `created_at` (TIMESTAMP)

6. **quiz_questions** - Individual quiz questions
   - `id` (UUID, Primary Key)
   - `quiz_id` (UUID, Foreign Key → quizzes)
   - `question_number` (INTEGER)
   - `question` (VARCHAR)
   - `options` (JSONB)
   - `correct_answer` (VARCHAR)
   - `explanation` (TEXT)
   - `content` (JSONB)

7. **user_progress** - Track user progress
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users)
   - `roadmap_id` (UUID, Foreign Key → roadmaps)
   - `module_id` (UUID, Foreign Key → modules, nullable)
   - `completed` (BOOLEAN)
   - `completion_percentage` (INTEGER)
   - `data` (JSONB) - Additional progress data
   - `updated_at` (TIMESTAMP)

8. **chat_history** - Store AI chat conversations
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users)
   - `roadmap_id` (UUID, Foreign Key → roadmaps)
   - `role` (VARCHAR) - 'user' or 'assistant'
   - `content` (TEXT)
   - `created_at` (TIMESTAMP)

9. **video_recommendations** - YouTube video recommendations for topics
   - `id` (UUID, Primary Key)
   - `topic_id` (UUID, Foreign Key → topics)
   - `title` (VARCHAR)
   - `channel` (VARCHAR, nullable)
   - `search_query` (VARCHAR)
   - `difficulty` (VARCHAR)
   - `duration` (VARCHAR, nullable)
   - `content` (JSONB)
   - `created_at` (TIMESTAMP)

## Database Utilities Created

A new file `/supabase/functions/server/database.tsx` provides comprehensive database operations:

### Available Database Functions

**User Operations** (`db.userDb`)
- `create(email, name, authUserId)` - Create a new user
- `get(userId)` - Get user by ID
- `update(userId, updates)` - Update user info

**Roadmap Operations** (`db.roadmapDb`)
- `create(userId, title, content, status)` - Create a roadmap
- `get(roadmapId)` - Get roadmap by ID
- `getByUser(userId)` - Get all roadmaps for a user
- `update(roadmapId, updates)` - Update roadmap
- `delete(roadmapId)` - Delete roadmap

**Module Operations** (`db.moduleDb`)
- `create(roadmapId, title, description, order, content)` - Create module
- `getByRoadmap(roadmapId)` - Get all modules in a roadmap
- `get(moduleId)` - Get module by ID
- `update(moduleId, updates)` - Update module

**Topic Operations** (`db.topicDb`)
- `create(moduleId, title, difficulty, content)` - Create topic
- `getByModule(moduleId)` - Get all topics in a module
- `get(topicId)` - Get topic by ID
- `update(topicId, updates)` - Update topic

**Progress Operations** (`db.progressDb`)
- `upsert(userId, roadmapId, moduleId, data)` - Create or update progress
- `getByUser(userId)` - Get all progress for a user
- `getByRoadmap(userId, roadmapId)` - Get progress for a specific roadmap

**Chat Operations** (`db.chatDb`)
- `create(userId, roadmapId, role, content)` - Save chat message
- `getByUser(userId, limit)` - Get user's chat history
- `getByRoadmap(userId, roadmapId, limit)` - Get chat history for a roadmap

**Quiz Operations** (`db.quizDb`)
- `create(roadmapId, title, description, content)` - Create quiz
- `getByRoadmap(roadmapId)` - Get all quizzes for a roadmap

**Video Operations** (`db.videoDb`)
- `create(topicId, title, searchQuery, difficulty, content)` - Create video recommendation
- `getByTopic(topicId)` - Get videos for a topic

## Current Implementation Status

### ✅ Completed
- Database schema created in Supabase
- Database utility functions created (`/supabase/functions/server/database.tsx`)
- Database module imported into server (`import * as db from "./database.tsx"`)

### ⚠️ Pending - Migration Needed
The backend endpoints are still using the KV store. To complete the migration, we need to:

1. **Update Profile Endpoints** 
   - Store profiles in KV (for backward compatibility with auth metadata)
   - OR create a profile column in the users table

2. **Update Roadmap Generation**
   - Store generated roadmaps in the `roadmaps` table
   - Store modules in the `modules` table
   - Store topics in the `topics` table

3. **Update Progress Tracking**
   - Use `user_progress` table instead of KV store

4. **Update Chat History**
   - Use `chat_history` table instead of KV store

5. **Update Topic Content Generation**
   - Store topic content in the `topics` table
   - Store video recommendations in the `video_recommendations` table

## Benefits of SQL Migration

1. **Better Data Relationships** - Proper foreign keys ensure data integrity
2. **Efficient Queries** - Indexed queries are much faster than KV lookups
3. **Complex Filtering** - Easy to filter, sort, and aggregate data
4. **Scalability** - SQL databases scale better for complex applications
5. **Data Analytics** - Run reports and analytics on your data
6. **Cascade Deletes** - When a roadmap is deleted, modules/topics are automatically removed

## Next Steps

Would you like me to:
1. **Complete the migration** - Update all endpoints to use SQL tables
2. **Hybrid approach** - Keep some data in KV store and migrate critical data to SQL
3. **Data migration script** - Create a script to migrate existing KV data to SQL tables

Let me know which approach you prefer!
