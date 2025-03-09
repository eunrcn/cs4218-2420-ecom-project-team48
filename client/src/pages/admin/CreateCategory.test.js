import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu" />
));

jest.mock(
  "../../components/Form/CategoryForm",
  () =>
    ({ handleSubmit, value, setValue }) =>
      (
        <form data-testid="category-form" onSubmit={handleSubmit}>
          <input
            data-testid="category-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      )
);

jest.mock("antd", () => ({
  Modal: ({ visible, onCancel, footer, children }) =>
    visible ? (
      <div data-testid="modal">
        {children}
        <button onClick={onCancel}>Close</button>
      </div>
    ) : null,
}));

describe("CreateCategory Component", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
    { _id: "3", name: "Furniture" },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });
    axios.post.mockResolvedValue({ data: { success: true } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );
  };

  test("renders layout and admin menu", async () => {
    renderComponent();
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
  });

  test("fetches and displays categories on mount", async () => {
    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  test("handles error when fetching categories returns a failed response", async () => {
    axios.get.mockResolvedValue({
      data: { success: false, message: "Error fetching categories" },
    });

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      expect(toast.error).toHaveBeenCalledWith("Error fetching categories");
    });
  });

  test("handles fetch API errors gracefully", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );
    });
  });

  test("submits new category form successfully", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("category-input"), {
      target: { value: "Food" },
    });

    fireEvent.submit(screen.getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        { name: "Food" }
      );
      expect(toast.success).toHaveBeenCalledWith("Food is created");
    });
  });

  test("shows error when submitting category returns a failed response", async () => {
    renderComponent();
    axios.post.mockResolvedValue({
      data: { success: false, message: "Error creating category" },
    });

    fireEvent.change(screen.getByTestId("category-input"), {
      target: { value: "Fail Category" },
    });
    fireEvent.submit(screen.getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "Fail Category",
        }
      );

      expect(toast.error).toHaveBeenCalledWith("Error creating category");
    });
  });

  test("shows error when category creation API fails", async () => {
    axios.post.mockRejectedValue(new Error("Creation failed"));
    renderComponent();

    fireEvent.change(screen.getByTestId("category-input"), {
      target: { value: "Fail Category" },
    });
    fireEvent.submit(screen.getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in input form"
      );
    });
  });

  test("prevents duplicate category creation", async () => {
    renderComponent();

    fireEvent.change(screen.getByTestId("category-input"), {
      target: { value: "Electronics" },
    });

    fireEvent.submit(screen.getByTestId("category-form"));

    await waitFor(() => {
      expect(screen.getAllByText("Electronics").length).toBe(1);
    });
  });

  test("opens edit modal with category data", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Edit")[0]);

    const modal = await waitFor(() => screen.getByTestId("modal"));
    expect(modal).toBeInTheDocument();

    const categoryInput = within(modal).getByTestId("category-input");
    expect(categoryInput).toHaveValue("Electronics");
  });

  test("closes modal when clicking the close button", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Edit")[0]);

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  test("updates category successfully", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Edit")[0]);
    const modal = await waitFor(() => screen.getByTestId("modal"));
    const categoryInput = within(modal).getByTestId("category-input");

    fireEvent.change(categoryInput, {
      target: { value: "Updated Electronics" },
    });

    fireEvent.submit(within(modal).getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        { name: "Updated Electronics" }
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Updated Electronics is updated"
      );
    });
  });

  test("shows error when category update API fails", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Edit")[0]);
    const modal = await waitFor(() => screen.getByTestId("modal"));
    const categoryInput = within(modal).getByTestId("category-input");

    fireEvent.change(categoryInput, {
      target: { value: "Updated Fail" },
    });

    axios.put.mockRejectedValue(new Error("Update failed"));
    fireEvent.submit(within(modal).getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        { name: "Updated Fail" }
      );
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  test("shows error when category update API returns a failed response", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Edit")[0]);
    const modal = await waitFor(() => screen.getByTestId("modal"));
    const categoryInput = within(modal).getByTestId("category-input");

    fireEvent.change(categoryInput, { target: { value: "Updated Fail" } });

    axios.put.mockResolvedValue({
      data: { success: false, message: "Failed to create category" },
    });

    fireEvent.submit(within(modal).getByTestId("category-form"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        { name: "Updated Fail" }
      );
      expect(toast.error).toHaveBeenCalledWith("Failed to create category");
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  test("deletes category successfully", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Electronics"));

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });
  });

  test("shows error when delete API fails", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Electronics"));
    axios.delete.mockRejectedValue(new Error("Delete failed"));
    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      expect(screen.getByText("Electronics")).toBeInTheDocument(); // electronics not deleted
    });
  });

  test("shows error when delete API returns a failed response", async () => {
    renderComponent();

    await waitFor(() => screen.getByText("Electronics"));
    axios.delete.mockResolvedValue({
      data: { success: false, message: "Category deletion failed" },
    });

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
      expect(toast.error).toHaveBeenCalledWith("Category deletion failed");
      expect(screen.getByText("Electronics")).toBeInTheDocument(); // electronics not deleted
    });
  });
});
