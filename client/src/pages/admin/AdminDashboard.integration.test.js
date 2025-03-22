import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import { AuthProvider } from "../../context/auth";
import AdminRoute from "../../components/Routes/AdminRoute";
import "@testing-library/jest-dom";

jest.mock("../../components/Layout", () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

jest.mock("../../components/Header", () => {
  return () => <div data-testid="mock-header">Mock Header</div>;
});

jest.mock("../../components/Spinner", () => {
  return () => <div data-testid="spinner">Loading...</div>;
});

jest.mock("axios");

const renderAdminDashboard = () => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="dashboard/admin" element={<AdminDashboard />} />
          </Route>
          <Route
            path="/login"
            element={<div data-testid="login-page">Login</div>}
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("AdminDashboard Integration", () => {
  const mockAdminUser = {
    user: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "98761234",
      role: 1,
    },
    token: "fake-admin-token",
  };

  beforeEach(() => {
    localStorage.setItem("auth", JSON.stringify(mockAdminUser));

    axios.get.mockResolvedValue({ data: { ok: true } });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should load admin dashboard after successful admin auth check", async () => {
    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByText("Admin Name : Admin User")).toBeInTheDocument();
      expect(
        screen.getByText("Admin Email : admin@example.com")
      ).toBeInTheDocument();
      expect(screen.getByText("Admin Contact : 98761234")).toBeInTheDocument();

      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Create Category" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Create Product" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Products" })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument();
    });
  });

  test("should show spinner during auth check", async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderAdminDashboard();

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("should handle no auth data in localStorage", async () => {
    localStorage.clear();

    renderAdminDashboard();

    expect(screen.queryByText("Admin Name : Admin User")).not.toBeInTheDocument();
  });

  test("should render admin dashboard with correct data for a different admin user", async () => {
    const testAdmin = {
      user: {
        name: "Test Admin",
        email: "testadmin@example.com",
        phone: "98765432",
      },
      token: "valid-token",
    };

    localStorage.setItem("auth", JSON.stringify(testAdmin));
    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByText("Admin Name : Test Admin")).toBeInTheDocument();
      expect(
        screen.getByText("Admin Email : testadmin@example.com")
      ).toBeInTheDocument();
      expect(screen.getByText("Admin Contact : 98765432")).toBeInTheDocument();
    });
  });

  test("should not allow non-admin users to access the dashboard", async () => {
    const nonAdminUser = {
      user: {
        name: "Regular User",
        email: "user@example.com",
        phone: "92457890",
        role: 0,
      },
      token: "fake-user-token",
    };

    localStorage.setItem("auth", JSON.stringify(nonAdminUser));
    axios.get.mockResolvedValue({ data: { ok: false } });

    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.queryByText(/Admin Name/i)).not.toBeInTheDocument();
      // non admins will be redirected to login page
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  test("should navigate to login on API error", async () => {
    localStorage.setItem("auth", JSON.stringify(mockAdminUser));
    axios.get.mockRejectedValue(new Error("API failure"));

    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });
});
