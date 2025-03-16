import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/Auth";

// Fetch all unique categories from products collection
export const fetchAllCategories = createAsyncThunk(
    'categories/fetchAll',
    async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(products.map(product => product.category))]
            .filter(Boolean) // Remove any null/undefined categories
            .sort() // Sort alphabetically
            .map(category => ({
                id: category.toLowerCase().replace(/\s+/g, '-'), // Create URL-friendly ID
                name: category,
                value: category, // Add value field for filtering
                productCount: products.filter(p => p.category === category).length
            }));
            
        return uniqueCategories;
    }
);

const categoriesSlice = createSlice({
    name: "categories",
    initialState: {
        items: [],
        loading: false,
        error: null,
        selectedCategory: null,
        selectedCategoryName: null // Add this to store the actual category name
    },
    reducers: {
        setSelectedCategory: (state, action) => {
            if (action.payload === null || action.payload === 'all') {
                state.selectedCategory = null;
                state.selectedCategoryName = null;
            } else {
                const category = state.items.find(cat => cat.id === action.payload);
                state.selectedCategory = category?.id || null;
                state.selectedCategoryName = category?.value || null;
            }
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
            state.selectedCategoryName = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllCategories.fulfilled, (state, action) => {
            state.items = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchAllCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    }
});

// Export actions
export const {
    setSelectedCategory,
    clearSelectedCategory
} = categoriesSlice.actions;

// Selectors
export const selectAllCategories = (state) => state.categories.items;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectCategoriesError = (state) => state.categories.error;
export const selectSelectedCategory = (state) => state.categories?.selectedCategory || "all";
export const selectSelectedCategoryName = (state) => state.categories.selectedCategoryName;


export default categoriesSlice.reducer;