import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getAllOrders');
        setOrders(response.data.orders);
        console.log("orders :", response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div>
        <h1>All Orders</h1>
        <div>
          <ul>
            {orders.map(order => (
              <li key={order.
                // @ts-ignore
                id}>
                <p>Order ID: {order.
                  // @ts-ignore
                  id}</p>
                <p>Order Number : {order.
                  // @ts-ignore
                  order_number}</p>
                <p>First Name: {order.
                  // @ts-ignore
                  billing_address.first_name}</p>
                <p>Last Name: {order.
                  // @ts-ignore
                  billing_address.last_name}</p>
                <p>Email: {order.
                  // @ts-ignore
                contact_email}</p>
                <p>Created: {order.
                  // @ts-ignore
                  created_at}</p>
                <p>Price: {order.
                  // @ts-ignore
                  current_subtotal_price}</p>

              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Orders;
