import { Ionicons } from "@expo/vector-icons"; // icons
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Smith</Text>
      <Text style={styles.subtitle}>Forging Home Solutions</Text>

      {/* Customer Card */}
      <Link
        href={{ pathname: "/auth/login", params: { role: "customer" } }}
        asChild
      >
        <TouchableOpacity style={styles.card}>
          <Ionicons name="person" size={40} color="#3498db" />
          <Text style={styles.cardText}>Continue as Customer</Text>
        </TouchableOpacity>
      </Link>

      {/* Provider Card */}
      <Link
        href={{ pathname: "/auth/login", params: { role: "provider" } }}
        asChild
      >
        <TouchableOpacity style={styles.card}>
          <Ionicons name="construct" size={40} color="#e67e22" />
          <Text style={styles.cardText}>Continue as Provider</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#7f8c8d",
  },
  card: {
    backgroundColor: "white",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 10,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // shadow for Android
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
});
