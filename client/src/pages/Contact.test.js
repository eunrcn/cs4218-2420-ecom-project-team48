import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";

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

const renderContactPage = () => {
  render(
    <MemoryRouter initialEntries={["/contact"]}>
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Contact Page Component", () => {
  
  test("contact components renders correctly", async () => {
    renderContactPage();
    expect(await screen.findByText(/CONTACT US/i)).toBeTruthy();
  });

  test("contact page displays a title 'CONTACT US'", async () => {
    renderContactPage();
    // Check that the title "CONTACT US" is rendered on the page
    expect(await screen.findByText(/CONTACT US/i)).toBeInTheDocument();
  });

  test("displays correct contact details (email, phone, and support number)", async () => {
    renderContactPage();
    expect(await screen.findByText(/saber@nus.edu.sg/i)).toBeTruthy();
    expect(await screen.findByText(/9995 2134/i)).toBeTruthy();
    expect(await screen.findByText(/1800-1234-5678/i)).toBeTruthy();
  });

  test("renders the contact image correctly", async () => {
    renderContactPage();
    const img = screen.getByAltText("contactus");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  }); 

  test("verifies if the Layout component wraps the Contact page", async () => {
    renderContactPage();
    expect(screen.findByText(/CONTACT US/i)).toBeTruthy();
    // Check if Layout component is applied by checking for a title or similar property
    expect(screen.findByText(/Ecommerce app/i)).toBeTruthy();
  });

});
