import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://10.223.161.7:5000/api"; // update if backend IP changes

export default function MyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadProviderJobs = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        router.replace("/auth/login");
        return;
      }

      const res = await fetch(`${API_URL}/providers/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(data.bookings);
      } else {
        Alert.alert("Error", data.message || "Failed to load jobs");
      }
    } catch (err) {
      console.error("Load provider jobs error:", err);
      Alert.alert("Error", "Unable to load jobs. Check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderJobs();
  }, []);

  const handleAction = async (id: string, action: "accept" | "decline" | "complete") => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Session expired", "Please login again.");

      const res = await fetch(`${API_URL}/providers/bookings/${id}/${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert("Success", `Booking ${action}ed successfully`);
        loadProviderJobs();
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Change status error:", err);
      Alert.alert("Error", "Network error while updating status.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.serviceName}</Text>
      <Text>Customer: {item.customer?.name || "N/A"}</Text>
      <Text>📅 {item.date} ⏰ {item.time}</Text>
      <Text>📍 {item.address}</Text>
      <Text>📞 {item.phone}</Text>
      <Text>Status: {item.status}</Text>

      {item.status === "pending" ? (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#4CAF50" }]}
            onPress={() => handleAction(item._id, "accept")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#f44336" }]}
            onPress={() => handleAction(item._id, "decline")}
          >
            <Text style={styles.btnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      ) : item.status === "accepted" ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2196F3", marginTop: 8 }]}
          onPress={() => handleAction(item._id, "complete")}
        >
          <Text style={styles.btnText}>Mark Completed</Text>
        </TouchableOpacity>
      ) : item.status === "completed" ? (
        <Text style={{ marginTop: 8, fontStyle: "italic", color: "#2E7D32" }}>
          ✅ Job Completed
        </Text>
      ) : (
        <Text style={{ marginTop: 8, fontStyle: "italic", color: "#555" }}>
          Job {item.status}
        </Text>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>My Jobs</Text>
      {jobs.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text>No jobs yet</Text>
        </View>
      ) : (
        <FlatList data={jobs} keyExtractor={(i) => i._id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 8, elevation: 2 },
  title: { fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btn: { padding: 10, borderRadius: 6, minWidth: 110, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
