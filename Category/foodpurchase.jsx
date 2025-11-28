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

const localImages = {
  1: require("../../assets/foods/Milk Lactose.png"),
  2: require("../../assets/foods/Value Meal Dog food.png"),
  3: require("../../assets/foods/Vitality High Energy.png"),
  4: require("../../assets/foods/Vitality Classic.png"),
  5: require("../../assets/foods/Royal Canin Hairball Care.png"),
  6: require("../../assets/foods/Royal Canin Urinary Care.png"),
  7: require("../../assets/foods/Royal Canin Renal Can Wet Food.png"),
  8: require("../../assets/foods/Royal Canin Veterinary Gastrointestinal.png"),
  9: require("../../assets/foods/Royal Canin Veterinary Gastrointestinal.png"),
  10: require("../../assets/foods/Royal Canin Hepatic Adult Wet Dog Food.png"),
  11: require("../../assets/foods/Royal Canin Recovery for Dogs and Cats.png"),
  12: require("../../assets/foods/Dr. Healmedix Hepatic 1.5kg Dog.png"),
  13: require("../../assets/foods/Pedigree DENTASTIX Daily oral care.png"),
  14: require("../../assets/foods/Pedigree Puppy Chicken Chunks.png"),
  15: require("../../assets/foods/PEDIGREE PUPPY WET DOG FOOD BEEF.png"),
  16: require("../../assets/foods/Pedigree Adult Beef in Gravy Wet Dog.png"),
  17: require("../../assets/foods/Special Delight Tuna and Ocean Fish.png"),
  18: require("../../assets/foods/Special Delight Tuna and Salmon Mousse.png"),
  19: require("../../assets/foods/Specialbeef-removebg-preview.png"),
  20: require("../../assets/foods/Whiskas Junior Tuna Wet Cat Food.png"),
  21: require("../../assets/foods/Whiskas Junior Mackerel Wet Cat Food.png"),
  22: require("../../assets/foods/Tuna Cat Food Pouch for Adult.png"),
  23: require("../../assets/foods/SHEBA WET CAT FOOD.png"),
  24: require("../../assets/foods/kitecat chicken tuna.png"),
  25: require("../../assets/foods/Kitekat Wet Cat Food Chicken and Salmon.png"),
  26: require("../../assets/foods/Persian Kitten Dry Cat Food.png"),
  27: require("../../assets/foods/Royal Canin Breed Health Nutrition.png"),
  28: require("../../assets/foods/Nutripe Lamb and Green Tripe Pure.png"),
  29: require("../../assets/foods/Nutripe Dog Food Beef And Green Tripe.png"),
  30: require("../../assets/foods/Vitality Valuemeal Dog Food Grain Free.png"),
  31: require("../../assets/foods/charco's beef.png"),
  32: require("../../assets/foods/charco's dog.png"),
};

// 💬 Local fallback descriptions
const localDescriptions = {
  1: "A lactose-free milk formula made specially for pets to provide calcium and nutrients without upsetting their stomachs.",
  2: "A complete and affordable dog food that provides balanced nutrition and essential vitamins for daily health.",
  3: "High-energy formula designed for active dogs, providing proteins and fats to support strength and endurance.",
  4: "Classic dog food blend offering balanced nutrition for all breeds, supporting strong bones and a shiny coat.",
  5: "Helps reduce hairball formation and supports digestive health for cats prone to shedding.",
  6: "Supports urinary tract health by maintaining proper mineral balance and reducing the risk of stones.",
  7: "Formulated to support kidney function with controlled protein and phosphorus levels for dogs with renal issues.",
  8: "A highly digestible diet designed for pets with sensitive stomachs or digestive disorders.",
  9: "Veterinary formula designed to promote gut health and ease gastrointestinal discomfort in cats and dogs.",
  10: "Supports liver function and helps dogs maintain healthy metabolism with reduced copper content.",
  11: "High-energy and nutrient-rich formula for pets recovering from illness or surgery.",
  12: "Specially made for dogs with liver conditions, supporting detoxification and healthy metabolism.",
  13: "Tasty dental sticks that help clean your dog’s teeth and freshen their breath while chewing.",
  14: "Soft, flavorful chunks made with chicken to support your puppy’s growth and strong bones.",
  15: "Delicious wet food made from tender beef, enriched with nutrients for growing puppies.",
  16: "Savory beef gravy meal packed with protein for adult dogs’ daily strength and energy.",
  17: "A delightful mix of tuna and ocean fish in sauce that cats love, rich in Omega-3 and protein.",
  18: "Smooth salmon mousse that provides your cat with premium protein and irresistible taste.",
  19: "Creamy tuna and salmon mousse packed with flavor and essential nutrients for a healthy coat.",
  20: "Specially formulated wet food for kittens made with real tuna to support growth and immunity.",
  21: "Tasty mackerel recipe rich in DHA and calcium to help kittens develop strong bones and vision.",
  22: "A savory tuna pouch made for adult cats, providing balanced nutrition and hydration.",
  23: "Premium wet cat food made with tender cuts in gravy for a gourmet dining experience.",
  24: "Wholesome chicken and tuna mix that gives cats complete nutrition and energy for playtime.",
  25: "A delicious combination of salmon and chicken to maintain your cat’s overall health and vitality.",
  26: "Tailored dry food for Persian kittens to promote coat health and proper digestion.",
  27: "Breed-specific nutrition developed to meet the unique needs of purebred dogs.",
  28: "Made with lamb and green tripe for high digestibility and natural prebiotics for gut health.",
  29: "Beef and tripe formula crafted for dogs with sensitive stomachs, rich in natural enzymes.",
  30: "Grain-free formula for dogs with allergies, packed with protein and essential fatty acids.",
  31: "Chewy beef treats that reward your pet with a rich, meaty flavor and nutrients for energy.",
  32: "Original recipe dog treats made with real meat, ideal for training or rewarding good behavior.",
};

const foodPrices = {
  1: "₱200",
  2: "₱160",
  3: "₱280",
  4: "₱250",
  5: "₱75",
  6: "₱85",
  7: "₱180",
  8: "₱180",
  9: "₱80",
  10: "₱180",
  11: "₱300",
  12: "₱1,400",
  13: "₱125",
  14: "₱48",
  15: "₱45",
  16: "₱30",
  17: "₱40",
  18: "₱40",
  19: "₱40",
  20: "₱40",
  21: "₱40",
  22: "₱35",
  23: "₱45",
  24: "₱30",
  25: "₱30",
  26: "₱290",
  27: "₱320",
  28: "₱130",
  29: "₱130",
  30: "₱160",
  31: "₱180",
  32: "₱130",
};

const getImageUri = (img) => {
  if (!img) return null;
  if (typeof img === "number") return Image.resolveAssetSource(img).uri;
  if (img.uri) return img.uri;
  return null;
};

const FoodPurchase = () => {
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

  if (loading) return <View style={styles.center}><Text>Loading product...</Text></View>;
  if (!item) return <View style={styles.center}><Text>⚠️ Item not found for ID: {id}</Text></View>;

  const productImage = localImages[item.id] || { uri: item.image };
  const description = item.description || localDescriptions[item.id] || "No description available.";
  const displayPrice = foodPrices[item.id] || "₱0";

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
            { text: "Continue Shopping", onPress: () => router.push("/category/food")  },
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push("/category/food")}>
          <Image source={require("../../assets/icons/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>🐾 Pawfessional</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={productImage} style={styles.productImage} />
        </View>

        <View style={styles.details}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{displayPrice}</Text>

          <View style={styles.metaInfo}>
            <Text style={styles.text}><Text style={styles.label}>Brand:</Text> {item.brand}</Text>
            <Text style={styles.text}><Text style={styles.label}>Type:</Text> {item.productType}</Text>
            <Text style={styles.text}><Text style={styles.label}>Stock:</Text> {item.count}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonRow}>
      
            <TouchableOpacity
              style={styles.cartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.cartText}>
                🛒 Add to Cart
              </Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={[
                styles.buyButton,
                item.count === 0 && { backgroundColor: "#ccc", opacity: 0.6 },
              ]}
              onPress={handleBuyNow}
              disabled={item.count === 0}
            >
              <Text style={styles.buyText}>
                {item.count === 0 ? "Out of Stock" : "Buy Now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default FoodPurchase;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  backIcon: { width: 28, height: 28, resizeMode: "contain", tintColor: "#f97316" },
  appTitle: { fontSize: 32, fontWeight: "800", color: "#f97316", textAlign: "center", flex: 1 },

  container: { padding: 16, backgroundColor: "#fefcfb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, padding: 20 },
  imageContainer: { backgroundColor: "#fff7ed", borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12, paddingVertical: 20 },
  productImage: { width: 220, height: 200, resizeMode: "contain" },
  details: { paddingHorizontal: 6 },
  productName: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  productPrice: { fontSize: 18, fontWeight: "bold", color: "#f97316", marginBottom: 12 },
  metaInfo: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 10, marginBottom: 10 },
  text: { fontSize: 14, color: "#374151", marginBottom: 3 },
  label: { fontWeight: "600", color: "#111827" },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20, marginBottom: 20, textAlign: "justify" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  cartButton: { flex: 1, borderWidth: 1.5, borderColor: "#f97316", borderRadius: 25, paddingVertical: 10, marginRight: 8, backgroundColor: "#fff" },
  cartText: { textAlign: "center", color: "#f97316", fontWeight: "600" },
  buyButton: { flex: 1, backgroundColor: "#f97316", borderRadius: 25, paddingVertical: 10, marginLeft: 8 },
  buyText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
