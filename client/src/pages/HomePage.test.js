import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { useCart } from "../context/cart";
import axios from "axios";
import { MemoryRouter, useNavigate, BrowserRouter } from "react-router-dom";
import { Prices } from "../components/Prices";
import { expect } from "@playwright/test";
import { log } from "console";

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




describe("HomePage Component", () => {
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

    it("renders HomePage with categories and products", async () => {

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
        expect(await screen.getByText(mockProducts[0].name)).toBeInTheDocument();
        expect(await screen.getByText("$1,000.00")).toBeInTheDocument();
        expect(screen.getAllByText(mockCatergory[0].name)).toHaveLength(2);
        expect(screen.getAllByText(mockCatergory[1].name)).toHaveLength(2);
        expect(screen.getByText('Loadmore')).toBeInTheDocument();
    });

    it("should filters products by category", async () => {

        axios.post.mockImplementation((url) => {
            if (url === "/api/v1/product/product-filters") {
                return Promise.resolve({ data: { products: mockProducts2 } });
            }
        });


        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        const checkboxes = await screen.getAllByRole('checkbox');
        // Click on the second checkbox (Cat 2)
        fireEvent.click(checkboxes[1]);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
                checked: ["2"],
                radio: [],
            });
            expect(screen.getByText(mockProducts2[0].name)).toBeInTheDocument();
        });


        //Uncheck the second checkbox (Cat 2)
        fireEvent.click(checkboxes[1]);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
                checked: ["2"],
                radio: [],
            });
            expect(screen.queryByText(mockProducts2[0].name)).not.toBeInTheDocument();
        });

    });

    it("should filter product by price", async () => {

        axios.post.mockImplementation((url) => {
            if (url === "/api/v1/product/product-filters") {
                return Promise.resolve({ data: { products: mockProducts2 } });
            }
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        Prices.forEach((price) => {
            expect(screen.getByLabelText(price.name)).toBeInTheDocument();
        });

        const radioButtons = await screen.getAllByRole('radio');
        // // Click on the second radio button ($20 to 39)
        fireEvent.click(radioButtons[1]);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
                checked: [],
                radio: [20, 39],
            });
            expect(screen.getByText(mockProducts2[0].name)).toBeInTheDocument();
        });
    });

    it("should filter product by category and price", async () => {

        axios.post.mockImplementation((url) => {
            if (url === "/api/v1/product/product-filters") {
                return Promise.resolve({ data: { products: mockProducts2 } });
            }
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        Prices.forEach((price) => {
            expect(screen.getByLabelText(price.name)).toBeInTheDocument();
        });

        const checkboxes = await screen.getAllByRole('checkbox');
        const radioButtons = await screen.getAllByRole('radio');
        // Click on the second category button (Category 2)
        fireEvent.click(checkboxes[1]);
        // Click on the second radio button ($20 to 39)
        fireEvent.click(radioButtons[1]);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
                checked: ["2"],
                radio: [20, 39],
            });
            expect(screen.getByText(mockProducts2[0].name)).toBeInTheDocument();
        });
    });

    it("should add product to cart", async () => {

        axios.get.mockResolvedValueOnce({
            data: { success: true, category: mockCatergory },
        });

        axios.get.mockResolvedValueOnce({
            data: { products: mockProducts },
        });

        useCart.mockReturnValue([[], jest.fn()]);

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        Storage.prototype.setItem = jest.fn();
        const addToCartButton = await screen.findByText("ADD TO CART");
        fireEvent.click(addToCartButton);

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });

    it("should reload the page when the reset button is clicked", async () => {
        const window_location = window.location
        delete window.location;
        window.location = { reload: jest.fn() };
        await act(async () => {
            render(
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            );
        });
        const resetButton = screen.getByText(/RESET FILTERS/i);
        fireEvent.click(resetButton);
        expect(window.location.reload).toHaveBeenCalled();
        window.location = window_location;
    });

    it("navigates to the correct product page on button click", async () => {
        const navigateMock = jest.fn();
        useNavigate.mockReturnValue(navigateMock);

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        const detailsButton = screen.getByText(/More Details/i);
        expect(detailsButton).toBeInTheDocument();

        fireEvent.click(detailsButton);
        expect(navigateMock).toHaveBeenCalledWith(`/product/${mockProducts[0].slug}`);
    });

    it("renders the loadmore button when there are more than one to load", async () => {

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

        useCart.mockReturnValue([[], jest.fn()]);

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        const loadMoreButton = await screen.findByText("Loadmore");
        fireEvent.click(loadMoreButton);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("should log error when getTotal fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        axios.get.mockImplementation(() => {
            return Promise.reject(mockError);
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

    it("should log error when loadmore fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({ data: { success: true, category: mockCatergory } });
            }
            if (url === "/api/v1/product/product-list/1") {
                return Promise.resolve({ data: { products: mockProducts } });
            }
            if (url === "/api/v1/product/product-list/2") {
                return Promise.reject(mockError);
            }
            if (url === "/api/v1/product/product-count") {
                return Promise.resolve({ data: { total: 2 } });
            }
            return Promise.resolve({ data: {} });
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });


        const loadMoreButton = await screen.findByText("Loadmore");
        fireEvent.click(loadMoreButton);

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

    it("should log error when filterProduct fails", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        axios.post.mockImplementation((url) => {
            if (url === "/api/v1/product/product-filters") {
                return Promise.reject(mockError);
            }
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        const checkbox = await screen.getAllByRole('checkbox');
        fireEvent.click(checkbox[1]);
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(mockError));
        logSpy.mockRestore();
    });

});

