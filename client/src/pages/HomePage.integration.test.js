import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react";
import axios from "axios";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import Cart from "./CartPage";
import HomePage from "../pages/HomePage";
import { Prices } from "../components/Prices";
import { expect } from "@playwright/test";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[], jest.fn()]), // Ensure cart is an empty array, not null
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("HomePage integration", () => {
  const mockProducts = [{ _id: "1", name: "Product 1", price: 1000, description: "Test product", slug: "product1" }];
  const mockProducts2 = [{ _id: "2", name: "Product 2", price: 100, description: "Test product", slug: "product2" }];
  const mockCatergory = [{ _id: "1", name: "Category 1", slug: "cat1" }, { _id: "2", name: "Category 2", slug: "cat2" }];
  const mockError = new Error("Mock Error");

  beforeAll(() => {
      Object.defineProperty(window, "matchMedia", {
          writable: true,
          value: jest.fn().mockImplementation((query) => ({
              matches: false,
              media: query,
              onchange: null,
              addListener: jest.fn(),
              removeListener: jest.fn(),
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              dispatchEvent: jest.fn(),
          })),
      });
  });

  beforeEach(() => {
      axios.get.mockImplementation((url) => {
          if (url === "/api/v1/category/get-category") {
              return Promise.resolve({ data: { success: true, category: mockCatergory } });
          }
          if (url === "/api/v1/product/product-list/1") {
              return Promise.resolve({ data: { products: mockProducts } });
          }
          if (url === "/api/v1/product/product-list/2") {
              return Promise.resolve({ data: { products: mockProducts2 } });
          }
          if (url === "/api/v1/product/product-count") {
              return Promise.resolve({ data: { total: 2 } });
          }
          return Promise.resolve({ data: {} });
      });

      jest.clearAllMocks();
  });

  // Simulating complete user flow: rendering the home page, filter by category, price, add an item to the cart, and reset filters.
  it("renders HomePage with categories and products", async () => {

    // 1. Set up initial render
    await act(async () => {
      render(
        <BrowserRouter initialEntries={["/"]}> {/* Start at Home */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </BrowserRouter>
      );
    });

    // 2. Verify category and product filter are there
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    expect(await screen.getByText(mockProducts[0].name)).toBeInTheDocument();
    expect(await screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getAllByText(mockCatergory[0].name)).toHaveLength(2);
    expect(screen.getAllByText(mockCatergory[1].name)).toHaveLength(2);
    expect(screen.getByText('Loadmore')).toBeInTheDocument();

    // 3. Simulate filters products by category
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
          return Promise.resolve({ data: { products: mockProducts2 } });
      }
    });

    const checkboxes = await screen.getAllByRole('checkbox');
    // Click on the second checkbox (Cat 2)
    fireEvent.click(checkboxes[1]);

    // 4. filter product by price
    Prices.forEach((price) => {
      expect(screen.getByLabelText(price.name)).toBeInTheDocument();
    });

    const radioButtons = await screen.getAllByRole('radio');
    // Click on the second radio button ($20 to 39)
    fireEvent.click(radioButtons[1]);

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
            checked: ["2"],
            radio: [20, 39],
        });
        expect(screen.getByText(mockProducts2[0].name)).toBeInTheDocument();
    });

    // 5. Add product to cart
    axios.get.mockResolvedValueOnce({
        data: { success: true, category: mockCatergory },
    });

    axios.get.mockResolvedValueOnce({
        data: { products: mockProducts },
    });

    Storage.prototype.setItem = jest.fn();
    const addToCartButton = await screen.findAllByText("ADD TO CART");
    fireEvent.click(addToCartButton[0]); // Clicks the first button

    await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    // 6. reset filter
    const window_location = window.location
    delete window.location;
    window.location = { reload: jest.fn() };
    const resetButton = screen.getByText(/RESET FILTERS/i);
    fireEvent.click(resetButton);
    expect(window.location.reload).toHaveBeenCalled();
    window.location = window_location;

  });


    // //Uncheck the second checkbox (Cat 2)
    // fireEvent.click(checkboxes[1]);

    // await waitFor(() => {
    //     expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
    //         checked: ["2"],
    //         radio: [],
    //     });
    //     expect(screen.queryByText(mockProducts2[0].name)).not.toBeInTheDocument();
    // });

  // });

});

    // // 3. Simulate user input
    // fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
    //   target: { value: "Jane Doe" },
    // });
    // fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
    //     target: { value: "newpassword" },
    // });
    // fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
    //   target: { value: "9876543210" },
    // });
    // fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
    //   target: { value: "456 Alt St" },
    // });

    // // 4. Simulate the update button click
    // fireEvent.click(screen.getByText("UPDATE"));

    // await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // // 5. Verify profile success
    // expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");

    // // 6. Verify the localStorage has been updated with the new data
    // expect(localStorage.setItem).toHaveBeenCalledWith(
    //   "auth",
    //   expect.stringContaining('"name":"Jane Doe"')
    // );
      
//   });

// });