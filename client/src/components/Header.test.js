import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import Header from "./Header";
import toast from "react-hot-toast";
import "@testing-library/jest-dom";
import useCategory from "../hooks/useCategory";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => ["", jest.fn()]),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const renderHeaderComponent = () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCategory.mockReturnValue([
      [
        {
          _id: "123451",
          name: "Electronics",
          slug: "electronics",
          __v: 0,
        },
        {
          _id: "123452",
          name: "Fashion",
          slug: "fashion",
          __v: 0,
        },
      ],
      jest.fn(),
    ]);
  });

  beforeAll(() => {
    // mock the localStorage methods
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders header correctly", async () => {
    // mock the useAuth hook to return a logged-out state
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);
    renderHeaderComponent();

    // check if the main elements are rendered
    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText(/Cart/i)).toBeInTheDocument();
  });

  test("verifies that the '🛒 Virtual Vault' logo links to the homepage", () => {
    renderHeaderComponent();
    const logo = screen.getByText(/🛒 Virtual Vault/i);
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  test("verifies that the 'Home' link navigates to the homepage", () => {
    renderHeaderComponent();
    const homeLink = screen.getByText(/Home/i);
    fireEvent.click(homeLink);
    expect(window.location.pathname).toBe("/");
  });

  test("verifies that 'Register' and 'Login' links are shown when user is not logged in", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    renderHeaderComponent();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toHaveAttribute("href", "/register")

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login")

  });

  test("verifies that 'Dashboard' and 'Logout' options are shown when user is logged in", () => {
    useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "dummy-token" }, jest.fn()]);
    renderHeaderComponent();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("checks that clicking on 'Logout' clears authentication data", () => {
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "dummy-token" }, mockSetAuth]);
    renderHeaderComponent();
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    expect(mockSetAuth).toHaveBeenCalledWith({ user: null, token: "" });
    expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });

  test("ensures SearchInput is shown", () => {
    renderHeaderComponent();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  test("verifies clicking 'All Categories' navigates to '/categories'", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );
    // find and click the correct Categories dropdown
    const categoriesDropdown = screen.getByRole("link", { name: "Categories" });
    fireEvent.click(categoriesDropdown);
    const allCategoriesLink = screen.getByRole("link", { name: "All Categories" });
    expect(allCategoriesLink).toHaveAttribute("href", "/categories")
  });
  
  test("redirects to the correct dashboard based on user role", () => {
    const userAdmin = { name: "Admin User", role: 1 };
    const userRegular = { name: "Regular User", role: 0 };

    // test for admin role
    useAuth.mockReturnValue([{ user: userAdmin }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderHeaderComponent();

    expect(screen.getByText("Admin User")).toBeInTheDocument();

    // test for regular user
    useAuth.mockReturnValue([{ user: userRegular }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderHeaderComponent();

    expect(screen.getByText("Regular User")).toBeInTheDocument();
  });


  test("checks the 'Cart' link navigates to /cart and displays empty badge count", () => {

    // test for empty cart
    useCart.mockReturnValue([[], jest.fn()]);
    renderHeaderComponent();
    const cartLink = screen.getByText(/Cart/i);
    const badge = screen.getByText(/0/i);
    expect(badge).toBeInTheDocument();
    expect(cartLink).toHaveAttribute("href", "/cart")

    // test for cart with products
    useCart.mockReturnValue([[{ id: 1 }, { id: 2 }], jest.fn()]);
    renderHeaderComponent();
    const badge2 = screen.getByText(/2/i);
    expect(badge2).toBeInTheDocument();
  });

});