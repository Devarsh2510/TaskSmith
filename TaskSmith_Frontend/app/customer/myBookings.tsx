// app/customer/mybookings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Booking {
  _id: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  phone: string;
  notes?: string;
  status?: string;
}

// ✅ Update to your backend IP
const API_URL = "http://10.223.161.7:5000/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Fetch bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        router.replace("/");
        return;
      }

      const res = await fetch(`${API_URL}/bookings/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("📦 GET /bookings/my response:", res.status, data);

      if (res.ok && data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        Alert.alert("Error", data.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("❌ Error loading bookings:", err);
      Alert.alert("Error", "Unable to fetch bookings. Check network/API.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete booking (Customer hard delete)
  const handleDelete = async (id: string) => {
    console.log("🗑️ Cancel button pressed for booking:", id);

    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              Alert.alert("Error", "Please login again.");
              return;
            }

            console.log("🚀 Sending DELETE request to:", `${API_URL}/bookings/${id}`);

            const res = await fetch(`${API_URL}/bookings/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            const data = await res.json();
            console.log("🧾 DELETE /bookings/:id response:", res.status, data);

            if (res.ok && data.success) {
              // ✅ Instantly update UI without reloading
              setBookings((prev) => prev.filter((b) => b._id !== id));
              Alert.alert("Success", "Booking cancelled successfully");
            } else {
              Alert.alert("Error", data.message || "Failed to cancel booking");
            }
          } catch (err) {
            console.error("❌ Error deleting booking:", err);
            Alert.alert("Error", "Network or server issue. Try again.");
          }
        },
      },
    ]);
  };

  // ✅ Reload when focused
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
      Alert.alert("Error", "Unable to logout. Try again.");
    }
  };

  // ✅ Render each booking
  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="construct-outline" size={30} color="#2980b9" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.service}>{item.serviceName}</Text>
          <Text style={styles.info}>📅 {item.date}</Text>
          <Text style={styles.info}>⏰ {item.time}</Text>
          <Text style={styles.info}>📍 {item.address}</Text>
          <Text style={styles.info}>📞 {item.phone}</Text>
          {item.notes ? <Text style={styles.info}>📝 {item.notes}</Text> : null}
          {item.status ? (
            <Text
              style={[
                styles.status,
                item.status === "cancelled" ? { color: "red" } : { color: "green" },
              ]}
            >
              Status: {item.status}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ✅ Cancel button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDelete(item._id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={18} color="#fff" />
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Bookings</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2980b9" style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.navigateButton, { backgroundColor: "#27ae60" }]}
        onPress={() => router.push("/customer/customer")}
        activeOpacity={0.8}
      >
        <Ionicons name="person-outline" size={22} color="#fff" />
        <Text style={styles.navigateText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 26, fontWeight: "bold", color: "#2c3e50" },
  logoutButton: { backgroundColor: "#c0392b", padding: 8, borderRadius: 8 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  service: { fontSize: 18, fontWeight: "bold", color: "#2980b9", marginBottom: 6 },
  info: { fontSize: 14, color: "#555", marginBottom: 2 },
  status: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", marginLeft: 5 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 10, fontSize: 16, color: "#7f8c8d" },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 10,
  },
  navigateText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 6 },
});
