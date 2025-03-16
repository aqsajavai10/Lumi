import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Link,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  Grid,
  CircularProgress,
  Backdrop,
  useTheme,
} from "@mui/material";
import { useAuth } from "../firebase/Auth";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Your existing styled components remain the same
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(2),
}));

const RegisterCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 400,
  padding: theme.spacing(3),
  backgroundColor: "rgba(44, 44, 45, 0.9)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
  border: 0,
  borderRadius: 3,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  color: theme.palette.common.white,
  height: 48,
  padding: "0 30px",
}));

export default function Register() {
  const { signUp, verificationEmailSent } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const theme = useTheme();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  async function handleRegister(event) {
    event.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      setRegistrationComplete(true);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (registrationComplete) {
    return (
      <GradientBackground>
        <RegisterCard>
          <CardContent>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Registration Successful!</AlertTitle>
              We've sent a verification email to {formData.email}. Please check your
              inbox and verify your email address to complete the registration
              process.
            </Alert>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Once you've verified your email, you can proceed to login.
            </Typography>
            <StyledButton
              fullWidth
              variant="contained"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </StyledButton>
          </CardContent>
        </RegisterCard>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <RegisterCard>
        <CardContent>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          <Box component="form" onSubmit={handleRegister} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {errors.submit && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errors.submit}
              </Typography>
            )}
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Sign Up
            </StyledButton>
            <Box sx={{ textAlign: "center" }}>
              <Link href="/login" variant="body2" color="primary">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </CardContent>
      </RegisterCard>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </GradientBackground>
  );
}