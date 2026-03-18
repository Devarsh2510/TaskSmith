// app/customer/customer.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  // ✅ Fetch user info from AsyncStorage on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedEmail = await AsyncStorage.getItem("email");
        if (!token) {
          Alert.alert("Session Expired", "Please login again.");
          router.replace("/auth/login");
        } else if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const services = [
    { name: "Plumber", icon: "water-outline" },
    { name: "Electrician", icon: "flash-outline" },
    { name: "Cleaner", icon: "help-circle-outline" },
    { name: "Carpenter", icon: "construct-outline" },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("email");
      router.replace("/");
    } catch (err) {
      console.error("Error logging out:", err);
      Alert.alert("Error", "Unable to logout. Please try again.");
    }
  };

  const renderService = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/customer/booking",
          params: { serviceName: item.name },
        })
      }
    >
      <Ionicons name={item.icon as any} size={26} color="#2980b9" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Available Services</Text>
          {userEmail ? (
            <Text style={styles.subHeader}>Logged in as: {userEmail}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Services */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
      />

      {/* My Bookings button */}
      <TouchableOpacity
        style={styles.bookingsButton}
        onPress={() => router.push("/customer/myBookings")}
      >
        <Text style={styles.bookingsText}>Go to My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subHeader: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  logoutButton: {
    backgroundColor: "#c0392b",
    padding: 8,
    borderRadius: 8,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  cardText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "500",
    color: "#34495e",
  },
  bookingsButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  bookingsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
