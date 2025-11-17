import {useEffect, useState} from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from "../services/authStorage";
import api from '../services/api';

export default function BoletimScreen() {
  const [boletim, setBoletim] = useState([]);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const token = await getToken();
      const matricula = await AsyncStorage.getItem('matricula');
      const r = await api.get(`aluno/boletim/${matricula}`, { headers: { authorization: `${token}` }});
      setBoletim(r.data.boletim);
    } catch (e) {
      console.log('carregar boletim err', e.response?.data ?? e.message);
      alert('Erro ao carregar boletim');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Boletim</Text>
      <FlatList data={boletim} keyExtractor={(item)=>item.disciplina} renderItem={({item})=>(
        <View style={styles.card}>
          <Text style={styles.title}>{item.disciplina}</Text>
          <Text>Notas: {item.notas.join(', ') || '—'}</Text>
          <Text>Média: {item.media ?? '—'}</Text>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20},
  header:{fontSize:26,fontWeight:'bold',marginBottom:20},
  card:{padding:10,borderWidth:1,marginBottom:10,borderRadius:6},
  title:{fontSize:18,fontWeight:'bold',marginBottom:6}
});