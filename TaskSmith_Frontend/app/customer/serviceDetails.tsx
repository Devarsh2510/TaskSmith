// app/customer/serviceDetails.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://10.223.161.7:5000/api/services"; // 🔹 Replace YOUR_IP with your backend IP

export default function ServiceDetails() {
  const { service } = useLocalSearchParams<{ service?: string }>();
  const router = useRouter();

  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Try to fetch service details if only ID is passed
  useEffect(() => {
    if (!service) return;

    try {
      const parsed = JSON.parse(service);
      // If service has full details (from customer/services.tsx), use it directly
      if (parsed?.name) {
        setServiceDetails(parsed);
      } else if (parsed?._id) {
        fetchServiceDetails(parsed._id);
      }
    } catch (e) {
      console.log("Invalid service param:", e);
    }
  }, [service]);

  // 🔹 Fetch service details from backend (optional future use)
  const fetchServiceDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      if (res.ok) {
        setServiceDetails(data);
      } else {
        console.warn("Failed to load service:", data.message);
      }
    } catch (err) {
      console.error("Error fetching service:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (serviceDetails) {
      router.push({
        pathname: "/customer/booking",
        params: { service: JSON.stringify(serviceDetails) },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading service...</Text>
      </View>
    );
  }

  if (!serviceDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="red" />
        <Text style={styles.error}>No service details found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/customer/customer")}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Card with service info */}
      <View style={styles.card}>
        <Ionicons
          name={serviceDetails.icon || "construct-outline"}
          size={70}
          color="#2980b9"
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.header}>{serviceDetails.name}</Text>
        <Text style={styles.description}>
          {serviceDetails.description ||
            `You can book a ${serviceDetails.name} service here. More details and available providers will be added soon.`}
        </Text>

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: "100%",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 35,
  },
  bookButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
    width: "80%",
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#2980b9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
