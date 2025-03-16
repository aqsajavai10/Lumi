import React, { useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ShoppingCart, LocalOffer, NavigateNext } from '@mui/icons-material';
import { styled } from '@mui/system';
import { addToCart } from '../feature/cart-slice';
import { selectAllProducts, selectProductsLoading } from '../feature/products-slice';
import { selectAllCategories, setSelectedCategory } from '../feature/categories-slice';

// Styled Components
const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  paddingTop: '100%',
  backgroundSize: 'contain',
  backgroundColor: '#f5f5f5',
  [theme.breakpoints.down('sm')]: {
    paddingTop: '75%',
  },
}));

const ProductTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(1),
  height: '3em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    height: '2.7em',
  },
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  marginTop: 'auto',
  borderRadius: theme.shape.borderRadius * 3,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: '0.8rem',
  },
}));

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const categories = useSelector(selectAllCategories);

  const category = categories.find(cat => cat.id === categoryId);
  const categoryProducts = products.filter(product => product.category === category?.name);

  // Reset category selection when navigating to home
  const handleHomeClick = (e) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    navigate('/');
  };

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  if (!category) {
    return (
      <Container>
        <Typography variant="h4" align="center" sx={{ mt: 4 }}>
          Category not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: isSmallScreen ? 4 : 8 }}>
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 4 }}
      >
        <Link 
          color="inherit" 
          href="/"
          onClick={handleHomeClick}
          sx={{ cursor: 'pointer' }}
        >
          Home
        </Link>
        <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>
          {category.name}
        </Typography>
      </Breadcrumbs>

      <Typography 
        variant={isSmallScreen ? 'h4' : 'h3'} 
        component="h1" 
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: 700,
          textTransform: 'capitalize',
        }}
      >
        {category.name}
        <Typography 
          component="span" 
          color="text.secondary" 
          sx={{ ml: 2, fontSize: '0.7em' }}
        >
          ({categoryProducts.length} products)
        </Typography>
      </Typography>

      {loading ? (
        <Typography variant="h5" align="center">Loading products...</Typography>
      ) : categoryProducts.length === 0 ? (
        <Typography variant="h6" align="center">No products found in this category.</Typography>
      ) : (
        <Grid container spacing={isSmallScreen ? 3 : 4}>
          <AnimatePresence>
            {categoryProducts.map((product, index) => (
              <Grid item key={product.id} xs={6} sm={6} md={4} lg={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard elevation={3}>
                    <RouterLink
                      to={`/product/${product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ProductImage
                        image={product.imageUrl || product.image}
                        title={product.name || product.title}
                      />
                      <CardContent
                        sx={{
                          p: isSmallScreen ? 1.5 : 2,
                          '&:last-child': { pb: isSmallScreen ? 1.5 : 2 },
                        }}
                      >
                        <ProductTitle 
                          variant="h6" 
                          component="h3"
                          sx={{
                            fontSize: isSmallScreen ? '0.9rem' : '1.1rem',
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          {product.name || product.title}
                        </ProductTitle>
                        <ProductPrice
                          variant="h6"
                          sx={{
                            fontSize: isSmallScreen ? '1.1rem' : '1.25rem',
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          <LocalOffer fontSize="small" />
                          PKR {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </ProductPrice>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          {product.rating && (
                            <>
                              <Rating
                                value={product.rating.rate}
                                precision={0.5}
                                readOnly
                                size={isSmallScreen ? 'small' : 'medium'}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}
                              >
                                ({product.rating.count})
                              </Typography>
                            </>
                          )}
                        </Box>
                        {product.category && (
                          <Chip
                            label={product.category}
                            size={isSmallScreen ? 'small' : 'medium'}
                            sx={{
                              mt: 0.5,
                              borderRadius: '16px',
                              fontSize: isSmallScreen ? '0.7rem' : '0.875rem',
                            }}
                          />
                        )}
                      </CardContent>
                    </RouterLink>
                    <CardActions sx={{ p: isSmallScreen ? 1.5 : 2, pt: 0 }}>
                      <RouterLink
                        to={`/product/${product.id}`}
                        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                      >
                        <AddToCartButton
                          fullWidth
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingCart />}
                          sx={{
                            fontSize: isSmallScreen ? '0.8rem' : '0.9rem',
                            py: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          View Details
                        </AddToCartButton>
                      </RouterLink>
                    </CardActions>
                  </ProductCard>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </Container>
  );
};

export default CategoryPage;