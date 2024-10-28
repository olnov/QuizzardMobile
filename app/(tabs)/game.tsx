import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { saveScores } from '../../services/ScoreService';

const GameScreen = () => {
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState([]);
  const [time, setTime] = useState(45);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const audioRef = useRef(null);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      setShuffledAnswers(shuffleAnswers(currentQuestion.correct_answer, currentQuestion.incorrect_answers));
    }
  }, [currentQuestionIndex, questions]);

  const shuffleAnswers = (correctAnswer, incorrectAnswers) => {
    const allAnswers = [...incorrectAnswers, correctAnswer];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  const sendScoreToBackend = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    const timestamp = new Date().toISOString();

    const scoreData = questions.map((question, index) => {
      const playersAnswer = playerAnswers[index];
      const correctAnswer = question.correct_answer;
      const isCorrect = playersAnswer === correctAnswer;
      const scoreMultiplier = difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 1;
      const userScore = isCorrect ? scoreMultiplier : 0;

      return {
        player_id: userId,
        players_answer: playersAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        difficulty,
        score: userScore,
        answered_at: timestamp,
      };
    });

    try {
      await saveScores(token, scoreData);
      console.log('Score data successfully sent to backend');
    } catch (error) {
      console.error('Error sending score data:', error);
    }
  };

  const fetchQuestions = async (selectedDifficulty) => {
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${selectedDifficulty}&type=multiple`);
      const data = await response.json();
      setDifficulty(selectedDifficulty);
      setQuestions(data.results);
      setShuffledAnswers(shuffleAnswers(data.results[0].correct_answer, data.results[0].incorrect_answers));
      setPlayerAnswers(Array(data.results.length).fill(null));
    } catch (err) {
      setError(err.message || 'Failed to fetch questions.');
      console.error(err);
    }
  };

  const handleAnswerClick = (answer) => {
    if (quizFinished) return;

    setPlayerAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });

    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    if (answer === correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setQuizFinished(true);
    }
  };

  useEffect(() => {
    if (quizFinished) {
      sendScoreToBackend();
    }
  }, [quizFinished]);

  useEffect(() => {
    if (questions.length > 0 && !quizFinished) {
      const countdown = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setQuizFinished(true);
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [questions, quizFinished]);

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Choose Difficulty</Text>
        <View style={styles.buttonGroup}>
          <Button title="Easy" color="teal" onPress={() => fetchQuestions('easy')} />
          <Button title="Medium" color="orange" onPress={() => fetchQuestions('medium')} />
          <Button title="Hard" color="red" onPress={() => fetchQuestions('hard')} />
        </View>
      </View>
    );
  }

  if (quizFinished || time === 0) {
    const finalScoreMultiplier = difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 1;
    const finalScore = correctCount * finalScoreMultiplier;

    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Quiz Finished!</Text>
        <Text>Level played: {difficulty}</Text>
        <Text>Correct Answers: {correctCount}</Text>
        <Text>Total Time Taken: {45 - time} seconds</Text>
        <Text style={styles.score}>Score: {finalScore}</Text>
        <Button title="Play Again" onPress={() => router.push('/')} />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.questionCounter}>Question {currentQuestionIndex + 1} of {questions.length}:</Text>
      <Text style={styles.questionText}>{currentQuestion.question}</Text>
      <FlatList
        data={shuffledAnswers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.answerButton} onPress={() => handleAnswerClick(item)}>
            <Text style={styles.answerText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.timer}>Time Remaining: {time} seconds</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  questionCounter: { fontSize: 18 },
  questionText: { fontSize: 20, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  answerButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginVertical: 5 },
  answerText: { fontSize: 16, textAlign: 'center' },
  timer: { fontSize: 18, marginTop: 20, color: 'red', textAlign: 'center' },
  score: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', padding: 10 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', margin: 10 },
});

export default GameScreen;
