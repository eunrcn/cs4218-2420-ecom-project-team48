import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Dashboard from "./Dashboard";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const mockUser = {
  user: {
    name: "Saber",
    email: "saber@example.com",
    address: "123 Main St",
  },
};

const renderDashboard = (authState) => {
  useAuth.mockReturnValue([authState, jest.fn()]);

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Dashboard />
    </MemoryRouter>
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles null auth gracefully", () => {
    renderDashboard(null);

    expect(screen.queryByText(mockUser.user.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.user.email)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.user.address)).not.toBeInTheDocument();
  });

  it("handles undefined auth gracefully", () => {
    renderDashboard(undefined);

    expect(screen.queryByText(mockUser.user.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.user.email)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.user.address)).not.toBeInTheDocument();
  });

  it("displays user information when logged in", () => {
    renderDashboard(mockUser);

    expect(screen.getAllByText(mockUser.user.name).length).toBeGreaterThan(0);
    expect(screen.getByText(mockUser.user.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.user.address)).toBeInTheDocument();
  });
});
