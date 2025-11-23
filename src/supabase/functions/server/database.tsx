import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

// ==================== TYPE DEFINITIONS ====================

export interface User {
  user_id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  content: any; // JSONB
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  order: number;
  content: any; // JSONB
  created_at?: string;
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  difficulty: string;
  content: any; // JSONB
  created_at?: string;
}

export interface Quiz {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  content: any; // JSONB
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_number: number;
  question: string;
  options: any; // JSONB
  correct_answer: string;
  explanation: string;
  content: any; // JSONB
}

export interface UserProgress {
  id: string;
  user_id: string;
  roadmap_id: string;
  module_id?: string;
  completed: boolean;
  completion_percentage: number;
  data: any; // JSONB
  updated_at?: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  roadmap_id: string;
  role: string;
  content: string;
  created_at?: string;
}

export interface VideoRecommendation {
  id: string;
  topic_id: string;
  title: string;
  channel?: string;
  search_query?: string;
  difficulty?: string;
  duration?: string;
  content: any; // JSONB
  created_at?: string;
}

// ==================== USER OPERATIONS ====================

export const userDb = {
  async create(
    email: string,
    name: string,
    authUserId: string,
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({ user_id: authUserId, email, name })
        .select()
        .single();

      if (error) {
        console.error("Error creating user:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating user:", e);
      return null;
    }
  },

  async get(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error getting user:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting user:", e);
      return null;
    }
  },

  async getOrCreate(
    email: string,
    name: string,
    authUserId: string,
  ): Promise<User | null> {
    // Try to get existing user
    const existing = await this.get(authUserId);
    if (existing) return existing;

    // Create new user
    return await this.create(email, name, authUserId);
  },

  async update(
    userId: string,
    updates: Partial<User>,
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception updating user:", e);
      return null;
    }
  },
};

// ==================== ROADMAP OPERATIONS ====================

export const roadmapDb = {
  async create(
    userId: string,
    title: string,
    content: any,
    status = "active",
  ): Promise<Roadmap | null> {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .insert({
          user_id: userId,
          title,
          content,
          status,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating roadmap:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating roadmap:", e);
      return null;
    }
  },

  async get(roadmapId: string): Promise<Roadmap | null> {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", roadmapId)
        .single();

      if (error) {
        console.error("Error getting roadmap:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting roadmap:", e);
      return null;
    }
  },

  async getByUser(userId: string): Promise<Roadmap[]> {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error getting user roadmaps:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting user roadmaps:", e);
      return [];
    }
  },

  async update(
    roadmapId: string,
    updates: Partial<Roadmap>,
  ): Promise<Roadmap | null> {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roadmapId)
        .select()
        .single();

      if (error) {
        console.error("Error updating roadmap:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception updating roadmap:", e);
      return null;
    }
  },

  async delete(roadmapId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmapId);

      if (error) {
        console.error("Error deleting roadmap:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Exception deleting roadmap:", e);
      return false;
    }
  },
};

// ==================== MODULE OPERATIONS ====================

export const moduleDb = {
  async create(
    roadmapId: string,
    title: string,
    description: string,
    order: number,
    content: any,
  ): Promise<Module | null> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .insert({
          roadmap_id: roadmapId,
          title,
          description,
          order,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating module:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating module:", e);
      return null;
    }
  },

  async bulkCreate(
    modules: Omit<Module, "id" | "created_at">[],
  ): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .insert(modules)
        .select();

      if (error) {
        console.error("Error bulk creating modules:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception bulk creating modules:", e);
      return [];
    }
  },

  async getByRoadmap(roadmapId: string): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error getting modules:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting modules:", e);
      return [];
    }
  },

  async get(moduleId: string): Promise<Module | null> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (error) {
        console.error("Error getting module:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting module:", e);
      return null;
    }
  },

  async update(
    moduleId: string,
    updates: Partial<Module>,
  ): Promise<Module | null> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .update(updates)
        .eq("id", moduleId)
        .select()
        .single();

      if (error) {
        console.error("Error updating module:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception updating module:", e);
      return null;
    }
  },
};

// ==================== TOPIC OPERATIONS ====================

export const topicDb = {
  async create(
    moduleId: string,
    title: string,
    difficulty: string,
    content: any,
  ): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from("topics")
        .insert({
          module_id: moduleId,
          title,
          difficulty,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating topic:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating topic:", e);
      return null;
    }
  },

  async getByModule(moduleId: string): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("module_id", moduleId);

      if (error) {
        console.error("Error getting topics:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting topics:", e);
      return [];
    }
  },

  async get(topicId: string): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("id", topicId)
        .single();

      if (error) {
        console.error("Error getting topic:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting topic:", e);
      return null;
    }
  },

  async update(
    topicId: string,
    updates: Partial<Topic>,
  ): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from("topics")
        .update(updates)
        .eq("id", topicId)
        .select()
        .single();

      if (error) {
        console.error("Error updating topic:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception updating topic:", e);
      return null;
    }
  },
};

// ==================== QUIZ OPERATIONS ====================

export const quizDb = {
  async create(
    roadmapId: string,
    title: string,
    description: string,
    content: any,
  ): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          roadmap_id: roadmapId,
          title,
          description,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating quiz:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating quiz:", e);
      return null;
    }
  },

  async get(quizId: string): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) {
        console.error("Error getting quiz:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting quiz:", e);
      return null;
    }
  },

  async getByRoadmap(roadmapId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("roadmap_id", roadmapId);

      if (error) {
        console.error("Error getting quizzes:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting quizzes:", e);
      return [];
    }
  },

  async getWithQuestions(
    quizId: string,
  ): Promise<(Quiz & { questions: QuizQuestion[] }) | null> {
    try {
      const quiz = await this.get(quizId);
      if (!quiz) return null;

      const questions = await quizQuestionDb.getByQuiz(quizId);
      return { ...quiz, questions };
    } catch (e) {
      console.error(
        "Exception getting quiz with questions:",
        e,
      );
      return null;
    }
  },
};

// ==================== QUIZ QUESTION OPERATIONS ====================

export const quizQuestionDb = {
  async create(
    quizId: string,
    questionNumber: number,
    question: string,
    options: any,
    correctAnswer: string,
    explanation: string,
    content: any,
  ): Promise<QuizQuestion | null> {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: quizId,
          question_number: questionNumber,
          question,
          options,
          correct_answer: correctAnswer,
          explanation,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating quiz question:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating quiz question:", e);
      return null;
    }
  },

  async bulkCreate(
    questions: Omit<QuizQuestion, "id">[],
  ): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert(questions)
        .select();

      if (error) {
        console.error(
          "Error bulk creating quiz questions:",
          error,
        );
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(
        "Exception bulk creating quiz questions:",
        e,
      );
      return [];
    }
  },

  async getByQuiz(quizId: string): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("question_number", { ascending: true });

      if (error) {
        console.error("Error getting quiz questions:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting quiz questions:", e);
      return [];
    }
  },
};

// ==================== PROGRESS OPERATIONS ====================

export const progressDb = {
  async upsert(
    userId: string,
    roadmapId: string,
    moduleId: string | null,
    completed: boolean,
    completionPercentage: number,
    data: any,
  ): Promise<UserProgress | null> {
    try {
      // Check if progress exists
      let query = supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId);

      if (moduleId) {
        query = query.eq("module_id", moduleId);
      } else {
        query = query.is("module_id", null);
      }

      const { data: existing, error: fetchError } =
        await query.maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error(
          "Error checking existing progress:",
          fetchError,
        );
      }

      const progressData = {
        completed,
        completion_percentage: completionPercentage,
        data,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing progress
        const { data: updated, error } = await supabase
          .from("user_progress")
          .update(progressData)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating progress:", error);
          return null;
        }
        return updated;
      } else {
        // Create new progress
        const { data: created, error } = await supabase
          .from("user_progress")
          .insert({
            user_id: userId,
            roadmap_id: roadmapId,
            module_id: moduleId,
            ...progressData,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating progress:", error);
          return null;
        }
        return created;
      }
    } catch (e) {
      console.error("Exception upserting progress:", e);
      return null;
    }
  },

  async getByUser(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error getting user progress:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting user progress:", e);
      return [];
    }
  },

  async getByRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId);

      if (error) {
        console.error("Error getting roadmap progress:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("Exception getting roadmap progress:", e);
      return [];
    }
  },

  async getByModule(
    userId: string,
    roadmapId: string,
    moduleId: string,
  ): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (error) {
        console.error("Error getting module progress:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception getting module progress:", e);
      return null;
    }
  },
};

// ==================== CHAT HISTORY OPERATIONS ====================

export const chatDb = {
  async create(
    userId: string,
    roadmapId: string,
    role: string,
    content: string,
  ): Promise<ChatHistory | null> {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .insert({
          user_id: userId,
          roadmap_id: roadmapId,
          role,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat history:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("Exception creating chat history:", e);
      return null;
    }
  },

  async getByUser(
    userId: string,
    limit = 50,
  ): Promise<ChatHistory[]> {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error getting chat history:", error);
        return [];
      }
      return (data || []).reverse(); // Reverse to get chronological order
    } catch (e) {
      console.error("Exception getting chat history:", e);
      return [];
    }
  },

  async getByRoadmap(
    userId: string,
    roadmapId: string,
    limit = 50,
  ): Promise<ChatHistory[]> {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error(
          "Error getting roadmap chat history:",
          error,
        );
        return [];
      }
      return (data || []).reverse();
    } catch (e) {
      console.error(
        "Exception getting roadmap chat history:",
        e,
      );
      return [];
    }
  },

  async deleteByRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId);

      if (error) {
        console.error("Error deleting chat history:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Exception deleting chat history:", e);
      return false;
    }
  },
};

// ==================== VIDEO RECOMMENDATIONS OPERATIONS ====================

export const videoDb = {
  async create(
    topicId: string,
    title: string,
    searchQuery: string,
    difficulty: string,
    channel?: string,
    duration?: string,
    content?: any,
  ): Promise<VideoRecommendation | null> {
    try {
      const { data, error } = await supabase
        .from("video_recommendations")
        .insert({
          topic_id: topicId,
          title,
          search_query: searchQuery,
          difficulty,
          channel,
          duration,
          content: content || {},
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Error creating video recommendation:",
          error,
        );
        return null;
      }
      return data;
    } catch (e) {
      console.error(
        "Exception creating video recommendation:",
        e,
      );
      return null;
    }
  },

  async bulkCreate(
    videos: Omit<VideoRecommendation, "id" | "created_at">[],
  ): Promise<VideoRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from("video_recommendations")
        .insert(videos)
        .select();

      if (error) {
        console.error(
          "Error bulk creating video recommendations:",
          error,
        );
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(
        "Exception bulk creating video recommendations:",
        e,
      );
      return [];
    }
  },

  async getByTopic(
    topicId: string,
  ): Promise<VideoRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from("video_recommendations")
        .select("*")
        .eq("topic_id", topicId);

      if (error) {
        console.error(
          "Error getting video recommendations:",
          error,
        );
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(
        "Exception getting video recommendations:",
        e,
      );
      return [];
    }
  },
};

// ==================== HELPER FUNCTIONS ====================

export const helpers = {
  /**
   * Get complete roadmap with all nested data
   */
  async getRoadmapWithDetails(roadmapId: string): Promise<any> {
    try {
      const roadmap = await roadmapDb.get(roadmapId);
      if (!roadmap) return null;

      const modules = await moduleDb.getByRoadmap(roadmapId);

      // Get topics for each module
      const modulesWithTopics = await Promise.all(
        modules.map(async (module) => {
          const topics = await topicDb.getByModule(module.id);
          return { ...module, topics };
        }),
      );

      const quizzes = await quizDb.getByRoadmap(roadmapId);

      return {
        ...roadmap,
        modules: modulesWithTopics,
        quizzes,
      };
    } catch (e) {
      console.error(
        "Exception getting roadmap with details:",
        e,
      );
      return null;
    }
  },

  /**
   * Calculate overall roadmap progress for a user
   */
  async calculateRoadmapProgress(
    userId: string,
    roadmapId: string,
  ): Promise<number> {
    try {
      const modules = await moduleDb.getByRoadmap(roadmapId);
      if (modules.length === 0) return 0;

      const progressRecords = await progressDb.getByRoadmap(
        userId,
        roadmapId,
      );

      const completedModules = progressRecords.filter(
        (p) => p.module_id && p.completed,
      );

      return Math.round(
        (completedModules.length / modules.length) * 100,
      );
    } catch (e) {
      console.error(
        "Exception calculating roadmap progress:",
        e,
      );
      return 0;
    }
  },
};