import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom";

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
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

  it("should render search input field and button", () => {
    useSearch.mockReturnValue([{ keyword: "" }, jest.fn()]);

    renderSearchInput();

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("should update keyword in search input", () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "" }, setValuesMock]);

    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Test" } });

    expect(setValuesMock).toHaveBeenCalledWith({ keyword: "Test" });
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

  it("should call e.preventDefault() on form submission", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Test" }, setValuesMock]);
    axios.get.mockResolvedValue({ data: [] });
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    renderSearchInput();

    const form = screen.getByRole("search");
    const preventDefaultMock = jest.fn();
    form.onsubmit = preventDefaultMock;

    const submitButton = screen.getByText("Search");
    fireEvent.click(submitButton);

    expect(preventDefaultMock).toHaveBeenCalled();
  });

  it("should handle API call failure by not updating the values and not navigating", async () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Test" }, setValuesMock]);
    axios.get.mockRejectedValueOnce(new Error("API error"));
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
