import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Private from "./Private";
import { AuthContext } from "../../context/auth";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../Spinner", () => () => <div>Loading...</div>);

describe("PrivateRoute Component", () => {
  const mockAuth = {
    token: "mock-token",
  };

  const renderComponent = (authValue) => {
    return render(
      <AuthContext.Provider value={[authValue, jest.fn()]}>
        <MemoryRouter>
          <Private />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("renders Spinner component when user is not authenticated", () => {
    renderComponent({});
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders Outlet component when user is authenticated and API call is successful", async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    renderComponent(mockAuth);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("renders Spinner component when API call fails or returns not ok", async () => {
    axios.get.mockResolvedValue({ data: { ok: false } });

    renderComponent(mockAuth);

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("does not make API call if no token is present", async () => {
    axios.get.mockClear();

    renderComponent({ token: null });

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
