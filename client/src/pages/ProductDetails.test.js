import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails';

// Mock axios
jest.mock('axios');

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: 'test-product' }),
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

describe('ProductDetails Component', () => {
  const mockProduct = {
    _id: '123',
    name: 'Jeans',
    description: 'Blue like other jeans',
    price: 22.07,
    category: {
      _id: 'cat123', 
      name: 'Clothing'
    },
    slug: 'jeans'
  };

  const mockRelatedProducts = [
    {
      _id: '456',
      name: 'Denim Jacket',
      description: 'Denim jacket to match your jeans',
      price: 39.99,
      slug: 'denim-jacket'
    },
    {
      _id: '789',
      name: 'Cotton Tshirt',
      description: 'Simple white tshirt',
      price: 14.99,
      slug: 'cotton-tshirt'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch and display product details on mount', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
      expect(screen.getByText(`Category : ${mockProduct.category.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Price : $${mockProduct.price}`)).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('should handle error when fetching product details', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch product'));

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test('should render related products section', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
      mockRelatedProducts.forEach(product => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });
  });

  test('should display message when no related products found', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
    });
  });

  // test('should format product price correctly', async () => {
  //   axios.get.mockImplementation((url) => {
  //     if (url.includes('/get-product')) {
  //       return Promise.resolve({ data: { product: mockProduct } });
  //     } else if (url.includes('/related-product')) {
  //       return Promise.resolve({ data: { products: [] } });
  //     }
  //     return Promise.reject(new Error('Invalid URL'));
  //   });

  //   render(
  //     <BrowserRouter>
  //       <ProductDetails />
  //     </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByText('Price : $22.07')).toBeInTheDocument();
  //   });
  // });

  test('should handle error when fetching related products', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // First call succeed (get product), second call fail (related products)
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockRejectedValueOnce(new Error('Failed to fetch related products'));

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test('should truncate long descriptions in related products', async () => {
    const longDescriptionProduct = {
      ...mockRelatedProducts[0],
      description: 'This is a very long description that should be truncated at 60 characters to ensure proper display'
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: [longDescriptionProduct] } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      const truncatedText = longDescriptionProduct.description.substring(0, 60) + '...';
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });
  });

  test('should render product images with correct src and alt text', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      const mainImage = screen.getByRole('img', { name: mockProduct.name });  // look for alt text
      expect(mainImage).toBeInTheDocument();
      expect(mainImage.src).toContain(`/api/v1/product/product-photo/${mockProduct._id}`);  // check if src is correct

      mockRelatedProducts.forEach(product => {
        const relatedImage = screen.getByRole('img', { name: product.name });  // look for alt text
        expect(relatedImage).toBeInTheDocument();
        expect(relatedImage.src).toContain(`/api/v1/product/product-photo/${product._id}`);  // check if src is correct
      });
    });
  });

  test('should navigate to related product when clicking More Details', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
      return Promise.reject(new Error('Invalid URL'));
    });

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText('More Details');
      fireEvent.click(moreDetailsButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockRelatedProducts[0].slug}`);
    });
  });

  test('should not fetch product when slug parameter is missing', async () => {
    // Override the default useParams mock for this test
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({});
    
    const axiosGetSpy = jest.spyOn(axios, 'get');

    render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );

    expect(axiosGetSpy).not.toHaveBeenCalled();
  });
});