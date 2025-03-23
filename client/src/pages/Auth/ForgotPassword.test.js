import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword";

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

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  test("renders forgot password form with all fields", () => {
    renderComponent();
    
    expect(screen.getByRole("heading", { name: "RESET PASSWORD" })).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Security Answer")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter New Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /RESET PASSWORD/i, type: "submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Login/i })).toBeInTheDocument();
  });

  test("submits form with correct data and redirects on success", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Password Reset Successfully",
      },
    });

    renderComponent();

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

    expect(toast.success).toHaveBeenCalledWith("Password Reset Successfully", expect.any(Object));
    
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows error message on API error", async () => {
    axios.post.mockRejectedValueOnce(new Error("Error occurred"));

    renderComponent();

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
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
  });

  test("shows error message on unsuccessful response", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Wrong email or answer",
      },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Security Answer"), {
      target: { value: "wrong answer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter New Password"), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i, type: "submit" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Wrong email or answer");
    });
  });

  test("navigates to login page when Back to Login button is clicked", () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole("button", { name: /Back to Login/i }));
    
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
}); 