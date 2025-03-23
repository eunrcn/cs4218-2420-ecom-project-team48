import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { Route, MemoryRouter, Routes } from "react-router-dom";
import axios from "axios";
import UpdateProduct from "./UpdateProduct";
import "@testing-library/jest-dom";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import AdminRoute from "../../components/Routes/AdminRoute";
import toast from "react-hot-toast";

jest.mock("axios");

jest.spyOn(toast, "success");
jest.spyOn(toast, "error");

global.URL.createObjectURL = jest.fn(() => "mock-url");

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

window.prompt = jest.fn();

jest.mock("antd", () => {
  const antd = jest.requireActual("antd");

  const Select = ({ children, onChange, showSearch, value, ...rest }) => (
    <div>
      <select
        role="test-selection"
        onChange={(e) => onChange(e.target.value)}
        value={value}
        {...rest}
      >
        {children}
      </select>
    </div>
  );

  Select.Option = ({ children, value, ...rest }) => (
    <option role="test-option" value={value} {...rest}>
      {children}
    </option>
  );

  return { ...antd, Select };
});

const Providers = ({ children }) => (
  <AuthProvider>
    <SearchProvider>
      <CartProvider>{children}</CartProvider>
    </SearchProvider>
  </AuthProvider>
);

const renderUpdateProduct = (slug = "test-product") => {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[`/dashboard/admin/product/${slug}`]}>
        <Routes>
          <Route path="/dashboard" element={<AdminRoute />}>
            <Route path="admin/product/:slug" element={<UpdateProduct />} />
            <Route
              path="/dashboard/admin/products"
              element={<div data-testid="products-page">Products List</div>}
            />
          </Route>

          <Route
            path="/login"
            element={<div data-testid="login-page">Login</div>}
          />
        </Routes>
      </MemoryRouter>
    </Providers>
  );
};

describe("UpdateProduct page integration test", () => {
  const mockCategories = [
    {
      _id: "1",
      name: "Electronics",
    },
    {
      _id: "2",
      name: "Books",
    },
    {
      _id: "3",
      name: "Furniture",
    },
  ];

  const mockProduct = {
    _id: "product123",
    name: "Existing Product",
    description: "Existing Description",
    price: 199.99,
    quantity: 20,
    category: {
      _id: "1",
      name: "Electronics",
    },
    shipping: true,
    slug: "test-product",
  };

  const mockFile = new File(["dummy content"], "test-image.png", {
    type: "image/png",
  });

  const mockAuthData = {
    user: { name: "Admin User", role: 1 },
    token: "valid-token",
  };

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return {
          data: {
            success: true,
            category: mockCategories,
          },
        };
      } else if (url.includes("/api/v1/product/get-product/")) {
        return {
          data: {
            success: true,
            product: mockProduct,
          },
        };
      } else {
        return { data: { ok: true } };
      }
    });

    axios.put.mockReturnValue({ data: { success: true } });
    axios.delete.mockReturnValue({ data: { success: true } });

    localStorage.setItem("auth", JSON.stringify(mockAuthData));
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("should render the update product page with form elements", async () => {
    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Select a category")
      ).toBeInTheDocument();
      expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a description")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a price")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a quantity")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Select Shipping")
      ).toBeInTheDocument();
      expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
      expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
    });

    // check if the form is pre-filled with the product data
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockProduct.description)
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProduct.price)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockProduct.quantity)
      ).toBeInTheDocument();
    });
  });

  test("should update product successfully with modified fields", async () => {
    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: "Updated Product Name" },
      });

      fireEvent.change(screen.getByPlaceholderText("write a description"), {
        target: { value: "Updated Product Description" },
      });

      fireEvent.change(screen.getByPlaceholderText("write a price"), {
        target: { value: "299.99" },
      });

      fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
        target: { value: "30" },
      });

      const dropdowns = screen.getAllByRole("test-selection");
      const categoryDropdown = dropdowns[0];
      const shippingDropdown = dropdowns[1];

      fireEvent.change(categoryDropdown, { target: { value: "2" } });
      fireEvent.change(shippingDropdown, { target: { value: "0" } });

      const fileInput = screen.getByLabelText("Upload Photo");
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      const updateButton = screen.getByRole("button", {
        name: "UPDATE PRODUCT",
      });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });
  });

  test("should handle API error during product update", async () => {
    axios.put.mockRejectedValueOnce(new Error("API Error"));
    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: "Updated Product Name" },
      });

      const updateButton = screen.getByRole("button", {
        name: "UPDATE PRODUCT",
      });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should display uploaded image preview when adding a new photo", async () => {
    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      const fileInput = screen.getByLabelText("Upload Photo");
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    });

    await waitFor(() => {
      const imagePreview = screen.getByAltText("product_photo");
      expect(imagePreview).toBeInTheDocument();
      expect(imagePreview).toHaveAttribute("src", "mock-url");
    });
  });

  test("should show existing image when no new photo is uploaded", async () => {
    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await waitFor(() => {
      const imagePreview = screen.getByAltText("product_photo");
      expect(imagePreview).toBeInTheDocument();
      expect(imagePreview).toHaveAttribute(
        "src",
        `/api/v1/product/product-photo/${mockProduct._id}`
      );
    });
  });

  test("should delete product when confirmed via prompt", async () => {
    window.prompt.mockReturnValue("yes"); // user confirming deletion

    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      const deleteButton = screen.getByRole("button", {
        name: "DELETE PRODUCT",
      });
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith(
        "Are you sure want to delete this product?"
      );

      expect(toast.success).toHaveBeenCalledWith(
        "Product deleted successfully"
      );
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });
  });

  test("should not delete product when prompt is cancelled", async () => {
    window.prompt.mockReturnValue(null);

    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      const deleteButton = screen.getByRole("button", {
        name: "DELETE PRODUCT",
      });
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith(
        "Are you sure want to delete this product?"
      );
      expect(axios.delete).not.toHaveBeenCalled();
    });
  });

  test("should handle API error during product deletion", async () => {
    window.prompt.mockReturnValue("yes");
    axios.delete.mockRejectedValueOnce(new Error("API Error"));

    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByText("Update Product")).toBeInTheDocument();
    });

    await act(async () => {
      const deleteButton = screen.getByRole("button", {
        name: "DELETE PRODUCT",
      });
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should redirect to login page if user is non-admin", async () => {
    const mockAuthUserData = {
      user: { name: "User", role: 0 },
      token: "valid-token",
    };
    localStorage.setItem("auth", JSON.stringify(mockAuthUserData));

    axios.get = jest.fn().mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: {
            success: true,
            product: mockProduct,
          },
        });
      } else {
        return Promise.resolve({ data: { ok: false } });
      }
    });

    renderUpdateProduct();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });
});
