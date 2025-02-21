import { renderHook, act } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search";

describe("useSearch Hook", () => {
  it("should initialize with default search state", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current[0]).toEqual({ keyword: "", results: [] });
  });

  it("should update keyword when setAuth is called", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    act(() => {
      result.current[1]((prev) => ({ ...prev, keyword: "React" }));
    });

    expect(result.current[0].keyword).toBe("React");
  });

  it("should update results when setAuth is called", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    const mockResults = [{ id: 1, name: "React Testing" }];

    act(() => {
      result.current[1]((prev) => ({ ...prev, results: mockResults }));
    });

    expect(result.current[0].results).toEqual(mockResults);
  });

  it("should preserve previous state while updating keyword", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    const mockResults = [{ id: 1, name: "React Testing" }];

    act(() => {
      result.current[1]((prev) => ({ ...prev, results: mockResults }));
    });

    act(() => {
      result.current[1]((prev) => ({ ...prev, keyword: "React Hooks" }));
    });

    expect(result.current[0]).toEqual({
      keyword: "React Hooks",
      results: mockResults,
    });
  });
});
