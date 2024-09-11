import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Snackbar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For token storage
import { useNavigation } from "@react-navigation/native"; // React Navigation

export default function Loginch() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    Alert.alert(severity, message); // Native alert
  };

  const handleEmailSubmit = async () => {
    try {
      const response = await fetch("http://192.168.8.106:8080/User/checkPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (!data.exists) {
        showSnackbar("Il n'y a pas de compte associé à cet email.", "error");
      } else if (!data.enabled) {
        showSnackbar("Ce compte n'est pas activé.", "warning");
      } else if (data.hasPassword) {
        setStep("password");
      } else {
        setStep("newPassword");
      }
    } catch (error) {
      showSnackbar("Erreur lors de la vérification de l'email", "error");
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch("http://192.168.8.106:8080/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      const tokenPayload = JSON.parse(atob(data.access_token.split(".")[1]));
      const userId = tokenPayload.sub;

      if (data.access_token && data.idMongo) {
        await AsyncStorage.setItem("token", data.access_token);
        await AsyncStorage.setItem("idmongo", data.idMongo);
        await AsyncStorage.setItem("id", userId);

        // Example of navigating to UserAudits screen
        navigation.navigate('Audits', { userId });
      } else {
        throw new Error("Login successful but required data is missing");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("Login failed", "error");
    }
  };

  const handleNewPasswordSubmit = async () => {
    if (password !== confirmPassword) {
      showSnackbar("Les mots de passe ne correspondent pas", "error");
      return;
    }
    try {
      const response = await fetch("http://192.168.8.106:8080/User/addpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mdp: password }),
      });
      if (response.ok) {
        showSnackbar("Mot de passe défini avec succès", "success");
        setTimeout(() => navigation.navigate("Login"), 2000);
      } else {
        showSnackbar("Erreur lors de la définition du mot de passe", "error");
      }
    } catch (error) {
      showSnackbar("Erreur lors de la définition du mot de passe", "error");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/user.jpg")} style={styles.logo} />
      <Text style={styles.title}>Bienvenue à Votre Application</Text>

      <View style={styles.inputContainer}>
        {step === "email" && (
          <TextInput
            style={styles.input}
            placeholder="Adresse Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        )}
        {(step === "password" || step === "newPassword") && (
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        )}
        {step === "newPassword" && (
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={
          step === "email"
            ? handleEmailSubmit
            : step === "password"
              ? handlePasswordSubmit
              : handleNewPasswordSubmit
        }
      >
        <Text style={styles.buttonText}>
          {step === "email" ? "Suivant" : step === "password" ? "Se Connecter" : "Définir le mot de passe"}
        </Text>
      </TouchableOpacity>

      {snackbarMessage && <Text style={styles.snackbar}>{snackbarMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#C2002F",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  snackbar: {
    marginTop: 20,
    color: "#C2002F",
    textAlign: "center",
  },
});
