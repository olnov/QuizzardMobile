import React,{ useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { reloadAppAsync } from "expo";


const LogoutScreen = () => {
const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userId', 'token']);
      await AsyncStorage.clear();
      setIsAuthenticated(false);
//       router.replace('/login');
      reloadAppAsync()
    } catch (error) {
      Alert.alert('Logout Error', 'An error occurred during logout.');
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Button title="Logout" color="teal" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default LogoutScreen;
