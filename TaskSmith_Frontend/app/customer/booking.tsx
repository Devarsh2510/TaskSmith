// app/customer/booking.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Booking() {
  const router = useRouter();
  const { serviceName: paramService } = useLocalSearchParams<{ serviceName?: string }>();

  const [serviceName, setServiceName] = useState(paramService || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // ✅ Handle booking creation and save to backend
  const handleSave = async () => {
    if (!serviceName || !date || !time || !address || !phone) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Required", "Please log in again.");
        router.replace("/auth/login");
        return;
      }

      const bookingData = {
        serviceName,
        date,
        time,
        address,
        phone,
        notes,
      };

      // 🌐 Send POST request to backend
      const res = await axios.post(
        "http://10.223.161.7:5000/api/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 201 || res.data.success) {
        Alert.alert("Success", "Booking created successfully.");
        router.push("/customer/myBookings");
      } else {
        Alert.alert("Error", res.data.message || "Booking failed.");
      }
    } catch (error: any) {
      console.error("Booking error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to create booking."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Book a Service</Text>

        <InputBox
          icon="construct-outline"
          placeholder="Service Name"
          value={serviceName}
          onChangeText={setServiceName}
        />
        <InputBox
          icon="calendar-outline"
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <InputBox
          icon="time-outline"
          placeholder="Time (e.g. 10:00 AM)"
          value={time}
          onChangeText={setTime}
        />
        <InputBox
          icon="location-outline"
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
        <InputBox
          icon="call-outline"
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <InputBox
          icon="document-text-outline"
          placeholder="Notes / Special Instructions"
          value={notes}
          onChangeText={setNotes}
          multiline
          large
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-outline" size={22} color="#fff" />
          <Text style={styles.saveText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* 🔹 Reusable InputBox component */
function InputBox({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  multiline,
  large,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  multiline?: boolean;
  large?: boolean;
}) {
  return (
    <View
      style={[styles.inputBox, large && { height: 100, alignItems: "flex-start" }]}
    >
      <Ionicons name={icon} size={20} color="#2980b9" />
      <TextInput
        style={[styles.input, large && { height: 100, textAlignVertical: "top" }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fdfdfd",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 25,
    textAlign: "center",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#2c3e50",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
