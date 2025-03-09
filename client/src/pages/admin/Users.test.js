import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Users from "./Users";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));
jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu" />
));
jest.mock("../../components/UserTable", () => ({ users }) => (
  <div data-testid="user-table">{users.length} users displayed</div>
));

describe("Users Component", () => {
  const mockUsers = [
    { _id: "1", name: "Ben", email: "ben@gmail.com", role: 1 },
    { _id: "2", name: "Benny", email: "benny@gmail.com", role: 0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
  };

  test("renders layout and admin menu", async () => {
    axios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("layout")).toBeInTheDocument();
      expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    });
  });

  test("fetches and displays users on mount", async () => {
    axios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/user/get-users");
      expect(screen.getByTestId("user-table")).toHaveTextContent(
        "2 users displayed"
      );
    });
  });

  test("handles API fetch error", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
    });
  });

  test("displays correct title and heading", async () => {
    axios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("layout")).toHaveAttribute(
        "data-title",
        "Dashboard - All Users"
      );
      expect(
        screen.getByRole("heading", { name: /all users/i })
      ).toBeInTheDocument();
    });
  });
});
