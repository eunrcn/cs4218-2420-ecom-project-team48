import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Pagenotfound from "./Pagenotfound";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const renderPagenotfoundPage = () => {
  render(
    <MemoryRouter initialEntries={["/Pagenotfound"]}>
      <Routes>
        <Route path="/Pagenotfound" element={<Pagenotfound />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Pagenotfound Page Component", () => {
  
  test("renders the Pagenotfound component correctly", () => {
    renderPagenotfoundPage();
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Oops ! Page Not Found/i)).toBeInTheDocument();
  });

  test("verifies that the Layout component receives the correct title prop", async () => {
    renderPagenotfoundPage();
    await waitFor(() => {
      expect(document.title).toBe("go back- page not found");
    });
  });

  test("checks if the 'Go Back' button is present and links to '/'", () => {
    renderPagenotfoundPage();
    const goBackLink = screen.getByRole("link", { name: /go back/i });
    expect(goBackLink).toBeInTheDocument();
    expect(goBackLink).toHaveAttribute("href", "/");
  });

});
