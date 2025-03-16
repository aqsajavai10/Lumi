import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "../feature/products-slice";
import { addToCart } from "../feature/cart-slice";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ColorSwatch = ({ color, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      backgroundColor: color,
      border: selected ? "2px solid #000" : "1px solid #ccc",
      marginRight: 1,
      cursor: "pointer",
    }}
  />
);

const SizeButton = ({ size, selected, onClick, disabled }) => (
  <Button
    variant={selected ? "contained" : "outlined"}
    onClick={onClick}
    disabled={disabled}
    sx={{
      minWidth: 40,
      marginRight: 1,
      opacity: disabled ? 0.5 : 1,
      "&.Mui-disabled": {
        backgroundColor: "transparent",
      },
    }}
  >
    {size}
  </Button>
);

const getProductDetails = (category) => {

  const formattedCategory = category.toLowerCase().replace(/\s+/g, "_");

  const details = {
    acid_wash: {
      composition: [
        "Upper: 100% Premium Leather/Textile",
        "Lining: 100% Textile",
        "Sole: Rubber compound for maximum grip",
      ],
      care: [
        "Clean with a soft, dry cloth",
        "Store in a cool, dry place",
        "Use shoe tree to maintain shape",
      ],
      features: [
        "Cushioned insole for comfort",
        "Breathable mesh lining",
        "Durable outsole",
      ],
    },
    graphic_hoods: {
      composition: [
        "Main fabric: 95% Cotton, 5% Elastane",
        "Lining: 100% Cotton",
        "Trim: 100% Polyester",
      ],
      care: [
        "Machine wash at 30°C",
        "Do not bleach",
        "Iron at medium temperature",
        "Dry clean possible",
      ],
      features: [
        "Regular fit",
        "Breathable fabric",
        "Moisture-wicking technology",
      ],
    },
    totes: {
      composition: [
        "Exterior: Premium quality material",
        "Interior: Textile lining",
        "Hardware: Metal components",
      ],
      care: [
        "Wipe clean with damp cloth",
        "Avoid direct sunlight",
        "Store in provided dust bag",
      ],
      features: [
        "Adjustable components",
        "Multiple compartments",
        "Durable construction",
      ],
    },
    thrifts: {
      composition: [
        "Main fabric: 100% Vintage Cotton",
        "Lining: 100% Organic Cotton",
        "Trim: 100% Recycled Polyester",
      ],
      care: [
        "Hand wash only",
        "Do not tumble dry",
        "Iron at low temperature",
      ],
      features: [
        "Unique vintage design",
        "Eco-friendly materials",
        "Limited edition",
      ],
    },
  };

  return (
    details[formattedCategory] || {
      composition: [],
      care: [],
      features: [],
    }
  );
};

export default function ProductDetail() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [imageTransitioning, setImageTransitioning] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (currentProduct) {
      setSelectedColor(currentProduct.colors?.[0] || "");
      setCurrentImageIndex(0);
      setSizeError(false);
      setSelectedSize("");
    }
  }, [currentProduct]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSnackbarMessage("Please select a size before adding to cart");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSizeError(true);
      return;
    }

    if (currentProduct) {
      dispatch(
        addToCart({
          product: currentProduct,
          quantity: 1,
          color: selectedColor,
          size: selectedSize,
        })
      );
      setSnackbarMessage(`${currentProduct.name} added to cart`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSizeError(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePrevImage = () => {
    setImageTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentProduct.imageUrl.length - 1 : prev - 1
      );
      setImageTransitioning(false);
    }, 300);
  };

  const handleNextImage = () => {
    setImageTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === currentProduct.imageUrl.length - 1 ? 0 : prev + 1
      );
      setImageTransitioning(false);
    }, 300);
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentProduct) {
    return <Typography variant="h5">Product not found</Typography>;
  }

  const {
    name,
    price,
    description,
    imageUrl = [],
    colors = [],
    size = [],
    gender,
    fit,
    category,
  } = currentProduct || {};

  const productDetails = getProductDetails(category);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            {imageUrl.length > 0 && (
              <>
                <img
                  src={imageUrl[currentImageIndex]}
                  alt={`${name} - View ${currentImageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    opacity: imageTransitioning ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                />
                {imageUrl.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </>
            )}
          </Box>
          {imageUrl.length > 1 && (
            <Box
              sx={{ display: "flex", gap: 1, mt: 2, overflowX: "auto", py: 1 }}
            >
              {imageUrl.map((url, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    setImageTransitioning(true);
                    setTimeout(() => {
                      setCurrentImageIndex(index);
                      setImageTransitioning(false);
                    }, 300);
                  }}
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    cursor: "pointer",
                    border:
                      currentImageIndex === index
                        ? "2px solid #1976d2"
                        : "1px solid #ddd",
                    "&:hover": { opacity: 0.8 },
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {name || "Untitled Product"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            SKU: {productId}
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", my: 2 }}
          >
            PKR {(price || 0).toFixed(2)}
          </Typography>
          <Typography variant="body1" paragraph>
            {description || "No description available"}
          </Typography>

          {fit && (
            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                FIT
              </Typography>
              <Typography variant="body1">{fit}</Typography>
            </Box>
          )}

          {colors.length > 0 && (
            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                COLORS
              </Typography>
              <Box display="flex">
                {colors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={color === selectedColor}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </Box>
            </Box>
          )}

          {size.length > 0 && (
            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                SIZE
                {sizeError && (
                  <span style={{ color: "red", marginLeft: "8px" }}>
                    *Required
                  </span>
                )}
              </Typography>
              <Box display="flex">
                {size.map((size) => (
                  <SizeButton
                    key={size}
                    size={size}
                    selected={size === selectedSize}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {gender && (
            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                GENDER
              </Typography>
              <RadioGroup
                row
                value={gender}
                onChange={(e) => console.log(e.target.value)}
              >
                <FormControlLabel value="MEN" control={<Radio />} label="Men" />
                <FormControlLabel
                  value="WOMEN"
                  control={<Radio />}
                  label="Women"
                />
              </RadioGroup>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleAddToCart}
            sx={{ my: 3 }}
          >
            Add To Cart
          </Button>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>PRODUCT DETAILS & COMPOSITION</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Composition
                </Typography>
                <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                  {productDetails.composition.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2">{item}</Typography>
                    </li>
                  ))}
                </ul>

                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Features
                </Typography>
                <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                  {productDetails.features.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2">{item}</Typography>
                    </li>
                  ))}
                </ul>

                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Care Instructions
                </Typography>
                <ul style={{ marginLeft: "20px" }}>
                  {productDetails.care.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2">{item}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>DELIVERIES & RETURNS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {/* Add delivery and return information here */}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>SPECIAL RETURN CONDITIONS*</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {/* Add special return conditions here */}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px",
            fontFamily: "Arial, sans-serif",
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
