import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

describe("useAuth Hook", () => {
  beforeAll(() =>
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    axios.defaults.headers.common["Authorization"] = "";
  });

  it("should set default authentication state on initialization", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current[0]).toEqual({ user: null, token: "" });
  });

  it("should retrieve authentication data from localStorage on mount", async () => {
    const mockAuth = { user: { name: "Saber" }, token: "484848" };

    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockAuth));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current[0]).toEqual(mockAuth));

    expect(localStorage.getItem).toHaveBeenCalledWith("auth");
  });

  it("should update axios Authorization header when authentication state changes", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const newAuth = { user: { name: "Saber" }, token: "secureToken" };

    act(() => {
      result.current[1](newAuth);
    });

    expect(axios.defaults.headers.common["Authorization"]).toBe("secureToken");
  });

  it("should clear axios Authorization header when user logs out", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current[1]({ user: null, token: "" });
    });

    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });
});
