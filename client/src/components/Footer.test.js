import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer Component", () => {
  test("renders Footer component correctly", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check if footer exists in the document
    expect(screen.getByText(/All Rights Reserved © TestingComp/i)).toBeInTheDocument();
  });

  test("contains navigation links to About, Contact, and Privacy Policy", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check for the presence of navigation links
    expect(screen.getByRole("link", { name: /About/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /Contact/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/policy");
  });

  test("verifies the 'About' link navigates correctly", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check if the About link has the correct href attribute
    const aboutLink = screen.getByRole("link", { name: /About/i });
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  test("verifies the 'Contact' link navigates correctly", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check if the Contact link has the correct href attribute
    const contactLink = screen.getByRole("link", { name: /Contact/i });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  test("verifies the 'Privacy Policy' link navigates correctly", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check if the Privacy Policy link has the correct href attribute
    const policyLink = screen.getByRole("link", { name: /Privacy Policy/i });
    expect(policyLink).toHaveAttribute("href", "/policy");
  });

});