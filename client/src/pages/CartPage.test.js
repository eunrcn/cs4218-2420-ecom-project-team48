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


  it("should log error when removeCartItem throws an error", () => {
    const mockError = new Error("Failed to remove item");

    const setCart = jest.fn().mockImplementationOnce(() => {
      throw mockError;
    });

    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product B",
          price: 1,
          description: "Description",
        },
      ],
      setCart,
      jest.fn(),
      jest.fn(),
    ]);

    renderCartPage();

    const removeButton = screen.getByRole("button", { name: "Remove" });

    fireEvent.click(removeButton);

    expect(setCart).toHaveBeenCalledTimes(1);

    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
  });

  it("should log error when totalPrice throws an error", () => {
    const mockError = new Error("Failed to calculate total price");

    const mockToLocaleString = jest.spyOn(Number.prototype, "toLocaleString");
    mockToLocaleString.mockImplementation(() => {
      throw mockError;
    });

    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);

    mockToLocaleString.mockRestore();
  });

  it("should render empty cart message when cart is empty", () => {
    useAuth.mockReturnValue([{ user: null, token: null }]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();

    expect(screen.getByText("Your Cart Is Empty")).toBeInTheDocument();
  });

  it("should display cart items when cart is not empty", () => {
    useAuth.mockReturnValue([
      { user: { name: "Saber" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product A",
          price: 1,
          description: "Test description",
        },
      ],
      jest.fn(),
    ]);

    renderCartPage();

    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Price : 1")).toBeInTheDocument();
  });

  it("should remove item from cart when remove button is clicked", () => {
    const setCartMock = jest.fn();
    useAuth.mockReturnValue([
      { user: { name: "Saber" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product Z",
          price: 10,
          description: "Description",
        },
      ],
      setCartMock,
    ]);

    renderCartPage();

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(setCartMock).toHaveBeenCalled();
  });

  it("should fetch Braintree client token on mount", async () => {
    useAuth.mockReturnValue([
      { user: { name: "Saber" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockResolvedValue({ data: { clientToken: "test-client-token" } });

    renderCartPage();

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );
  });

  it("should not show payment button when user is not logged in", () => {
    useAuth.mockReturnValue([{ user: null, token: null }]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();

    expect(screen.queryByText("Make Payment")).toBeNull();
  });

  it("should navigate to profile page when update address button is clicked", () => {
    useAuth.mockReturnValue([
      {
        user: { name: "Saber", address: "Singapore" },
        token: "test-token",
      },
    ]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();

    const updateAddressButton = screen.getByText("Update Address");
    fireEvent.click(updateAddressButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

    it("should navigate to login page when user is not logged in and clicks 'Please Login to checkout'", () => {
      useAuth.mockReturnValue([{ user: null, token: null }]);
      useCart.mockReturnValue([[], jest.fn()]);

      renderCartPage();

      const loginButton = screen.getByText("Plase Login to checkout");
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/cart",
      });
    });

  it("should correctly display the total price of the cart", () => {
    useAuth.mockReturnValue([
      { user: { name: "Saber" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product X",
          price: 444,
          description: "Description",
        },
        {
          _id: "2",
          name: "Product Y",
          price: 400,
          description: "Description",
        },
      ],
      jest.fn(),
    ]);

    renderCartPage();

    expect(screen.getByText("Total : $844.00")).toBeInTheDocument(); 
  });

  it("should prompt user to update address if no address is set", () => {
    useAuth.mockReturnValue([
      { user: { name: "Saber", address: "" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();

    const updateAddressButton = screen.getByText("Update Address");
    fireEvent.click(updateAddressButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
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
});

