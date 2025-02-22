import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import "@testing-library/jest-dom";

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(),
}));
  
jest.mock('../../components/Layout', () => ({ children }) => (
    <div data-testid="layout-mock">{ children }</div>
));
  
jest.mock('../../components/AdminMenu', () => () => (
    <div data-testid="admin-menu-mock" />
));

describe('AdminDashboard', () => {
    const mockAuth = {
        user: {
          name: 'John Doe',
          email: 'john@gmail.com',
          phone: '84327890',
        },
    };

    beforeEach(() => {
        useAuth.mockImplementation(() => [mockAuth]);
        render(
            <MemoryRouter>
              <AdminDashboard />
            </MemoryRouter>
        );
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the Layout component', () => {
        expect(screen.getByTestId('layout-mock')).toBeInTheDocument();
    });

    test('renders the AdminMenu component', () => {
        expect(screen.getByTestId('admin-menu-mock')).toBeInTheDocument();
    });

    test('displays correct user information from auth context', () => {
        expect(screen.getByRole('heading', { name: /admin name : john doe/i }))
          .toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /admin email : john@gmail\.com/i }))
          .toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /admin contact : 84327890/i }))
          .toBeInTheDocument();
    });
});
