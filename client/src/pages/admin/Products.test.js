import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Products from './Products';
import "@testing-library/jest-dom";

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu" />
));
jest.mock('../../components/Layout', () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

const mockProducts = [
  {
    _id: '1',
    name: 'Bluetooth Headphones',
    description: 'Comfortable headphones with wireless connectivity.',
    slug: 'bluetooth-headphones',
  },
  {
    _id: '2',
    name: 'Cotton T-Shirt',
    description: 'Soft t-shirt made from cotton.',
    slug: 'cotton-tshirt',
  },
  {
    _id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Durable bottle that keeps drinks at the right temperature.',
    slug: 'stainless-steel-water-bottle',
  }
];

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders layout and admin menu', async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });
    
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
  });

  test("fetches products from the correct API endpoint", async () => {
    axios.get.mockResolvedValueOnce({data: { products: mockProducts }});
    
    render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
    });
  });

  test('fetches and displays products correctly', async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      const productCards = screen.getAllByRole('link');
      expect(productCards).toHaveLength(mockProducts.length);

      // tests for product's name, description, slug and id fields
      mockProducts.forEach((product, index) => {
        const productCard = productCards[index];
        const image = within(productCard).getByRole('img');
        expect(within(productCard).getByText(product.name)).toBeInTheDocument();
        expect(within(productCard).getByText(product.description)).toBeInTheDocument();
        expect(productCard).toHaveAttribute(
          'href',
          `/dashboard/admin/product/${product.slug}`
        );
        expect(image).toHaveAttribute(
          'src',
          `/api/v1/product/product-photo/${product._id}`
        );
      });
    });
  });

  test('handles empty product state', async () => {
    axios.get.mockResolvedValue({ data: { products: [] } });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText(/all products list/i)).toBeInTheDocument();
    });
  });

  test('shows error toast on API failure', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong');
    });
  });
});
