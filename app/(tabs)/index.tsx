import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getUser } from '../../services/UserService';

const HomeScreen = () => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedToken = await AsyncStorage.getItem('token');
            if (storedUserId && storedToken) {
                setUserId(storedUserId);
                setToken(storedToken);
                fetchUserDetails(storedUserId, storedToken);
            }
        };

        const fetchUserDetails = async (userId, token) => {
            try {
                const user = await getUser(userId, token);
                setUserName(user.fullName);
                console.log('Name:', user.fullName);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        loadUserData();
    }, []);

    const handleGameStart = () => {
        router.push('/game');
    };

    const handleLeaderboard = () => {
        router.push('/leaderboard');
    };

    return (
        <FlatList
            data={[
                { level: 'Easy', points: '1 point' },
                { level: 'Medium', points: '2 points' },
                { level: 'Hard', points: '3 points' },
            ]}
            keyExtractor={(item) => item.level}
            ListHeaderComponent={
                <View style={styles.container}>
                    <Text style={styles.welcomeText}>Welcome, {userName}!</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Well done on logging in and creating your profile! When ready,
                            click "Begin" to start your journey and become a Quizzard.
                        </Text>
                        <Text style={styles.infoText}>
                            You have 45 seconds to answer 10 questions.
                        </Text>
                        <Text style={styles.infoText}>
                            Alternatively, see your score on the Leaderboard. Stay tuned for new changes soon!
                        </Text>
                    </View>
                </View>
            }
            renderItem={({ item }) => (
                <Text style={styles.scoreListItem}>
                    {item.level} = {item.points}
                </Text>
            )}
            ListFooterComponent={
                <View style={styles.buttonContainer}>
                    <Button title="Begin" color="teal" onPress={handleGameStart} />
                    <View style={styles.buttonSpacer} />
                    <Button title="Leaderboard" onPress={handleLeaderboard} />
                </View>
            }
            contentContainerStyle={styles.flatListContent}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoBox: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    scoreListItem: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 5,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    buttonSpacer: {
        height: 10,
    },
});

export default HomeScreen;
