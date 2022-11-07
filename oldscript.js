const gameController = function() {
    //html doms and variables
    const tiles = document.querySelectorAll('.tile');

    var player1 = undefined;
    var player2 = undefined;
    var turn = 1;
    var winner = undefined;

    //methods
    function setPlayer(player, type) {
        if (player === 'player1') {
            player1 = type;
        } else {
            player2 = type;
        }
    }

    function getPlayer(player) {
        if (player === 'player1') {
            return player1 ;
        } else {
            return player2;
        }
    }

    function setTile(event) {
        if (event.target.classList.length === 2) {
            updateBoard(event.target.id);
        }
    }

    function getBoard() {
        const board = [[], [], []];
        tiles.forEach(tile => {
            const row = parseInt(tile.id.slice(0, 1));
            const column = parseInt(tile.id.slice(-1));
            board[row][column] = tile.textContent;
        });

        return board;
    }

    function checkBoard(board) {
        var empty = false;

        function checkTriple(a, b, c) {
            if (a === 'X' || a === 'O') {
                return a === b && b === c;
            }
        }

        for (let i = 0; i < 3; i++) {
            if (checkTriple(board[i][0], board[i][1], board[i][2])) {
                return board[i][0];
            }
            if (checkTriple(board[0][i], board[1][i], board[2][i])) {
                return board[0][i];
            }
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    empty = true;
                }
            }
        }
        if (checkTriple(board[0][0], board[1][1], board[2][2])) {
            return board[0][0];
        } 
        if (checkTriple(board[0][2], board[1][1], board[2][0])) {
            return board[0][2];
        }
        if (!empty) {
            return '';
        }
    }

    function updateBoard(id) {
        const tile = document.getElementById(id);
        tile.classList.remove('empty');
        if (turn === 1) {
            tile.textContent = 'X';
            if (checkBoard(getBoard()) !== undefined) {
                return endGame(checkBoard(getBoard()));
            }
            turn = 2;
            runGame();
        } else {
            tile.textContent = 'O';
            if (checkBoard(getBoard()) !== undefined) {
                return endGame(checkBoard(getBoard()));
            }
            turn = 1;
            runGame();
        }
    }

    function runGame() {
        if (player1 === 'player' && player2 !== 'player') {
            if (turn === 1) {
                tiles.forEach(tile => tile.addEventListener('click', setTile));
            } else {
                tiles.forEach(tile => tile.removeEventListener('click', setTile));
                setTimeout(player2.aiPlay, 400);
            }
        } else if (player1 !== 'player' && player2 === 'player') {
            if (turn === 1) {
                tiles.forEach(tile => tile.removeEventListener('click', setTile));
                setTimeout(player1.aiPlay, 400);
            } else {
                tiles.forEach(tile => tile.addEventListener('click', setTile));
            }
        } else if (player1 !== 'player' && player2 !== 'player') {
            if (turn === 1) {
                setTimeout(player1.aiPlay, 500);
            } else {
                setTimeout(player2.aiPlay, 500);
            }
        } else {
            tiles.forEach(tile => tile.addEventListener('click', setTile));
        }
    }

    function endGame(char) {
        winner = char;
        displayController.end();
        tiles.forEach(tile => tile.classList.add('empty'));
        if (turn === 1 && player1 === 'player') {
            tiles.forEach(tile => tile.removeEventListener('click', setTile));
        } else if (turn === 2 && player2 === 'player') {
            tiles.forEach(tile => tile.removeEventListener('click', setTile));
        }
    }

    function getWinner() {
        return winner;
    }

    function resetTurn() {
        turn = 1;
    }

    return {
        tiles, 
        setPlayer, 
        getPlayer, 
        getBoard, 
        checkBoard, 
        updateBoard, 
        getWinner, 
        resetTurn, 
        runGame
    }
}();

const displayController = function() {
    //html doms and event listeners
    const settings = document.getElementById('settings');
    const grid = document.getElementById('game');

    document.getElementById('start').addEventListener('click', init);
    document.getElementById('rematch').addEventListener('click', init);
    document.getElementById('restart').addEventListener('click', reset);

    document.querySelectorAll('.player').forEach(button => button.addEventListener('click', () => {
        gameController.setPlayer(button.parentNode.id, 'player');
        resetButtons(button.parentElement);
        button.style.background = 'black';
        button.style.color = 'white';
    }));
    document.querySelectorAll('.cpu').forEach(button => button.addEventListener('click', () => {
        gameController.setPlayer(button.parentNode.id, cpuPlayer(button.parentNode.id));
        resetButtons(button.parentElement);
        button.style.background = 'black';
        button.style.color = 'white';
    }));

    //methods
    function resetButtons(parent) {
        parent.querySelectorAll('button').forEach(button => {
            button.style.background = 'white';
            button.style.color = 'black';
        });
    }

    function init() {
        if (gameController.getPlayer('player1') !== undefined && gameController.getPlayer('player2') !== undefined) {
            gameController.resetTurn();
            gameController.tiles.forEach(tile => tile.textContent = '');
            settings.style.display = 'none';
            gameover.style.display = 'none';
            grid.style.visibility = 'visible';
            gameController.runGame();
        }
    }

    function end() {
        gameover.style.display = 'flex';
        document.getElementById('overtext').textContent = 
            gameController.getWinner() === "X" 
            ? "Player 1 has won" 
            : gameController.getWinner() === "O" 
            ? "Player 2 has won" 
            : "It's a tie";
    }

    function reset() {
        settings.style.display = 'flex';
        gameover.style.display = 'none';
        grid.style.visibility = 'hidden';
        document.querySelectorAll('.player').forEach(button => resetButtons(button.parentNode));
    }

    return {
        end
    }
}();

const cpuPlayer = function (player) {
    const aimark = player === 'player1' ? 'X' : 'O';
    const humanmark = player === 'player1' ? 'O' : 'X';

    //methods
    function getEmptyCells(board) {
        const empty = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    empty.push([i, j]);
                }
            }
        }
        return empty;
    }

    function minimax(current, currMark) {
        const empty = getEmptyCells(current);
        const store = [];

        if (gameController.checkBoard(current) === aimark) {
            return {score: 1};
        } else if (gameController.checkBoard(current) === '') {
            return {score: 0};
        } else if (gameController.checkBoard(current) === humanmark) {
            return {score: -1};
        }

        for (let i = 0; i < empty.length; i++) {
            const currentTest = {};
            currentTest.index = empty[i];
            current[empty[i][0]][empty[i][1]] = currMark;
            if (currMark === aimark) {
                const result = minimax(current, humanmark);
                currentTest.score = result.score;
            } else {
                const result = minimax(current, aimark);
                currentTest.score = result.score;
            }
            current[empty[i][0]][empty[i][1]] = '';
            store.push(currentTest);
        }

        let bestTestPlay = null;
        if (currMark === aimark) {
            let bestScore = -Infinity;
            for (let i = 0; i < store.length; i++) {
                if (store[i].score > bestScore) {
                    bestScore = store[i].score;
                    bestTestPlay = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < store.length; i++) {
                if (store[i].score < bestScore) {
                    bestScore = store[i].score;
                    bestTestPlay = i;
                }
            }
        }
        return store[bestTestPlay];
    }

    function aiPlay() {
        const bestPlay = minimax(gameController.getBoard(), aimark);
        const id = bestPlay.index[0] + '-' + bestPlay.index[1];
        gameController.updateBoard(id);
    }

    return {
        aiPlay
    }
};