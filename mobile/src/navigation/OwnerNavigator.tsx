import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Owner screens
import DashboardScreen from '../screens/owner/DashboardScreen';
import MenuManagementScreen from '../screens/owner/MenuManagementScreen';
import AddMenuItemScreen from '../screens/owner/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/owner/EditMenuItemScreen';
import OrdersScreen from '../screens/owner/OrdersScreen';
import OrderDetailsScreen from '../screens/owner/OrderDetailsScreen';
import TransactionsScreen from '../screens/owner/TransactionsScreen';
import TaxDashboardScreen from '../screens/owner/TaxDashboardScreen';
import ProfileScreen from '../screens/owner/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MenuStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MenuList" component={MenuManagementScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} options={{ title: 'Add Item' }} />
      <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} options={{ title: 'Edit Item' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}

function TransactionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TransactionsList" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <Stack.Screen name="TaxDashboard" component={TaxDashboardScreen} options={{ title: 'Tax Reports' }} />
    </Stack.Navigator>
  );
}

export default function OwnerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Menu" component={MenuStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Finance" component={TransactionsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

