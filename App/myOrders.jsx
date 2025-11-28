import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  BackHandler,
  Dimensions,
} from "react-native";
import { collection, query, where, orderBy, doc, writeBatch, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BackIcon from "../assets/icons/back.png";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const MyOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      router.replace("/dashboard");
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [])
);

  useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const ordersData = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate();

      if (data.status === "Pending" && createdAt && now - createdAt > threeDays) {
        data.status = "Expired";
      }

      ordersData.push({ id: docSnap.id, ...data });
    });

    setOrders(ordersData);
    setLoading(false);
    setRefreshing(false);
  });

  return () => unsubscribe();
}, []);


  const onRefresh = () => {
  setRefreshing(true);
  setTimeout(() => setRefreshing(false), 500);
};

  const cancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        Alert.alert("Error", "Order not found.");
        return;
      }

      const orderData = orderSnap.data();
      const productId = orderData.itemId;
      const quantity = orderData.quantity || 1;
      const productRef = doc(db, "products", productId);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      Alert.alert("Order Cancelled", "Your order has been successfully cancelled.");

      const productSnap = await getDoc(productRef);
      const batch = writeBatch(db);

      if (productSnap.exists()) {
        const currentCount = productSnap.data().count || 0;
        batch.update(productRef, { count: currentCount + quantity });
      }

      batch.update(orderRef, { status: "Cancelled" });
      await batch.commit();

    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Error", "Failed to cancel order. Please try again.");
    }
  };

  const calculateDaysLeft = (createdAt) => {
    if (!createdAt?.toDate) return null;
    const now = new Date();
    const orderDate = createdAt.toDate();
    const threeDaysLater = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((threeDaysLater - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No orders yet 😢</Text>
        <Text style={styles.subText}>Start shopping and your orders will show up here!</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace("/dashboard")}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>🐾 My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => {
          const daysLeft = item.status === "Pending" ? calculateDaysLeft(item.createdAt) : null;

          let badgeColor = "#f59e0b";
          let badgeBg = "#fff7ed";
          if (item.status === "Completed") {
            badgeColor = "#1d4ed8";
            badgeBg = "#eff6ff";
          } else if (item.status === "Cancelled") {
            badgeColor = "#b91c1c";
            badgeBg = "#fef2f2";
          } else if (item.status === "Expired") {
            badgeColor = "#92400e";
            badgeBg = "#fffbeb";
          }

          return (
            <View style={styles.card}>
              <View style={[styles.statusBadgeTop, { backgroundColor: badgeBg }]}>
                <Text style={[styles.statusText, { color: badgeColor }]}>{item.status}</Text>
              </View>

              <View style={styles.headerRowCard}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                ) : (
                  <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/616/616408.png" }}
                    style={styles.productImage}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.productName}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Customer:</Text>
                  <Text style={styles.detailValue}>{item.customerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cart-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>₱{item.price}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Order Date:</Text>
                  <Text style={styles.detailValue}>
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {item.status === "Pending" && daysLeft !== null && (
                <Text style={styles.expireText}>
                  ⏰ Expires in <Text style={{ fontWeight: "700" }}>{daysLeft}</Text> day
                  {daysLeft !== 1 ? "s" : ""}
                </Text>
              )}

              {item.status === "Pending" && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelOrder(item.id)}>
                  <Ionicons name="close-circle-outline" size={screenWidth * 0.045} color="#fff" />
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefefe",
  },
  container: {
    padding: screenWidth * 0.045,
    paddingBottom: screenHeight * 0.05,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: screenHeight * 0.06,
    marginBottom: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.04,
  },
  backIcon: {
    width: screenWidth * 0.065,
    height: screenWidth * 0.065,
    resizeMode: "contain",
    tintColor: "#f97316",
    marginLeft: screenWidth * 0.02,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: screenWidth * 0.07,
    fontWeight: "700",
    color: "#f97316",
    marginRight: screenWidth * 0.07,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: screenWidth * 0.045,
    paddingVertical: screenHeight * 0.03,
    paddingHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.028,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f5d0a9",
    position: "relative",
  },
  statusBadgeTop: {
    position: "absolute",
    top: screenHeight * 0.008,
    right: screenWidth * 0.025,
    borderRadius: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.006,
    paddingHorizontal: screenWidth * 0.03,
  },
  statusText: {
    fontWeight: "700",
    fontSize: screenWidth * 0.035,
    textTransform: "uppercase",
  },
  headerRowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: screenWidth * 0.025,
    marginTop: screenHeight * 0.008,
  },
  productImage: {
    width: screenWidth * 0.14,
    height: screenWidth * 0.14,
    borderRadius: screenWidth * 0.025,
    backgroundColor: "#f3f4f6",
    resizeMode: "cover",
  },
  productName: {
    fontSize: screenWidth * 0.045,
    fontWeight: "700",
    color: "#d35400",
    marginBottom: screenHeight * 0.02,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: screenHeight * 0.015,
  },
  details: {
    marginTop: screenHeight * 0.002,
    gap: screenHeight * 0.008,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: screenWidth * 0.02,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#f97316",
  },
  detailValue: {
    fontSize: screenWidth * 0.038,
    color: "#111827",
  },
  expireText: {
    marginTop: screenHeight * 0.012,
    color: "#92400e",
    fontSize: screenWidth * 0.035,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: screenHeight * 0.012,
    borderRadius: screenWidth * 0.025,
    marginTop: screenHeight * 0.02,
    gap: screenWidth * 0.02,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: screenWidth * 0.038,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: screenWidth * 0.05,
  },
  loadingText: {
    marginTop: screenHeight * 0.012,
    fontSize: screenWidth * 0.038,
    color: "#555",
  },
  emptyText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
    color: "#777",
  },
  subText: {
    fontSize: screenWidth * 0.035,
    color: "#9ca3af",
    textAlign: "center",
  },
});
