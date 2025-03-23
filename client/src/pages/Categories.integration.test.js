import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Categories from './Categories';
import CategoryProduct from './CategoryProduct';

jest.mock('axios');

jest.mock('../hooks/useCategory', () => {
  return jest.fn(() => [
    { _id: '1', name: 'Electronics', slug: 'electronics' },
    { _id: '2', name: 'Clothing', slug: 'clothing' },
  ]);
});

jest.mock('../context/auth', () => ({
  useAuth: () => [
    { user: { name: 'Test User' } },
    jest.fn()
  ]
}));

jest.mock('../context/cart', () => ({
  useCart: () => [
    [],
    jest.fn()
  ]
}));

jest.mock('../components/Layout', () => {
  return ({ children, title }) => (
    <div data-testid="layout">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
});

describe('Categories Page Integration Tests', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Jeans',
      description: 'Blue like other jeans',
      slug: 'jeans',
      price: 22.07,
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call API when navigating to category products page', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/v1/product/product-category/clothing') {
        return Promise.resolve({
          data: {
            products: mockProducts,
            category: { name: 'Clothing' }
          }
        });
      }
      return Promise.reject(new Error('API call not mocked'));
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    const clothingButton = screen.getByText('Clothing');
    await userEvent.click(clothingButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-category/clothing');
    });
  });

  test('should handle API errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    axios.get.mockImplementation((url) => {
      if (url === '/api/v1/product/product-category/clothing') {
        return Promise.reject(new Error('API Error'));
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    const clothingButton = screen.getByText('Clothing');
    await userEvent.click(clothingButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('should display correct content on category products page', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/v1/product/product-category/clothing') {
        return Promise.resolve({
          data: {
            products: mockProducts,
            category: { name: 'Clothing' }
          }
        });
      }
      return Promise.reject(new Error('API call not mocked'));
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    const clothingButton = screen.getByText('Clothing');
    await userEvent.click(clothingButton);

    await waitFor(() => {
      expect(screen.getByText('Category - Clothing')).toBeInTheDocument();
      expect(screen.getByText('1 result found')).toBeInTheDocument();
      expect(screen.getByText('Jeans')).toBeInTheDocument();
    });
  });
}); 