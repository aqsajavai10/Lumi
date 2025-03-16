// services/orderService.js
import { db } from "../firebase/Auth";
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    increment,
    serverTimestamp
} from 'firebase/firestore';

export const createOrder = async (orderData, cart, userId) => {
    try {
        // Process cart items
        const items = cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            color: item.color || '',
            size: item.size || ''
        }));

        // Calculate totals
        const subtotal = cart.reduce((sum, item) =>
            sum + (item.product.price * item.quantity), 0
        );
        const shippingCost = 300;
        const totalPrice = subtotal + shippingCost;

        // Create order document
        const discountedPrice = totalPrice * 0.75; // Subtract 25%

        const orderRef = await addDoc(collection(db, 'orders'), {
            customerID: userId,
            items,
            orderDate: serverTimestamp(),
            shippingAddress: orderData.address,
            totalPrice: discountedPrice,
            status: 'pending',
            paymentMethod: 'COD',
            phoneNumber: orderData.address.phoneNumber
        });

        // Update product stock
        for (const item of cart) {
            const productRef = doc(db, 'products', item.product.id);
            await updateDoc(productRef, {
                stock: increment(-item.quantity),
                // Update status to 'outOfStock' if stock becomes 0
                status: item.product.stock - item.quantity <= 0 ? 'outOfStock' : 'available'
            });
        }

        return orderRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};