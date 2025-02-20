import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import AdminMenu from './AdminMenu';

const ADMIN_LINKS = [
    {
      path: '/dashboard/admin/create-category',
      name: 'Create Category',
    },
    {
      path: '/dashboard/admin/create-product',
      name: 'Create Product',
    },
    {
      path: '/dashboard/admin/products',
      name: 'Products',
    },
    {
      path: '/dashboard/admin/orders',
      name: 'Orders',
    },
];

describe('AdminMenu Component', () => {
    beforeEach(() => {
        render(
          <MemoryRouter>
            <AdminMenu />
          </MemoryRouter>
        );
    });

    test('renders the "Admin Panel" heading', () => {
        const heading = screen.getByText(/admin panel/i);
        expect(heading).toBeInTheDocument();
    });

    test.each(ADMIN_LINKS)(
        'renders $name link with correct path',
        ({ path, name }) => {
          const link = screen.getByRole('link', { name: new RegExp(name, 'i') });
          expect(link).toHaveAttribute('href', path);
        }
    );
});
