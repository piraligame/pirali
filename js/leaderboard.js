'use strict';

class Leaderboard {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const scores = localStorage.getItem('leaderboard');
        return scores ? JSON.parse(scores) : {};
    }

    saveScores() {
        localStorage.setItem('leaderboard', JSON.stringify(this.scores));
    }

    addScore(player, score) {
        if (!this.scores[player] || this.scores[player] < score) {
            this.scores[player] = score;
        }
        this.saveScores();
    }

    getRankedScores() {
        return Object.entries(this.scores)
            .sort(([,scoreA], [,scoreB]) => scoreB - scoreA)
            .map(([player, score]) => ({ player, score }));
    }

    display() {
        const rankedScores = this.getRankedScores();
        const displayArea = document.getElementById('leaderboard');
        displayArea.innerHTML = '';
        rankedScores.forEach(({ player, score }, index) => {
            const rank = index + 1;
            displayArea.innerHTML += `<div>${rank}. ${player} - ${score}</div>`;
        });
    }
}

// Example usage:
const leaderboard = new Leaderboard();
leaderboard.addScore('Player1', 50);
leaderboard.addScore('Player2', 75);
leaderboard.display();

// Firebase migration ready
// Uncomment to add Firebase integration
// function saveToFirebase() {
//     // Implementation for saving scores to Firebase
// }
// function loadFromFirebase() {
//     // Implementation for loading scores from Firebase
// }