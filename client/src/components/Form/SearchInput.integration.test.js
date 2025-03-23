import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom";

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const renderSearchInput = () => {
  return render(<SearchInput />);
};

describe("SearchInput Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger API call and navigate when form is submitted", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Test" }, setValuesMock]);
    axios.get.mockResolvedValue({ data: [] });
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Test" } });

    const submitButton = screen.getByText("Search");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Test");
    });

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalledWith({
        keyword: "Test",
        results: [],
      });
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/search");
    });
  });

  it("should handle API error gracefully", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Test" }, setValuesMock]);
    axios.get.mockRejectedValue(new Error("API error"));
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Test" } });

    const submitButton = screen.getByText("Search");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Test");
    });

    await waitFor(() => {
      expect(setValuesMock).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});
