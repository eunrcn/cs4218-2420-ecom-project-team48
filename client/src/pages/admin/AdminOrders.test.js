import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminOrders from "./AdminOrders";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const mock = new AxiosMockAdapter(axios);

beforeEach(() => {
  mock.reset();

  mock.onGet("/api/v1/auth/all-orders").reply(200, [
    {
      _id: "1",
      status: "Processing",
      buyer: { name: "John Doe" },
      createAt: "2024-01-01T00:00:00Z",
      payment: { success: true },
      products: [
        {
          _id: "p1",
          name: "Product 1",
          description: "Product description",
          price: 100,
        },
      ],
    },
  ]);

  mock
    .onPut("/api/v1/auth/order-status/1")
    .reply(200, { message: "Status updated" });
});

const renderOrderForm = () => {
  render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("AdminOrders Component", () => {
  test("renders correctly", async () => {
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeTruthy();
  });

  test("fetches and displays orders", async () => {
    renderOrderForm();
    expect(await screen.findByText("John Doe")).toBeTruthy();
    expect(await screen.findByText("Processing")).toBeTruthy();
    expect(await screen.findByText("Product 1")).toBeTruthy();
  });

  test("handles API error for fetching orders", async () => {
    mock.onGet("/api/v1/auth/all-orders").reply(500);
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeTruthy();
  });

  test("displays correct date format", async () => {
    renderOrderForm();
    expect(await screen.findByText(/ago/i)).toBeTruthy();
  });

  test("displays correct payment status", async () => {
    renderOrderForm();
    expect(await screen.findByText("Success")).toBeTruthy();
  });

  test("handles missing auth token", async () => {
    jest.mock("../../context/auth", () => ({
      useAuth: jest.fn(() => [null, jest.fn()]),
    }));
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeTruthy();
  });
});
