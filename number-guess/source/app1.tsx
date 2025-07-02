import {Text, Box, Static} from 'ink';
import { useEffect, useState} from 'react';
import prompts from 'prompts';



interface HistoryEntry {
	guess: number;
	attempt: number;
	won: boolean;
	timestamp: string;
}

interface Stats {
	gamesPlayed: number;
	totalAttempts: number;
	wins: number;
	bestScore: number;
}

const GameStats = ({stats}: {stats: Stats}) => {
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
			<Text bold color="blue">Game Stats</Text>
			<Text>Games Played: {stats.gamesPlayed}</Text>
			<Text>Total Attempts: {stats.totalAttempts}</Text>
			<Text>Wins: {stats.wins}</Text>
			<Text>Win Percentage: 
				{stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed * 100).toFixed(1) : 0}%
			</Text>
			<Text>Best Score: {stats.bestScore || 'N/A'}</Text>
		</Box>
	)
}

export const NumberGuessingApp = () => {
	const [gameMessages, setGameMessages] = useState<string[]>([]);
	const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
	const [gameHistory, setGameHistory] = useState<Array<HistoryEntry>>([]);
	const [stats, setStats] = useState<Stats>({
		gamesPlayed: 0,
		totalAttempts: 0,
		wins: 0,
		bestScore: 0,
	});

	const playGame = async () => {
		const log = (message: string) => setGameMessages(prev => [...prev, message]);
		const targetNumber = Math.floor(Math.random() * 100) + 1;
		let attempts = 0;
		const maxAttempts = 10;
		let won = false;

		log('Guess the number between 1 and 100!');
		log(`You have ${maxAttempts} attempts to guess the number.`);

		while(attempts < maxAttempts && !won){
			const response = await prompts({
				type: 'number',
				name: 'guess',
				message: `Attempt ${attempts + 1}/${maxAttempts} - Guess the number:`,
				validate: (value: number) => {
					if(value >= 1 && value <= 100){
						return true;
					}else{
						return 'Please enter a number between 1 and 100.';
					}
				},
			});
			if(response.guess === undefined){
				log('Game cancelled.');
				return;
			}
			attempts++;
			if(response.guess === targetNumber){
				log(`Congratulations! You guessed the ${targetNumber} in ${attempts} attempts.`);
				won = true;
			} else if (response.guess < targetNumber) {
				log('Too low. Try again.');
			}else{
				log('Too high. Try again.');
			}
		}
		if (!won) {
			log(`Game over! The number was ${targetNumber}.`);
		}

		setStats(prevStats => {
			const newBestScore = won && (prevStats.bestScore === 0 || attempts < prevStats.bestScore) 
				? attempts 
				: prevStats.bestScore;

			return {
				gamesPlayed: prevStats.gamesPlayed + 1,
				totalAttempts: prevStats.totalAttempts + attempts,
				wins: prevStats.wins + (won ? 1 : 0),
				bestScore: newBestScore,
			};
		});

		setGameHistory(prevHistory => [
			...prevHistory,
			{
				guess: targetNumber,
				attempt: attempts,
				won,
				timestamp: new Date().toISOString(),
			}]);

	};



	useEffect(() => {
		const runGame = async () => {
			setGameStatus('playing');
			setGameMessages([]);
			await playGame();

			const playAgainResponse = await prompts({
				type: 'confirm',
				name: 'continue',
				message: 'Do you want to play again?',
				initial: true,
			});

			if (playAgainResponse.continue) {
				setGameStatus('idle');
			} else {
				setGameStatus('finished');
			}
		};

		if (gameStatus === 'idle') {
			runGame();
		}
	}, [gameStatus]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="blue">Number Guessing Game</Text>
			<GameStats stats={stats}/>

			<Box flexDirection="column" marginTop={1}>
				<Text bold color="blue">Game Log</Text>
				{gameMessages.map((msg, index) => <Text key={index}>{msg}</Text>)}
			</Box>

			{gameStatus === 'finished' && <Text>Thank you for playing!</Text>}

			{gameHistory.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold color="blue">Game History</Text>
					<Static items={gameHistory.slice(-5)}>
						{(entry, index) => (
							<Box key={index} flexDirection="column" padding={1} borderStyle="round">
								<Text>Guess: {entry.guess}</Text>
								<Text>Attempt: {entry.attempt}</Text>
								<Text>Result: {entry.won ? 'Won' : 'Lost'}</Text>
								<Text>Timestamp: {entry.timestamp}</Text>
							</Box>
						)}
					</Static>
				</Box>
			)}
		</Box>
	)

}
