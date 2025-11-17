import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUser() {
  const json = await AsyncStorage.getItem('@user');
  return json ? JSON.parse(json) : null;
}

export async function getToken() {
  const user = await getUser();
  return user?.token || null;
}

export async function logout() {
  await AsyncStorage.removeItem('@user');
}
