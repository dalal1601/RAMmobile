import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Snackbar,KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For token storage
import { useNavigation } from "@react-navigation/native"; // React Navigation
import { Ionicons } from '@expo/vector-icons';



export default function Loginch() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    Alert.alert(severity, message); // Native alert
  };

  const handleEmailSubmit = async () => {
    try {
      const response = await fetch("http://172.20.10.3:8080/User/checkPassword", {
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
      const response = await fetch("http://172.20.10.3:8080/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
  
      const data = await response.json();
      console.log("Login response:", data);
  
      if (!data.access_token) {
        throw new Error("Access token is missing from the response");
      }
  
      let userId;
      try {
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = tokenParts[1];
        const decodedPayload = decodeBase64Url(payload);
        const tokenPayload = JSON.parse(decodedPayload);
        userId = tokenPayload.sub;
        console.log("Decoded token payload:", tokenPayload);
      } catch (tokenError) {
        console.error("Token decoding error:", tokenError);
        throw new Error("Failed to decode the access token");
      }
  
      if (data.access_token && data.idMongo && userId) {
        await AsyncStorage.setItem("token", data.access_token);
        await AsyncStorage.setItem("idmongo", data.idMongo);
        await AsyncStorage.setItem("id", userId);

         
  
        switch (data.role) {
          case "AUDITEUR":
            console.log("Navigating to Audits page");
            navigation.navigate('Audits', { userId: userId });
            break;
          case "AUDITE":
            console.log("Navigating to Audite page");
            navigation.navigate('Audite', { userId: userId });
            break;
          default:
            console.warn("Unknown user role:", data.role);
            showAlert("Attention", "Rôle utilisateur non reconnu");
        }


      } else {
        throw new Error("Login successful but required data is missing");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar(error.message || "Login failed", "error");
    }
  };
  
  // Add this function outside of handlePasswordSubmit
  const decodeBase64Url = (input) => {
    input = input
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    // Pad the string if necessary
    const pad = input.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    }
  
    return atob(input);
  };

  const handleNewPasswordSubmit = async () => {
    if (password !== confirmPassword) {
      showSnackbar("Les mots de passe ne correspondent pas", "error");
      return;
    }
    try {
      const response = await fetch("http://172.20.10.3:8080/User/addpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mdp: password }),
      });
      if (response.ok) {
        showSnackbar("Mot de passe défini avec succès", "success");
        setStep("login");
      } else {
        showSnackbar("Erreur lors de la définition du mot de passe", "error");
      }
    } catch (error) {
      showSnackbar("Erreur lors de la définition du mot de passe", "error");
    }
  };



  const handleLogin = async () => {
    try {
      const response = await fetch("http://172.20.10.3:8080/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      let userId;
      try {
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = tokenParts[1];
        const decodedPayload = decodeBase64Url(payload);
        const tokenPayload = JSON.parse(decodedPayload);
        userId = tokenPayload.sub;
        console.log("Decoded token payload:", tokenPayload);
      } catch (tokenError) {
        console.error("Token decoding error:", tokenError);
        throw new Error("Failed to decode the access token");
      }
  
      if (data.access_token && data.idMongo && userId) {
        await AsyncStorage.setItem("token", data.access_token);
        await AsyncStorage.setItem("idmongo", data.idMongo);
        await AsyncStorage.setItem("id", userId);

         
  
        switch (data.role) {
          case "AUDITEUR":
            console.log("Navigating to Audits page");
            navigation.navigate('Audits', { userId: userId });
            break;
          case "AUDITE":
            console.log("Navigating to Audite page");
            navigation.navigate('Audite', { userId: userId });
            break;
          default:
            console.warn("Unknown user role:", data.role);
            showAlert("Attention", "Rôle utilisateur non reconnu");
        }
      } else {
        throw new Error("Login successful but required data is missing");
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("Erreur de connexion", error.message || "Échec de la connexion. Veuillez réessayer.");
    }
  };



  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={require("../../assets/images.png")} style={styles.logo} />
        <Text style={styles.title}>Bienvenue à Votre portail d'audit</Text>

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
          {step === "password" && (
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
              </TouchableOpacity>
            </View>
          )}
          {step === "newPassword" && (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nouveau mot de passe"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="gray" />
                </TouchableOpacity>
              </View>
            </>
          )}
          {step === "login" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Adresse Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mot de passe"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={
            step === "email"
              ? handleEmailSubmit
              : step === "password"
                ? handlePasswordSubmit
                : step === "newPassword"
                  ? handleNewPasswordSubmit
                  : handleLogin
          }
        >
          <Text style={styles.buttonText}>
            {step === "email" ? "Suivant" : step === "password" ? "Se Connecter" : step === "newPassword" ? "Définir le mot de passe" : "Se Connecter"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 60,
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
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
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
});