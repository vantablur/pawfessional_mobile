import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// 🧡 Local images for vitamins
const localImages = {
  33: require("../../assets/vitamins/petdelyte.png"),
  34: require("../../assets/vitamins/lc vit.png"),
  35: require("../../assets/vitamins/hepatosure.png"),
  36: require("../../assets/vitamins/mondex.png"),
};

const localDescriptions = {
  33: "An electrolyte solution that helps pets recover from dehydration caused by heat, diarrhea, or illness. Keeps your pet hydrated and refreshed.",
  34: "A multivitamin syrup enriched with Lysine to boost your pet’s immune system, improve appetite, and support overall growth and vitality.",
  35: "A liver supplement formulated with Sorbitol and Inositol to promote healthy liver function and detoxification for dogs and cats.",
  36: "A water-soluble energy supplement designed to restore electrolytes and glucose levels in pets experiencing stress, dehydration, or fatigue.",
};

const vitaminPrices = {
  33: "₱70",
  34: "₱200",
  35: "₱300",
  36: "₱180",
};

const getImageUri = (img) => {
  if (!img) return null;
  if (typeof img === "number") return Image.resolveAssetSource(img).uri;
  if (img.uri) return img.uri;
  return null;
};

const VitaminPurchase = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      } else {
        setItem(null);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      Alert.alert("Error", "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItem().finally(() => setRefreshing(false));
  }, [fetchItem]);

  if (loading)
    return (
      <View style={styles.center}>
        <Text>Loading product...</Text>
      </View>
    );

  if (!item)
    return (
      <View style={styles.center}>
        <Text>⚠️ Item not found for ID: {id}</Text>
      </View>
    );

  const productImage = localImages[item.id] || { uri: item.image };
  const description =
    item.description || localDescriptions[item.id] || "No description available.";
  const displayPrice = vitaminPrices[item.id] || "₱0";

  const handleAddToCart = async () => {
    if (item.count <= 0) {
      Alert.alert("Out of Stock", "This item is no longer available.");
      return;
    }
    try {
      await addDoc(collection(db, "cart"), {
        name: item.name,
        price: displayPrice,
        image: getImageUri(productImage),
        productID: item.id,
        brand: item.brand,
        productType: item.productType,
        quantity: 1,
        createdAt: Timestamp.now(),
      });
        Alert.alert(
    "Added to Cart",
    `${item.name} has been added to your cart.`,
    [
      { text: "Continue Shopping", onPress: () => router.push("/category/vitamins")  },
      { text: "View Cart", onPress: () => router.push("/cart") },
    ]
  );
} catch (error) {
  console.error("Error adding to cart:", error);
  Alert.alert(
    "Add to Cart Failed",
    "We couldn’t add this item to your cart. Please try again."
  );
}
  };

  const handleBuyNow = () => {
    if (item.count <= 0) return;

    router.push({
      pathname: "/orders",
      params: {
        selectedItems: JSON.stringify([
          {
            id: item.id,
            name: item.name,
            price: displayPrice,
            image: getImageUri(productImage),
            brand: item.brand,
            productType: item.productType,
            quantity: 1,
          },
        ]),
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/category/vitamins")}
        >
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.appTitle}>🐾 Pawfessional</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={productImage} style={styles.productImage} />
        </View>

        <View style={styles.details}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{displayPrice}</Text>

          <View style={styles.metaInfo}>
            <Text style={styles.text}>
              <Text style={styles.label}>Brand:</Text> {item.brand}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Type:</Text> {item.productType}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Stock:</Text> {item.count}
            </Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonRow}>
      
            <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
              <Text style={styles.cartText}>🛒 Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buyButton,
                item.count <= 0 && { backgroundColor: "#ccc", opacity: 0.6 },
              ]}
              onPress={handleBuyNow}
              disabled={item.count <= 0}
            >
              <Text style={styles.buyText}>
                {item.count <= 0 ? "Out of Stock" : "Buy Now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default VitaminPurchase;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fefcfb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
    position: "relative",
  },
  backButton: { position: "absolute", left: 0, padding: 8 },
  backIcon: { width: 28, height: 28, resizeMode: "contain", tintColor: "#f97316" },
  appTitle: { fontSize: 32, fontWeight: "800", color: "#f97316", textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    padding: 20,
  },
  imageContainer: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingVertical: 20,
  },
  productImage: { width: 220, height: 200, resizeMode: "contain" },
  details: { paddingHorizontal: 6 },
  productName: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  productPrice: { fontSize: 18, fontWeight: "bold", color: "#f97316", marginBottom: 12 },
  metaInfo: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 10, marginBottom: 12 },
  text: { fontSize: 14, color: "#374151", marginBottom: 3 },
  label: { fontWeight: "600", color: "#111827" },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20, marginBottom: 16, textAlign: "justify" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  cartButton: { flex: 1, borderWidth: 1.5, borderColor: "#f97316", borderRadius: 25, paddingVertical: 10, marginRight: 8, backgroundColor: "#fff" },
  cartText: { textAlign: "center", color: "#f97316", fontWeight: "600" },
  buyButton: { flex: 1, backgroundColor: "#f97316", borderRadius: 25, paddingVertical: 10, marginLeft: 8 },
  buyText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
