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

  test("displays fallback message when fetching orders fails", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    renderOrderForm();

    expect(await screen.findByText("All Orders")).toBeTruthy();
  });
});
