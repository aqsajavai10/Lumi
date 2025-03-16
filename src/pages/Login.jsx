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
  CircularProgress,
  Backdrop,
  useTheme,
} from "@mui/material";
import { useAuth } from "../firebase/Auth";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
}));

const LoginCard = styled(Card)(({ theme }) => ({
  minWidth: 300,
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  // Get redirect path from location state, or default to home
  const from = location.state?.from?.pathname || "/";

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userWithRole = await signIn(email, password);
      console.log("Sign in successful", userWithRole);

      if (userWithRole.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <GradientBackground>
      <LoginCard>
        <CardContent>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {(error || authError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error || authError}
              </Alert>
            )}
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Sign In
            </StyledButton>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Link
                href="/forgot-password"
                variant="body2"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </Link>
              <Link href="/register" variant="body2" color="primary">
                Create an account
              </Link>
            </Box>
          </Box>
        </CardContent>
      </LoginCard>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </GradientBackground>
  );
}
