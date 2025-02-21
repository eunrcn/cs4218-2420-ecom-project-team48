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
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
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
});
