import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { useProgressStore } from "./useProgressStore";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      userType: null, // 'admin', 'teacher', or 'student'
      userProfile: null, // Admin, Teacher, or Student record
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Initialize auth state from Supabase session
      initAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            await get().loadUserProfile(session.user);
            // Clear any stale dev overrides
            localStorage.removeItem('userTypeOverride');
          } else {
            set({
              user: null,
              userType: null,
              userProfile: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error("Init auth error:", error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false
          });
        }
      },

      // Load user profile from Admins, Teachers or Students table
      loadUserProfile: async (authUser) => {
        try {
          const email = authUser.email;

          // Check if user is an admin
          const { data: adminData, error: adminError } = await supabase
            .from("admins")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (adminData && !adminError) {
            set({
              user: authUser,
              userType: "admin",
              userProfile: adminData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Check if user is a teacher
          const { data: teacherData, error: teacherError } = await supabase
            .from("teachers")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (teacherData && !teacherError) {
            // Check if teacher is approved
            if (teacherData.approval_status !== 'approved') {
              set({
                user: authUser,
                userType: null,
                userProfile: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Your account is pending approval by your school administrator.",
              });
              return;
            }

            set({
              user: authUser,
              userType: "teacher",
              userProfile: teacherData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Check if user is a student
          const { data: studentData, error: studentError } = await supabase
            .from("students")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (studentData && !studentError) {
            // Check if student is approved
            if (studentData.approval_status !== 'approved') {
              set({
                user: authUser,
                userType: null,
                userProfile: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Your account is pending approval by your school administrator.",
              });
              return;
            }

            set({
              user: authUser,
              userType: "student",
              userProfile: studentData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Load progress and record daily login for students
            const progressStore = useProgressStore.getState();
            progressStore.loadProgress(studentData.student_id);
            progressStore.recordDailyLogin(studentData.student_id);
            return;
          }

          // User authenticated but not found in Admins, Teachers or Students
          set({
            user: authUser,
            userType: null,
            userProfile: null,
            isAuthenticated: false,
            isLoading: false,
            error: "User profile not found",
          });
        } catch (error) {
          console.error("Load user profile error:", error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Sign up new user
      signUp: async (email, password, userType, firstName, lastName, schoolId, rememberDevice = true) => {
        set({ isLoading: true, error: null });

        try {
          // Store remember device preference
          if (typeof window !== 'undefined') {
            localStorage.setItem('rememberDevice', rememberDevice.toString());
          }

          // 1. Create Supabase Auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error("Failed to create user");

          // 2. Create record in Teachers or Students table
          const profileData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            school_id: schoolId,

          };

          let profileResult;
          if (userType === "teacher") {
            const { data, error } = await supabase
              .from("teachers")
              .insert([profileData])
              .select()
              .single();

            if (error) throw error;
            profileResult = data;
          } else {
            const { data, error } = await supabase
              .from("students")
              .insert([profileData])
              .select()
              .single();

            if (error) throw error;
            profileResult = data;
          }

          // 3. Load user profile
          await get().loadUserProfile(authData.user);

          return { success: true, user: authData.user };
        } catch (error) {
          console.error("Sign up error:", error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false
          });
          return { success: false, error: error.message };
        }
      },

      // Sign in existing user
      signIn: async (email, password, rememberDevice = true) => {
        set({ isLoading: true, error: null });

        try {
          // Store remember device preference
          if (typeof window !== 'undefined') {
            localStorage.setItem('rememberDevice', rememberDevice.toString());
          }

          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error("Failed to sign in");

          // Load user profile
          await get().loadUserProfile(authData.user);

          return { success: true, user: authData.user };
        } catch (error) {
          console.error("Sign in error:", error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false
          });
          return { success: false, error: error.message };
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            userType: null,
            userProfile: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error("Sign out error:", error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist essential auth state
        user: state.user,
        userType: state.userType,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user) {
    useAuthStore.getState().loadUserProfile(session.user);
  } else if (event === "SIGNED_OUT") {
    // Directly reset state instead of calling signOut() to avoid infinite loop
    useAuthStore.setState({
      user: null,
      userType: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }
});