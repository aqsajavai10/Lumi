import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Chip,
  Snackbar,
  Alert,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ShoppingCart,
  Search,
  LocalOffer,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { addToCart } from "../feature/cart-slice";
import {
  fetchAllProducts,
  selectAllProducts,
  selectProductsLoading,
} from "../feature/products-slice";

const HeroSection = styled("section")(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  backgroundImage: 'url("/path-to-your-background-image.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  padding: theme.spacing(4, 2),
  textAlign: "center",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)",
    },
  },
  [theme.breakpoints.down("sm")]: {
    "&:active": {
      transform: "scale(0.98)",
    },
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  paddingTop: "100%", // Make it square
  backgroundSize: "contain",
  backgroundColor: "#f5f5f5",
  [theme.breakpoints.down("sm")]: {
    paddingTop: "75%", // Shorter on mobile
  },
}));

const ProductTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.1rem",
  marginBottom: theme.spacing(1),
  height: "3em",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
    height: "2.7em",
  },
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  marginTop: "auto",
  borderRadius: theme.shape.borderRadius * 3,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.8rem",
  },
}));

const ExpandButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 3,
  width: "100%",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Added subtle shadow
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
}));

const CategoryDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(6, 0, 4),
  "&::before, &::after": {
    borderColor: theme.palette.primary.main,
  },
  [theme.breakpoints.down("sm")]: {
    margin: theme.spacing(4, 0, 3),
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.2rem",
  },
}));

export default function Home() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const searchTerm = searchParams.get("searchTerm")?.toLowerCase(); // Ensure lowercase for consistent search

  // Updated Redux selectors
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const productsSectionRef = useRef(null);

  const [expandedCategories, setExpandedCategories] = useState({});
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!products?.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, products]);

  const addProductToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredProducts = products?.filter((product) => {
    const categoryMatch =
      !category || category === "all" || product.category === category;
    const searchMatch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm));
    return categoryMatch && searchMatch;
  });

  const groupedProducts = filteredProducts?.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const handleExploreProductsClick = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getInitialDisplayCount = () => {
    if (isSmallScreen) return 3; // Show 2 products on mobile
    if (isMediumScreen) return 3; // Show 3 products on tablet
    return 4; // Show 4 products on desktop
  };

  const renderProductGrid = (categoryProducts, categoryName) => {
    const initialDisplayCount = getInitialDisplayCount();
    const isExpanded = expandedCategories[categoryName];
    const displayedProducts = isExpanded
      ? categoryProducts
      : categoryProducts.slice(0, initialDisplayCount);
    const hasMoreProducts = categoryProducts.length > initialDisplayCount;

    return (
      <>
        <Grid container spacing={isSmallScreen ? 3 : 4}>
          <AnimatePresence>
            {displayedProducts.map((product, index) => (
              <Grid item key={product.id} xs={6} sm={6} md={4} lg={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard elevation={3}>
                    <Link
                      to={`/product/${product.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <ProductImage
                        image={product.imageUrl || product.image} // Handle both imageUrl and image properties
                        title={product.name || product.title} // Handle both name and title properties
                      />
                      <CardContent
                        sx={{
                          p: isSmallScreen ? 1.5 : 2,
                          "&:last-child": { pb: isSmallScreen ? 1.5 : 2 },
                        }}
                      >
                        <ProductTitle
                          variant="h6"
                          component="h3"
                          sx={{
                            fontSize: isSmallScreen ? "0.9rem" : "1.1rem",
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          {product.name || product.title}
                        </ProductTitle>
                        <ProductPrice
                          variant="h6"
                          sx={{
                            fontSize: isSmallScreen ? "1.1rem" : "1.25rem",
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          <LocalOffer fontSize="small" />
                          PKR
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : product.price}
                        </ProductPrice>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          {product.rating ? (
                            <>
                              <Rating
                                value={product.rating.rate}
                                precision={0.5}
                                readOnly
                                size={isSmallScreen ? "small" : "medium"}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: isSmallScreen
                                    ? "0.75rem"
                                    : "0.875rem",
                                }}
                              >
                                ({product.rating.count})
                              </Typography>
                            </>
                          ) : null}
                        </Box>
                        {product.category && (
                          <Chip
                            label={product.category}
                            size={isSmallScreen ? "small" : "medium"}
                            sx={{
                              mt: 0.5,
                              borderRadius: "16px",
                              fontSize: isSmallScreen ? "0.7rem" : "0.875rem",
                            }}
                          />
                        )}
                      </CardContent>
                    </Link>
                    <CardActions sx={{ p: isSmallScreen ? 1.5 : 2, pt: 0 }}>
                      <Link
                        to={`/product/${product.id}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          width: "100%",
                        }}
                      >
                        <AddToCartButton
                          fullWidth
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingCart />}
                          sx={{
                            fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                            py: isSmallScreen ? 0.5 : 1,
                          }}
                        >
                          View Details
                        </AddToCartButton>
                      </Link>
                    </CardActions>
                  </ProductCard>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
        {hasMoreProducts && (
          <Box sx={{ mt: 2, px: 2 }}>
            {" "}
            {/* Added padding for better spacing */}
            <ExpandButton
              onClick={() => toggleCategory(categoryName)}
              endIcon={
                expandedCategories[categoryName] ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )
              }
              variant="contained" // Added variant for better visibility
              disableElevation // Disabled default elevation
            >
              <span style={{ flexGrow: 1, textAlign: "center" }}>
                {" "}
                {/* Added span for better text alignment */}
                {expandedCategories[categoryName]
                  ? "Show Less"
                  : `Show All ${categoryProducts.length} Products`}
              </span>
            </ExpandButton>
          </Box>
        )}
      </>
    );
  };

  // Add effect to scroll to products section when search params change
  useEffect(() => {
    if (searchTerm || category) {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchTerm, category]);

  return (
    <>
      {/* Keep the HeroSection as is */}

      <HeroSection>
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 100 }} // Increased y value for more motion
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }} // Increased duration and added easing
          >
            <Typography
              variant={isSmallScreen ? "h3" : "h1"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                fontSize: isSmallScreen ? "2rem" : "3.75rem",
              }}
            >
              Welcome to Our Store
            </Typography>
            <Typography
              variant={isSmallScreen ? "body1" : "h5"}
              paragraph
              sx={{
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                fontSize: isSmallScreen ? "1rem" : "1.5rem",
                mb: 3,
              }}
            >
              Discover amazing products at unbeatable prices
            </Typography>
            <Button
              variant="contained"
              size={isSmallScreen ? "medium" : "large"}
              color="secondary"
              startIcon={<Search />}
              onClick={handleExploreProductsClick}
              sx={{
                borderRadius: "50px",
                padding: isSmallScreen ? "8px 16px" : "12px 24px",
                fontSize: isSmallScreen ? "0.875rem" : "1rem",
              }}
            >
              Shop Now
            </Button>
          </motion.div>
        </Container>
      </HeroSection>

      <Container
        maxWidth="lg"
        sx={{ py: isSmallScreen ? 4 : 8 }}
        id="products"
        ref={productsSectionRef}
      >
        <Typography
          variant={isSmallScreen ? "h4" : "h2"}
          component="h2"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            mb: isSmallScreen ? 4 : 6,
            fontSize: isSmallScreen ? "1.75rem" : "3rem",
          }}
        >
          Our Products
        </Typography>
        {loading ? (
          <Typography variant="h5" align="center">
            Loading products...
          </Typography>
        ) : Object.keys(groupedProducts).length === 0 ? (
          <Typography variant="h6" align="center">
            No products found.
          </Typography>
        ) : (
          Object.entries(groupedProducts).map(
            ([categoryName, categoryProducts]) => (
              <Box key={categoryName} sx={{ mb: isSmallScreen ? 4 : 6 }}>
                <CategoryDivider textAlign="left">
                  <CategoryHeader>
                    <CategoryTitle
                      variant={isSmallScreen ? "h5" : "h4"}
                      component="h3"
                    >
                      {categoryName.charAt(0).toUpperCase() +
                        categoryName.slice(1)}
                      <Typography
                        component="span"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({categoryProducts.length} items)
                      </Typography>
                    </CategoryTitle>
                  </CategoryHeader>
                </CategoryDivider>
                {renderProductGrid(categoryProducts, categoryName)}
              </Box>
            )
          )
        )}
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: "16px",
            fontWeight: 500,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
