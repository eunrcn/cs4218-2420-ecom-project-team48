import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "../../context/auth";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";

window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() {},
  };
};

jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout" data-title={title}>
    {children}
  </div>
));

jest.mock("axios");

describe("ForgotPassword Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("integrates with Login page via 'Forgot Password' button on Login page", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Check on the login page
    expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Forgot Password/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "RESET PASSWORD" })).toBeInTheDocument();
    });
  });

  test("integrates with Login page via 'Back to Login' button on ForgotPassword page", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/forgot-password"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Check on forgot password page
    expect(screen.getByRole("heading", { name: "RESET PASSWORD" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to Login/i }));

    await waitFor(() => {
      expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
    });
  });

  test("integrates with backend API for password reset", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Password Reset Successfully",
      },
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Security Answer"), {
      target: { value: "test answer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter New Password"), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i, type: "submit" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/forgot-password", {
        email: "test@example.com",
        answer: "test answer",
        newPassword: "newpassword123",
      });
    });
  });

  test("shows loading state while submitting", async () => {
    axios.post.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              success: true,
              message: "Password Reset Successfully",
            },
          });
        }, 100);
      });
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <ForgotPassword />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Security Answer"), {
      target: { value: "test answer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter New Password"), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i, type: "submit" }));

    expect(screen.getByRole("button", { name: /Resetting.../i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
}); 