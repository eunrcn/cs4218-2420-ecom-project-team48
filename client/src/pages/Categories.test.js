import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout";

// Mock useCategory hook
jest.mock("../hooks/useCategory");

// Mock Layout to avoid rendering Header which uses unmocked hooks
jest.mock("../components/Layout", () => {
  return {
    __esModule: true,
    default: ({ children, title }) => (
      <div data-testid="mock-layout">
        <div data-testid="layout-title">{title}</div>
        {children}
      </div>
    ),
  };
});

describe("Categories Component", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics", slug: "electronics" },
    { _id: "2", name: "Clothing", slug: "clothing" },
    { _id: "3", name: "Books", slug: "books" },
  ];

  const renderCategoriesComponent = () => {
    return render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render 'All Categories' title in Layout", () => {
    useCategory.mockReturnValue(mockCategories);

    renderCategoriesComponent();

    expect(screen.getByTestId("layout-title")).toHaveTextContent("All Categories");
  });

  test("should render all categories from the hook", () => {
    useCategory.mockReturnValue(mockCategories);

    renderCategoriesComponent();

    mockCategories.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  test("should render the correct number of category links", () => {
    useCategory.mockReturnValue(mockCategories);

    renderCategoriesComponent();

    const categoryLinks = screen.getAllByRole("link");
    expect(categoryLinks).toHaveLength(mockCategories.length);
  });

  test("should generate correct links with proper slugs", () => {
    useCategory.mockReturnValue(mockCategories);

    renderCategoriesComponent();

    mockCategories.forEach((category) => {
      const link = screen.getByText(category.name);
      expect(link).toHaveAttribute("href", `/category/${category.slug}`);
    });
  });

  test("should handle empty categories array", () => {
    useCategory.mockReturnValue([]);

    renderCategoriesComponent();

    const categoryLinks = screen.queryAllByRole("link");
    expect(categoryLinks).toHaveLength(0);
  });
}); 