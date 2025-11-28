import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Community = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔸 Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pawfessional Community 🐾</Text>
        <Text style={styles.headerSubtitle}>
          Connect • Learn • Stay Updated
        </Text>
      </View>

      {/* 🔸 Main Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/community.png")}
          style={styles.image}
        />
      </View>

      {/* 🔸 Card 1 */}
      <View style={styles.card}>
        <Ionicons name="people" size={32} color="#f97316" style={styles.icon} />
        <Text style={styles.sectionTitle}>Connect with Pet Lovers</Text>
        <Text style={styles.description}>
          Be part of a growing community of pet enthusiasts. Share experiences,
          discover care tips, and support each other in keeping your furry
          friends happy and healthy.
        </Text>
      </View>

      {/* 🔸 Card 2 */}
      <View style={styles.card}>
        <Ionicons
          name="book-outline"
          size={32}
          color="#f97316"
          style={styles.icon}
        />
        <Text style={styles.sectionTitle}>Learn & Share</Text>
        <Text style={styles.description}>
          Explore articles, grooming advice, and veterinary insights — or share
          your own stories to inspire fellow pawrents. Together, we make every
          pet’s life better.
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons
          name="megaphone-outline"
          size={32}
          color="#f97316"
          style={styles.icon}
        />
        <Text style={styles.sectionTitle}>Stay Updated</Text>
        <Text style={styles.description}>
          Visit our official Pawfessional website to access important
          information about our clinic, including services, operating hours,
          and contact details. Scan the QR code available on the website to
          easily download our mobile app and stay
          informed about your pet's care and clinic updates.
        </Text>
      </View>
    </ScrollView>
  );
};

export default Community;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    backgroundColor: "#f97316",
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: 25,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#fff8f0",
    marginTop: 5,
  },

  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 30,
  },
  image: {
    width: 330,
    height: 220,
    borderRadius: 20,
    resizeMode: "cover",
  },

  card: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f97316",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    textAlign: "justify",
  },
});
