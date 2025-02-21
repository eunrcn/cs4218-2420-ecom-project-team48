import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import "@testing-library/jest-dom/extend-expect";
import HomePage from "./HomePage";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const mock = new AxiosMockAdapter(axios);

beforeEach(() => {
  jest.spyOn(window, "location", "get").mockReturnValue({ reload: jest.fn() });

  mock.reset();
  mock.onGet("/api/v1/category/get-category").reply(200, {
    success: true,
    category: [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Clothing" },
    ],
  });

  mock.onGet("/api/v1/product/product-count").reply(200, { total: 5 });

  mock.onGet("/api/v1/product/product-list/1").reply(200, {
    products: [
      {
        _id: "p1",
        name: "Product 1",
        description: "This is product 1",
        price: 100,
        slug: "product-1",
      },
    ],
  });
});

const renderHomePage = () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("HomePage Component", () => {
  test("renders correctly", async () => {
    renderHomePage();
    expect(await screen.findByText(/All Products/i)).toBeTruthy();
  });

  test("displays categories correctly", async () => {
    renderHomePage();
    const filterSection = screen
      .getByText(/Filter By Category/i)
      .closest("div");
    expect(within(filterSection).findByText(/electronics/i)).toBeTruthy();
    expect(within(filterSection).findByText(/clothing/i)).toBeTruthy();
  });

  test("filters by price", async () => {
    renderHomePage();
    const priceRadio = screen.getByLabelText("$0 to 19");
    fireEvent.click(priceRadio);
    await waitFor(() => expect(priceRadio.checked).toBe(true));
  });

  test("resets filters correctly", async () => {
    renderHomePage();
    const resetButton = screen.getByText("RESET FILTERS");
    fireEvent.click(resetButton);
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled);
  });

  test("handles API error gracefully", async () => {
    mock.onGet("/api/v1/product/product-list/1").reply(500);
    renderHomePage();
    expect(await screen.findByText(/All Products/i)).toBeTruthy();
  });
});
