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

const vitaminsItems = [
  {
    id: "33",
    name: "Petdelyte Oral Solution",
    price: "₱70",
    image: require("../../assets/vitamins/petdelyte.png"),
  },
  {
    id: "34",
    name: "LC-Vit Syrup Multivitamins Lysine",
    price: "₱200",
    image: require("../../assets/vitamins/lc vit.png"),
  },
  {
    id: "35",
    name: "Hepatosure Sorbitol Inositol Hepato Protectant",
    price: "₱300",
    image: require("../../assets/vitamins/hepatosure.png"),
  },
  {
    id: "36",
    name: "Mondex Water Soluble Powder 340g",
    price: "₱180",
    image: require("../../assets/vitamins/mondex.png"),
  },
];

const VitaminsScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleVitaminPress = (item) => {
    router.push({
      pathname: "/category/vitaminpurchase",
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
      onPress={() => handleVitaminPress(item)}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.vitaminImage} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.vitaminName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.vitaminPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Pawfessional</Text>
        <Text style={styles.headerSubtitle}>Pet Vitamins & Wellness</Text>
      </View>

      <Text style={styles.categoryTitle}>✨ Pet Vitamins</Text>

     
      <FlatList
        data={vitaminsItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />
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

export default VitaminsScreen;

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
  vitaminImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  infoContainer: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  vitaminName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  vitaminPrice: {
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
