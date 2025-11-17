import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { getToken } from "../services/authStorage";
import api from "../services/api";

export default function ProfessorScreen() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal / seleção
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // campos dentro do modal (podem ser usados para rename / matricular / nota)
  const [renameValue, setRenameValue] = useState("");
  const [matriculaValue, setMatriculaValue] = useState("");
  const [notaValue, setNotaValue] = useState("");

  // Modal Notas
  const [alunosDisciplina, setAlunosDisciplina] = useState([]);
  const [modalNotasVisible, setModalNotasVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [alunos, setAlunos] = useState([]);
  const [modalAlunosVisible, setModalAlunosVisible] = useState(false);

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  async function abrirListaAlunos() {
    try {
      const token = await getToken();
      const res = await api.get("/professor/alunos", {
        headers: { authorization: `${token}` },
      });
      setAlunos(res.data);
      setModalAlunosVisible(true);
    } catch (err) {
      console.log("erro carregar alunos", err.response?.data ?? err.message);
      Alert.alert("Erro", "Não foi possível carregar os alunos");
    }
  }

  async function carregarDisciplinas() {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("carregarDisciplinas -> token:", token?.slice?.(0, 20));
      const r = await api.get("/professor/minhas-disciplinas", {
        headers: { authorization: `${token}` },
      });
      setDisciplinas(r.data || []);
    } catch (err) {
      console.log(
        "carregarDisciplinas error",
        err.response?.data ?? err.message
      );
      Alert.alert("Erro", "Falha ao carregar disciplinas");
    } finally {
      setLoading(false);
    }
  }

  // CRIAR disciplina (pequeno form abaixo da lista)
  const [novaDisciplina, setNovaDisciplina] = useState("");
  async function cadastrarDisciplina() {
    if (!novaDisciplina.trim())
      return Alert.alert("Informe o nome da disciplina");
    try {
      const token = await getToken();
      const r = await api.post(
        "/professor/disciplina",
        { nome: novaDisciplina.trim() },
        {
          headers: { authorization: `${token}` },
        }
      );
      console.log("cadastrarDisciplina res", r.status, r.data);
      Alert.alert("Sucesso", "Disciplina cadastrada");
      setNovaDisciplina("");
      carregarDisciplinas();
    } catch (err) {
      console.log("cadastrarDisciplina err", err.response?.data ?? err.message);
      Alert.alert("Erro ao cadastrar disciplina");
    }
  }

  // Quando escolher "Selecionar" abre modal preenchendo campos
  function openModalFor(item) {
    setSelected(item);
    setRenameValue(item.nome || "");
    setMatriculaValue("");
    setNotaValue("");
    setModalVisible(true);
  }

  // RENAME (PUT)
  async function alterarDisciplina() {
    if (!selected) return Alert.alert("Selecione uma disciplina");
    if (!renameValue.trim()) return Alert.alert("Informe o novo nome");

    try {
      const token = await getToken();
      console.log("PUT /professor/disciplina/" + selected.id, {
        nome: renameValue,
      });
      const res = await api.put(
        `/professor/disciplina/${selected.id}`,
        { nome: renameValue.trim() },
        { headers: { authorization: `${token}` } }
      );
      console.log("alterarDisciplina res", res.status, res.data);
      Alert.alert("Alterada", "Disciplina atualizada");
      setModalVisible(false);
      setSelected(null);
      carregarDisciplinas();
    } catch (err) {
      console.log("alterarDisciplina err", err.response?.data ?? err.message);
      const msg = err.response?.data?.erro ?? "Erro ao alterar disciplina";
      Alert.alert("Erro", msg);
    }
  }

  // DELETE
  async function excluirDisciplina() {
    if (!selected) return Alert.alert("Selecione uma disciplina");
    Alert.alert(
      "Confirmar exclusão",
      `Excluir a disciplina "${selected.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              const res = await api.delete(
                `/professor/disciplina/${selected.id}`,
                {
                  headers: { authorization: `${token}` },
                }
              );
              console.log("excluirDisciplina res", res.status);
              Alert.alert("Removida", "Disciplina removida");
              setModalVisible(false);
              setSelected(null);
              carregarDisciplinas();
            } catch (err) {
              console.log(
                "excluirDisciplina err",
                err.response?.data ?? err.message
              );
              Alert.alert("Erro ao excluir disciplina");
            }
          },
        },
      ]
    );
  }

  // MATRICULAR
  async function matricularAluno() {
    if (!selected) return Alert.alert("Selecione uma disciplina");
    if (!matriculaValue.trim())
      return Alert.alert("Informe a matrícula do aluno");

    try {
      const token = await getToken();
      const res = await api.post(
        "/professor/matriculas",
        {
          aluno_matricula: matriculaValue.trim(),
          disciplina_id: Number(selected.id),
        },
        {
          headers: { authorization: `${token}` },
        }
      );
      console.log("matricularAluno res", res.status, res.data);
      Alert.alert("Matriculado", "Aluno matriculado com sucesso");
      setMatriculaValue("");
    } catch (err) {
      console.log("matricularAluno err", err.response?.data ?? err.message);
      const msg = err.response?.data?.erro ?? "Erro ao matricular";
      Alert.alert("Erro", msg);
    }
  }

  // MODAL NOTAS
  async function abrirModalNotas() {
    if (!selected) return Alert.alert("Selecione uma disciplina");

    try {
      const token = await getToken();
      const res = await api.get(
        `/professor/disciplinas/${selected.id}/alunos`,
        {
          headers: { authorization: `${token}` },
        }
      );

      setAlunosDisciplina(res.data);
      setModalNotasVisible(true);
    } catch (err) {
      console.log(
        "erro alunos da disciplina",
        err.response?.data ?? err.message
      );
      Alert.alert(
        "Erro",
        "Não foi possível carregar os alunos desta disciplina"
      );
    }
  }
  async function confirmarLancamentoNota() {
    if (!alunoSelecionado) return Alert.alert("Selecione um aluno");
    if (!notaValue.trim()) return Alert.alert("Informe a nota");

    const parsed = Number(notaValue);
    if (Number.isNaN(parsed)) return Alert.alert("Nota inválida");

    try {
      const token = await getToken();

      const res = await api.post(
        "/professor/notas",
        {
          aluno_matricula: alunoSelecionado.matricula,
          disciplina_id: selected.id,
          nota: parsed,
        },
        {
          headers: { authorization: `${token}` },
        }
      );

      Alert.alert("Sucesso", "Nota lançada com sucesso");
      setNotaValue("");
      setAlunoSelecionado(null);
      setModalNotasVisible(false);
    } catch (err) {
      const msg = err.response?.data?.erro ?? "Erro ao lançar nota";
      Alert.alert("Erro", msg);
    }
  }

  function renderItem({ item }) {
    return (
      <View style={styles.itemCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.itemTitle}>{item.nome}</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => openModalFor(item)}
            >
              <Text style={styles.smallBtnText}>Abrir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Painel do Professor</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas Disciplinas</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={disciplinas}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            ListEmptyComponent={<Text>Nenhuma disciplina</Text>}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cadastrar disciplina</Text>
        <TextInput
          placeholder="Nome da disciplina"
          style={styles.input}
          value={novaDisciplina}
          onChangeText={setNovaDisciplina}
        />
        <View style={{ height: 12 }} />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={cadastrarDisciplina}
        >
          <Text style={styles.primaryBtnText}>Cadastrar</Text>
        </TouchableOpacity>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.primaryBtn} onPress={abrirListaAlunos}>
          <Text style={styles.primaryBtnText}>Ver Todos os Alunos</Text>
        </TouchableOpacity>
      </View>

      {/* Modal / painel da disciplina selecionada */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Disciplina: {selected?.nome}</Text>

          <Text style={styles.modalLabel}>Renomear</Text>
          <TextInput
            style={styles.input}
            value={renameValue}
            onChangeText={setRenameValue}
            placeholder="Novo nome"
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={alterarDisciplina}
            >
              <Text style={styles.primaryBtnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: "#ccc" }]}
              onPress={() => {
                setRenameValue(selected?.nome || "");
              }}
            >
              <Text>Reset</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{ height: 1, backgroundColor: "#ddd", marginVertical: 16 }}
          />

          <Text style={styles.modalLabel}>Matrícula do aluno</Text>
          <TextInput
            style={styles.input}
            value={matriculaValue}
            onChangeText={setMatriculaValue}
            placeholder="Ex: 20210001"
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={matricularAluno}
            >
              <Text style={styles.primaryBtnText}>Matricular</Text>
            </TouchableOpacity>
            <View style={{ width: 8, margin: 12 }} />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={abrirModalNotas}
            >
              <Text style={styles.primaryBtnText}>Lançar Notas</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{ height: 1, backgroundColor: "#ddd", marginVertical: 16 }}
          />

          <TouchableOpacity
            style={[styles.dangerBtn]}
            onPress={excluirDisciplina}
          >
            <Text style={styles.dangerBtnText}>Excluir disciplina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { marginTop: 12 }]}
            onPress={() => {
              setModalVisible(false);
              setSelected(null);
            }}
          >
            <Text>Fechar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <Modal
        visible={modalAlunosVisible}
        animationType="slide"
        onRequestClose={() => setModalAlunosVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
            Lista de Alunos
          </Text>

          <FlatList
            data={alunos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <Text style={{ fontSize: 18 }}>{item.nome}</Text>
                <Text>Matrícula: {item.matricula}</Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={() => setModalAlunosVisible(false)}
          >
            <Text style={styles.primaryBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={modalNotasVisible}
        animationType="slide"
        onRequestClose={() => setModalNotasVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            Lançar Nota — {selected?.nome}
          </Text>

          <Text style={{ marginTop: 10, fontSize: 18, fontWeight: "600" }}>
            Selecione o aluno:
          </Text>

          {/* LISTA DE ALUNOS */}
          <FlatList
            data={alunosDisciplina}
            keyExtractor={(item) => String(item.aluno_id)}
            style={{ flex: 0, maxHeight: 340, marginTop: 10 }}
            renderItem={({ item }) => {
              const isSelected = alunoSelecionado?.aluno_id === item.aluno_id;

              // Formatando data para visualização
              const dataFormatada = item.data
                ? new Date(item.data).toLocaleDateString("pt-BR")
                : "—";

              return (
                <TouchableOpacity
                  onPress={() => setAlunoSelecionado(item)}
                  style={{
                    padding: 12,
                    backgroundColor: isSelected ? "#1e90ff" : "#f0f0f0",
                    marginBottom: 6,
                    borderRadius: 10,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: "#ccc",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: isSelected ? "#fff" : "#000",
                    }}
                  >
                    {item.nome}
                  </Text>

                  <Text
                    style={{
                      color: isSelected ? "#e0e0e0" : "#333",
                      marginTop: 2,
                    }}
                  >
                    Matrícula: {item.matricula}
                  </Text>

                  <Text
                    style={{
                      color: isSelected ? "#e0e0e0" : "#333",
                      marginTop: 2,
                    }}
                  >
                    Última nota: {item.nota ?? "—"}
                  </Text>

                  <Text
                    style={{
                      color: isSelected ? "#d0d0d0" : "#666",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Data: {dataFormatada}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* INPUT DE NOTA */}
          <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "600" }}>
            Digite a nova nota:
          </Text>

          <TextInput
            placeholder="Nota"
            value={notaValue}
            onChangeText={setNotaValue}
            keyboardType="numeric"
            style={[styles.input, { marginTop: 10 }]}
          />

          {/* BOTÃO CONFIRMAR */}
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={confirmarLancamentoNota}
          >
            <Text style={styles.primaryBtnText}>Confirmar</Text>
          </TouchableOpacity>

          {/* BOTÃO FECHAR */}
          <TouchableOpacity
            style={[styles.secondaryBtn, { marginTop: 10 }]}
            onPress={() => setModalNotasVisible(false)}
          >
            <Text style={styles.secondaryBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  header: { alignItems: "center", marginVertical: 8 },
  title: { fontSize: 22, fontWeight: "bold" },

  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  itemCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  itemTitle: { fontSize: 16, fontWeight: "600" },

  smallBtn: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  smallBtnText: { color: "#fff" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },

  primaryBtn: {
    backgroundColor: "#1e90ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },

  secondaryBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#eee",
  },

  dangerBtn: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerBtnText: { color: "#fff", fontWeight: "700" },

  modalContainer: { padding: 20, paddingBottom: 60 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  modalLabel: { fontSize: 14, marginTop: 8 },
});
