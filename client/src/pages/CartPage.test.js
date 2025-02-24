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

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: ({ onInstance }) => {
    onInstance({
      requestPaymentMethod: jest
        .fn()
        .mockResolvedValue({ nonce: "test-nonce" }),
    });
    return <div data-testid="dropin-component"></div>;
  },
}));

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
          name: "Product 1",
          price: 100,
          description: "Test description",
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
      { user: { name: "John Doe" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Test description",
        },
      ],
      jest.fn(),
    ]);

    renderCartPage();

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Price : 100")).toBeInTheDocument();
  });

  it("should remove item from cart when remove button is clicked", () => {
    const setCartMock = jest.fn();
    useAuth.mockReturnValue([
      { user: { name: "John Doe" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Test description",
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
      { user: { name: "John Doe" }, token: "test-token" },
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
        user: { name: "John Doe", address: "123 Street" },
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
      { user: { name: "John Doe" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Test description",
        },
        {
          _id: "2",
          name: "Product 2",
          price: 200,
          description: "Test description 2",
        },
      ],
      jest.fn(),
    ]);

    renderCartPage();

    expect(screen.getByText("Total : $300.00")).toBeInTheDocument(); 
  });

  it("should prompt user to update address if no address is set", () => {
    useAuth.mockReturnValue([
      { user: { name: "John Doe", address: "" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([[], jest.fn()]);

    renderCartPage();

    const updateAddressButton = screen.getByText("Update Address");
    fireEvent.click(updateAddressButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });


    it("should navigate to orders page and show toast after successful payment", async () => {
    useAuth.mockReturnValue([
      { user: { name: "John Doe", address: "123 Main St" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        { _id: "1", name: "Product 1", price: 100, description: "Test description" },
      ],
      jest.fn(),
    ]);

    // Mock axios to return a successful response
    axios.post.mockResolvedValue({ data: "Payment Successful" });

    renderCartPage();

    // Wait for DropIn to initialize and fire payment event
    const paymentButton = screen.getByText("Make Payment");

    // Simulate the payment flow
    fireEvent.click(paymentButton);

    // Wait for the successful payment response and assert the following:
    await waitFor(() => {
      // Ensure that the navigation to the orders page happens
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");

      // Ensure that the toast message "Payment Completed Successfully" is shown
      expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
    });

    // Verify that localStorage is cleared after successful payment
    expect(localStorage.getItem("cart")).toBeNull();
  });

  it("should show error toast if payment fails", async () => {
    useAuth.mockReturnValue([
      { user: { name: "John Doe", address: "123 Main St" }, token: "test-token" },
    ]);
    useCart.mockReturnValue([
      [
        { _id: "1", name: "Product 1", price: 100, description: "Test description" },
      ],
      jest.fn(),
    ]);

    // Mock axios to return an error
    axios.post.mockRejectedValue(new Error("Payment Failed"));

    renderCartPage();

    const paymentButton = screen.getByText("Make Payment");
    fireEvent.click(paymentButton);

    // Assert that the toast message for failure is shown
    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled();
      // You could have another toast for failure here
      // Example: toast.error("Payment Failed");
    });
  });

});

