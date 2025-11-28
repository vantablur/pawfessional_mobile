import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Dashboard = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.replace("/(auth)/login");
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
          />
        }
      >
        <Text style={styles.appTitle}>Pawfessional</Text>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Hi{" "}
            <Text style={styles.greetingName}>
              {userEmail ? userEmail.split("@")[0] : "User"}
            </Text>{" "}
            👋
          </Text>
          <Text style={styles.welcomeText}>Welcome to your pet space!</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardText}>Join The {"\n"}Community</Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => router.push("/community")}
              >
                <Text style={styles.cardButtonText}>Join Now</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require("../assets/images/pawcommunity.png")}
              style={styles.cardImage}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>🐶 Categories</Text>

        <View style={styles.categories}>
          <TouchableOpacity
            style={styles.categoryBox}
            onPress={() => router.push("/category/food")}
          >
            <View style={styles.categoryImageWrapper}>
              <Image
                source={require("../assets/icons/food.png")}
                style={styles.categoryImage}
              />
            </View>
            <Text style={styles.categoryText}>Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryBox}
            onPress={() => router.push("/category/vitamins")}
          >
            <View style={styles.categoryImageWrapper}>
              <Image
                source={require("../assets/icons/vitamins.png")}
                style={styles.categoryImage}
              />
            </View>
            <Text style={styles.categoryText}>Vitamins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryBox}
            onPress={() => router.push("/category/petSupplies")}
          >
            <View style={styles.categoryImageWrapper}>
              <Image
                source={require("../assets/icons/product.png")}
                style={styles.categoryImage}
              />
            </View>
            <Text style={styles.categoryText}>Pet Supplies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryBox}
            onPress={() => router.push("/category/appointment")}
          >
            <View style={styles.categoryImageWrapper}>
              <Image
                source={require("../assets/icons/appointment.png")}
                style={styles.categoryImage}
              />
            </View>
            <Text style={styles.categoryText}>Appointment</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>🆕 New Arrival</Text>
        <View style={styles.newArrival}>
          <Text style={styles.newText}>Stay tuned for new products!</Text>
          <Image
            source={require("../assets/icons/threedots.png")}
            style={styles.dotIcon}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => router.push("/dashboard")}
          style={styles.navItem}
        >
          <Image
            source={require("../assets/icons/home.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={styles.navItem}
        >
          <Image
            source={require("../assets/icons/cart.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.navItem}
        >
          <Image
            source={require("../assets/icons/profile.webp")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf5",
    padding: screenWidth * 0.05,
  },
  appTitle: {
    fontSize: screenWidth * 0.08,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: screenHeight * 0.015,
    marginTop: screenHeight * 0.045,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  greetingContainer: {
    backgroundColor: "#fff7ed",
    padding: screenWidth * 0.04,
    borderRadius: 16,
    marginBottom: screenHeight * 0.025,
    shadowColor: "#f97316",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  greetingText: {
    fontSize: screenWidth * 0.056,
    fontWeight: "700",
    color: "#f97316",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  greetingName: {
    color: "#d65b0a",
    fontWeight: "800",
  },
  welcomeText: {
    fontSize: screenWidth * 0.038,
    color: "#6b7280",
    marginTop: screenHeight * 0.008,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#f97316",
    padding: screenWidth * 0.07,
    borderRadius: 18,
    marginBottom: screenHeight * 0.024,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: screenWidth * 0.056,
    fontWeight: "700",
    marginBottom: screenHeight * 0.02,
  },
  cardButton: {
    backgroundColor: "#fff",
    paddingVertical: screenHeight * 0.012,
    paddingHorizontal: screenWidth * 0.03,
    borderRadius: 13,
    alignSelf: "flex-start",
    width: "106%",
    alignItems: "center",
    marginLeft: -10,
  },
  cardButtonText: {
    color: "#d85614ff",
    fontWeight: "600",
    fontSize: screenWidth * 0.036,
  },
  cardImage: {
    width: screenWidth * 0.18,
    height: screenWidth * 0.18,
    marginTop: screenHeight * 0.02,
    resizeMode: "contain",
  },
  sectionTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "700",
    color: "#333",
    marginBottom: screenHeight * 0.018,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: screenHeight * 0.02,
  },
  categoryBox: {
    alignItems: "center",
    width: screenWidth * 0.21,
  },
  categoryImageWrapper: {
    backgroundColor: "#f97316",
    padding: screenWidth * 0.03,
    borderRadius: 10,
    marginBottom: screenHeight * 0.006,
  },
  categoryImage: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    resizeMode: "contain",
  },
  categoryText: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    textAlign: "center",
  },
  newArrival: {
    height: screenHeight * 0.15,
    backgroundColor: "#f3efefff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: screenHeight * 0.09,
  },
  dotIcon: {
    width: screenWidth * 0.09,
    height: screenWidth * 0.09,
    marginBottom: screenHeight * 0.002,
  },
  newText: {
    color: "#6b7280",
    fontSize: screenWidth * 0.037,
    fontWeight: "500",
    marginTop: screenHeight * 0.05,
  },
  bottomNav: {
    position: "absolute",
    bottom: screenHeight * 0.07,
    left: screenWidth * 0.05,
    right: screenWidth * 0.05,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: screenHeight * 0.012,
    borderRadius: 25,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    width: screenWidth * 0.06,
    height: screenWidth * 0.06,
    resizeMode: "contain",
    marginBottom: screenHeight * 0.002,
  },
  navText: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#333",
  },
});
