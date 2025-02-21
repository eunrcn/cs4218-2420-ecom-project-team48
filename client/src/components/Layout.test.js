import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";
import "@testing-library/jest-dom/extend-expect";

// Mocking Helmet, Header, Footer, and Toaster components
jest.mock("react-helmet", () => ({
  Helmet: ({ children }) => <div>{children}</div>,
}));

jest.mock("./Header", () => () => <div>Header Component</div>);

jest.mock("./Footer", () => () => <div>Footer Component</div>);

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div>Toaster Component</div>,
}));

describe("Layout Component", () => {
  
  test("renders Helmet with correct title, description, keywords, and author", () => {
    render(
      <MemoryRouter>
        <Layout
          title="Test Page"
          description="Test Description"
          keywords="test, react, unit test"
          author="Test Author"
        />
      </MemoryRouter>
    );

    // check for title
    expect(screen.getByText("Test Page")).toBeInTheDocument();

    // check meta tags in the document head
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    const authorMeta = document.querySelector('meta[name="author"]');

    expect(descriptionMeta).toHaveAttribute("content", "Test Description");
    expect(keywordsMeta).toHaveAttribute("content", "test, react, unit test");
    expect(authorMeta).toHaveAttribute("content", "Test Author");
  });

  test("renders Header and Footer components correctly", () => {
    render(
      <MemoryRouter>
        <Layout title="Test Page">
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText("Header Component")).toBeInTheDocument();
    expect(screen.getByText("Footer Component")).toBeInTheDocument();
  });

  test("renders children prop content inside the layout", () => {
    render(
      <MemoryRouter>
        <Layout title="Test Page">
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders Toaster component correctly", () => {
    render(
      <MemoryRouter>
        <Layout title="Test Page">
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText("Toaster Component")).toBeInTheDocument();
  });
});
