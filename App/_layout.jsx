import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { CartProvider } from "./category/cartContext"; 

const RootLayout = () => {
  return (
    <CartProvider>
    <StatusBar style="dark" backgroundColor="#e7cfefff" />
      <Stack screenOptions={{ headerShown: false }} />
    </CartProvider>
  );
};

export default RootLayout;
