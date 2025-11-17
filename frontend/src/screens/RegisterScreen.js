import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  const register = async () => {
    if (!email || !senha || !perfil) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await api.post("/auth/register", {
        nome,
        email,
        matricula,
        senha,
        perfil,
      });

      Alert.alert("Sucesso", "Cadastro realizado!");
      navigation.navigate("Login");
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível registrar.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            placeholder="Digite seu nome"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            placeholder="Ex: usuario@exemplo.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            placeholder="Ex: 2024A001"
            style={styles.input}
            value={matricula}
            onChangeText={setMatricula}
          />

          <Text style={styles.label}>Senha *</Text>
          <TextInput
            placeholder="Digite sua senha"
            secureTextEntry
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Perfil *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={perfil}
              onValueChange={(value) => setPerfil(value)}
            >
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Aluno" value="aluno" />
              <Picker.Item label="Professor" value="professor" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Já tem conta? Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#1e90ff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    fontWeight: "600",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    marginBottom: 15,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#1e90ff",
    textAlign: "center",
    marginTop: 15,
    fontSize: 15,
  },
});
