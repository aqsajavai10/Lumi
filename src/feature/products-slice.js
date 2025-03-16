import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/Auth";

export const fetchAllProducts = createAsyncThunk('products/fetchAll', async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return products;
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id) => {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data()
        };
    } else {
        throw new Error("Product not found");
    }
});

export const selectAllProducts = (state) => state.products?.value || [];
export const selectProductsLoading = (state) => state.products?.loading || false;


const productsSlice = createSlice({
    name: "products",
    initialState: { 
        value: [],
        loading: false,
        currentProduct: null
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllProducts.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllProducts.fulfilled, (state, action) => {
            state.value = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchProductById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchProductById.fulfilled, (state, action) => {
            state.currentProduct = action.payload;
            state.loading = false;
        });
    }
});

export default productsSlice.reducer;