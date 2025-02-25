import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

jest.mock("axios");

describe("useCategory Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // To silence console.log for error test
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test("should fetch categories and return them", async () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Clothing", slug: "clothing" }
    ];

    axios.get.mockResolvedValueOnce({
      data: { category: mockCategories }
    });

    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });

  test("should handle API errors gracefully", async () => {
    const mockError = new Error("API Error");
    axios.get.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Should still be an empty array
    expect(result.current).toEqual([]);
    expect(console.log).toHaveBeenCalledWith(mockError);
  });

  test("should handle empty category data", async () => {
    axios.get.mockResolvedValueOnce({
      data: { category: [] }
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toEqual([]);
  });

  test("should handle undefined category data", async () => {
    axios.get.mockResolvedValueOnce({
      data: {}
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toEqual([]);
  });

  test("should handle null category data", async () => {
    axios.get.mockResolvedValueOnce({
      data: { category: null }
    });

    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toEqual([]);
  });
}); 