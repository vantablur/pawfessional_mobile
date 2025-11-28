import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const foodItems = [
  { id: "1", name: "Pet's Milk Lactose-Free 1L", price: "₱200", image: require("../../assets/foods/Milk Lactose.png") },
  { id: "2", name: "Value Meal Dog food in Can 390g", price: "₱160", image: require("../../assets/foods/Value Meal Dog food.png") },
  { id: "3", name: "Vitality High Energy", price: "₱280", image: require("../../assets/foods/Vitality High Energy.png") },
  { id: "4", name: "Vitality Classic", price: "₱250", image: require("../../assets/foods/Vitality Classic.png") },
  { id: "5", name: "Royal Canin Hairball Care Adult Wet Cat Food", price: "₱75", image: require("../../assets/foods/Royal Canin Hairball Care.png") },
  { id: "6", name: "Royal Canin Urinary Care Cat Slices in Gravy", price: "₱85", image: require("../../assets/foods/Royal Canin Urinary Care.png") },
  { id: "7", name: "Royal Canin Renal Can Wet Food for Dogs", price: "₱180", image: require("../../assets/foods/Royal Canin Renal Can Wet Food.png") },
  { id: "8", name: "Royal Canin Veterinary Gastrointestinal Dog Loaf", price: "₱180", image: require("../../assets/foods/Royal Canin Veterinary Gastrointestinal.png") },
  { id: "9", name: "Royal Canin Veterinary Canine Urinary Wet Dog Food", price: "₱80", image: require("../../assets/foods/Royal Canin Veterinary Canine Urinary.png") },
  { id: "10", name: "Royal Canin Hepatic Adult Wet Dog Food", price: "₱180", image: require("../../assets/foods/Royal Canin Hepatic Adult Wet Dog Food.png") },
  { id: "11", name: "Royal Canin Recovery for Dogs and Cats canned", price: "₱300", image: require("../../assets/foods/Royal Canin Recovery for Dogs and Cats.png") },
  { id: "12", name: "Dr. Healmedix Hepatic 1.5kg Dog Dry Food", price: "₱1,400", image: require("../../assets/foods/Dr. Healmedix Hepatic 1.5kg Dog.png") },
  { id: "13", name: "Pedigree Dentastix Daily oral care", price: "₱125", image: require("../../assets/foods/Pedigree DENTASTIX Daily oral care.png") },
  { id: "14", name: "Pedigree Puppy Chicken Chunks in Gravy Wet Dog Food", price: "₱48", image: require("../../assets/foods/Pedigree Puppy Chicken Chunks.png") },
  { id: "15", name: "Pedigree Puppy Wet Dog Food Beef Flavor in Gravy", price: "₱45", image: require("../../assets/foods/PEDIGREE PUPPY WET DOG FOOD BEEF.png") },
  { id: "16", name: "Pedigree Adult Beef in Gravy Wet Dog", price: "₱30", image: require("../../assets/foods/Pedigree Adult Beef in Gravy Wet Dog.png") },
  { id: "17", name: "Special Delight Tuna and Ocean Fish", price: "₱40", image: require("../../assets/foods/Special Delight Tuna and Ocean Fish.png") },
  { id: "18", name: "Special Delight Tuna and Salmon Mousse", price: "₱40", image: require("../../assets/foods/Special Delight Tuna and Salmon Mousse.png") },
  { id: "19", name: "Special Delight Red Meat in Jelly", price: "₱40", image: require("../../assets/foods/Specialbeef-removebg-preview.png") },
  { id: "20", name: "Whiskas Junior Tuna Wet Cat Food", price: "₱40", image: require("../../assets/foods/Whiskas Junior Tuna Wet Cat Food.png") },
  { id: "21", name: "Whiskas Junior Mackerel Wet Cat Food", price: "₱40", image: require("../../assets/foods/Whiskas Junior Mackerel Wet Cat Food.png") },
  { id: "22", name: "Tuna Cat Food Pouch for Adult", price: "₱35", image: require("../../assets/foods/Tuna Cat Food Pouch for Adult.png") },
  { id: "23", name: "SHEBA WET CAT FOOD", price: "₱45", image: require("../../assets/foods/SHEBA WET CAT FOOD.png") },
  { id: "24", name: "Kitekat Wet Cat Food Chicken and Tuna", price: "₱30", image: require("../../assets/foods/kitecat chicken tuna.png") },
  { id: "25", name: "Kitekat Wet Cat Food Chicken and Salmon", price: "₱30", image: require("../../assets/foods/Kitekat Wet Cat Food Chicken and Salmon.png") },
  { id: "26", name: "Persian Kitten Dry Cat Food 400g", price: "₱290", image: require("../../assets/foods/Persian Kitten Dry Cat Food.png") },
  { id: "27", name: "Royal Canin Breed Health Nutrition Shih tzu", price: "₱320", image: require("../../assets/foods/Royal Canin Breed Health Nutrition.png") },
  { id: "28", name: "Nutripe Lamb and Green Tripe Pure", price: "₱130", image: require("../../assets/foods/Nutripe Lamb and Green Tripe Pure.png") },
  { id: "29", name: "Nutripe Dog Food Beef And Green Tripe", price: "₱130", image: require("../../assets/foods/Nutripe Dog Food Beef And Green Tripe.png") },
  { id: "30", name: "Vitality Valuemeal Dog Food Grain Free", price: "₱160", image: require("../../assets/foods/Vitality Valuemeal Dog Food Grain Free.png") },
  { id: "31", name: "Charco's Beef Dog Treats", price: "₱180", image: require("../../assets/foods/charco's beef.png") },
  { id: "32", name: "Charco's Original Dog Treats", price: "₱130", image: require("../../assets/foods/charco's dog.png") },
];

const FoodScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleFoodPress = (item) => {
    router.push({
      pathname: "/category/foodpurchase",
      params: { id: item.id },
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleFoodPress(item)}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.foodImage} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.foodPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Pawfessional</Text>
        <Text style={styles.headerSubtitle}>Pet Food & Essentials</Text>
      </View>

      <Text style={styles.categoryTitle}>✨ Pet Foods</Text>

      <FlatList
        data={foodItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
            tintColor="#f97316"
          />
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => router.push("/dashboard")}
          style={styles.navItem}
        >
          <Image
            source={require("../../assets/icons/home.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={styles.navItem}
        >
          <Image
            source={require("../../assets/icons/cart.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.navItem}
        >
          <Image
            source={require("../../assets/icons/profile.webp")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FoodScreen;

const CARD_WIDTH = width / 2 - 24;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefefe",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f97316",
    marginTop: 25,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
    fontWeight: "500",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
    marginLeft: 20,
    color: "#2d2d2d",
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 130,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 6,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    backgroundColor: "#fff3e6",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  foodImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  infoContainer: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  foodName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  foodPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f97316",
  },
  bottomNav: {
    position: "absolute",
    bottom: 12,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 44,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#f97316",
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
});
