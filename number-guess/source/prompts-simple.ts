import prompts from 'prompts';

class NumberGuess {
    private targetNumber: number;
    private attempts: number;
    private maxAttempts: number;
    constructor(){
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
        this.maxAttempts = 10;
    }   

    async startGame(){
        console.log('Welcome to the Number Guessing Game!');
        console.log(`I'm thinking of a number between 1 and 100.`);
        console.log(`You have ${this.maxAttempts} attempts to guess the number.`);
        while(this.attempts < this.maxAttempts){
            const response = await prompts({
                type: 'number',
                name: 'guess',
                message: `Attempt ${this.attempts + 1}/${this.maxAttempts} - Guess the number:`,
                validate: (value: number) => {
                    if(value >= 1 && value <= 100){
                        return true;
                    }else{
                        return 'Please enter a number between 1 and 100.';
                    }
                },
            });
            this.attempts++;
            if(response.guess === this.targetNumber){
                console.log(`Congratulations! You guessed the ${this.targetNumber} in ${this.attempts} attempts.`);
                await this.askPlayAgain();
                return;
            }else if (response.guess < this.targetNumber){
                console.log(`Too low. Try again.`);
            }else{
                console.log(`Too high. Try again.`);
            }

            if(this.attempts === this.maxAttempts){
                console.log(`Game over! The number was ${this.targetNumber}.`);
                await this.askPlayAgain();
                return;
            }
        }
    }

    private async askPlayAgain(){
        const response = await prompts({
            type: 'confirm',
            name: 'playAgain',
            message: 'Do you want to play again?',
            initial: true
        });
        if(response.playAgain){
           this.resetGame()
            await this.startGame();
        }else{
            console.log('Thank you for playing!');
        }
    }

    private resetGame(){
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
    }
}

const game = new NumberGuess();
game.startGame();

