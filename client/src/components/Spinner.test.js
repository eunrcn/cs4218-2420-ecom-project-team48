import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import "@testing-library/jest-dom/extend-expect";
import { act } from 'react-dom/test-utils';

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

const renderSpinnerComponent = () => {
  render(
    <MemoryRouter>
      <Spinner />
    </MemoryRouter>
  );
};

describe("Spinner Component", () => {
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  
  // mock the location object
  useLocation.mockReturnValue({ pathname: "/some/path" });

  test("should render spinner and countdown message correctly", () => {
    renderSpinnerComponent();
    // check if the spinner is in the document
    expect(screen.getByRole("status")).toBeInTheDocument();
    // check if the countdown message is rendered
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
  });
  
  test("should start with a countdown at 3 seconds", () => {
    renderSpinnerComponent();
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
  });

  test("should update countdown every second", () => {
    jest.useFakeTimers();
    renderSpinnerComponent();

    // countdown should start at 3
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();

    // fast forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // check for countdown (should be 2)
    expect(screen.getByText(/redirecting to you in 2 second/i)).toBeInTheDocument();

    // fast forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // check for countdown (should be 1)
    expect(screen.getByText(/redirecting to you in 1 second/i)).toBeInTheDocument();

    // fast forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // check for countdown (should be 0)
    expect(screen.getByText(/redirecting to you in 0 second/i)).toBeInTheDocument();
  });

  test("should navigate to the correct path after countdown reaches 0", async () => {
    jest.useFakeTimers();
    renderSpinnerComponent();
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/redirecting to you in 0 second/i)).toBeInTheDocument();
    // Verify that navigate has been called with the correct path after the countdown reaches 0
    expect(mockNavigate).toHaveBeenCalledWith("/login", expect.objectContaining({ state: expect.anything() }));
  });

});
