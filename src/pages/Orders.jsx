import React, { useState, useEffect } from "react";
import { db } from "../firebase/Auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../firebase/Auth";
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const statusColors = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.CONFIRMED]: "info",
  [OrderStatus.SHIPPED]: "primary",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.CANCELLED]: "error",
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "orders"),
        where("customerID", "==", user.uid) // Ensure the field name matches the Firestore document
      );

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate(),
        };
      });

      console.log("Fetched orders:", ordersData); // Debugging statement

      // Sort orders by date, newest first
      setOrders(ordersData.sort((a, b) => b.orderDate - a.orderDate));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely render address
  const renderAddress = (address) => {
    if (!address) return "No address information available";

    const addressParts = [];
    if (address.address1) addressParts.push(address.address1);
    if (address.street) addressParts.push(address.street);
    if (address.city || address.state || address.zip) {
      const cityStateZip = [address.city, address.state, address.zip]
        .filter(Boolean)
        .join(", ");
      if (cityStateZip) addressParts.push(cityStateZip);
    }
    if (address.country) addressParts.push(address.country);

    return addressParts.length > 0
      ? addressParts.join("\n")
      : "Incomplete address information";
  };

  // Helper function to calculate total price
  const calculateTotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return (
      items.reduce((sum, item) => {
        const price = item?.price || 0;
        const quantity = item?.quantity || 0;
        return sum + price * quantity;
      }, 0) + 300
    ); // Adding 300 for shipping
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            You haven't placed any orders yet.
          </Typography>
        </Paper>
      ) : (
        orders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    Order #{order.id.slice(-8)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    {order.orderDate?.toLocaleDateString() ||
                      "Date not available"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip
                    label={order.status || "Processing"}
                    color={statusColors[order.status] || "default"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: "pre-line" }}>
                  {renderAddress(order.shippingAddress)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4}>
                        <Typography>
                          {item?.name || "Product name not available"}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sm={2}>
                        <Typography>x{item?.quantity || 0}</Typography>
                      </Grid>
                      <Grid item xs={3} sm={2}>
                        <Typography>
                          {item?.size || "Size not available"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography>
                          PKR{" "}
                          {((item?.price || 0) * (item?.quantity || 0)).toFixed(
                            2
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  No items in this order
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography variant="h6">
                  Total: PKR {calculateTotal(order.items).toFixed(2)}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default CustomerOrders;
