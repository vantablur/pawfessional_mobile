import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "appointments"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setAppointments(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        Alert.alert("Error", "Failed to load appointments.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const user = auth.currentUser;
      if (!user) {
        setRefreshing(false);
        return;
      }

      const q = query(collection(db, "appointments"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const refreshedData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setAppointments(refreshedData);
    } catch (error) {
      console.error("Error refreshing appointments:", error);
      Alert.alert("Error", "Failed to refresh appointments.");
    } finally {
      setRefreshing(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const docRef = doc(db, "appointments", appointmentId);
      await updateDoc(docRef, { status: "Cancelled" });

      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: "Cancelled" } : appt
        )
      );

      Alert.alert("Appointment Cancelled", "Your appointment has been successfully cancelled.");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      Alert.alert("Error", "Failed to cancel appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  if (appointments.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.emptyText}>No appointments found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.title}>My Appointments</Text>

        {appointments.map((item) => {
          let badgeColor = "#f59e0b";
          let badgeBg = "#fff7ed";
          if (item.status?.toLowerCase() === "approved") {
            badgeColor = "#1d4ed8";
            badgeBg = "#eff6ff";
          } else if (item.status?.toLowerCase() === "rejected") {
            badgeColor = "#b91c1c";
            badgeBg = "#fef2f2";
          } else if (item.status?.toLowerCase() === "cancelled") {
            badgeColor = "#92400e";
            badgeBg = "#fffbeb";
          }

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.petType}>{item.typeOfPet || "Pet Type"}</Text>
                  <Text style={styles.serviceText}>{item.service || "Service"}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.statusText, { color: badgeColor }]}>
                    {item.status || "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-circle-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{item.name || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{item.email || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Contact:</Text>
                  <Text style={styles.detailValue}>{item.contactNumber || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Appointment Date:</Text>
                  <Text style={styles.detailValue}>{item.appointmentDate || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Appointment Time:</Text>
                  <Text style={styles.detailValue}>{item.appointmentTime || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="medkit-outline" size={screenWidth * 0.045} color="#f97316" />
                  <Text style={styles.detailLabel}>Condition:</Text>
                  <Text style={styles.detailValue}>{item.condition || "N/A"}</Text>
                </View>
              </View>

              {item.status?.toLowerCase() === "pending" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelAppointment(item.id)}
                >
                  <Ionicons name="close-circle-outline" size={screenWidth * 0.045} color="#fff" />
                  <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefefe",
  },
  container: {
    padding: screenWidth * 0.045,
  },
  title: {
    fontSize: screenWidth * 0.07,
    fontWeight: "700",
    color: "#f97316",
    marginTop: screenHeight * 0.01,
    marginBottom: screenHeight * 0.025,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: screenWidth * 0.045,
    padding: screenWidth * 0.05,
    marginBottom: screenHeight * 0.025,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f5d0a9",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  petType: {
    fontSize: screenWidth * 0.05,
    fontWeight: "700",
    color: "#d35400",
  },
  serviceText: {
    fontSize: screenWidth * 0.038,
    color: "#555",
    marginTop: screenHeight * 0.002,
  },
  statusBadge: {
    borderRadius: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.005,
    paddingHorizontal: screenWidth * 0.03,
  },
  statusText: {
    fontWeight: "700",
    fontSize: screenWidth * 0.035,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: screenHeight * 0.015,
  },
  details: {
    marginTop: screenHeight * 0.005,
    gap: screenHeight * 0.005,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: screenWidth * 0.02,
  },
  detailValue: {
    fontSize: screenWidth * 0.038,
    color: "#111827",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#f97316",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: screenHeight * 0.013,
    borderRadius: screenWidth * 0.025,
    marginTop: screenHeight * 0.02,
    gap: screenWidth * 0.02,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: screenWidth * 0.038,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: screenWidth * 0.05,
  },
  loadingText: {
    marginTop: screenHeight * 0.01,
    fontSize: screenWidth * 0.038,
    color: "#555",
  },
  emptyText: {
    fontSize: screenWidth * 0.038,
    color: "#777",
  },
});

export default MyAppointment;
