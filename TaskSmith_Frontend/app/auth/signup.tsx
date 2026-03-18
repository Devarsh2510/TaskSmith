import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 👇 Base URL config (update IP when testing on device)
const API_BASE_URL = "http://10.223.161.7:5000/api";

export default function SignupScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [name, setName] = useState(""); // ✅ Added name input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing details", "Please enter all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/users/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        role: role || "customer",
      });

      const { token, user } = res.data;

      // ✅ Save user session
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userRole", user.role);
      await AsyncStorage.setItem("userId", user._id);

      Alert.alert("Signup Successful", `Welcome ${user.name || "User"}!`);

      // ✅ Redirect based on role
      if (user.role === "customer") {
        router.replace("/customer/customer");
      } else if (user.role === "provider") {
        router.replace("/provider/provider");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      Alert.alert(
        "Signup Failed",
        err.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === "provider" ? "Provider Signup" : "Customer Signup"}
      </Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
        <Text style={styles.primaryButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/auth/login", params: { role } })
          }
        >
          <Text style={styles.linkButton}> Login</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#555",
  },
  linkButton: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  secondaryButtonText: {
    textAlign: "center",
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
