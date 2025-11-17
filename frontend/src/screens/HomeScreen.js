import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen({ route, navigation }) {

  const { usuario } = route.params;
  
  const logout = async () => {
    try {
      // remove token salvo
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario'); // se você salvar também

      navigation.replace('Login');
    } catch (err) {
      console.log('Erro ao deslogar:', err);
      navigation.replace('Login');
    }
  };



  // Decide qual interface renderizar
  const renderPorPerfil = () => {
    switch (usuario.perfil) {
      case 'aluno':
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Boletim', { matricula: usuario.matricula })}
          >
            <Text style={styles.buttonText}>Ver Boletim</Text>
          </TouchableOpacity>
        );

      case 'professor':
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Professor')}
          >
            <Text style={styles.buttonText}>Acessar Painel do Professor</Text>
          </TouchableOpacity>
        );

      case 'admin':
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.buttonText}>Painel do Admin</Text>
          </TouchableOpacity>
        );

      default:
        return <Text>Erro: Perfil não reconhecido</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Bem-vindo, {usuario.nome}</Text>
      <Text style={styles.subtitle}>Perfil: {usuario.perfil.toUpperCase()}</Text>

      {renderPorPerfil()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#1e90ff', padding: 20, marginBottom: 15 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
  logoutButton: {
    position: 'relative',
    alignSelf: 'flex-end',
    marginTop: 0,
    padding: 15,
    backgroundColor: '#ff4d4d',
    borderRadius: 6
  },
    logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
