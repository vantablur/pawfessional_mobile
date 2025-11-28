import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  Timestamp,
  writeBatch,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const Orders = () => {
  const { selectedItems } = useLocalSearchParams();
  const router = useRouter();
  const items = selectedItems ? JSON.parse(selectedItems) : [];

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // --- Fetch User Info ---
  const fetchUserInfo = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login Required", "Please log in to continue.");
      router.push("/login");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      } else {
        setUserInfo({
          name: user.displayName || "Guest User",
          contact: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserInfo();
    setRefreshing(false);
  }, [fetchUserInfo]);

  // --- Compute Total ---
  const total = items.reduce(
    (sum, i) =>
      sum +
      Number((i.price || "0").toString().replace(/[₱,]/g, "")) *
        (i.quantity || 1),
    0
  );

  // --- Place Order ---
  const handlePlaceOrder = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Please login first before purchasing.");
        return;
      }

      const customerName = userInfo?.name || "Unknown";
      const contactNumber = userInfo?.contact || "";
      const address = userInfo?.address || "";

      const batch = writeBatch(db);

      for (const item of items) {
        const productID = item.productID || item.id;
        const { name, price, image, quantity, productType, id: cartId } = item;
        const qty = parseInt(quantity) || 1;
        const priceValue =
          Number((price || "0").toString().replace(/[₱,]/g, "")) || 0;

        const productRef = doc(db, "products", productID.toString());
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentCount = productData.count || 0;
          const newCount = Math.max(currentCount - qty, 0);

          // Reduce stock
          batch.update(productRef, { count: newCount });

          // Add order record
          const orderRef = doc(collection(db, "orders"));
          batch.set(orderRef, {
            userId: user.uid,
            customerName,
            contactNumber,
            address,
            itemId: productID,
            productName: name,
            price: priceValue * qty,
            quantity: qty,
            imageUrl: image || "",
            productType: productType || "Unknown",
            status: "Pending",
            orderType: "Store Pickup",
            createdAt: Timestamp.now(),
          });

          // Remove item from cart
          const cartRef = doc(db, "cart", cartId);
          batch.delete(cartRef);
        } else {
          console.warn(`⚠️ Product not found in Firestore: ${productID}`);
        }
      }

      await batch.commit();

      Alert.alert("Order Placed", "Your order has been successfully submitted!", [
        {
          text: "View My Orders",
          onPress: () => router.push("/myOrders"),
        },
      ]);
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Something went wrong while placing the order.");
    }
  };

  // --- Edit Pickup Info ---
  const handleEditInfo = () => {
    setEditName(userInfo?.name || "");
    setEditContact(userInfo?.contact || "");
    setEditAddress(userInfo?.address || "");
    setEditModalVisible(true);
  };

  const saveUserInfo = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: editName,
        contact: editContact,
        address: editAddress,
      });

      setUserInfo({
        name: editName,
        contact: editContact,
        address: editAddress,
      });

      setEditModalVisible(false);
      Alert.alert("Success", "Information updated successfully!");
    } catch (error) {
      console.error("Error updating user info:", error);
      Alert.alert("Error", "Failed to update information.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 120,
          paddingHorizontal: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
          />
        }
      >
        {/* Pickup Info */}
        <View style={styles.cardPremium}>
          <View style={styles.cardHeaderPremium}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIconEmoji}>🐾</Text>
            </View>
            <Text style={styles.cardTitlePremium}>Pickup Information</Text>
          </View>
          <View style={styles.cardBodyPremium}>
            <View style={styles.infoRowPremium}>
              <Text style={styles.infoLabelPremium}>Name</Text>
              <Text style={styles.infoValuePremium}>
                {userInfo?.name || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRowPremium}>
              <Text style={styles.infoLabelPremium}>Contact</Text>
              <Text style={styles.infoValuePremium}>
                {userInfo?.contact || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRowPremium}>
              <Text style={styles.infoLabelPremium}>Address</Text>
              <Text style={styles.infoValuePremium}>
                {userInfo?.address || "N/A"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtnPremium}
            onPress={handleEditInfo}
          >
            <Text style={styles.editBtnTextPremium}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Ordered Items */}
        <View style={[styles.cardPremium, { marginTop: 0 }]}>
          <View style={styles.shopHeader}>
            <Image
              source={require("../assets/images/Shopicon.png")}
              style={styles.shopIcon}
            />
            <Text style={styles.shopTitle}>Pawfessional Accessories</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.itemCardPremium}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                ₱{(Number(item.price.toString().replace(/[₱,]/g, "")) * (item.quantity || 1)).toFixed(2)}
              </Text>
                <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pickup Details */}
        <View style={styles.cardPremium}>
          <Text style={styles.deliveryLabel}>Pickup Option</Text>
          <Text style={styles.deliveryValue}>
            Standard (Claim in store)
          </Text>
          <Text style={styles.deliveryNote}>
            Please claim your order within 3 days.
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCardPremium}>
          <Text style={styles.summaryNote}>
            Total price includes pickup service fee
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTotal}>₱{total.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() =>
            Alert.alert("Confirm Order", "Are you sure you want to place this order?", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes", onPress: handlePlaceOrder },
            ])
          }
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Pickup Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact"
              value={editContact}
              onChangeText={setEditContact}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={editAddress}
              onChangeText={setEditAddress}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#f97316" }]}
                onPress={saveUserInfo}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fffaf5" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardPremium: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
    marginTop: 30,
  },
  cardHeaderPremium: { flexDirection: "row", alignItems: "center" },
  headerIconCircle: {
    backgroundColor: "#fff5f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#f97316",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitlePremium: { fontSize: 18, fontWeight: "700", color: "#f97316" },
  headerIconEmoji: { fontSize: 26 },
  cardBodyPremium: {
    backgroundColor: "#fff7f2",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffe0b3",
    marginBottom: 8,
  },
  infoRowPremium: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  infoLabelPremium: { fontSize: 15, color: "#555", fontWeight: "600" },
  infoValuePremium: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  editBtnPremium: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: "#f97316",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 12,
    elevation: 3,
  },
  editBtnTextPremium: { color: "#fff", fontWeight: "700", fontSize: 14 },
  shopTitle: { fontSize: 18, fontWeight: "900", color: "#f97316", marginBottom: 10 },
  shopHeader: { flexDirection: "row", alignItems: "center" },
  shopIcon: { width: 30, height: 30, marginRight: 8 },
  itemCardPremium: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7f2",
    borderRadius: 12,
    marginBottom: 8,
    padding: 10,
  },
  itemImage: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, color: "#111", marginBottom: 3 },
  itemPrice: { color: "#f97316", fontWeight: "600" },
  itemQty: { fontSize: 12, color: "#666" },
  deliveryLabel: { fontWeight: "700", color: "#333", fontSize: 15, marginBottom: 4 },
  deliveryValue: { fontSize: 14, color: "#555", marginBottom: 2 },
  deliveryNote: { fontSize: 12, color: "#888" },
  summaryCardPremium: {
    backgroundColor: "#fff7f2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffe0b3",
    marginBottom: 20,
  },
  summaryNote: { fontSize: 12, color: "#666" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#f97316" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffaf5",
    borderTopWidth: 1,
    borderColor: "#eee",
    marginBottom: 50,
    paddingHorizontal: 18,
    paddingVertical: 14,
    elevation: 10,
  },
  footerTotal: { fontSize: 18, fontWeight: "bold", color: "#f97316" },
  placeOrderBtn: {
    backgroundColor: "#f97316",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 26,
    shadowColor: "#f97316",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "85%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#f97316" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
});
