import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useSelector, useDispatch } from "react-redux";
import { updateAddress } from "../feature/checkout-slice";

export default function AddressForm({ onValidityChange }) {
  const address = useSelector((state) => state.checkout?.address);
  const dispatch = useDispatch();

  const requiredFields = [
    'firstName',
    'lastName',
    'address1',
    'city',
    'country',
    'phoneNumber'
  ];

  function handleChange(event) {
    const { name, value } = event.target ?? {};
    dispatch(updateAddress({ [name]: value }));
    
    // Check if all required fields are filled
    const isValid = requiredFields.every(field => {
      if (field === name) {
        return value.trim() !== '';
      }
      return address[field]?.trim() !== '';
    });
    
    onValidityChange(isValid);
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Shipping Address
      </Typography>
      <Box component="form" onChange={handleChange}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="firstName"
              name="firstName"
              label="First Name"
              fullWidth
              autoComplete="given-name"
              variant="standard"
              defaultValue={address.firstName ?? ""}
              error={address.firstName === ""}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="lastName"
              name="lastName"
              label="Last Name"
              fullWidth
              autoComplete="family-name"
              variant="standard"
              defaultValue={address.lastName ?? ""}
              error={address.lastName === ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="address1"
              name="address1"
              label="Address Line 1"
              fullWidth
              variant="standard"
              defaultValue={address.address1 ?? ""}
              error={address.address1 === ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="address2"
              name="address2"
              label="Address Line 2"
              fullWidth
              variant="standard"
              defaultValue={address.address2 ?? ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="city"
              name="city"
              label="City"
              fullWidth
              variant="standard"
              defaultValue={address.city ?? ""}
              error={address.city === ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="zipCode"
              name="zipCode"
              label="Zip Code/Postal Code"
              fullWidth
              variant="standard"
              defaultValue={address.zipCode ?? ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="country"
              name="country"
              label="Country"
              fullWidth
              variant="standard"
              defaultValue={address.country ?? ""}
              error={address.country === ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number"
              fullWidth
              variant="standard"
              defaultValue={address.phoneNumber ?? ""}
              error={address.phoneNumber === ""}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
