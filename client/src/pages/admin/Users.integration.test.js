import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import Users from "./Users";
import "@testing-library/jest-dom";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import AdminRoute from "../../components/Routes/AdminRoute";
import toast from "react-hot-toast";

jest.mock("axios");

jest.spyOn(toast, "success");
jest.spyOn(toast, "error");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const Providers = ({ children }) => (
  <AuthProvider>
    <SearchProvider>
      <CartProvider>{children}</CartProvider>
    </SearchProvider>
  </AuthProvider>
);

const renderUsers = () => {
  return render(
    <Providers>
      <MemoryRouter initialEntries={["/dashboard/admin/users"]}>
        <Routes>
          <Route path="/dashboard" element={<AdminRoute />}>
            <Route path="admin/users" element={<Users />} />
          </Route>
          <Route
            path="/login"
            element={<div data-testid="login-page">Login</div>}
          />
        </Routes>
      </MemoryRouter>
    </Providers>
  );
};

describe("Users page integration test", () => {
  const mockUsers = [
    {
      _id: "1",
      name: "Admin User",
      email: "admin@example.com",
      phone: "1234567890",
      role: 1,
    },
    {
      _id: "2",
      name: "Regular User",
      email: "user@example.com",
      phone: "9876543210",
      role: 0,
    },
    {
      _id: "3",
      name: "Another User",
      email: "another@example.com",
      phone: "5555555555",
      role: 0,
    },
  ];

  const mockAuthData = {
    user: { name: "Admin User", role: 1 },
    token: "valid-token",
  };

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/user/get-users") {
        return {
          data: {
            success: true,
            users: mockUsers,
          },
        };
      } else {
        return { data: { ok: true } };
      }
    });

    localStorage.setItem("auth", JSON.stringify(mockAuthData));
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("should fetch and display users in the table", async () => {
    renderUsers();

    await waitFor(() => {
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent("ID");
      expect(headers[1]).toHaveTextContent("Name");
      expect(headers[2]).toHaveTextContent("Email");
      expect(headers[3]).toHaveTextContent("Role");

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(mockUsers.length + 1);

      const firstRow = rows[1];
      const firstRowCells = within(firstRow).getAllByRole("cell");
      expect(firstRowCells[0]).toHaveTextContent(mockUsers[0]._id);
      expect(firstRowCells[1]).toHaveTextContent(mockUsers[0].name);
      expect(firstRowCells[2]).toHaveTextContent(mockUsers[0].email);
      expect(firstRowCells[3]).toHaveTextContent("Admin");

      const secondRow = rows[2];
      const secondRowCells = within(secondRow).getAllByRole("cell");
      expect(secondRowCells[1]).toHaveTextContent(mockUsers[1].name);

      const thirdRow = rows[3];
      const thirdRowCells = within(thirdRow).getAllByRole("cell");
      expect(thirdRowCells[1]).toHaveTextContent(mockUsers[2].name);
    });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/user/get-users");
  });

  test("should handle API error when fetching users", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/user/get-users") {
        throw new Error("API Error");
      } else {
        return { data: { ok: true } };
      }
    });

    renderUsers();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
    });

    await waitFor(() => {
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(1);
    });
  });

  test("should display empty table when no users exist", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/user/get-users") {
        return {
          data: {
            success: true,
            users: [],
          },
        };
      } else {
        return { data: { ok: true } };
      }
    });

    renderUsers();

    await waitFor(() => {
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(1);
    });
  });

  test("should redirect to login page if user is non-admin", async () => {
    const mockNonAdminAuthData = {
      user: { name: "Regular User", role: 0 },
      token: "valid-token",
    };
    localStorage.setItem("auth", JSON.stringify(mockNonAdminAuthData));
    axios.get = jest.fn().mockResolvedValueOnce({ data: { ok: false } });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });
});
