import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  Checkbox,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Switch,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete,
  Edit,
  Add,
  SaveAlt,
  Cancel,
  Image as ImageIcon,
} from "@mui/icons-material";
import { db } from "../firebase/Auth";

const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const statusColors = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.CONFIRMED]: "info",
  [OrderStatus.SHIPPED]: "primary",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.CANCELLED]: "error",
};

const categories = ["Acid Wash", "Graphic Hoods", "Totes", "Thirfts"];

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    color: "",
    size: [],
    features: "",
    status: "available",
  });

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const [promocodes, setPromocodes] = useState([]);
  const [openPromocodeDialog, setOpenPromocodeDialog] = useState(false);
  const [promocodeFormData, setPromocodeFormData] = useState({
    code: "",
    discount: "",
    valid: true,
  });

  const [editingPromocode, setEditingPromocode] = useState(null);

  useEffect(() => {
    if (tabValue === 0) {
      fetchProducts();
    } else if (tabValue === 1) {
      fetchOrders();
    } else if (tabValue === 2) {
      fetchPromocodes();
    }
  }, [tabValue]);

  useEffect(() => {
    if (images.length > 0) {
      const newImageURLs = images.map((image) => URL.createObjectURL(image));
      setImageURLs(newImageURLs);
      return () => newImageURLs.forEach((url) => URL.revokeObjectURL(url));
    }
  }, [images]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
  
    // Collect all products first (avoids multiple re-renders)
    const newProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    setProducts(newProducts); // Update state only once
  };
  

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        orderDate: doc.data().orderDate?.toDate(),
      }));
      setOrders(ordersData.sort((a, b) => b.orderDate - a.orderDate));
    } catch (error) {
      showSnackbar("Error fetching orders", "error");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter((s) => s !== size)
        : [...prev.size, size],
    }));
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files].slice(0, 4);
    setImages(files);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      await fetchOrders();
    } catch (error) {
      showSnackbar("Error updating order status", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      color: "",
      size: [],
      features: "",
      status: "available",
    });
    setImages([]);
    setImageURLs([]);
    setSelectedProduct(null);
    setEditMode(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const storage = getStorage();
      let imageUrls = [];
      setUploadProgress(0);

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
          setUploadProgress(((i + 1) / images.length) * 100);
        }
      } else if (editMode && selectedProduct) {
        imageUrls = selectedProduct.imageUrl;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: imageUrls,
        createdAt: editMode ? selectedProduct.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editMode && selectedProduct) {
        await updateDoc(doc(db, "products", selectedProduct.id), productData);
        showSnackbar("Product updated successfully");
      } else {
        await addDoc(collection(db, "products"), productData);
        showSnackbar("Product added successfully");
      }

      resetForm();
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      showSnackbar("Error saving product", "error");
    }
    setLoading(false);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      color: product.color || "",
      size: product.size || [],
      features: product.features || "",
      status: product.status || "available",
    });
    setImageURLs(product.imageUrl || []);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showSnackbar("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        showSnackbar("Error deleting product", "error");
      }
    }
  };

  const calculateTotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return (
      items.reduce((sum, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return sum + price * quantity;
      }, 0) * 0.75 + 300
    );
  };

  const getUniqueCategories = (products) => {
    const categories = products.map((product) => product.category);
    return ["All", ...new Set(categories)];
  };

  const fetchPromocodes = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "promocodes"));
      setPromocodes(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      showSnackbar("Error fetching promocodes", "error");
    }
    setLoading(false);
  };

  const handlePromocodeInputChange = (e) => {
    const { name, value, checked } = e.target;
    setPromocodeFormData((prev) => ({
      ...prev,
      [name]: name === "valid" ? checked : value,
    }));
  };

  const resetPromocodeForm = () => {
    setPromocodeFormData({
      code: "",
      discount: "",
      valid: true,
    });
    setEditingPromocode(null);
  };

  const handleAddPromocode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const promocodeData = {
        ...promocodeFormData,
        discount: parseInt(promocodeFormData.discount),
        createdAt: editingPromocode ? editingPromocode.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingPromocode) {
        await updateDoc(
          doc(db, "promocodes", editingPromocode.id),
          promocodeData
        );
        showSnackbar("Promocode updated successfully");
      } else {
        await addDoc(collection(db, "promocodes"), promocodeData);
        showSnackbar("Promocode added successfully");
      }

      resetPromocodeForm();
      setOpenPromocodeDialog(false);
      fetchPromocodes();
    } catch (error) {
      showSnackbar("Error saving promocode", "error");
    }
    setLoading(false);
  };

  const handleEditPromocode = (promocode) => {
    setEditingPromocode(promocode);
    setPromocodeFormData({
      code: promocode.code,
      discount: promocode.discount.toString(),
      valid: promocode.valid,
    });
    setOpenPromocodeDialog(true);
  };

  const handleDeletePromocode = async (id) => {
    if (window.confirm("Are you sure you want to delete this promocode?")) {
      try {
        await deleteDoc(doc(db, "promocodes", id));
        showSnackbar("Promocode deleted successfully");
        fetchPromocodes();
      } catch (error) {
        showSnackbar("Error deleting promocode", "error");
      }
    }
  };

  const handleTogglePromocodeStatus = async (promocode) => {
    try {
      await updateDoc(doc(db, "promocodes", promocode.id), {
        valid: !promocode.valid,
        updatedAt: new Date(),
      });
      fetchPromocodes();
    } catch (error) {
      showSnackbar("Error updating promocode status", "error");
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchLower) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const OrderRow = ({ order }) => {
    const isExpanded = expandedOrder === order.id;
    const orderItems = Array.isArray(order.items) ? order.items : [];

    return (
      <>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              size="small"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{order.id.slice(-8)}</TableCell>
          <TableCell>{order.orderDate?.toLocaleString()}</TableCell>
          <TableCell>{order.shippingAddress?.fullName}</TableCell>
          <TableCell>
            <Select
              value={order.status || "pending"}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              size="small"
            >
              {Object.values(OrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  <Chip
                    label={status}
                    size="small"
                    color={statusColors[status]}
                  />
                </MenuItem>
              ))}
            </Select>
          </TableCell>
          <TableCell>PKR {calculateTotal(orderItems).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Order Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Shipping Address:
                    </Typography>
                    <Typography variant="body2">
                      {order.shippingAddress?.address1}
                      <br />
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zip}
                      <br />
                      {order.shippingAddress?.country}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Customer Contact:
                    </Typography>
                    <Typography variant="body2">
                      Email: {order.email}
                      <br />
                      Phone: {order.shippingAddress?.phoneNumber || "N/A"}
                      <br />
                      Name:{" "}
                      {order.shippingAddress?.firstName +
                        " " +
                        order.shippingAddress?.lastName || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
                <Table size="small" sx={{ mt: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.size || "N/A"}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          PKR {item.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          PKR {(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">Shipping:</TableCell>
                      <TableCell align="right">PKR 300.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <strong>Total:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          PKR {calculateTotal(orderItems).toFixed(2)}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Promocodes" />
      </Tabs>

      {tabValue === 0 ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Product Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
            >
              Add New Product
            </Button>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filter by Category"
              >
                {getUniqueCategories(products).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading && <LinearProgress />}

          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl?.[0] || "/placeholder.png"}
                    alt={product.name}
                    sx={{ objectFit: "contain", bgcolor: "grey.100" }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <Chip label={product.category} size="small" />
                      <Chip
                        label={`${product.stock} in stock`}
                        size="small"
                        color={product.stock > 0 ? "success" : "error"}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      PKR {Number(product.price).toFixed(0)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : tabValue === 1 ? (
        <Box>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              {Object.values(OrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Promocode Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetPromocodeForm();
                setOpenPromocodeDialog(true);
              }}
            >
              Add New Promocode
            </Button>
          </Box>

          {loading && <LinearProgress />}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Discount (%)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promocodes.map((promocode) => (
                  <TableRow key={promocode.id}>
                    <TableCell>{promocode.code}</TableCell>
                    <TableCell>{promocode.discount}%</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={promocode.valid}
                            onChange={() =>
                              handleTogglePromocodeStatus(promocode)
                            }
                            color="primary"
                          />
                        }
                        label={promocode.valid ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell>
                      {promocode.createdAt?.toDate().toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {promocode.updatedAt?.toDate().toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditPromocode(promocode)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePromocode(promocode.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleAddProduct}>
          <DialogTitle>
            {editMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle1">Size</Typography>
                  {sizeOptions.map((size) => (
                    <FormControlLabel
                      key={size}
                      control={
                        <Checkbox
                          checked={formData.size.includes(size)}
                          onChange={() => handleSizeChange(size)}
                        />
                      }
                      label={size}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Features"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  helperText="Enter product features, separated by commas"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload Images (max 4)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    max="4"
                  />
                </Button>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  {imageURLs.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: "cover" }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SaveAlt />}
            >
              {editMode ? "Update" : "Save"} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openPromocodeDialog}
        onClose={() => setOpenPromocodeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleAddPromocode}>
          <DialogTitle>
            {editingPromocode ? "Edit Promocode" : "Add New Promocode"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Promocode"
                  name="code"
                  value={promocodeFormData.code}
                  onChange={handlePromocodeInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discount Percentage"
                  name="discount"
                  type="number"
                  value={promocodeFormData.discount}
                  onChange={handlePromocodeInputChange}
                  required
                  InputProps={{
                    inputProps: { min: 0, max: 500 },
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={promocodeFormData.valid}
                      onChange={handlePromocodeInputChange}
                      name="valid"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenPromocodeDialog(false)}
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SaveAlt />}
            >
              {editingPromocode ? "Update" : "Save"} Promocode
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage;
