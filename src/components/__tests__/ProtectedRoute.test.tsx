import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

// Mock the auth store
vi.mock("../../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from "../../store/useAuthStore";

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>;

describe("ProtectedRoute", () => {
  it("should show loading spinner while auth is loading", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Getting Ready")).toBeInTheDocument();
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("should redirect to /login when not authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated with no role restriction", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "student",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });

  it("should block students from admin routes", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "student",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute allowedRoles={["admin"]}>
          <div>Admin Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Student should NOT see admin content
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("should block students from teacher routes", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "student",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/students"]}>
        <ProtectedRoute allowedRoles={["teacher"]}>
          <div>Teacher Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Teacher Dashboard")).not.toBeInTheDocument();
  });

  it("should allow teachers to access teacher routes", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "teacher",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["teacher"]}>
          <div>Teacher Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
  });

  it("should allow access to shared routes for both students and teachers", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "student",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["student", "teacher"]}>
          <div>Tutorials Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Tutorials Page")).toBeInTheDocument();
  });

  it("should allow admin to access admin routes", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "admin",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["admin"]}>
          <div>Admin Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
