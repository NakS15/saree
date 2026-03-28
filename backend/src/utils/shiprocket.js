const axios = require('axios');
const logger = require('../config/logger');

let token = null;
let tokenExpiry = 0;

const getToken = async () => {
  if (token && Date.now() < tokenExpiry) return token;
  const { data } = await axios.post(`${process.env.SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });
  token = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // tokens last ~10 days
  return token;
};

const api = async (method, path, data) => {
  const t = await getToken();
  const res = await axios({
    method,
    url: `${process.env.SHIPROCKET_BASE_URL}${path}`,
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    data,
  });
  return res.data;
};

exports.createOrder = async (order, vendor) => {
  const payload = {
    order_id: order.orderNumber,
    order_date: new Date(order.createdAt).toISOString().slice(0, 10),
    pickup_location: vendor.businessName,
    channel_id: '',
    comment: '',
    billing_customer_name: order.shippingAddress.fullName,
    billing_last_name: '',
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || '',
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: 'India',
    billing_email: '',
    billing_phone: order.shippingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((i) => ({
      name: i.name, sku: i.product?.toString(), units: i.quantity,
      selling_price: i.price, discount: 0, tax: '', hsn: 0,
    })),
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.subtotal,
    length: 20, breadth: 15, height: 5, weight: 0.5,
  };

  return api('POST', '/orders/create/adhoc', payload);
};

exports.trackOrder = async (awb) => {
  return api('GET', `/courier/track/awb/${awb}`);
};

exports.cancelOrder = async (ids) => {
  return api('POST', '/orders/cancel', { ids });
};
