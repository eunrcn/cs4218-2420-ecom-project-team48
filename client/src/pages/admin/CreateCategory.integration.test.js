import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import { Route, MemoryRouter, Routes } from "react-router-dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import "@testing-library/jest-dom";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import toast from "react-hot-toast";

jest.mock("axios");

jest.spyOn(toast, "success");
jest.spyOn(toast, "error");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const Providers = ({ children }) => (
  <AuthProvider>
    <SearchProvider>
      <CartProvider>{children}</CartProvider>
    </SearchProvider>
  </AuthProvider>
);

const renderCreateCategory = () => {
  return render(
    <Providers>
      <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-category"
            element={<CreateCategory />}
          />
        </Routes>
      </MemoryRouter>
    </Providers>
  );
};

describe("CreateCategory page integration test", () => {
  let createdCategoryId;
  const mockCategory1 = {
    _id: "1",
    name: "Electronics",
  };
  const mockCategory2 = {
    _id: "2",
    name: "Books",
  };
  const mockCategory3 = {
    _id: "3",
    name: "Furniture",
  };
  const mockNewCategory = {
    _id: "4",
    name: "Test Category",
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [mockCategory1, mockCategory2, mockCategory3],
      },
    });
    axios.post.mockResolvedValue({ data: { success: true } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render the create category page with existing categories", async () => {
    renderCreateCategory();

    expect(await screen.getByText("Manage Category")).toBeInTheDocument();
    expect(
      await screen.getByPlaceholderText("Enter new category")
    ).toBeInTheDocument();
    expect(
      await screen.getByRole("button", { name: /submit/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      const electronics = screen.getAllByText("Electronics");
      const books = screen.getAllByText("Books");
      const furniture = screen.getAllByText("Furniture");

      // found both in dropdown and table
      expect(electronics.length).toBe(2);
      expect(books.length).toBe(2);
      expect(furniture.length).toBe(2);
    });
  });

  test("should create a new category successfully on page and dropdown", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          mockCategory1,
          mockCategory2,
          mockCategory3,
          mockNewCategory,
        ],
      },
    });

    renderCreateCategory();

    await act(async () => {
      const categoryInput = screen.getByPlaceholderText("Enter new category");
      fireEvent.change(categoryInput, { target: { value: "Test Category" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Test Category is created");
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "Test Category",
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Category"));
      expect(
        screen.getByRole("link", { name: "Test Category" })
      ).toBeInTheDocument();
    });
  });

  test("should show error when handling failed category creation", async () => {
    axios.post.mockRejectedValue(new Error("Creation failed"));
    renderCreateCategory();

    await act(async () => {
      const categoryInput = screen.getByPlaceholderText("Enter new category");
      fireEvent.change(categoryInput, { target: { value: "Test Category" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in input form"
      );
    });
  });

  test("should update an existing category", async () => {
    renderCreateCategory();

    await waitFor(() => {
      const electronics = screen.getAllByText("Electronics");
      expect(electronics.length).toBe(2);
    });

    // Get the one associated with Electronics
    await waitFor(() => {
      const electronicsCell = screen.getAllByText("Electronics")[1];
      const row = electronicsCell.closest("tr");
      const editButton = within(row).getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);
    });

    const modal = screen.getByRole("dialog");
    const input = within(modal).getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Updated Category" } });
    });

    fireEvent.click(screen.getAllByRole("button", { name: /submit/i })[1]);

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Updated Category is updated");
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        { name: "Updated Category" }
      );
    });
  });

  test("should delete a category", async () => {
    renderCreateCategory();

    await waitFor(() => {
      const electronics = screen.getAllByText("Electronics");
      expect(electronics.length).toBe(2);
    });

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
    });
  });
});
