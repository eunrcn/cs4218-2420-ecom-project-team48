import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails';
import { CartProvider } from '../context/cart';

jest.mock('axios');

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: 'test-product' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('../context/auth', () => ({
  useAuth: () => [{ user: { name: 'Test User' } }, jest.fn()],
}));

jest.mock('../hooks/useCategory', () => () => [
  { _id: 'category1', name: 'Test Category' }
]);

jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

describe('ProductDetails Integration Tests', () => {
  const mockProduct = {
    _id: 'product1',
    name: 'Jeans',
    description: 'Blue like other jeans',
    price: 22.07,
    category: {
      _id: 'cat1', 
      name: 'Clothing'
    },
    slug: 'jeans'
  };

  const mockRelatedProducts = [
    {
      _id: 'related1',
      name: 'Denim Jacket',
      description: 'Denim jacket to match your jeans',
      price: 39.99,
      category: { _id: 'cat1', name: 'Clothing' },
      slug: 'denim-jacket',
    },
    {
      _id: 'related2',
      name: 'White Sneakers',
      description: 'Classic white sneakers for a casual look.',
      price: 59.99,
      category: { _id: 'cat2', name: 'Footwear' },
      slug: 'white-sneakers',
    }
  ];

  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('should fetch and display product details', async () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductDetails />
        </CartProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
      expect(screen.getByText(`Category : ${mockProduct.category.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Price : $${mockProduct.price}`)).toBeInTheDocument();
    });
  });

  test('should fetch and display similar products', async () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductDetails />
        </CartProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(mockRelatedProducts[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockRelatedProducts[1].name)).toBeInTheDocument();

      const truncatedDesc = mockRelatedProducts[0].description.substring(0, 60) + '...';
      expect(screen.getByText(truncatedDesc)).toBeInTheDocument();
    });
  });

  test('should add main product to cart when ADD TO CART button is clicked', async () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductDetails />
        </CartProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 6, name: new RegExp(mockProduct.name) })).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /ADD TO CART/i });
    fireEvent.click(addToCartButtons[0]);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const cartData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(cartData).toEqual(expect.arrayContaining([
        expect.objectContaining({ _id: mockProduct._id })
      ]));
    });
  });

  test('should add similar product to cart when ADD TO CART button is clicked', async () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductDetails />
        </CartProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
      expect(screen.getByText(mockRelatedProducts[0].name)).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /ADD TO CART/i });
    fireEvent.click(addToCartButtons[1]);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const cartData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(cartData).toEqual(expect.arrayContaining([
        expect.objectContaining({ _id: mockRelatedProducts[0]._id })
      ]));
    });
  });
}); 