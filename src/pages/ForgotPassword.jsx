import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  Link,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../firebase/Auth';
import { useNavigate } from 'react-router-dom';

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
}));

const ResetCard = styled(Card)(({ theme }) => ({
  minWidth: 300,
  maxWidth: 400,
  padding: theme.spacing(3),
  backgroundColor: 'rgba(44, 44, 45, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: theme.palette.common.white,
  height: 48,
  padding: '0 30px',
}));

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ResetCard>
        <CardContent>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Password reset email sent! Check your inbox.
              </Alert>
            )}
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Send Reset Link
            </StyledButton>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Link
                href="/login"
                variant="body2"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Back to Login
              </Link>
            </Box>
          </Box>
        </CardContent>
      </ResetCard>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </GradientBackground>
  );
}