const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
const path = require('path');

// Game State
const INITIAL_BALANCE = 1000;
const ROUND_DURATION = 60; // seconds

let gameState = {
    players: [],
    currentRound: 0,
    roundActive: false,
    currentBets: [],
    timeRemaining: ROUND_DURATION,
    gameStarted: false,
    allResults: []
};

// Store timer separately to avoid circular reference
let roundTimer = null;

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send current game state to new connection
    socket.emit('gameState', gameState);
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
    
    // Add player
    socket.on('addPlayer', (playerName) => {
        console.log('Player joining:', playerName);
        if (!gameState.gameStarted && playerName && !gameState.players.find(p => p.name === playerName)) {
            gameState.players.push({
                name: playerName,
                balance: INITIAL_BALANCE
            });
            io.emit('gameState', gameState);
            console.log('Player added:', playerName, '- Total players:', gameState.players.length);
        }
    });
    
    // Remove player
    socket.on('removePlayer', (playerName) => {
        if (gameState.gameStarted) {
            // Can't remove players once game has started
            return;
        }
        gameState.players = gameState.players.filter(p => p.name !== playerName);
        io.emit('gameState', gameState);
    });
    
    // Start game
    socket.on('startGame', () => {
        console.log('Start game requested. Current state:', gameState.gameStarted, 'Players:', gameState.players.length);
        if (!gameState.gameStarted && gameState.players.length >= 2) {
            gameState.gameStarted = true;
            console.log('Game starting!');
            startNewRound();
        }
    });
    
    // Place bet
    socket.on('placeBet', ({ playerName, amount }) => {
        console.log('Bet received:', playerName, amount, 'Round active:', gameState.roundActive);
        
        if (!gameState.roundActive) {
            console.log('Bet rejected: round not active');
            return;
        }
        
        const player = gameState.players.find(p => p.name === playerName);
        if (!player) {
            console.log('Bet rejected: player not found');
            return;
        }
        
        if (amount <= 0 || amount > player.balance) {
            console.log('Bet rejected: invalid amount', amount, 'Balance:', player.balance);
            return;
        }
        
        // Check if player already bet
        if (gameState.currentBets.find(b => b.playerName === playerName)) {
            console.log('Bet rejected: player already bet');
            return;
        }
        
        gameState.currentBets.push({
            playerName: playerName,
            amount: amount
        });
        
        console.log('Bet accepted! Total bets:', gameState.currentBets.length);
        io.emit('gameState', gameState);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Game Logic Functions
function startNewRound() {
    gameState.currentRound++;
    gameState.roundActive = true;
    gameState.currentBets = [];
    gameState.timeRemaining = ROUND_DURATION;
    
    io.emit('gameState', gameState);
    
    // Clear any existing timer
    if (roundTimer) {
        clearInterval(roundTimer);
    }
    
    // Start countdown
    roundTimer = setInterval(() => {
        gameState.timeRemaining--;
        io.emit('timerUpdate', gameState.timeRemaining);
        
        if (gameState.timeRemaining <= 0) {
            endRound();
        }
    }, 1000);
}

function endRound() {
    clearInterval(roundTimer);
    gameState.roundActive = false;
    
    if (gameState.currentBets.length === 0) {
        io.emit('roundEnded', { noBets: true });
        setTimeout(() => {
            startNewRound();
        }, 3000);
        return;
    }
    
    const results = processRound();
    gameState.allResults.unshift(results);
    
    io.emit('roundResults', results);
    io.emit('gameState', gameState);
    
    setTimeout(() => {
        startNewRound();
    }, 5000);
}

function processRound() {
    // Sort bets by amount
    const sortedBets = [...gameState.currentBets].sort((a, b) => a.amount - b.amount);
    
    const pairs = [];
    const refunded = [];
    
    // Create pairs
    for (let i = 0; i < sortedBets.length - 1; i += 2) {
        const bet1 = sortedBets[i];
        const bet2 = sortedBets[i + 1];
        
        // Higher bet wins
        const winner = bet2.amount >= bet1.amount ? bet2 : bet1;
        const loser = bet2.amount >= bet1.amount ? bet1 : bet2;
        
        pairs.push({
            winner: winner.playerName,
            loser: loser.playerName,
            winnerBet: winner.amount,
            loserBet: loser.amount
        });
        
        // Update balances
        const winnerPlayer = gameState.players.find(p => p.name === winner.playerName);
        const loserPlayer = gameState.players.find(p => p.name === loser.playerName);
        
        winnerPlayer.balance += loser.amount;
        loserPlayer.balance -= loser.amount;
    }
    
    // Handle odd player (refund)
    if (sortedBets.length % 2 === 1) {
        const oddBet = sortedBets[sortedBets.length - 1];
        refunded.push({
            playerName: oddBet.playerName,
            amount: oddBet.amount
        });
    }
    
    return {
        round: gameState.currentRound,
        pairs: pairs,
        refunded: refunded
    };
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
