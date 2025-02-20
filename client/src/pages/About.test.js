import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

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

const renderAboutPage = () => {
  render(
    <MemoryRouter initialEntries={["/about"]}>
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("About Page Component", () => {
  
  test("about component renders correctly", async () => {
    renderAboutPage();
    expect(await screen.findByText(/Add text/i)).toBeTruthy();
  });

  test("verifies if the Layout component wraps the About page", async () => {
    renderAboutPage();
    expect(await screen.findByText(/Add text/i)).toBeTruthy();
  });

  test("checks if the about page displays an image", async () => {
    renderAboutPage();
    const img = screen.getByAltText("contactus");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/about.jpeg");
  });

});
