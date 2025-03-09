import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu" />
));

const mockNavigate = jest.fn();
const mockParams = { slug: "mouse" };
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  const Select = ({ children, onChange, placeholder, showSearch, ...rest }) => (
    <select
      data-testid="antd-select"
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {children}
    </select>
  );
  Select.Option = ({ children, ...rest }) => (
    <option {...rest}>{children}</option>
  );
  return { ...antd, Select };
});

global.URL.createObjectURL = jest.fn(() => "blob:mocked-url");
window.prompt = jest.fn();

describe("UpdateProduct Component", () => {
  const mockProduct = {
    _id: "123",
    name: "Mouse",
    description: "A reliable computer mouse",
    price: 100,
    quantity: 10,
    shipping: true,
    category: { _id: "1", name: "Electronics" },
    photo: "existing-photo.jpg",
  };

  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
    { _id: "3", name: "Clothing" },
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes("get-product")) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      return Promise.resolve({
        data: { success: true, category: mockCategories },
      });
    });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );
  };

  test("renders layout and fetches initial data", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("layout")).toBeInTheDocument();
      expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith(
        `/api/v1/product/get-product/${mockParams.slug}`
      );
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    });
  });

  test("pre-fills form with existing product data", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockProduct.description)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockProduct.price.toString())
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockProduct.quantity.toString())
      ).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByAltText("product_photo")).toHaveAttribute(
        "src",
        `/api/v1/product/product-photo/${mockProduct._id}`
      );
    });
  });

  test("updates product with new name and description", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Update Product"));

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "New Shirt" },
    });

    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "A cool shirt" },
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.put.mock.calls[0][1];
      const formEntries = Object.fromEntries(formData.entries());

      expect(formEntries.name).toBe("New Shirt");
      expect(formEntries.description).toBe("A cool shirt");
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("updates product with modified category and shipping", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Update Product"));

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "New Shirt" },
    });

    // category from electronics to clothing
    fireEvent.change(screen.getAllByTestId("antd-select")[0], {
      target: { value: "3" },
    });

    // // shipping from true to false
    fireEvent.change(screen.getAllByTestId("antd-select")[1], {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.put.mock.calls[0][1];
      const formEntries = Object.fromEntries(formData.entries());

      expect(formEntries.category).toBe("3");
      expect(formEntries.shipping).toBe("0");

      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("updates product with new photo", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Update Product"));

    const file = new File(["test"], "new-photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload Photo"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.put.mock.calls[0][1];
      const formEntries = Object.fromEntries(formData.entries());

      expect(formEntries.photo).toBeInstanceOf(File);
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("updates product with price", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Update Product"));

    const priceInput = screen.getByPlaceholderText("write a price");

    fireEvent.change(priceInput, { target: { value: "25.99" } });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.put.mock.calls[0][1];
      const formEntries = Object.fromEntries(formData.entries());

      expect(formEntries.price).toBe("25.99");
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("updates product with quantity", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Update Product"));

    const quantityInput = screen.getByPlaceholderText("write a quantity");

    fireEvent.change(quantityInput, { target: { value: "10" } });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      const formData = axios.put.mock.calls[0][1];
      const formEntries = Object.fromEntries(formData.entries());

      expect(formEntries.quantity).toBe("10");
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("shows error message when update operation API fails", async () => {
    renderComponent();

    axios.put.mockRejectedValue(new Error("Update product error"));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/v1/product/update-product/${mockProduct._id}`,
        expect.any(FormData)
      );

      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("shows validation errors for missing fields", async () => {
    renderComponent();

    axios.put = jest.fn().mockResolvedValue({
      data: { success: false, message: "Failed to update product" },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("UPDATE PRODUCT"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update product");
    });
  });

  test("deletes product with confirmation", async () => {
    window.prompt.mockReturnValue("yes");
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/v1/product/delete-product/${mockProduct._id}`
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product deleted successfully"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  test("cancels delete operation", async () => {
    window.prompt.mockReturnValue(null);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    await waitFor(() => {
      expect(axios.delete).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test("shows error message when delete operation API fails", async () => {
    window.prompt.mockReturnValue("yes");
    renderComponent();
    axios.delete.mockRejectedValue(new Error("Delete product error"));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/v1/product/delete-product/${mockProduct._id}`
      );
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("successfully fetches and displays categories", async () => {
    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");

      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  test("displays error toast when category fetch API returns a failed response", async () => {
    axios.get.mockResolvedValue({
      data: { success: false, message: "Failed to get category" },
    });

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to get category");

      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });
  });

  test("displays error toast when category fetch API fails", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );

      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });
  });
});
