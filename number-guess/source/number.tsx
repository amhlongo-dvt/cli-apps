import { Box, Text, Static } from 'ink';
import { 
  Spinner, 
  ProgressBar, 
  Badge, 
} from '@inkjs/ui';
import { useState, useEffect } from 'react';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';

// TypeScript Interfaces
interface DifficultyConfig {
  name: string;
  range: [number, number];
  maxAttempts: number;
  multiplier: number;
}

interface Stats {
  gamesPlayed: number;
  wins: number;
  bestScore: number | null;
  totalScore: number;
}

interface HighScore {
  playerName: string;
  score: number;
  attempts: number;
  difficulty: string;
  timestamp: string;
  won: boolean;
}

interface CurrentGame {
  playerName: string;
  difficulty: string;
  attempts: number;
  targetNumber: number;
  guesses: number[];
  hints: string[];
}

interface GameHistory {
  playerName: string;
  targetNumber: number;
  difficulty: string;
  attempts: number;
  won: boolean;
  score: number;
  timestamp: string;
}

interface GameInterfaceProps {
  gameState: string;
  stats: Stats;
  highScores: HighScore[];
  currentGame: CurrentGame | null;
  gameMessages: string[];
}

type DifficultyKey = 'easy' | 'medium' | 'hard' | 'expert';

const HIGH_SCORES_FILE: string = path.join(process.cwd(), 'high-scores.json');

const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy: { name: 'Easy', range: [1, 50], maxAttempts: 15, multiplier: 1 },
  medium: { name: 'Medium', range: [1, 100], maxAttempts: 10, multiplier: 2 },
  hard: { name: 'Hard', range: [1, 200], maxAttempts: 8, multiplier: 3 },
  expert: { name: 'Expert', range: [1, 500], maxAttempts: 6, multiplier: 5 }
};

const GameInterface: React.FC<GameInterfaceProps> = ({ gameState, stats, highScores, currentGame, gameMessages }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="blue">🎯 Advanced Number Guessing Game</Text>
      
      {/* Stats Panel */}
      <Box 
        flexDirection="column" 
        borderStyle="round" 
        borderColor="blue" 
        padding={1}
        marginY={1}
      >
        <Text bold color="blue">📊 Statistics</Text>
        <Text>Games: {stats.gamesPlayed} | Wins: {stats.wins} | Total Score: {stats.totalScore}</Text>
        {stats.bestScore && <Text>Best: {stats.bestScore} attempts</Text>}
      </Box>

      {/* Game Messages */}
      {gameMessages.length > 0 && (
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor="green" 
          padding={1}
          marginBottom={1}
        >
          <Text bold color="green">🎮 Game Log</Text>
          {gameMessages.slice(-5).map((msg, index) => (
            <Text key={index}>{msg}</Text>
          ))}
        </Box>
      )}

      {/* High Scores */}
      {highScores.length > 0 && (
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor="yellow" 
          padding={1}
          marginBottom={1}
        >
          <Text bold color="yellow">🏆 Top 3 High Scores</Text>
          <Static items={highScores.slice(0, 3)}>
            {(score, index) => (
              <Text key={index}>
                {index + 1}. {score.playerName} - {score.score} pts ({score.difficulty})
              </Text>
            )}
          </Static>
        </Box>
      )}

      {/* Current Game Info */}
      {currentGame && gameState === 'playing' && (
        <Box flexDirection="column" marginBottom={1}>
          <Text>
            Player: <Badge color="green">{currentGame.playerName}</Badge> | 
            Difficulty: <Badge color="cyan">{DIFFICULTIES[currentGame.difficulty as DifficultyKey]?.name}</Badge>
          </Text>
          <ProgressBar 
            value={(currentGame.attempts / DIFFICULTIES[currentGame.difficulty as DifficultyKey]?.maxAttempts) * 100}
          />
        </Box>
      )}

      {gameState === 'loading' && (
        <Box>
          <Spinner /> <Text>Processing...</Text>
        </Box>
      )}
    </Box>
  );
};

export const AdvancedNumberGuessingGame: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    wins: 0,
    bestScore: null,
    totalScore: 0
  });
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyKey>('medium');

  const log = (message: string) => setGameMessages(prev => [...prev, message]);

  const loadHighScores = async (): Promise<void> => {
    try {
      log(`Looking for high scores file at: ${HIGH_SCORES_FILE}`);
      log(`Current working directory: ${process.cwd()}`);
      const fileExists = await fs.pathExists(HIGH_SCORES_FILE);
      log(`File exists: ${fileExists}`);
      
      if (fileExists) {
        log('High scores file found, loading data...');
        const data = await fs.readJSON(HIGH_SCORES_FILE);
        setHighScores(data.highScores || []);
        setStats(data.stats || {
          gamesPlayed: 0,
          wins: 0,
          bestScore: null,
          totalScore: 0
        });
        setGameHistory(data.gameHistory || []);
        log(`Loaded ${data.highScores?.length || 0} high scores and ${data.gameHistory?.length || 0} game history entries`);
      } else {
        log('High scores file not found, starting fresh');
      }
    } catch (error) {
      log('Error loading high scores: ' + error);
    }
  };

  const saveData = async (): Promise<void> => {
    try {
      await fs.writeJSON(HIGH_SCORES_FILE, {
        highScores,
        stats,
        gameHistory
      }, { spaces: 2 });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const calculateScore = (attempts: number, difficulty: DifficultyKey, won: boolean): number => {
    if (!won) return 0;
    
    const config: DifficultyConfig = DIFFICULTIES[difficulty];
    const baseScore: number = Math.max(0, config.maxAttempts - attempts + 1);
    return baseScore * config.multiplier * 10;
  };

  const endGame = async (playerName: string, targetNumber: number, attempts: number, won: boolean, score: number, difficulty: DifficultyKey): Promise<void> => {
    // Update stats
    setStats(prevStats => ({
      gamesPlayed: prevStats.gamesPlayed + 1,
      wins: prevStats.wins + (won ? 1 : 0),
      bestScore: won && (!prevStats.bestScore || attempts < prevStats.bestScore) ? attempts : prevStats.bestScore,
      totalScore: prevStats.totalScore + score
    }));

    // Add to game history
    const gameEntry: GameHistory = {
      playerName,
      targetNumber,
      attempts,
      won,
      score,
      difficulty,
      timestamp: new Date().toLocaleString()
    };
    setGameHistory(prev => [...prev, gameEntry]);

    // Add to high scores if won
    if (won) {
      const newHighScore: HighScore = {
        playerName,
        score,
        attempts,
        difficulty,
        timestamp: new Date().toLocaleString(),
        won
      };
      
      setHighScores(prev => {
        const updated = [...prev, newHighScore].sort((a, b) => b.score - a.score).slice(0, 20);
        if (updated[0]?.playerName === playerName && updated[0]?.score === score) {
          log('🏆 NEW HIGH SCORE! 🏆');
        }
        return updated;
      });
    }

    await saveData();
  };

  const playGame = async (): Promise<void> => {
    // Get player name
    const nameResponse = await prompts({
      type: 'text',
      name: 'playerName',
      message: 'Enter your name:',
      validate: (value: string) => value.trim() ? true : 'Name cannot be empty'
    });

    if (!nameResponse.playerName) return;

    const playerName: string = nameResponse.playerName.trim();
    const config: DifficultyConfig = DIFFICULTIES[difficulty];
    
    const targetNumber: number = Math.floor(Math.random() * (config.range[1] - config.range[0] + 1)) + config.range[0];
    let attempts: number = 0;
    let won: boolean = false;

    const gameData: CurrentGame = {
      playerName,
      difficulty,
      attempts,
      targetNumber,
      guesses: [],
      hints: []
    };

    setCurrentGame(gameData);
    setGameMessages([]);
    
    log(`🎯 Starting new game for ${playerName}!`);
    log(`Difficulty: ${config.name}`);
    log(`Guess a number between ${config.range[0]} and ${config.range[1]}`);
    log(`You have ${config.maxAttempts} attempts.`);

    // Game loop
    while (attempts < config.maxAttempts && !won) {
      const response = await prompts({
        type: 'number',
        name: 'guess',
        message: `Attempt ${attempts + 1}/${config.maxAttempts}:`,
        validate: (value: number) => {
          if (value < config.range[0] || value > config.range[1]) {
            return `Number must be between ${config.range[0]} and ${config.range[1]}`;
          }
          return true;
        }
      });

      if (response.guess === undefined) {
        log('Game cancelled.');
        break;
      }

      attempts++;
      gameData.attempts = attempts;
      gameData.guesses.push(response.guess);
      setCurrentGame({...gameData});
      
      if (response.guess === targetNumber) {
        won = true;
        const score: number = calculateScore(attempts, difficulty, won);
        log(`🎉 Congratulations! You won in ${attempts} attempts!`);
        log(`Your score: ${score} points`);
        await endGame(playerName, targetNumber, attempts, won, score, difficulty);
        break;
      } else if (response.guess < targetNumber) {
        log('📈 Too low! Try a higher number.');
        gameData.hints.push('Too low');
      } else {
        log('📉 Too high! Try a lower number.');
        gameData.hints.push('Too high');
      }
    }

    if (!won && attempts >= config.maxAttempts) {
      const score: number = calculateScore(attempts, difficulty, won);
      log(`💀 Game Over! The number was ${targetNumber}.`);
      await endGame(playerName, targetNumber, attempts, won, score, difficulty);
    }
  };

  const runGameLoop = async (): Promise<void> => {
    while (gameState !== 'finished') {
      const response = await prompts({
        type: 'select',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { title: '🎮 Start New Game', value: 'start' },
          { title: '⚙️ Select Difficulty', value: 'difficulty' },
          { title: '📊 View High Scores', value: 'scores' },
          { title: '🚪 Exit', value: 'exit' }
        ]
      });

      if (!response.action) break;

      switch (response.action) {
        case 'start':
          setGameState('playing');
          await playGame();
          setGameState('menu');
          setCurrentGame(null);
          break;
        case 'difficulty':
          const diffResponse = await prompts({
            type: 'select',
            name: 'difficulty',
            message: 'Select difficulty:',
            choices: Object.entries(DIFFICULTIES).map(([key, config]) => ({
              title: `${config.name} (${config.range[0]}-${config.range[1]}, ${config.maxAttempts} attempts, ${config.multiplier}x multiplier)`,
              value: key
            }))
          });
          if (diffResponse.difficulty) {
            setDifficulty(diffResponse.difficulty as DifficultyKey);
            log(`Difficulty set to: ${DIFFICULTIES[diffResponse.difficulty as DifficultyKey].name}`);
          }
          break;
        case 'scores':
          if (highScores.length === 0) {
            log('No high scores recorded yet.');
          } else {
            log('🏆 High Scores:');
            highScores.slice(0, 10).forEach((score: HighScore, index: number) => {
              log(`${index + 1}. ${score.playerName} - ${score.score} points (${score.difficulty}) - ${score.attempts} attempts`);
            });
          }
          await prompts({
            type: 'confirm',
            name: 'continue',
            message: 'Press Enter to continue',
            initial: true
          });
          break;
        case 'exit':
          setGameState('finished');
          log('Thanks for playing! 👋');
          return;
      }
    }
  };

  useEffect(() => {
    loadHighScores();
  }, []);

  useEffect(() => {
    if (gameState === 'menu') {
      runGameLoop();
    }
  }, [gameState]);

  return (
    <GameInterface 
      gameState={gameState}
      stats={stats}
      highScores={highScores}
      currentGame={currentGame}
      gameMessages={gameMessages}
    />
  );
};