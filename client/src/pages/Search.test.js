import { render, screen, fireEvent } from "@testing-library/react";
import Search from "../pages/Search";
import { useSearch } from "../context/search";
import "@testing-library/jest-dom";
import React from "react";


jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

describe("Search Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Layout component with the correct title", () => {
    useSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("Search Results")).toBeInTheDocument();
  });

  it("should display 'No Products Found' if there are no search results", () => {
    useSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("should display the number of products found", () => {
    useSearch.mockReturnValue([
      {
        results: [
          {
            _id: "1",
            name: "Product 1",
            description: "Description 1",
            price: 100,
          },
          {
            _id: "2",
            name: "Product 2",
            description: "Description 2",
            price: 200,
          },
        ],
      },
      jest.fn(),
    ]);

    render(<Search />);

    expect(screen.getByText("Found 2")).toBeInTheDocument();
  });

  it("should render product details when there are search results", () => {
    useSearch.mockReturnValue([
      {
        results: [
          {
            _id: "1",
            name: "Product 1",
            description: "This is product 1",
            price: 100,
          },
        ],
      },
      jest.fn(),
    ]);

    render(<Search />);

    const productName = screen.getByText("Product 1");
    const productPrice = screen.getByText("$ 100");

    expect(productName).toBeInTheDocument();
    expect(productPrice).toBeInTheDocument();
  });

  it("should render 'Add to Cart' button for each product", () => {
    useSearch.mockReturnValue([
      {
        results: [
          {
            _id: "1",
            name: "Product 1",
            description: "Description 1",
            price: 100,
          },
          {
            _id: "2",
            name: "Product 2",
            description: "Description 2",
            price: 200,
          },
        ],
      },
      jest.fn(),
    ]);

    render(<Search />);

    const addToCartButton1 = screen.getAllByText("ADD TO CART")[0];
    const addToCartButton2 = screen.getAllByText("ADD TO CART")[1];

    expect(addToCartButton1).toBeInTheDocument();
    expect(addToCartButton2).toBeInTheDocument();
  });
});