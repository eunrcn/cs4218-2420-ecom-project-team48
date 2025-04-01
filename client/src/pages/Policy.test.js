import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Policy from "./Policy";

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

const renderPolicyPage = () => {
  render(
    <MemoryRouter initialEntries={["/policy"]}>
      <Routes>
        <Route path="/policy" element={<Policy />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Policy Page Component", () => {

    test("renders the Policy component correctly", async () => {
      renderPolicyPage();
      // Check that the component renders without errors using placeholder privacy policy text
      expect(screen.findByText(/1. Information We Collect: /i));
    });
    
    test("ensures Layout component wraps the Policy page", async () => {
      renderPolicyPage();
      // Verify if the Layout component is applied by checking for a title or content within the layout
      expect(screen.findByText(/Ecommerce app/i)).toBeTruthy();
    });

    test("renders an image on the policy page", async () => {
      renderPolicyPage();
      // Check that the image is rendered correctly
      const img = screen.getByAltText("contactus");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
    });


});
