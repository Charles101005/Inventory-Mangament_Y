const cells = document.querySelectorAll('[data-cell]');
const gameBoard = document.getElementById('gameBoard');
const statusMessage = document.getElementById('statusMessage');
const resetButton = document.getElementById('resetButton');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

// Sound effects
const moveSound = new Audio('move.mp3');
const winSound = new Audio('win.mp3');
const tieSound = new Audio('tie.mp3');

let currentPlayer = 'X';
let isGameOver = false;
let boardState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0 };

// Winning combinations
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Load scores from local storage
function loadScores() {
    scores.X = parseInt(localStorage.getItem('scoreX')) || 0;
    scores.O = parseInt(localStorage.getItem('scoreO')) || 0;
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

// Save scores to local storage
function saveScores() {
    localStorage.setItem('scoreX', scores.X);
    localStorage.setItem('scoreO', scores.O);
}

// Handle player move
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (isGameOver || cell.textContent !== '') return;

        moveSound.play();

        // Mark the cell
        cell.textContent = currentPlayer;
        boardState[index] = currentPlayer;

        // Check for winner
        if (checkWinner()) {
            winSound.play();
            endGame(currentPlayer);
        } else if (isTie()) {
            tieSound.play();
            endGame('Tie');
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatusMessage();

            // AI makes a move if enabled
            if (currentPlayer === 'O' && aiEnabled) {
                setTimeout(makeAIMove, 500);
            }
        }
    });
});

// Simple AI move logic
let aiEnabled = true;
function makeAIMove() {
    let emptyCells = [];

    cells.forEach((cell, index) => {
        if (boardState[index] === '') {
            emptyCells.push(index);
        }
    });

    if (emptyCells.length === 0) return;

    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    cells[randomIndex].textContent = 'O';
    boardState[randomIndex] = 'O';

    if (checkWinner()) {
        winSound.play();
        endGame('O');
    } else if (isTie()) {
        tieSound.play();
        endGame('Tie');
    } else {
        currentPlayer = 'X';
        updateStatusMessage();
    }
}

// Check for winner
function checkWinner() {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return boardState[index] === currentPlayer;
        });
    });
}

// Check for tie
function isTie() {
    return boardState.every(cell => cell !== '');
}

// End the game and show the result
function endGame(result) {
    isGameOver = true;

    if (result === 'Tie') {
        statusMessage.textContent = "It's a tie!";
        cells.forEach(cell => {
            if (cell.textContent === '') {
                cell.classList.add('tie');
            }
        });
    } else {
        statusMessage.textContent = `Player ${result} wins!`;
        WINNING_COMBINATIONS.forEach(combination => {
            if (combination.every(index => boardState[index] === result)) {
                combination.forEach(index => {
                    cells[index].classList.add('winner');
                });
            }
        });

        scores[result]++;
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        saveScores();
    }
}

// Update status message
function updateStatusMessage() {
    statusMessage.textContent = `Player ${currentPlayer}'s turn`;
}

// Reset the game
resetButton.addEventListener('click', resetGame);

function resetGame() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    isGameOver = false;
    currentPlayer = 'X';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winner', 'tie');
    });
    updateStatusMessage();
}

// Initialize status message and load scores
updateStatusMessage();
loadScores();