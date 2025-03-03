import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { useCart } from "../context/cart";
import axios from "axios";
import { MemoryRouter, useNavigate, BrowserRouter } from "react-router-dom";
import { Prices } from "../components/Prices";


// Mock axios
jest.mock("axios");

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../components/Prices", () => ({
    Prices: [
        { _id: 1, name: "Under $10", array: [0, 9] },
        { _id: 2, name: "$10 - $50", array: [10, 50] },
    ],
}));



describe("HomePage Component", () => {
    const mockProducts = [{ _id: "1", name: "Laptop", price: 1000, description: "Powerful laptop", slug: "laptop" }];
    const mockCatergory = [{ _id: "1", name: "Electronics" }];
    const mockError = new Error("Mock Error");

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
    };

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
        jest.clearAllMocks();
    });

    it("renders HomePage with categories and products", async () => {

        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({ data: { success: true, category: mockCatergory } });
            }
            if (url.startsWith("/api/v1/product/product-list")) {
                return Promise.resolve({ data: { products: mockProducts } });
            }
            if (url === "/api/v1/product/product-count") {
                return Promise.resolve({ data: { total: 1 } });
            }
            return Promise.resolve({ data: {} });
        });

        useCart.mockReturnValue([[], jest.fn()]);

        renderComponent();

        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
        expect(await screen.findByText("Electronics", { selector: ".filters span" })).toBeInTheDocument();

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("$1,000.00")).toBeInTheDocument();
    });

    it("should filters products by category", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({ data: { success: true, category: mockCatergory } });
            }
            if (url.startsWith("/api/v1/product/product-list")) {
                return Promise.resolve({ data: { products: mockProducts } });
            }
            if (url === "/api/v1/product/product-count") {
                return Promise.resolve({ data: { total: 1 } });
            }
            return Promise.resolve({ data: {} });
        });

        useCart.mockReturnValue([[], jest.fn()]);

        renderComponent();

        const checkbox = await screen.findByRole("checkbox", { name: /Electronics/i });
        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
                checked: ["1"],
                radio: [],
            });
        });

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        //Continue this check here.

        fireEvent.click(checkbox);


    });

    it("should add product to cart", async () => {

        axios.get.mockResolvedValueOnce({
            data: { success: true, category: mockCatergory },
        });

        axios.get.mockResolvedValueOnce({
            data: { products: mockProducts },
        });

        useCart.mockReturnValue([[], jest.fn()]);

        renderComponent();

        Storage.prototype.setItem = jest.fn();
        const addToCartButton = await screen.findByText("ADD TO CART");
        fireEvent.click(addToCartButton);

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });

    it("should log error when getAllCategory fails", async () => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        jest.spyOn(axios, "get").mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.reject(mockError);
            }
            return Promise.resolve({ data: { success: true } });
        });

        renderComponent();
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

    it("should log error when getAllProducts fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        axios.get.mockImplementation((url) => {
            if (url.includes("/api/v1/product/product-list")) {
                return Promise.reject(mockError);
            }
            return Promise.resolve({ data: { success: true, category: [] } });
        });

        renderComponent();

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

    it("should log error when getTotal fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        axios.get.mockImplementation((url) => {
            return Promise.reject(mockError);
        });

        renderComponent();

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

    it("should reload the page when the reset button is clicked", () => {
        const window_location = window.location
        delete window.location;
        window.location = { reload: jest.fn() };

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const resetButton = screen.getByText(/RESET FILTERS/i);
        fireEvent.click(resetButton);
        expect(window.location.reload).toHaveBeenCalled();
        window.location = window_location;
    });

    it("should render radio buttons and updates selection on click", () => {
        renderComponent();

        Prices.forEach((price) => {
            expect(screen.getByLabelText(price.name)).toBeInTheDocument();
        });

        const selectedRadio = screen.getByLabelText("Under $10");
        const otherRadio = screen.getByLabelText("$10 - $50");
        fireEvent.click(selectedRadio);

        expect(selectedRadio).toBeChecked();
        expect(otherRadio).not.toBeChecked();
    });
    

});

