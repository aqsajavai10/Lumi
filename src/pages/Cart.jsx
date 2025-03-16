import React, { useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { useSelector, useDispatch } from "react-redux";
import {
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Divider,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { getSubtotal } from "../utils";
import {
  addToCart,
  removeFromCart,
  removeAllFromCart,
  applyPromocode,
  removePromocode,
} from "../feature/cart-slice";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { styled } from "@mui/material/styles";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/Auth";

const ResponsiveCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
}));

const ResponsiveCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flex: 1,
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(2),
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(25),
  objectFit: "cover",
  borderRadius: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: theme.spacing(40),
  },
}));

export default function Cart() {
  const cart = useSelector((state) => state.cart?.value);
  const appliedPromocode = useSelector((state) => state.cart?.appliedPromocode);
  const promocodeDiscount = useSelector(
    (state) => state.cart?.promocodeDiscount
  );
  const subtotal = getSubtotal(cart)?.toFixed(2);
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [promocode, setPromocode] = useState("");
  const [promocodeError, setPromocodeError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Calculate final total after discount
  const discountAmount = (subtotal * (promocodeDiscount / 100)).toFixed(2);
  const finalTotal = (subtotal - discountAmount).toFixed(2);

  async function validatePromocode(code) {
    try {
      const promocodesRef = collection(db, "promocodes");
      const q = query(promocodesRef, where("code", "==", code.toLowerCase()));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const promocodeDoc = querySnapshot.docs[0].data();
        return {
          valid: promocodeDoc.valid,
          discount: promocodeDoc.discount,
          code: promocodeDoc.code,
        };
      }

      return { valid: false };
    } catch (error) {
      console.error("Error validating promocode:", error);
      throw new Error("Failed to validate promocode");
    }
  }

  async function handlePromocodeSubmit() {
    if (!promocode.trim()) return;

    setPromocodeError("");
    setIsValidating(true);

    try {
      const result = await validatePromocode(promocode);

      if (result.valid) {
        dispatch(
          applyPromocode({
            code: result.code,
            discount: result.discount,
          })
        );
        setPromocode("");
      } else {
        setPromocodeError("Invalid or inactive promocode");
      }
    } catch (error) {
      setPromocodeError("Error validating promocode");
    } finally {
      setIsValidating(false);
    }
  }

  function handleRemovePromocode() {
    dispatch(removePromocode());
    setPromocode("");
    setPromocodeError("");
  }

  function incrementQuantity(product, color, size) {
    dispatch(addToCart({ product, quantity: 1, color, size }));
  }

  function decrementQuantity(product, color, size) {
    dispatch(removeFromCart({ product, color, size }));
  }

  function removeItem(product, color, size) {
    dispatch(removeAllFromCart({ product, color, size }));
  }

  if (!cart?.length) {
    return (
      <Container sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Shopping Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {cart?.map(({ product, quantity, color, size }) => {
              const { name, id, price, imageUrl } = product;
              return (
                <Grid item key={id + size} xs={12}>
                  <ResponsiveCard>
                    <ProductImage
                      component="img"
                      image={Array.isArray(imageUrl) ? imageUrl[0] : imageUrl}
                      alt={name}
                    />
                    <ResponsiveCardContent>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          {name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {color && `Color: ${color}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {size && `Size: ${size}`}
                        </Typography>

                        <Box
                          sx={{ mt: 2, display: "flex", alignItems: "center" }}
                        >
                          <IconButton
                            aria-label="decrease quantity"
                            onClick={() =>
                              decrementQuantity(product, color, size)
                            }
                            disabled={quantity <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 2 }}>
                            {quantity}
                          </Typography>
                          <IconButton
                            aria-label="increase quantity"
                            onClick={() =>
                              incrementQuantity(product, color, size)
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: { xs: "center", sm: "flex-end" },
                          gap: 1,
                          minWidth: { sm: "120px" },
                        }}
                      >
                        <Typography variant="h6">
                          PKR {(price * quantity).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          PKR {price.toFixed(2)} each
                        </Typography>
                        <IconButton
                          aria-label="delete"
                          onClick={() => removeItem(product, color, size)}
                          sx={{
                            color: theme.palette.error.main,
                            mt: 1,
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ResponsiveCardContent>
                  </ResponsiveCard>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              padding: 3,
              position: { md: "sticky" },
              top: { md: theme.spacing(2) },
            }}
          >
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              {appliedPromocode ? (
                <Box sx={{ mb: 2 }}>
                  <Alert
                    severity="success"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleRemovePromocode}
                      >
                        Remove
                      </Button>
                    }
                  >
                    Promocode {appliedPromocode} applied ({promocodeDiscount}
                    {promocodeDiscount >= 100 ? " PKR off" : "% off"})
                  </Alert>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Promocode"
                    value={promocode}
                    onChange={(e) => setPromocode(e.target.value)}
                    error={Boolean(promocodeError)}
                    helperText={promocodeError}
                    sx={{ mb: 1 }}
                    disabled={isValidating}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handlePromocodeSubmit}
                    disabled={!promocode || isValidating}
                    startIcon={
                      isValidating ? <CircularProgress size={20} /> : null
                    }
                  >
                    {isValidating ? "Validating..." : "Apply Promocode"}
                  </Button>
                </Box>
              )}
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Subtotal</Typography>
              <Typography>PKR {subtotal}</Typography>
            </Box>

            {appliedPromocode && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>
                  Discount ({promocodeDiscount}
                  {promocodeDiscount >= 100 ? " PKR" : "%"})
                </Typography>
                <Typography color="error">
                  - PKR{" "}
                  {promocodeDiscount >= 100
                    ? promocodeDiscount
                    : (subtotal * promocodeDiscount) / 100}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Shipping</Typography>
              <Typography>
                {promocodeDiscount >= 100 ? "Free" : "Calculated at checkout"}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">
                PKR{" "}
                {promocodeDiscount >= 100
                  ? subtotal
                  : subtotal - (subtotal * promocodeDiscount) / 100}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate("/checkout")}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
