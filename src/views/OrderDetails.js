import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Table,
  Spinner,
  Button,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import "../assets/css/OrderDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discountedCost, setDiscountedCost] = useState(0);

  useEffect(() => {
    // Fetch order details by ID
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items/${id}`
        );
        const itemData = response.data.Item;
        setOrderDetails(itemData);
        calculateTotals(itemData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  let promo_discount = "";

  const calculateTotals = (item) => {
    let total_price = 0;
    let total_cost = 0;
    promo_discount = item.promodiscount;

    item.Products.forEach((product) => {
      // Remove $ and comma from price and cost
      const price = parseFloat(product.price.replace(/[\$,]/g, ""));
      const cost = parseFloat(product.cost.replace(/[\$,]/g, ""));
      const quantity = product.qty ?? product.quantity;

      // Calculate totals
      total_price += quantity * price;
      total_cost += quantity * cost;
    });

    // Apply promo discount if available
    const discounted_price = promo_discount
      ? total_price - promo_discount
      : total_price;
    const discounted_cost = promo_discount
      ? total_cost - promo_discount
      : total_cost;

    setTotalPrice(total_price);
    setTotalCost(total_cost);
    setDiscountedPrice(discounted_price);
    setDiscountedCost(discounted_cost);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spinner color="primary" />
        <p>Loading order details...</p>
      </div>
    );
  }

  const senderInfo = JSON.parse(orderDetails.senderAddress || "{}");
  const receiverInfo = {
    name: orderDetails.name,
    email: orderDetails.useremail,
    phone: orderDetails.phone,
    address: orderDetails.address,
    city: orderDetails.city,
    state: orderDetails.state,
    country: orderDetails.country,
  };

  return (
    <>
      <Helmet>
        <title>Order Details - Mesob Store</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Order Details</h2>
          </div>
        }
      />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card className="order-card">
              <CardHeader className="order-header">
                <div className="d-flex align-items-center">
                  <Button
                    className="btn btn-link"
                    onClick={() => navigate("/admin/orders")}
                    style={{ fontSize: "20px", marginRight: "10px" }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <h4 className="card-title">
                    <b>Order ID:</b> {orderDetails.id}
                  </h4>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  {/* Sender Info */}
                  <Col md={6} className="order-info-col">
                    <h5 className="section-heading">Sender Information</h5>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Name:</strong> {senderInfo.name}
                      </li>
                      <li>
                        <strong>Email:</strong> {senderInfo.email}
                      </li>
                      <li>
                        <strong>Phone:</strong> {senderInfo.phone}
                      </li>
                      <li>
                        <strong>Address:</strong> {senderInfo.address}
                      </li>
                      <li>
                        <strong>City:</strong> {senderInfo.city}
                      </li>
                      <li>
                        <strong>State:</strong> {senderInfo.state}
                      </li>
                      <li>
                        <strong>Pin Code:</strong> {senderInfo.pincode}
                      </li>
                    </ul>
                  </Col>

                  {/* Receiver Info */}
                  <Col md={6} className="order-info-col">
                    <h5 className="section-heading">Receiver Information</h5>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Name:</strong> {receiverInfo.name}
                      </li>
                      <li>
                        <strong>Email:</strong> {receiverInfo.email}
                      </li>
                      <li>
                        <strong>Phone:</strong> {receiverInfo.phone}
                      </li>
                      <li>
                        <strong>Address:</strong> {receiverInfo.address}
                      </li>
                      <li>
                        <strong>City:</strong> {receiverInfo.city}
                      </li>
                      <li>
                        <strong>State:</strong> {receiverInfo.state}
                      </li>
                      <li>
                        <strong>Country:</strong> {receiverInfo.country}
                      </li>
                    </ul>
                  </Col>
                </Row>

                {/* Products Table */}
                <h5 className="section-heading mt-4">Products</h5>
                <Table responsive className="order-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Country</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.Products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.title}
                            className="img-fluid"
                          />
                        </td>
                        <td>{product.title}</td>
                        <td>{product.category}</td>
                        <td>{product.description}</td>
                        <td>{product.country}</td>
                        <td>{product.qty}</td>
                        <td>{product.price}</td>
                        <td>{product.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Summary Section */}
                <div className="summary-section mt-4">
                  <div>
                    <div>
                      Discount:
                      <span>{promo_discount ? promo_discount : " - "}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      Selling Price: <span>$ {discountedPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      Cost Price: <span>$ {discountedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderDetails;
