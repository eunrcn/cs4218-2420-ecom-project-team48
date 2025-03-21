import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/ProductDetailsStyles.css";
import { useCart } from "../context/cart";
import { toast } from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart = [], setCart = () => {}] = useCart() || [];

  //initial details
  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);
  
  //getProduct
  const getProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );
      
      if (!data?.product) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setProduct(data.product);
      getSimilarProduct(data.product._id, data.product.category._id);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setNotFound(true);
      setLoading(false);
    }
  };
  
  //get similar product
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products || []);
    } catch (error) {
      console.log(error);
    }
  };
  
  // Product not found UI
  if (notFound) {
    return (
      <Layout title="Product Not Found">
        <div className="container text-center mt-5">
          <div className="error-container">
            <h1>Product not found</h1>
            <p className="lead">The requested product does not exist or may have been removed.</p>
            <Link to="/" className="btn btn-primary mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading UI
  if (loading) {
    return (
      <Layout>
        <div className="container text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading product details...</p>
        </div>
      </Layout>
    );
  }

  // Main product details UI
  return (
    <Layout>
      <div className="row container product-details">
        <div className="col-md-6">
          <img
            src={`/api/v1/product/product-photo/${product._id}`}
            className="card-img-top"
            alt={product.name}
            height="300"
            width={"350px"}
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name : {product.name}</h6>
          <h6>Description : {product.description}</h6>
          <h6>
            Price : {product?.price?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </h6>
          <h6>Category : {product?.category?.name}</h6>
          <button className="btn btn-dark ms-1"
            onClick={() => {
              setCart([...cart, product]);
              localStorage.setItem(
                "cart",
                JSON.stringify([...cart, product])
              );
              toast.success("Item added to cart");
            }}
          >
            ADD TO CART
          </button>
        </div>
      </div>
      <hr />
      <div className="row container similar-products">
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar Products found</p>
        )}
        <div className="d-flex flex-wrap">
          {relatedProducts?.map((p) => (
            <div className="card m-2" key={p._id}>
              <img
                src={`/api/v1/product/product-photo/${p._id}`}
                className="card-img-top"
                alt={p.name}
              />
              <div className="card-body">
                <div className="card-name-price">
                  <h5 className="card-title">{p.name}</h5>
                  <h5 className="card-title card-price">
                    {p.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h5>
                </div>
                <p className="card-text ">
                  {p.description.substring(0, 60)}...
                </p>
                <div className="card-name-price">
                  <button
                    className="btn btn-info ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                  <button
                    className="btn btn-dark ms-1"
                    onClick={() => {
                      setCart([...cart, p]);
                      localStorage.setItem(
                        "cart",
                        JSON.stringify([...cart, p])
                      );
                      toast.success("Item Added to cart");
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;