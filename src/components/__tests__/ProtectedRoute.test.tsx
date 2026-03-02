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

  it("should render children when authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
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

  // This test DOCUMENTS A KNOWN BUG:
  // ProtectedRoute does NOT check userType, so students can access /admin
  it("BUG: does not block students from teacher/admin routes", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      userType: "student",
      initAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute>
          <div>Admin Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // BUG: Student CAN see admin content because ProtectedRoute
    // only checks isAuthenticated, not userType
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
