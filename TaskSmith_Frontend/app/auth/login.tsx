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

// 👇 You can also move this to api.js for reusability
const API_BASE_URL = "http://10.223.161.7:5000/api"; // change IP to your machine's local IP

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Please enter both email and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, {
        email: email.trim(),
        password,
      });

      const { token, user } = res.data;

      // ✅ Save auth info locally
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userRole", user.role);
      await AsyncStorage.setItem("userId", user._id);

      // ✅ Redirect user based on role
      if (user.role === "customer") {
        router.replace("/customer/customer");
      } else if (user.role === "provider") {
        router.replace("/provider/provider");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      console.error("Login Error:", err.response?.data || err.message);
      let message = "Login failed. Please try again.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === "provider" ? "Provider Login" : "Customer Login"}
      </Text>

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

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don’t have an account?</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/auth/signup", params: { role } })
          }
        >
          <Text style={styles.linkButton}> Sign Up</Text>
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
