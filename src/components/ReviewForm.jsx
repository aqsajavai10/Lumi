import React from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Grid from "@mui/material/Grid";
import { useSelector } from "react-redux";

export default function ReviewForm() {
  const cart = useSelector((state) => state.cart.value);
  const address = useSelector((state) => state.checkout?.address);
  const promocodeDiscount = useSelector((state) => state.cart?.promocodeDiscount) || 0;
  const shippingCost = 300;

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * (promocodeDiscount / 100));
  const totalWithDiscount = subtotal - discountAmount + shippingCost;

  const addressFields = [
    `${address.firstName} ${address.lastName}`,
    address.address1,
    address.address2,
    address.city,
    address.zipCode,
    address.country,
    address.phoneNumber,
  ].filter(Boolean);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <List disablePadding>
        {cart.map(({ product, quantity, color, size }) => (
          <ListItem key={product.id + (size || "") + (color || "")} sx={{ py: 1, px: 0 }}>
            <ListItemText
              primary={product.name}
              secondary={`Color: ${color || 'N/A'} | Size: ${size || 'N/A'}`}
            />
            <Typography variant="body2">
              {quantity} x PKR {product.price.toFixed(2)} = PKR {(quantity * product.price).toFixed(2)}
            </Typography>
          </ListItem>
        ))}

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Subtotal" />
          <Typography variant="body1">
            PKR {subtotal.toFixed(2)}
          </Typography>
        </ListItem>

        {promocodeDiscount > 0 && (
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary={`Discount (${promocodeDiscount}%)`} />
            <Typography variant="body1" color="error">
              - PKR {discountAmount.toFixed(2)}
            </Typography>
          </ListItem>
        )}

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Shipping Cost" />
          <Typography variant="body1">
            PKR {shippingCost.toFixed(2)}
          </Typography>
        </ListItem>

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            PKR {totalWithDiscount.toFixed(2)}
          </Typography>
        </ListItem>
      </List>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Shipping Address
          </Typography>
          <Typography gutterBottom>{addressFields.join(', ')}</Typography>
        </Grid>
      </Grid>
    </>
  );
}