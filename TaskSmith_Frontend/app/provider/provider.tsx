import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = "http://10.223.161.7:5000/api";

export default function ProviderScreen() {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Session Expired", "Please log in again.");
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch provider details");

        setProvider(data.user || data);
      } catch (error: any) {
        console.error("Error fetching provider data:", error);
        Alert.alert("Error", error.message || "Unable to fetch provider data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading provider data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {provider?.name || "Provider"}!</Text>
      <Text style={styles.subtitle}>Here you can manage your jobs</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/provider/myjobs")}
      >
        <Text style={styles.primaryButtonText}>View My Jobs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  primaryButton: { backgroundColor: "#4CAF50", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
