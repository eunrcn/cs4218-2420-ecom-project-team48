import React from "react";

const UserTable = ({ users }) => {
  const tableContainerStyle = {
    maxHeight: "40svh",
    overflowY: "auto",
    width: "90%",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    margin: "20px 0",
  };

  const headerCellStyle = {
    padding: "12px 15px",
    border: "1px solid #ddd",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
    color: "#333",
  };

  const cellStyle = {
    padding: "12px 15px",
    border: "1px solid #ddd",
  };

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>ID</th>
            <th style={headerCellStyle}>Name</th>
            <th style={headerCellStyle}>Email</th>
            <th style={headerCellStyle}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td style={cellStyle}>{user._id}</td>
              <td style={cellStyle}>{user.name}</td>
              <td style={cellStyle}>{user.email}</td>
              <td style={cellStyle}>{user.role === 1 ? "Admin" : "User"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
