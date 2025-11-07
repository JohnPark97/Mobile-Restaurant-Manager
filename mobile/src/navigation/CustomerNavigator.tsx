import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Customer screens
import RestaurantListScreen from '../screens/customer/RestaurantListScreen';
import RestaurantMenuScreen from '../screens/customer/RestaurantMenuScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import MyOrdersScreen from '../screens/customer/MyOrdersScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BrowseStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: 'Restaurants' }} />
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyOrdersList" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Browse" component={BrowseStack} />
      <Tab.Screen name="MyOrders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

