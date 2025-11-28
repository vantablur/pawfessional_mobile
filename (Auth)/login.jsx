import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

// Enable smooth animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AuthScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const router = useRouter();

  const toggleForm = (loginState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLogin(loginState);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert("Invalid", "Please enter your email and password.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            name: user.displayName || "Guest User",
            email: user.email,
            contact: "",
            address: "",
            role: "customer",
            createdAt: Timestamp.now(),
          });
        }

        Alert.alert("Welcome!", "You have logged in successfully.");
        router.replace("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: nameInput || "Anonymous",
        });

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          name: nameInput || "No name provided",
          email: user.email,
          contact: phoneInput || "",
          address: addressInput || "",
          role: "customer",
          createdAt: Timestamp.now(),
        });

        Alert.alert("Account Created", "Welcome to Pawfessional!");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("🔥 Firebase Error:", error);
      switch (error.code) {
        case "auth/invalid-email":
          Alert.alert("Invalid Email", "Please enter a valid email address.");
          break;
        case "auth/email-already-in-use":
          Alert.alert("Email Exists", "This email is already registered.");
          break;
        case "auth/weak-password":
          Alert.alert("Weak Password", "Password must be at least 6 characters.");
          break;
        case "auth/invalid-credential":
          Alert.alert("Invalid Login", "Wrong email or password.");
          break;
        default:
          Alert.alert("Authentication Error", error.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordIcon = useMemo(
    () => (
      <Ionicons
        name={showPassword ? "eye" : "eye-off"}
        size={26}
        color={isDarkMode ? "#fff" : "#464544ff"}
      />
    ),
    [showPassword, isDarkMode]
  );

  const confirmPasswordIcon = useMemo(
    () => (
      <Ionicons
        name={showConfirmPassword ? "eye" : "eye-off"}
        size={26}
        color={isDarkMode ? "#fff" : "#464544ff"}
      />
    ),
    [showConfirmPassword, isDarkMode]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  return (
    <KeyboardAvoidingView
  style={{ flex: 1, backgroundColor: isDarkMode ? "#000" : "#ffffffff" }}
  behavior={Platform.OS === "ios" ? "padding" : "padding"}
  keyboardVerticalOffset={0}
>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#f97316" }]}>
          <View style={[styles.header, { backgroundColor: isDarkMode ? "#222" : "#f97316" }]}>
            <Text style={[styles.appTitle, { color: isDarkMode ? "#fff" : "#fff" }]}>Pawfessional</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? "#ddd" : "#fff" }]}>
              VETERINARY CLINIC AND GROOMING CENTER
            </Text>
            <Text style={[styles.headerText, { color: isDarkMode ? "#fff" : "#fff" }]}>
              Try all advanced features {"\n"} with Pawfessional
            </Text>
          </View>

          <View style={[styles.form, { backgroundColor: isDarkMode ? "#111" : "#fff" }]}>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={isLogin ? styles.toggleButtonActive : styles.toggleButton}
                onPress={() => toggleForm(true)}
              >
                <Text style={isLogin ? styles.toggleTextActive : styles.toggleText}>Log in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={!isLogin ? styles.toggleButtonActive : styles.toggleButton}
                onPress={() => toggleForm(false)}
              >
                <Text style={!isLogin ? styles.toggleTextActive : styles.toggleText}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <TextInput
                  placeholder="Full Name:"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                  style={[styles.input, { backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
                  value={nameInput}
                  onChangeText={setNameInput}
                />
                <TextInput
                  placeholder="Phone Number:"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                  style={[styles.input, { backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  keyboardType="phone-pad"
                />
                <TextInput
                  placeholder="Address:"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                  style={[styles.input, { backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
                  value={addressInput}
                  onChangeText={setAddressInput}
                />
              </>
            )}

            <TextInput
              placeholder="Email:"
              placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
              style={[styles.input, { backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={{ position: "relative" }}>
              <TextInput
                placeholder="Password:"
                placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 45, backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIconOnly}
              >
                {passwordIcon}
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={{ position: "relative" }}>
                <TextInput
                  placeholder="Confirm Password:"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, { paddingRight: 45, backgroundColor: isDarkMode ? "#222" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={styles.eyeIconOnly}
                >
                  {confirmPasswordIcon}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>{isLogin ? "Login" : "Register"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, },
  header: { backgroundColor: "#f97316", paddingTop: 60, paddingBottom: 40, alignItems: "center" },
  appTitle: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  subtitle: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    alignSelf: "flex-start",
    marginLeft: 20,
    paddingTop: 34,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  form: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 47,
    borderTopRightRadius: 47,
    paddingHorizontal: 30,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  toggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    borderRadius: 12,
    alignSelf: "center",
    padding: 1,
  },
  toggleButtonActive: {
    backgroundColor: "#f97316",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    width: 120,
    alignItems: "center",
  },
  toggleButton: {
    backgroundColor: "transparent",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderWidth: 1,
    width: "40%",
    alignItems: "center",
    borderColor: "#f97316",
    marginHorizontal: 5,
  },
  toggleTextActive: { color: "#fff", fontWeight: "700", fontSize: 18 },
  toggleText: { color: "#f97316", fontWeight: "700", fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: "#9d9696",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#000",
    elevation: 2,
  },
  eyeIconOnly: { position: "absolute", right: 15, top: 13 },
  confirmButton: {
    backgroundColor: "#f97316",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8b8787",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "center",
    width: "44%",
    elevation: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});
