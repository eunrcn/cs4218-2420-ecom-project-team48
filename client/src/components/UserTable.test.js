import React from "react";
import { render, screen, within } from "@testing-library/react";
import UserTable from "./UserTable";
import "@testing-library/jest-dom";

describe("UserTable Component", () => {
  const mockUsers = [
    { _id: "1", name: "Admin User", email: "admin@test.com", role: 1 },
    { _id: "2", name: "Regular User", email: "user@test.com", role: 0 },
    { _id: "3", name: "Another User", email: "another@test.com", role: 0 },
  ];

  const renderComponent = (users = mockUsers) => {
    return render(<UserTable users={users} />);
  };

  test("displays correct table headers", () => {
    renderComponent();

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent("ID");
    expect(headers[1]).toHaveTextContent("Name");
    expect(headers[2]).toHaveTextContent("Email");
    expect(headers[3]).toHaveTextContent("Role");
  });

  test("renders correct number of user rows", () => {
    renderComponent();

    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(mockUsers.length);
  });

  test("displays user data correctly", () => {
    renderComponent();

    const firstRow = screen.getAllByRole("row")[1];
    const cells = within(firstRow).getAllByRole("cell");

    expect(cells[0]).toHaveTextContent(mockUsers[0]._id);
    expect(cells[1]).toHaveTextContent(mockUsers[0].name);
    expect(cells[2]).toHaveTextContent(mockUsers[0].email);
    expect(cells[3]).toHaveTextContent("Admin");
  });

  test('shows "User" role for non-admin users', () => {
    renderComponent();

    const secondRow = screen.getAllByRole("row")[2];
    const roleCell = within(secondRow).getAllByRole("cell")[3];
    expect(roleCell).toHaveTextContent("User");
  });

  test('shows "Admin" role for admin users', () => {
    renderComponent();

    const firstRow = screen.getAllByRole("row")[1];
    const roleCell = within(firstRow).getAllByRole("cell")[3];
    expect(roleCell).toHaveTextContent("Admin");
  });
});
