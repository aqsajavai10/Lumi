import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllCategories,
  selectAllCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  setSelectedCategory,
  selectSelectedCategory,
} from "../feature/categories-slice";
import { selectAllProducts } from "../feature/products-slice";
import { getItemCount } from "../utils";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  Badge,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart,
  Search,
  Menu as MenuIcon,
  Close,
  Person,
  Receipt,
  KeyboardArrowDown,
} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/system";

// Styled Components
const HeaderContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  textDecoration: "none",
  marginRight: theme.spacing(2),
  cursor: "pointer",
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flex: 1,
  maxWidth: 800,
  margin: "0 auto",
  gap: theme.spacing(1),
}));

const CategorySelect = styled(Select)(({ theme }) => ({
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  "& .MuiSelect-select": {
    paddingTop: 8,
    paddingBottom: 8,
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginLeft: "auto",
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  color: theme.palette.text.primary,
  minWidth: 130,
  justifyContent: "flex-start",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 280,
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const MobileSearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Header = ({ user, signOut }) => {
  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux Selectors
  const categories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const selectedCategory = useSelector(selectSelectedCategory);
  const products = useSelector(selectAllProducts); // Updated selector
  const cartItems = useSelector((state) => state.cart?.value || []); // Updated cart selector path
  const cartItemCount = getItemCount(cartItems);

  // Debugging
  console.log("Cart Items:", cartItems);
  console.log("Cart Item Count:", cartItemCount);

  // Effects
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const category = searchParams.get("category");
    const searchTerm = searchParams.get("searchTerm");

    if (category) {
      dispatch(setSelectedCategory(category));
    }

    setSearchValue(searchTerm || "");
  }, [searchParams, dispatch]);

  // Handlers
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    dispatch(setSelectedCategory(categoryId));

    if (categoryId === "all") {
      navigate("/");
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  const handleSearch = (value) => {
    const searchQuery = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      searchQuery.set("category", selectedCategory);
    }
    if (value) {
      searchQuery.set("searchTerm", value.toLowerCase());
    }
    navigate(`/?${searchQuery.toString()}`);

    // Scroll to products section with a slight delay to ensure DOM update
    setTimeout(() => {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleProfileClose();
    navigate("/login");
  };

  const handleMyOrders = () => {
    handleProfileClose();
    navigate("/orders");
  };

  // Render Functions
  const renderSearch = () => (
    <SearchContainer>
      <CategorySelect
        value={selectedCategory || "all"}
        onChange={handleCategoryChange}
        size="small"
        displayEmpty
        disabled={categoriesLoading}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
          },
        }}
      >
        <MenuItem value="all">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            value={category.id}
            sx={{
              textTransform: "capitalize",
              minHeight: "48px",
            }}
          >
            {category.name} ({category.productCount})
          </MenuItem>
        ))}
      </CategorySelect>

      {categoriesLoading ? (
        <CircularProgress size={24} />
      ) : (
        <Autocomplete
          freeSolo
          size="small"
          options={products.map((product) => product.name)}
          value={searchValue}
          onChange={(_, newValue) => {
            setSearchValue(newValue);
            handleSearch(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search products..."
              fullWidth
              size="small"
              error={Boolean(categoriesError)}
              helperText={categoriesError}
            />
          )}
          sx={{ flex: 1 }}
        />
      )}

      <IconButton
        color="primary"
        onClick={() => handleSearch(searchValue)}
        disabled={categoriesLoading}
      >
        <Search />
      </IconButton>
    </SearchContainer>
  );

  const renderProfileMenu = () => (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleMyOrders}>
        <ListItemIcon>
          <Receipt fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="My Orders" />
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Close fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );

  return (
    <HeaderContainer position="sticky">
      <Toolbar>
        <NavContainer>
          <Logo variant="h6" component={Link} to="/">
            Lumi
          </Logo>

          {!isMobile && renderSearch()}

          {!isMobile && (
            <ActionButtons>
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <StyledBadge badgeContent={cartItemCount} color="primary">
                  <ShoppingCart />
                </StyledBadge>
              </IconButton>

              {user ? (
                <>
                  <ProfileButton
                    onClick={handleProfileClick}
                    endIcon={<KeyboardArrowDown />}
                  >
                    <Person sx={{ mr: 1 }} />
                    {user.displayName || user.email}
                  </ProfileButton>
                  {renderProfileMenu()}
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  color="primary"
                  variant="contained"
                >
                  Login
                </Button>
              )}
            </ActionButtons>
          )}

          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
        </NavContainer>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <DrawerContent>
            <MobileSearchContainer>{renderSearch()}</MobileSearchContainer>

            <List>
              <ListItem
                button
                component={Link}
                to="/cart"
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemIcon>
                  <ShoppingCart />
                </ListItemIcon>
                <ListItemText
                  primary="Cart"
                  secondary={`${cartItemCount} items`}
                />
              </ListItem>

              {user ? (
                <>
                  <ListItem button onClick={handleMyOrders}>
                    <ListItemIcon>
                      <Receipt />
                    </ListItemIcon>
                    <ListItemText primary="My Orders" />
                  </ListItem>
                  <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                      <Close />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </>
              ) : (
                <ListItem
                  button
                  component={Link}
                  to="/login"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
              )}
            </List>
          </DrawerContent>
        </Drawer>
      </Toolbar>
    </HeaderContainer>
  );
};

export default Header;