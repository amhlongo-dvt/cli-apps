import {Text, Box, useInput, useApp} from 'ink';
import { useState} from 'react';

type Props = {
	name: string | undefined;
};

interface HistoryEntry {
	guess: number;
	attempt: number;
	result: 'correct'|'too low'|'too high';
}

export default function App({name = 'Stranger'}: Props) {
	const {exit} = useApp();
	const [targetNumber, setTargetNumber] = useState<number>(() => 
		Math.floor(Math.random() * 100) + 1
	);
	const [currentGuess, setCurrentGuess] = useState<string>('');
	const [attempts, setAttempts] = useState<number>(0);
	const [gameState, setGameState] = useState<"playing"|"won"|"lost">("playing")
	const [message, setMessage] = useState('');
	const [guessHistory, setGuessHistory] = useState<Array<HistoryEntry>>([]);
	const maxAttempts = 10;
	useInput((input, key) => {
		if(gameState !== "playing"){
			if (input === 'r'){
				setTargetNumber(Math.floor(Math.random() * 100) + 1);
				setCurrentGuess('');
				setAttempts(0);
				setGameState("playing");
				setMessage('');
				setGuessHistory([]);
			}else if (input === 'q'){
				exit()
			}
			return;
		}

		if(key.return){
			const guess = parseInt(currentGuess);
			if(isNaN(guess) || guess < 1 || guess > 100){
				setMessage('Please enter a valid number between 1 and 100.');
				return;
			}
			setAttempts(attempts + 1);
			
			const historyEntry: HistoryEntry = {
				guess: guess,
				attempt: attempts,
				result: guess === targetNumber ? 'correct' : 
						guess < targetNumber ? 'too low' : 'too high'
			}
			setGuessHistory([...guessHistory, historyEntry]);
			
			if (guess === targetNumber){
				setGameState("won");
				setMessage(`Congratulations! You guessed the number ${targetNumber} in ${attempts} attempts.`);
			}else if (attempts === maxAttempts){
				setGameState("lost");
				setMessage(`Game over! The number was ${targetNumber}.`);
			}else{
				setMessage(
					guess < targetNumber 
						? 'Too low. Try again.' 
						: 'Too high. Try again.'
				);
			}
			setCurrentGuess('');
		} else if (key.backspace || key.delete){
			setCurrentGuess(currentGuess.slice(0, -1));
		}else if (key.ctrl && input === 'c'){
			exit();
		}else if (/^\d$/.test(input)){
			setCurrentGuess(currentGuess + input);
		}
	});
	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="blue">
				Hello, {name}
			</Text>
			<Text >
				Guess the number between 1 and 100
			</Text>
			<Text>
				Attempts: {attempts}/{maxAttempts}
			</Text>
			<Text></Text>

			{gameState === "playing" && (
				<Box>
					<Text>Guess: </Text>
					<Text color="yellow">{currentGuess}</Text>
					<Text color="gray">█</Text>
				</Box>
			)}

			{message && (
				<Text color={gameState === "won" ? "green" : 
							gameState === "lost" ? "red" : "cyan"
				}>
					{message}
				</Text>
			)}

			{guessHistory.length > 0 && (
				<Box flexDirection='column' marginTop={1}>
					<Text>Guess History:</Text>
					{guessHistory.slice(-5).map((entry, index) => (
						<Text key={index}>
							#{entry.attempt}: {entry.guess} - {entry.result}
						</Text>
					))}
				</Box>
			)}

			{gameState !== "playing" && (
				<Box flexDirection='column' marginTop={1}>
					<Text>Game Over!</Text>
					<Text>Play again? (r) or quit (q)</Text>
				</Box>
			)}

			<Box flexDirection='column' marginTop={1}>
				<Text>Use numbers to type your guess</Text>
				<Text>Press Enter to submit your guess</Text>
				<Text>Press Ctrl+C to quit</Text>
			</Box>
		</Box>
	);
}
