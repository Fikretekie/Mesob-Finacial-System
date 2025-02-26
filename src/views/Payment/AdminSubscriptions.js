import React, { useEffect, useState } from "react";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetch("https://your-api-gateway-url/get-subscriptions")
      .then((res) => res.json())
      .then((data) => setSubscriptions(data))
      .catch((error) => console.error("Error fetching subscriptions:", error));
  }, []);

  return (
    <div>
      <h2>All Subscriptions</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.customer_email}</td>
              <td>{sub.status}</td>
              <td>${sub.amount / 100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSubscriptions;
