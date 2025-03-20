/* eslint-disable testing-library/no-node-access */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartPage from "./CartPage";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import axios from "axios";
import "@testing-library/jest-dom";
import React from "react";

// Mocks
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("braintree-web-drop-in-react", () => {
  return function DropIn(props) {
    return (
      <div data-testid="mock-dropin">
        <button
          onClick={() =>
            props.onInstance({
              requestPaymentMethod: async () => ({ nonce: "test-nonce" }),
            })
          }
        >
          DropIn mock
        </button>
      </div>
    );
  };
});

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

const renderCartPage = () => {
  return render(
    <BrowserRouter>
      <CartPage />
    </BrowserRouter>
  );
};

describe("CartPage Component", () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    jest.clearAllMocks();
    global.localStorage = {
      removeItem: jest.fn(),
      setItem: jest.fn(),
      getItem: jest.fn(),
    };
  });

  it("should fetch Braintree client token on mount", async () => {
    useAuth.mockReturnValue([{ user: { name: "Saber" }, token: "test-token" }]);
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockResolvedValue({ data: { clientToken: "test-client-token" } });

    renderCartPage();

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );
  });

  it("should handle payment successfully", async () => {
    const setCartMock = jest.fn();
    const mockToast = require("react-hot-toast");

    useAuth.mockReturnValue([
      { user: { name: "Saber", address: "Singapore" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Saber",
          price: 444,
          description: "Description",
        },
      ],
      setCartMock,
    ]);

    axios.post.mockResolvedValue({ data: { success: true } });

    mockToast.success.mockClear();

    render(<CartPage />);

    const dropIn = await screen.findByTestId("mock-dropin");
    fireEvent.click(dropIn.querySelector("button"));

    const paymentButton = await screen.findByRole("button", {
      name: /make payment/i,
    });

    fireEvent.click(paymentButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "test-nonce",
          cart: [
            {
              _id: "1",
              name: "Saber",
              price: 444,
              description: "Description",
            },
          ],
        })
      );
    });

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
    });

    expect(setCartMock).toHaveBeenCalledWith([]);
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringMatching(/Payment Completed Successfully/i)
      );
    });
  });

  it("should handle payment failure", async () => {
    const setCartMock = jest.fn();
    const mockToast = require("react-hot-toast");

    axios.post.mockRejectedValue(new Error("Payment failed"));

    useAuth.mockReturnValue([
      { user: { name: "Saber", address: "Singapore" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Saber",
          price: 444,
          description: "Description",
        },
      ],
      setCartMock,
    ]);

    mockToast.success.mockClear();

    render(<CartPage />);

    const dropIn = await screen.findByTestId("mock-dropin");
    fireEvent.click(dropIn.querySelector("button"));

    const paymentButton = await screen.findByRole("button", {
      name: /make payment/i,
    });

    fireEvent.click(paymentButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "test-nonce",
          cart: [
            {
              _id: "1",
              name: "Saber",
              price: 444,
              description: "Description",
            },
          ],
        })
      );
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(new Error("Payment failed"));
  });
});
