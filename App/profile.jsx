import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  useColorScheme,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "./firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const ProfileScreen = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchUserData = async (email) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setUserData(docData);
      } else {
        console.log("No user document found for this email.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchUserData(user.email);
      } else {
        setUserEmail("");
        router.replace("/(auth)/login");
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const user = auth.currentUser;
    if (user) {
      fetchUserData(user.email);
    } else {
      router.replace("/(auth)/login");
    }
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  const theme = {
    background: isDark ? "#121212" : "#fdfdfd",
    card: isDark ? "#1E1E1E" : "#fff",
    textPrimary: isDark ? "#fff" : "#222",
    textSecondary: isDark ? "#aaa" : "#555",
    border: isDark ? "#333" : "#eee",
    accent: "#f97316",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["#f97316", "#fb923c"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.appTitle}>Pawfessional</Text>

          <View style={styles.profileSection}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../assets/icons/profile.webp")}
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.profileName}>
              {userData?.name || (userEmail ? userEmail.split("@")[0] : "User")}
            </Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: theme.card,
              shadowColor: isDark ? "#000" : "#f97316",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: isDark ? "#2a2a2a" : "#fff7ed",
                borderColor: theme.accent,
              },
            ]}
            onPress={() => router.push("/myAppointment")}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: theme.accent }]}>
              📅 My Appointments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: isDark ? "#2a2a2a" : "#fff7ed",
                borderColor: theme.accent,
              },
            ]}
            onPress={() => router.push("/myOrders")}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: theme.accent }]}>
              🛒 My Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              styles.logoutCard,
              { backgroundColor: theme.accent },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, { color: "#fff" }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          { backgroundColor: isDark ? "#1E1E1E" : "rgba(255,255,255,0.95)" },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push("/dashboard")}
          style={styles.navItem}
        >
          <Image
            source={require("../assets/icons/home.png")}
            style={styles.navIcon}
          />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={styles.navItem}
        >
          <Image
            source={require("../assets/icons/cart.png")}
            style={styles.navIcon}
          />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={[styles.navItem, styles.activeNav]}
        >
          <Image
            source={require("../assets/icons/profile.webp")}
            style={styles.navIcon}
          />
          <Text style={[styles.navText, { color: theme.accent }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 320,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    elevation: 8,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 15,
    letterSpacing: 1,
  },
  profileSection: { alignItems: "center" },
  imageWrapper: {
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 70,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  profileImage: { width: 110, height: 110, borderRadius: 55 },
  profileName: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 10 },
  profileEmail: { fontSize: 14, color: "#fff", opacity: 0.9 },
  cardContainer: {
    marginHorizontal: 25,
    marginTop: 70,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 15,
    marginVertical: 8,
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 16, fontWeight: "600" },
  logoutCard: { marginTop: 16 },
  bottomNav: {
    position: "absolute",
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 46,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  activeNav: { transform: [{ scale: 1.08 }] },
  navIcon: { width: 26, height: 26, resizeMode: "contain" },
  navText: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});
