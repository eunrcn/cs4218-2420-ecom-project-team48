import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import PrivateRoute from "./Private";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../Spinner", () => () => <div>Loading...</div>);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: jest.fn(() => <div>Protected Content</div>),
}));

describe("PrivateRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show Spinner when no auth token is present", () => {
    useAuth.mockReturnValue([{}]);
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show Outlet when user is authenticated and API confirms access", async () => {
    useAuth.mockReturnValue([{ token: "valid-token" }]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("should show Spinner when API denies access", async () => {
    useAuth.mockReturnValue([{ token: "invalid-token" }]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});
