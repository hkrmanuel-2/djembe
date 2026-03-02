import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase BEFORE importing the store
const mockFrom = vi.fn();
vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Mock progress store to prevent side effects
vi.mock("../useProgressStore", () => ({
  useProgressStore: {
    getState: () => ({
      loadProgress: vi.fn(),
      recordDailyLogin: vi.fn(),
    }),
  },
}));

import { useAuthStore } from "../useAuthStore";

// Helper to create a chainable Supabase query mock
function mockQuery(data: any, error: any = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
}

describe("useAuthStore", () => {
  const fakeUser = { email: "test@school.edu", id: "auth-123" };

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      userType: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe("loadUserProfile", () => {
    it("should identify an admin user", async () => {
      const adminProfile = {
        id: "admin-1",
        email: "test@school.edu",
        role: "admin",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(adminProfile);
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.userType).toBe("admin");
      expect(state.isAuthenticated).toBe(true);
      expect(state.userProfile).toEqual(adminProfile);
    });

    it("should identify a teacher when not an admin", async () => {
      const teacherProfile = {
        id: "teacher-1",
        email: "test@school.edu",
        approval_status: "approved",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(null);
        if (table === "teachers") return mockQuery(teacherProfile);
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.userType).toBe("teacher");
      expect(state.isAuthenticated).toBe(true);
    });

    it("should reject an unapproved teacher", async () => {
      const pendingTeacher = {
        id: "teacher-2",
        email: "test@school.edu",
        approval_status: "pending",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(null);
        if (table === "teachers") return mockQuery(pendingTeacher);
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userType).toBeNull();
      expect(state.error).toContain("pending approval");
    });

    it("should identify a student when not admin or teacher", async () => {
      const studentProfile = {
        student_id: "student-1",
        email: "test@school.edu",
        approval_status: "approved",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(null);
        if (table === "teachers") return mockQuery(null);
        if (table === "students") return mockQuery(studentProfile);
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.userType).toBe("student");
      expect(state.isAuthenticated).toBe(true);
    });

    it("should reject an unapproved student", async () => {
      const pendingStudent = {
        student_id: "student-2",
        email: "test@school.edu",
        approval_status: "pending",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(null);
        if (table === "teachers") return mockQuery(null);
        if (table === "students") return mockQuery(pendingStudent);
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toContain("pending approval");
    });

    it("should handle user not found in any table", async () => {
      mockFrom.mockImplementation(() => mockQuery(null));

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userType).toBeNull();
      expect(state.error).toContain("not found");
    });

    it("should handle database errors gracefully", async () => {
      mockFrom.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toContain("Database connection failed");
    });

    it("should prioritize admin over teacher", async () => {
      const adminProfile = { id: "admin-1", email: "test@school.edu" };

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") return mockQuery(adminProfile);
        if (table === "teachers")
          return mockQuery({
            id: "teacher-1",
            approval_status: "approved",
          });
        return mockQuery(null);
      });

      await useAuthStore.getState().loadUserProfile(fakeUser);

      expect(useAuthStore.getState().userType).toBe("admin");
    });
  });

  describe("signOut", () => {
    it("should clear all auth state", async () => {
      useAuthStore.setState({
        user: fakeUser,
        userType: "student",
        isAuthenticated: true,
      });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.userType).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("clearError", () => {
    it("should clear the error state", () => {
      useAuthStore.setState({ error: "some error" });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
