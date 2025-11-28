import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
  Animated, 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDocs, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";


const Cart = () => {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const filteredCartItems = cartItems.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [selectAll]);

  const handleBack = () => {
    if (from === "vitamin") router.push("/vitamin");
    else router.back();
  };


  const fetchCartItems = useCallback(async () => {
    setRefreshing(true);
    try {
      const snapshot = await getDocs(collection(db, "cart"));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    });
    return () => unsubscribe();
  }, []);


  const increaseQuantity = async (item) => {
  try {

    const productRef = doc(db, "products", item.productID);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      Alert.alert("Error", "Product not found in database.");
      return;
    }

    const productData = productSnap.data();
    const stock = Number(productData.count) || 0;
    const currentQty = Number(item.quantity) || 1;

    if (currentQty >= stock) {
      Alert.alert(
        "Stock Limit Reached",
        `Only ${stock} item(s) available for "${item.name}".`
      );
      return;
    }

    await updateDoc(doc(db, "cart", item.id), {
      quantity: currentQty + 1,
    });
  } catch (error) {
    console.error("Error increasing quantity:", error);
  }
};


  const decreaseQuantity = async (item) => {
    const currentQty = item.quantity || 1;
    if (currentQty > 1) {
      await updateDoc(doc(db, "cart", item.id), { quantity: currentQty - 1 });
    } else {
      Alert.alert(
        "Remove Item",
        "Do you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => removeFromCart(item.id) },
        ]
      );
    }
  };

  const removeFromCart = async (id) => {
    try {
      await deleteDoc(doc(db, "cart", id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const deleteSelectedItems = async () => {
    if (!selectedItems.length) {
      Alert.alert("No items selected", "Please select items to delete.");
      return;
    }

    Alert.alert("Remove Selected Items", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            await Promise.all(selectedItems.map((id) => deleteDoc(doc(db, "cart", id))));
            setSelectedItems([]);
            setSelectAll(false);
            Alert.alert("Deleted", "Selected items have been removed.");
          } catch (error) {
            console.error("Error deleting selected items:", error);
          }
        },
      },
    ]);
  };

  // --- Checkout ---
  const handleCheckout = () => {
    if (!selectedItems.length) {
      Alert.alert("No items selected", "Please select items to check out.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Please login first before checking out.");
      return;
    }

    const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));

    router.push({
      pathname: "/orders",
      params: { selectedItems: JSON.stringify(selectedCartItems) },
    });
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      setSelectAll(newSelected.length === filteredCartItems.length);
      return newSelected;
    });
  };

 const toggleSelectAll = () => {
  if (selectAll) {
    setSelectedItems([]);
    setSelectAll(false);
  } else {
    const ids = filteredCartItems.map((item) => item.id);
    setSelectedItems(ids);
    setSelectAll(true);
  }
};


const subtotal = selectedItems
  .map((id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return 0;

    const price = Number(String(item.price).replace(/[^0-9.]/g, "")) || 0;
    const qty = Number(item.quantity) || 1;

    return price * qty;
  })
  .reduce((sum, n) => sum + n, 0);


  return (
    <View style={styles.container}>
   
   <View style={styles.headerRow}>
  
  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
    <Image source={require("../assets/icons/back.png")} style={styles.backIcon} />
  </TouchableOpacity>

 
  <View style={styles.headerTitle}>
    <Text style={styles.cartTitle}>Pawfessional</Text>
    <Text style={styles.headerSubtitle}>Shopping Cart ({cartItems.length})</Text>
  </View>

 
  {cartItems.length > 0 && (
     <View style={[styles.headerIcons, { position: "absolute", right: 20, top: 112 }]}>
      <TouchableOpacity onPress={deleteSelectedItems} style={styles.iconBtn}>
        <Ionicons name="trash-bin" size={28} color="#e11d48" />
      </TouchableOpacity>
    </View>
  )}
</View>

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCartItems} />}
      >
        {cartItems.length === 0 ? (
          <>
            <Image source={require("../assets/images/catCart.png")} style={styles.image} />
            <Text style={styles.emptyText}>
              There is nothing in the {"\n"} shopping cart at the moment.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.selectAllRow}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Checkbox
                  value={selectAll}
                  onValueChange={toggleSelectAll}
                  color={selectAll ? "#f97316" : undefined}
                  style={{ marginRight: 8 }}
                />
              </Animated.View>
              <Text style={styles.selectAllText}>Select All</Text>
            </View>

          
           {filteredCartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Checkbox
                  value={selectedItems.includes(item.id)}
                  onValueChange={() => toggleSelectItem(item.id)}
                  color={selectedItems.includes(item.id) ? "#f97316" : undefined}
                  style={styles.checkbox}
                />
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image || require("../assets/images/catCart.png")
                  }
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => decreaseQuantity(item)}
                    >
                      <Text style={styles.qtySymbol}>–</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemQty}>{item.quantity || 1}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => increaseQuantity(item)}
                    >
                      <Text style={styles.qtySymbol}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Actions */}
   {/* Actions */}
{cartItems.length > 0 && (
  <View style={styles.actionContainer}>
    <View style={styles.totalCheckoutRow}>
      
      {/* Subtotal Text */}
      <View style={styles.subtotalInline}>
        <Text style={styles.subtotalLabel}>Subtotal:</Text>
        <Text style={styles.subtotalAmount}>₱{subtotal.toFixed(2)}</Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutText}>Check out</Text>
      </TouchableOpacity>

    </View>
  </View>
)}

    </View>
  );
};

export default Cart;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingTop: 50, paddingBottom: 15 },
  backIcon: { width: 26, height: 26, marginTop: 18, resizeMode: "contain", tintColor: "#f97316" },
  cartTitle: { fontSize: 36, fontWeight: "700", color: "#f97316", marginTop: 10, },
  headerSubtitle: { fontSize: 20, color: "#555", marginTop: 8, marginLeft: 18,},
  body: { flexGrow: 1, alignItems: "center", padding: 20, paddingBottom: 120 },
  image: { width: 220, height: 220, resizeMode: "contain", marginBottom: 10 },
  emptyText: { fontSize: 18, color: "#444", textAlign: "center" },
 selectAllRow: {
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  marginBottom: 20,
},

headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center", 
  paddingHorizontal: 20,
  paddingTop: 50,
  paddingBottom: 15,
  position: "relative",
},

headerTitle: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 0, 
},

headerIcons: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  top: 36,
},

iconBtn: {
  padding: 4,
},

backButton: {
  position: "absolute",
  left: 20,
  top: 68, 
  padding: 6,
  zIndex: 2,
},


backIcon: { width: 26, height: 26, resizeMode: "contain", tintColor: "#f97316" },


  selectAllText: { fontSize: 16, fontWeight: "600" },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },

searchInput: {
  flex: 1,
  fontSize: 16,
  color: "#333",
},

topActions: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "flex-end",
  marginBottom: 10,
  gap: 12, 
},

deleteIconBtn: {
  padding: 6,
},

  checkbox: { marginRight: 10 },
  itemImage: { width: 80, height: 80, resizeMode: "contain", marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { fontSize: 14, color: "#f97316" },

  qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: {
    backgroundColor: "#f97316",
    borderRadius: 6,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  qtySymbol: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  itemQty: { marginHorizontal: 10, fontSize: 16, fontWeight: "600" },


  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 90,
    width: "100%",
  },

  subtotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 10,
  },

  subtotalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginRight: 6,
  },

  subtotalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f97316",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#e11d48",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
  },

  deleteText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  checkoutButton: {
    backgroundColor: "#f97316",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
  },

  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  totalCheckoutRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
},

subtotalInline: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

});

