// src/screens/AdminScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getToken } from "../services/authStorage";
import api from "../services/api";

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("");
  const [matricula, setMatricula] = useState(""); // <--- faltava

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setLoading(true);
    try {
      const token = await getToken();
      const r = await api.get("/admin/usuarios", {
        headers: { authorization: `${token}` },
      });
      setUsers(r.data || []);
    } catch (err) {
      console.log("carregarUsuarios err", err.response?.data ?? err.message);
      Alert.alert("Erro", "Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  function openModal(u) {
    setSelected(u);
    setNome(u.nome ?? "");
    setEmail(u.email ?? "");
    setPerfil(u.perfil ?? "");
    setMatricula(u.matricula ?? "");
    setModalVisible(true);
  }

  const salvarUsuario = async () => {
    if (!selected) return Alert.alert("Selecione um usuário antes de salvar");
    try {
      const token = await getToken();
      const payload = { nome, email, matricula, perfil };

      const res = await api.put(
        `/admin/usuarios/${selected.id}`,
        payload,
        { headers: { authorization: `${token}` } }
      );

      Alert.alert("Sucesso", "Usuário atualizado");
      setModalVisible(false);
      setSelected(null);
      carregarUsuarios(); // atualiza lista
    } catch (err) {
      console.log("salvarUsuario err", err.response?.data ?? err.message);
      Alert.alert("Erro", err.response?.data?.erro ?? "Erro ao atualizar usuário");
    }
  };

  const deletarUsuario = () => {
    if (!selected) return Alert.alert("Selecione um usuário antes de excluir");

    Alert.alert("Confirmar", `Deletar usuário ${selected.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await api.delete(`/admin/usuarios/${selected.id}`, {
              headers: { authorization: `${token}` },
            });
            Alert.alert("Removido", "Usuário removido");
            setModalVisible(false);
            setSelected(null);
            carregarUsuarios();
          } catch (err) {
            console.log("deletarUsuario err", err.response?.data ?? err.message);
            Alert.alert("Erro", err.response?.data?.erro ?? "Erro ao deletar usuário");
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Painel do Admin
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderColor: "#eee",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontWeight: "600" }}>{item.nome}</Text>
                <Text>
                  {item.email} — {item.perfil} {item.matricula ? `— ${item.matricula}` : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openModal(item)}
                style={{
                  backgroundColor: "#1e90ff",
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff" }}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
            Editar Usuário
          </Text>

          {/* ID (somente leitura) */}
          <Text style={styles.label}>ID</Text>
          <TextInput
            editable={false}
            style={[styles.input, { backgroundColor: "#eee" }]}
            value={String(selected?.id ?? "")}
          />

          {/* Nome */}
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* Matrícula */}
          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            value={matricula}
            onChangeText={setMatricula}
          />

          {/* Perfil */}
          <Text style={styles.label}>Perfil</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={perfil} onValueChange={(v) => setPerfil(v)}>
              <Picker.Item label="Aluno" value="aluno" />
              <Picker.Item label="Professor" value="professor" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          {/* Botões */}
          <View style={{ flexDirection: "row", marginTop: 18 }}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#1e90ff" }]}
              onPress={salvarUsuario}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#ff4d4d", marginLeft: 10 }]}
              onPress={deletarUsuario}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Deletar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => {
              setModalVisible(false);
              setSelected(null);
            }}
          >
            <Text style={{ textAlign: "center", color: "#1e90ff" }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
  label: { marginTop: 10, fontWeight: "600" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
});
