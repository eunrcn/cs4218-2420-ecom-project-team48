import React from "react";
import axios from "axios";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Header from "./Header";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

jest.mock("axios");

const renderHeaderComponent = () => {
  return render(
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
};

// Mock Data
const mockUser = { user: { name: "John Doe", email: "test@example.com", phone: "1234567890" }, token: "dummy-token" };
const mockCategories = [
  { _id: "1", name: "Electronics", slug: "electronics" },
  { _id: "2", name: "Fashion", slug: "fashion" },
];

// Mock API Response
const mockAxiosGetCategories = ({ failCategoryFetch = false, emptyCategoryList = false } = {}) => {
  axios.get.mockImplementation((url) => {
    if (url === "/api/v1/category/get-category") {
      return failCategoryFetch
        ? Promise.reject(new Error("Failed to fetch categories"))
        : Promise.resolve({ data: { success: true, category: emptyCategoryList ? [] : mockCategories } });
    }
    return Promise.reject(new Error("Not Found"));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("Header Integration Tests", () => {
  test("should show category list in dropdown", async () => {
    localStorage.setItem("auth", JSON.stringify(mockUser));
    mockAxiosGetCategories();
    renderHeaderComponent();

    fireEvent.click(screen.getByText("Categories"));

    await waitFor(() => {
      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Fashion")).toBeInTheDocument();
    });
  });

  test("should show correct cart badge count", () => {
    localStorage.setItem("auth", JSON.stringify(mockUser));
    mockAxiosGetCategories();
    localStorage.setItem("cart", JSON.stringify([{ id: 1 }, { id: 2 }]));

    renderHeaderComponent();

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("should show empty categories list when API returns an empty list", async () => {
    localStorage.setItem("auth", JSON.stringify(mockUser));
    mockAxiosGetCategories({ emptyCategoryList: true });
    renderHeaderComponent();

    fireEvent.click(screen.getByText("Categories"));

    await waitFor(() => {
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
      expect(screen.queryByText("Fashion")).not.toBeInTheDocument();
    });
  });

});
