// app/provider/profile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://YOUR_BACKEND_IP:5000/api"; // ⚠️ Replace YOUR_BACKEND_IP

export default function ProviderProfile() {
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // From backend user info
  const [userId, setUserId] = useState(""); // From backend
  const router = useRouter();

  // ✅ Load provider data from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedEmail = await AsyncStorage.getItem("email");
        const storedUserId = await AsyncStorage.getItem("userId");

        if (!token) {
          Alert.alert("Session Expired", "Please log in again.");
          router.replace("/auth/login");
          return;
        }

        if (storedEmail) setEmail(storedEmail);
        if (storedUserId) setUserId(storedUserId);

        // Fetch provider profile from backend
        const res = await fetch(`${API_URL}/provider/profile/${storedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setServiceType(data.serviceType || "");
          setPhone(data.phone || "");
        } else {
          console.log("No existing profile found, user may be new.");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  // ✅ Save or Update Provider Profile
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (!token || !storedUserId) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/auth/login");
        return;
      }

      const res = await fetch(`${API_URL}/provider/profile/${storedUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, serviceType, phone }),
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert("✅ Success", "Profile updated successfully");
      } else {
        Alert.alert("❌ Error", result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("❌ Error", "Failed to save profile.");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "userRole", "userId", "email"]);
      router.replace("/auth/login");
    } catch (err) {
      Alert.alert("❌ Error", "Logout failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Provider Profile</Text>

      {/* Read-only details */}
      <Text style={styles.label}>Email</Text>
      <Text style={styles.readOnlyBox}>{email}</Text>

      <Text style={styles.label}>User ID</Text>
      <Text style={styles.readOnlyBox}>{userId}</Text>

      {/* Editable fields */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Service Type</Text>
      <TextInput
        style={styles.input}
        value={serviceType}
        onChangeText={setServiceType}
        placeholder="e.g. Electrician, Plumber"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  readOnlyBox: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutBtn: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
