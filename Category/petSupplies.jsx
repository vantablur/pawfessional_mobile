import React, { useState } from "react";
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

const suppliesItems = [
  {
    id: "37",
    name: "Toothpaste with Chicken Flavor",
    price: "₱70",
    image: require("../../assets/Pet Supplies/Toothpaste Chicken Flavor.png"),
  },
  {
    id: "38",
    name: "Toothpaste with Beef Flavor",
    price: "₱150",
    image: require("../../assets/Pet Supplies/toothpaste beef.png"),
  },
  {
    id: "39",
    name: "Toothpaste with Mint Flavor",
    price: "₱150",
    image: require("../../assets/Pet Supplies/Toothpaste with Mint Flavor.png"),
  },
  {
    id: "40",
    name: "Toothpaste with Orange Flavor",
    price: "₱150",
    image: require("../../assets/Pet Supplies/Toothpaste Orange Flavor.png"),
  },
  {
    id: "41",
    name: "Cat Litter Deodorant Powder",
    price: "₱250",
    image: require("../../assets/Pet Supplies/Cat Deodorant Powder.png"),
  },
  {
    id: "42",
    name: "Royal Tail Essentials Madre de Cacao Dog Soap Tutti Fruitie",
    price: "₱80",
    image: require("../../assets/Pet Supplies/Royal Tail Essentials Madre de Tutti Frutiepng.png"),
  },
  {
    id: "43",
    name: "Royal Tail Shampoo 1Gallon/4000mL",
    price: "₱950",
    image: require("../../assets/Pet Supplies/Royal Tail Shampoo.png"),
  },
  {
    id: "44",
    name: "Royal Tail Essentials Madre de Cacao Dog Soap",
    price: "₱80",
    image: require("../../assets/Pet Supplies/Royal Tail Essentials Madre de Cacao dog soup.png"),
  },
  {
    id: "45",
    name: "Royal Tail Sweet Talk",
    price: "₱250",
    image: require("../../assets/Pet Supplies/Royal Tail Sweet Talk.png"),
  },
  {
    id: "46",
    name: "Royal Ear Cleanser",
    price: "₱350",
    image: require("../../assets/Pet Supplies/Royal Tail ear Cleanser.png"),
  },
  {
    id: "47",
    name: "Furfect Soap Biosulfur+Madre de Cacao",
    price: "₱80",
    image: require("../../assets/Pet Supplies/Madre Bar Soup.png"),
  },
  {
    id: "48",
    name: "Papi Groom & Bloom 3 in 1 All Purpose Shampoo",
    price: "₱150",
    image: require("../../assets/Pet Supplies/Papi Groom.png"),
  },
  {
    id: "49",
    name: "Vetspro Fipronil spray",
    price: "₱300",
    image: require("../../assets/Pet Supplies/Fipronil.png"),
  },
  {
    id: "50",
    name: "Wound Spray",
    price: "₱350",
    image: require("../../assets/Pet Supplies/Wound Spray.png"),
  },
];

const PetSuppliesScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 🧭 Handle navigation when an item is pressed
  const handleSuppliesPress = (item) => {
    router.push({
      pathname: "/category/Suppliespurchase",
      params: { id: item.id },
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleSuppliesPress(item)}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.suppliesImage} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.suppliesName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.suppliesPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Pawfessional</Text>
        <Text style={styles.headerSubtitle}>Pet Supplies & Wellness</Text>
      </View>

      <Text style={styles.categoryTitle}>✨ Pet Supplies</Text>

      <FlatList
        data={suppliesItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />
        }
      />

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

export default PetSuppliesScreen;

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
  suppliesImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  infoContainer: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  suppliesName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  suppliesPrice: {
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
