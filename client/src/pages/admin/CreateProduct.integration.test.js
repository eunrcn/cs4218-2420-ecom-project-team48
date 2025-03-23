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
import CreateProduct from "./CreateProduct";
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

jest.mock("antd", () => {
  const antd = jest.requireActual("antd");

  const Select = ({ children, onChange, showSearch, ...rest }) => (
    <div>
      <select
        role="test-selection"
        onChange={(e) => onChange(e.target.value)}
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

const renderCreateProduct = () => {
  return render(
    <Providers>
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route path="/dashboard" element={<AdminRoute />}>
            <Route path="admin/create-product" element={<CreateProduct />} />
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

describe("CreateProduct page integration test", () => {
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

  const mockFile = new File(["dummy content"], "test-image.png", {
    type: "image/png",
  });

  const mockAuthData = {
    user: { name: "Admin User", role: 1 },
    token: "valid-token",
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: mockCategories,
      },
    });
    axios.post.mockResolvedValue({ data: { success: true } });
    localStorage.setItem("auth", JSON.stringify(mockAuthData));
    axios.get = jest.fn().mockResolvedValueOnce({ data: { ok: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("should render the create product page with form elements", async () => {
    renderCreateProduct();

    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
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
      expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();
    });
  });

  test("should show error when trying to create product without photo", async () => {
    renderCreateProduct();
    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: "Test Product" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a description"), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a price"), {
        target: { value: "99.99" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
        target: { value: "10" },
      });

      const dropdowns = screen.getAllByRole("test-selection");
      const categoryDropdown = dropdowns[0];
      const shippingDropdown = dropdowns[1];

      fireEvent.change(categoryDropdown, { target: { value: "1" } });
      fireEvent.change(shippingDropdown, { target: { value: "1" } });

      const createButton = screen.getByRole("button", {
        name: "CREATE PRODUCT",
      });
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please check all fields including photo"
      );
    });
  });

  test("should create product successfully with all fields", async () => {
    renderCreateProduct();
    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: "Test Product" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a description"), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a price"), {
        target: { value: "99.99" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
        target: { value: "10" },
      });

      const dropdowns = screen.getAllByRole("test-selection");
      const categoryDropdown = dropdowns[0];
      const shippingDropdown = dropdowns[1];

      fireEvent.change(categoryDropdown, { target: { value: "1" } });
      fireEvent.change(shippingDropdown, { target: { value: "1" } });

      const fileInput = screen.getByLabelText("Upload Photo");
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      const createButton = screen.getByRole("button", {
        name: "CREATE PRODUCT",
      });
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product Created Successfully"
      );
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });
  });

  test("should handle API error during product creation", async () => {
    axios.post.mockRejectedValueOnce(new Error("API Error"));
    renderCreateProduct();

    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: "Test Product" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a description"), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a price"), {
        target: { value: "99.99" },
      });
      fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
        target: { value: "10" },
      });

      const dropdowns = screen.getAllByRole("test-selection");
      const categoryDropdown = dropdowns[0];
      const shippingDropdown = dropdowns[1];

      fireEvent.change(categoryDropdown, { target: { value: "1" } });
      fireEvent.change(shippingDropdown, { target: { value: "1" } });

      const fileInput = screen.getByLabelText("Upload Photo");
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      const createButton = screen.getByRole("button", {
        name: "CREATE PRODUCT",
      });
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should display uploaded image preview", async () => {
    renderCreateProduct();
    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
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

  test("should update file name when photo is uploaded", async () => {
    renderCreateProduct();
    await waitFor(() => {
      const product = screen.getAllByText("Create Product");
      expect(product.length).toBe(2);
    });

    await act(async () => {
      expect(screen.getByText("Upload Photo")).toBeInTheDocument();

      const fileInput = screen.getByLabelText("Upload Photo");
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    });

    await waitFor(() => {
      expect(screen.getByText("test-image.png")).toBeInTheDocument();
    });
  });

  test("should redirect to login page if user is non-admin", async () => {
    const mockAuthUserData = {
      user: { name: "User", role: 0 },
      token: "valid-token",
    };
    localStorage.setItem("auth", JSON.stringify(mockAuthUserData));
    axios.get = jest.fn().mockResolvedValueOnce({ data: { ok: false } });

    renderCreateProduct();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });
});
