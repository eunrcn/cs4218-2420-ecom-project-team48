import { renderHook, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

describe("useCart Hook", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with an empty list", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current[0]).toEqual([]);
  });

  it("should load data from localStorage", async () => {
    const mockItems = [{ id: "1", name: "Item 1" }];
    localStorage.getItem.mockReturnValue(JSON.stringify(mockItems));

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    await waitFor(() => expect(result.current[0]).toEqual(mockItems));
    expect(localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  it("should update list state when setList is called", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const updatedList = [
      { id: "2", name: "Item 2" },
      { id: "3", name: "Item 3" },
    ];

    act(() => {
      result.current[1](updatedList);
    });

    expect(result.current[0]).toEqual(updatedList);
  });
  
  it("should call localStorage.getItem on mount to load list data", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith("cart");
    expect(localStorage.getItem).toHaveBeenCalledTimes(1); 
  });

  it("should persist list data across renders", () => {
    const { result, rerender } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const initialList = [{ id: "4", name: "Item 4" }];

    act(() => {
      result.current[1](initialList);
    });

    rerender();

    expect(result.current[0]).toEqual(initialList);
  });

  it("should persist list data after page refresh", () => {
    const { result, rerender } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const initialList = [{ id: "5", name: "Item 5" }];

    act(() => {
      result.current[1](initialList);
    });

    rerender();

    expect(result.current[0]).toEqual(initialList);
  });
});
