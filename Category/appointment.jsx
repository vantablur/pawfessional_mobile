import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const Appointment = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [selectedPet, setSelectedPet] = useState("");
  const [otherPet, setOtherPet] = useState(""); // ⭐ NEW STATE
  const [service, setService] = useState(null);
  const [condition, setCondition] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const pets = ["Cats", "Dogs", "Birds", "Rabbits", "Hamsters", "Others"];
  const services = [
    "Consultation",
    "Vaccination",
    "Surgery",
    "Blood Test",
    "Confinement",
    "Ultrasound",
    "Home Service",
    "Pet Grooming",
    "Fecalysis",
    "Microchip",
    "Titer",
    "Health Certificate",
    "Tick & Flea Prevention",
    "Deworming",
  ];

  const timeSlots = ["8:00 AM - 12:00 PM", "1:00 PM - 6:00 PM"];

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSelectedPet("");
      setOtherPet("");
      setService(null);
      setCondition("");
      setName("");
      setEmail("");
      setContactNumber("");
      setAppointmentDate("");
      setAppointmentTime("");
      setRefreshing(false);
    }, 800);
  }, []);

  const handleBookAppointment = async () => {
    if (
      !selectedPet ||
      !service ||
      !name ||
      !email ||
      !contactNumber ||
      !appointmentDate ||
      !appointmentTime ||
      (selectedPet === "Others" && !otherPet.trim()) 
    ) {
      Alert.alert("Invalid", "Please fill out all required fields.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "Please log in to book an appointment.");
      return;
    }

    const appointmentData = {
      userId,
      name,
      email,
      contactNumber,
      typeOfPet: selectedPet === "Others" ? otherPet : selectedPet, 
      service,
      condition: condition || "N/A",
      appointmentDate,
      appointmentTime,
      status: "Pending",
      createdAt: Timestamp.fromDate(new Date()),
    };

    try {
      await addDoc(collection(db, "appointments"), appointmentData);
      Alert.alert("Success", "Your appointment has been successfully submitted!", [
        {
          text: "OK",
          onPress: () => {
            setSelectedPet("");
            setOtherPet("");
            setService(null);
            setCondition("");
            setName("");
            setEmail("");
            setContactNumber("");
            setAppointmentDate("");
            setAppointmentTime("");
            router.push("/myAppointment");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving appointment:", error);
      Alert.alert("Error", "Something went wrong while booking your appointment.");
    }
  };

  const handleConfirmDate = (date) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    setAppointmentDate(formattedDate);
    setShowDatePicker(false);
  };

  const dynamicStyles = styles(isDarkMode);

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -136}
    >
      <ScrollView
        style={dynamicStyles.scroll}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>Pawfessional</Text>
          </View>

          <View style={dynamicStyles.form}>
            <Text style={dynamicStyles.title}>Appointment</Text>
            <Text style={dynamicStyles.subtitle}>
              Please fill out this form to make an appointment
            </Text>

            {/* PET TYPE */}
            <Text style={dynamicStyles.label}>What pet do you have?</Text>
            <View style={dynamicStyles.petContainer}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet}
                  style={[dynamicStyles.petBox, selectedPet === pet && dynamicStyles.petBoxSelected]}
                  onPress={() => setSelectedPet(pet)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      dynamicStyles.petRadioOuter,
                      selectedPet === pet && dynamicStyles.petRadioOuterSelected,
                    ]}
                  >
                    {selectedPet === pet && <View style={dynamicStyles.petRadioInner} />}
                  </View>
                  <Text
                    style={[dynamicStyles.petText, selectedPet === pet && dynamicStyles.petTextSelected]}
                  >
                    {pet}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPet === "Others" && (
              <View style={dynamicStyles.iconInput}>
                <Ionicons name="paw-outline" size={20} color="#f97316" style={{ marginRight: 8 }} />
                <TextInput
                  style={dynamicStyles.textInput}
                  value={otherPet}
                  onChangeText={setOtherPet}
                  placeholder="Specify your pet"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                />
              </View>
            )}

            <Text style={dynamicStyles.label}>
              What type of appointment services are you looking for?
            </Text>
            <View style={dynamicStyles.serviceContainer}>
              <Ionicons name="paw-outline" size={22} color="#f97316" style={{ marginRight: 8 }} />
              <Picker
                selectedValue={service}
                onValueChange={(itemValue) => setService(itemValue)}
                style={dynamicStyles.servicePicker}
              >
                <Picker.Item
                  label="Please select a service"
                  value={null}
                  color={isDarkMode ? "#fff" : "#000"}
                />
                {services.map((srv, index) => (
                  <Picker.Item
                    key={index}
                    label={srv}
                    value={srv}
                    color={isDarkMode ? "#fff" : "#000"}
                  />
                ))}
              </Picker>
            </View>

            <Text style={dynamicStyles.label}>
              Please share information about your pet's condition:
            </Text>
            <View style={dynamicStyles.iconInput}>
              <Ionicons name="medkit-outline" size={20} color="#f97316" style={{ marginRight: 8 }} />
              <TextInput
                style={[dynamicStyles.textInput, { height: 90 }]}
                multiline
                value={condition}
                onChangeText={setCondition}
                placeholder="Describe symptoms, behavior, etc."
                placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
              />
            </View>

            <Text style={dynamicStyles.label}>Contact Number:</Text>
            <View style={dynamicStyles.iconInput}>
              <Ionicons name="call-outline" size={20} color="#f97316" style={{ marginRight: 8 }} />
              <TextInput
                style={dynamicStyles.textInput}
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="Enter contact number"
                placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={dynamicStyles.label}>Appointment Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
              <View style={dynamicStyles.customDateBox}>
                <Ionicons name="calendar-outline" size={22} color="#f97316" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: appointmentDate ? (isDarkMode ? "#fff" : "#000") : "#888",
                  }}
                >
                  {appointmentDate || "Select appointment date"}
                </Text>
              </View>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setShowDatePicker(false)}
              minimumDate={new Date()}
            />

            <Text style={dynamicStyles.label}>Appointment Time:</Text>

            <TouchableOpacity
              onPress={() => setShowTimeSlots(!showTimeSlots)}
              activeOpacity={0.8}
            >
              <View style={dynamicStyles.timeInput}>
                <Ionicons name="time-outline" size={20} color="#f97316" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: appointmentTime ? (isDarkMode ? "#fff" : "#000") : "#666",
                  }}
                >
                  {appointmentTime || "Select appointment time"}
                </Text>
                <Ionicons
                  name={showTimeSlots ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#666"
                  style={{ marginLeft: "auto" }}
                />
              </View>
            </TouchableOpacity>

            {showTimeSlots && (
              <View style={dynamicStyles.timeSlotContainer}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => {
                      setAppointmentTime(slot);
                      setShowTimeSlots(false);
                    }}
                    style={[
                      dynamicStyles.timeSlot,
                      appointmentTime === slot && dynamicStyles.timeSlotSelected,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={appointmentTime === slot ? "#f97316" : "#ccc"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color:
                          appointmentTime === slot
                            ? "#f97316"
                            : isDarkMode
                            ? "#fff"
                            : "#000",
                        fontWeight: appointmentTime === slot ? "600" : "400",
                      }}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={dynamicStyles.label}>Your Name:</Text>
            <View style={dynamicStyles.iconInput}>
              <Ionicons name="person-outline" size={20} color="#f97316" style={{ marginRight: 8 }} />
              <TextInput
                style={dynamicStyles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
              />
            </View>

            <Text style={dynamicStyles.label}>Email Address:</Text>
            <View style={dynamicStyles.iconInput}>
              <Ionicons name="mail-outline" size={20} color="#f97316" style={{ marginRight: 8 }} />
              <TextInput
                style={dynamicStyles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={dynamicStyles.submitButton}
              onPress={handleBookAppointment}
            >
              <Text style={dynamicStyles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.footer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Appointment;

const styles = (isDarkMode) =>
  StyleSheet.create({
    keyboardView: { flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" },
    scroll: { flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" },
    container: { backgroundColor: isDarkMode ? "#121212" : "#fff", flex: 1 },
    header: {
      backgroundColor: "#f97316",
      paddingTop: 18,
      paddingBottom: 18,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#fafafaff",
      marginTop: 26,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    form: { padding: 18, flex: 1 },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#454444ff",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? "#ccc" : "#000",
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 8,
      marginTop: 8,
      color: isDarkMode ? "#fff" : "#000",
    },
    petContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    petBox: {
      width: "32%",
      borderWidth: 1,
      borderColor: "#847c7cff",
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 8,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      elevation: 3,
    },
    petBoxSelected: {
      borderColor: "#f97316",
      backgroundColor: isDarkMode ? "#332211" : "#fff5ef",
    },
    petText: {
      fontSize: 15,
      fontWeight: "500",
      marginLeft: 6,
      color: isDarkMode ? "#fff" : "#000",
    },
    petTextSelected: { color: "#f97316", fontWeight: "700" },
    petRadioOuter: {
      width: 22,
      height: 22,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: "#343232ff",
      alignItems: "center",
      justifyContent: "center",
    },
    petRadioOuterSelected: { borderColor: "#f97316" },
    petRadioInner: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: "#f97316",
    },
    iconInput: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      elevation: 2,
      marginBottom: 12,
    },
    textInput: { flex: 1, color: isDarkMode ? "#fff" : "#000" },
    serviceContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 12,
      paddingHorizontal: 10,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      elevation: 2,
      marginBottom: 12,
    },
    servicePicker: { flex: 1, color: isDarkMode ? "#fff" : "#000" },
    customDateBox: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      elevation: 2,
      marginBottom: 12,
    },
    timeInput: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      elevation: 2,
      marginBottom: 10,
    },
    timeSlotContainer: {
      borderWidth: 1,
      borderColor: "#eee",
      borderRadius: 12,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      paddingVertical: 4,
      marginBottom: 12,
      elevation: 2,
    },
    timeSlot: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#f2f2f2",
    },
    timeSlotSelected: {
      backgroundColor: isDarkMode ? "#332211" : "#fff7f2",
    },
    submitButton: {
      backgroundColor: "#f97316",
      borderRadius: 12,
      padding: 7,
      marginTop: 8,
      alignItems: "center",
      alignSelf: "center",
      width: "36%",
      elevation: 5,
    },
    submitText: { color: "#fff", fontSize: 24, fontWeight: "700" },
    footer: {
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      height: 48,
      marginTop: 18,
    },
  });
