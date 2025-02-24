import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

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

// Helper to render Orders component
const renderOrderForm = () => {
  render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Orders Component", () => {
  test("renders Orders component", async () => {
    renderOrderForm();
    const element = await screen.findByText(/All Orders/i);
    expect(element).toBeTruthy();
  });

  test("displays fetched orders when auth token exists", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          status: "Completed",
          buyer: { name: "John Doe" },
          createAt: "2025-02-12T12:00:00Z",
          payment: { success: true },
          products: [
            {
              _id: "p1",
              name: "Product 1",
              description: "A product",
              price: 100,
            },
          ],
        },
      ],
    });

    renderOrderForm();

    expect(await screen.findByText(/Completed/i)).toBeTruthy();
    expect(await screen.findByText(/John Doe/i)).toBeTruthy();
    expect(await screen.findByText(/Success/i)).toBeTruthy();
  });

  test("fetches orders only when token is present", async () => {
    const useAuthSpy = jest.spyOn(require("../../context/auth"), "useAuth");
    useAuthSpy.mockReturnValue([null, jest.fn()]); 

    renderOrderForm();

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });

    useAuthSpy.mockRestore();
  });

  test("displays fallback message when fetching orders fails", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    renderOrderForm();

    expect(await screen.findByText("All Orders")).toBeTruthy();
  });

  test("displays relative date in correct format", async () => {
    const mockDate = "2025-02-12T12:00:00Z";
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          status: "Completed",
          buyer: { name: "John Doe" },
          createAt: mockDate,
          payment: { success: true },
          products: [
            {
              _id: "p1",
              name: "Product 1",
              description: "A product",
              price: 100,
            },
          ],
        },
      ],
    });

    renderOrderForm();

    const relativeTimeText = await screen.findByText((content) =>
      content.includes("ago")
    );
    expect(relativeTimeText).toBeTruthy();
  });

  test("displays product information correctly", async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          status: "Completed",
          buyer: { name: "John Doe" },
          createAt: "2025-02-12T12:00:00Z",
          payment: { success: true },
          products: [
            {
              _id: "p1",
              name: "Product 1",
              description: "A description of product 1",
              price: 100,
            },
          ],
        },
      ],
    });

    renderOrderForm();

    const productName = await screen.findByText("Product 1");
    expect(productName).toBeTruthy();

    const productDescription = await screen.findByText(
      "A description of product 1"
    );
    expect(productDescription).toBeTruthy();

    const productPrice = await screen.findByText("Price : 100");
    expect(productPrice).toBeTruthy();
  });

  test("handles undefined or missing data gracefully", async () => {
    axios.get.mockResolvedValue({ data: undefined });

    renderOrderForm();

    const noOrdersMessage = await screen.findByText("All Orders");
    expect(noOrdersMessage).toBeTruthy();
  });
});
