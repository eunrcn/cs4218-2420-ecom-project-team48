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

  it("should render search input field and button", () => {
    useSearch.mockReturnValue([{ keyword: "" }, jest.fn()]);

    renderSearchInput();

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("should have the input field initially empty", () => {
    useSearch.mockReturnValue([{ keyword: "" }, jest.fn()]);

    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    expect(input.value).toBe("");
  });


  it("should update keyword in search input", () => {
    const setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "" }, setValuesMock]);

    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "Test" } });

    expect(setValuesMock).toHaveBeenCalledWith({ keyword: "Test" });
  });

});
