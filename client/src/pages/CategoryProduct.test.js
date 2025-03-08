import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import CategoryProduct from './CategoryProduct';

// Mock axios
jest.mock('axios');

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({ 
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: 'clothing' }),
  useNavigate: () => jest.fn(),
}));

// Mock Layout to avoid rendering Header which uses unmocked hooks
jest.mock("../components/Layout", () => {
  return {
    __esModule: true,
    default: ({ children, title }) => (
      <div data-testid="mock-layout">
        <div data-testid="layout-title">{title}</div>
        {children}
      </div>
    ),
  };
});

describe('CategoryProduct Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Jeans',
      description: 'Blue like other jeans',
      slug: 'jeans',
      price: 22.07,
    },
    {
      _id: '2',
      name: 'T-shirt',
      slug: 't-shirt',
      description: 'Simple white tshirt',
      price: 14.99,
    },
  ];

  const mockCategory = {
    name: 'Clothing',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders CategoryProduct component with loading state', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });
    
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByText('Category -')).toBeInTheDocument();
    expect(screen.getByText('0 result found')).toBeInTheDocument();
  });

  test('fetches and displays products successfully', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Category - Clothing')).toBeInTheDocument();
      expect(screen.getByText('2 result found')).toBeInTheDocument();
      expect(screen.getByText('Jeans')).toBeInTheDocument();
      expect(screen.getByText('T-shirt')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-category/clothing');
  });

  test('renders correctly when no products are found', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        products: [],
        category: mockCategory,
      },
    });
  
    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });
  
    await waitFor(() => {
      expect(screen.getByText('Category - Clothing')).toBeInTheDocument();
      expect(screen.getByText('0 result found')).toBeInTheDocument();
    });

    expect(screen.queryByText('More Details')).not.toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const error = new Error('API Error');
    axios.get.mockRejectedValueOnce(error);

    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    expect(screen.getByText('Category -')).toBeInTheDocument();
    expect(screen.getByText('0 result found')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('renders product cards with correct formatting', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('$22.07')).toBeInTheDocument();
      expect(screen.getByText('$14.99')).toBeInTheDocument();

      expect(screen.getByText('Blue like other jeans...')).toBeInTheDocument();
      expect(screen.getByText('Simple white tshirt...')).toBeInTheDocument();
    });
  });

  test('description is correctly truncated to 60 characters with ellipsis', async () => {
    const longDescriptionProduct = {
      _id: '3',
      name: 'Long Description Product',
      slug: 'long-description',
      description: 'This is a very long description that should be truncated at 60 characters to ensure proper display',
      price: 29.99,
    };

    axios.get.mockResolvedValueOnce({
      data: {
        products: [longDescriptionProduct],
        category: mockCategory,
      },
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      const expectedTruncatedText = 'This is a very long description that should be truncated at ...';
      expect(screen.getByText(expectedTruncatedText)).toBeInTheDocument();
    });
  });

  test('navigates to product detail page when clicking More Details', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    axios.get.mockResolvedValueOnce({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await act(async () => {
      const moreDetailsButtons = screen.getAllByText('More Details');
      fireEvent.click(moreDetailsButtons[0]);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/product/jeans');
  });

  test('should not fetch products when slug is undefined', async () => {
    // Override the default useParams mock for this test
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({});
  
    await act(async () => {
      render(
        <BrowserRouter>
          <CategoryProduct />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
}); 