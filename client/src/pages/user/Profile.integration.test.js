import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Profile from "./Profile";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [
    {
      user: {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St",
      },
    },
    jest.fn(),
  ]),
}));

jest.mock("../../components/UserMenu", () => () => <div>User Menu</div>);

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(() =>
      JSON.stringify({
        user: {
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          address: "123 Main St",
        },
      })
    ),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("User Profile Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Simulating complete user flow: rendering the profile page, changing values, and submitting the form.
  it("should render profile with current user data, allow editing, and update the profile successfully", async () => {

    axios.put.mockResolvedValueOnce({
        data: {
          updatedUser: {
            name: "Jane Doe",
            email: "john@example.com",
            phone: "9876543210",
            address: "456 Alt St",
          },
        },
    });

    // 1. Set up initial render
    render(
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
    );

    // 2. Verify initial values
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("John Doe");
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe("1234567890");
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe("123 Main St");

    // 3. Simulate user input
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
        target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Alt St" },
    });

    // 4. Simulate the update button click
    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // 5. Verify profile success
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");

    // 6. Verify the localStorage has been updated with the new data
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      expect.stringContaining('"name":"Jane Doe"')
    );

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      expect.stringContaining('"address":"456 Alt St"')
    );

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      expect.stringContaining('"phone":"9876543210')
    );
      
  });

});