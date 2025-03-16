import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/Auth";
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import AddressForm from "../components/AddressForm";
import ReviewForm from "../components/ReviewForm";
import { clearCart } from "../feature/cart-slice";
import { clearCheckoutInformation } from "../feature/checkout-slice";
import { createOrder } from "../feature/orderService";

const steps = ["Shipping Address", "Review Order"];

function getStepContent(activeStep, onValidityChange) {
  switch (activeStep) {
    case 0:
      return <AddressForm onValidityChange={onValidityChange} />;
    case 1:
      return <ReviewForm />;
    default:
      throw new Error("Unknown step");
  }
}

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const cart = useSelector((state) => state.cart.value);
  const address = useSelector((state) => state.checkout.address);
  const promocodeDiscount = useSelector((state) => state.cart?.promocodeDiscount) || 0;
  const standardShippingCost = 300;

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Determine effective shipping cost and discount
  const effectiveShippingCost = promocodeDiscount >= 300 ? 0 : standardShippingCost;
  const effectivePromocodeDiscount = promocodeDiscount >= 300 ? 0 : promocodeDiscount;

  // Calculate final total
  const discountAmount = (subtotal * (effectivePromocodeDiscount / 100));
  const totalWithDiscount = subtotal - discountAmount + effectiveShippingCost;

  const handleValidityChange = (isValid) => {
    setIsFormValid(isValid);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!user) {
        setError("Please sign in to place an order");
        return;
      }

      const orderData = {
        address,
        subtotal,
        discount: discountAmount,
        shippingCost: effectiveShippingCost,
        total: totalWithDiscount,
        promocodeDiscount: effectivePromocodeDiscount
      };

      const newOrderId = await createOrder(orderData, cart, user.uid);
      setOrderId(newOrderId);
      setActiveStep(activeStep + 1);

      // Clear cart and checkout info after successful order
      dispatch(clearCart());
      dispatch(clearCheckoutInformation());
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order. Please try again.");
    }
  };

  function handleNext() {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep(activeStep + 1);
    }
  }

  function handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <Container component="section" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <>
            <Typography variant="h5" gutterBottom>
              Thank you for your order!
            </Typography>
            <Typography variant="subtitle1">
              Your order ID is {orderId}. We will send you a confirmation email
              with your order details.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Payment of PKR {totalWithDiscount.toFixed(2)} will be collected upon delivery.
              {effectiveShippingCost === 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Free shipping applied! (Saved PKR {standardShippingCost})
                </Typography>
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ mt: 3 }}
            >
              Continue Shopping
            </Button>
          </>
        ) : (
          <>
            {getStepContent(activeStep, handleValidityChange)}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={{ mt: 3, ml: 1 }}
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 3, ml: 1 }}
                disabled={
                  (!user && activeStep === steps.length - 1) ||
                  (activeStep === 0 && !isFormValid)
                }
              >
                {activeStep === steps.length - 1 ? "Place Order" : "Next"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}