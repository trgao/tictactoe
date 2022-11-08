const gameBoard = function() {
    const board = [];

    function init() {
        for (let i = 0; i < 3; i++) {
            board[i] = [];
            for (let j = 0; j < 3; j++) {
                board[i][j] = '';
            }
        }
    }

    function getBoard() {
        return board;
    }

    function updateBoard(r, c) {
        const turn = gameController.getTurn();
        if (board[r][c] === '') {
            if (turn === 1) {
                board[r][c] = 'X';
                displayController.updateBoard(r + '-' + c, 'X');
            } else {
                board[r][c] = 'O';
                displayController.updateBoard(r + '-' + c, 'O');
            }
        }
    }

    return {
        init, 
        getBoard, 
        updateBoard, 
    }
}();

const gameController = function() {
    //variables
    var player1 = undefined;
    var player2 = undefined;
    var turn = 1;
    var state = 0;
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

    function getTurn() {
        return turn;
    }

    function changeTurn() {
        turn = 3 - turn;
    }

    function getWinner() {
        return winner;
    }

    function getState() {
        return state;
    }

    function start() {
        gameBoard.init();
        playGame();
    }

    function checkBoard() {
        const board = gameBoard.getBoard();
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

    function humanPlay(input) {
        const row = parseInt(input.slice(0, 1));
        const column = parseInt(input.slice(-1));
        gameBoard.updateBoard(row, column);
        endTurn();
    }

    function endTurn() {
        changeTurn();
        checkBoard();
        playGame();
    }

    function playGame() {
        if (state === 0) {
            if (checkBoard() !== undefined) {
                return endGame(checkBoard());
            }
            if (turn === 1) {
                if (player1 === 'player') {
                    displayController.setTiles();
                } else {
                    displayController.resetTiles();
                    setTimeout(player1.aiPlay, 400);
                }
            } else {
                if (player2 === 'player') {
                    displayController.setTiles();
                } else {
                    displayController.resetTiles();
                    setTimeout(player2.aiPlay, 400);
                }
            }
        }
    }

    function endGame(char) {
        winner = char;
        state = 1;
        displayController.end();
    }

    function restart() {
        player1 = undefined;
        player2 = undefined;
        turn = 1;
        state = 0;
        winner = undefined;
        start();
    }

    function rematch() {
        turn = 1;
        state = 0;
        winner = undefined;
        start();
    }

    return {
        setPlayer, 
        getPlayer, 
        getTurn, 
        changeTurn, 
        getWinner, 
        getState, 
        start, 
        checkBoard, 
        humanPlay, 
        endTurn, 
        restart, 
        rematch, 
    }
}();

const displayController = function() {
    //html doms and event listeners
    const settings = document.getElementById('settings');
    const grid = document.getElementById('game');
    const tiles = document.querySelectorAll('.tile');

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
            settings.style.display = 'none';
            gameover.style.display = 'none';
            grid.style.visibility = 'visible';
            clearBoard();
            const state = gameController.getState();
            if (state === 0) {
                gameController.start();
            } else {
                gameController.rematch();
            }
        }
    }

    function clearBoard() {
        tiles.forEach(tile => tile.textContent = '');
    }

    function updateBoard(id, mark) {
        const tile = document.getElementById(id);
        tile.classList.remove('empty');
        tile.textContent = mark;
    }

    function setTile(event) {
        const input = event.target.id;
        gameController.humanPlay(input);
    }

    function setTiles() {
        tiles.forEach(tile => tile.addEventListener('click', setTile));
    }

    function resetTiles() {
        tiles.forEach(tile => tile.removeEventListener('click', setTile));
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
        updateBoard, 
        setTiles, 
        resetTiles, 
        end, 
    }
}();

const cpuPlayer = function (player) {
    const aimark = player === 'player1' ? 'X' : 'O';
    const humanmark = player === 'player1' ? 'O' : 'X';

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
        const bestPlay = minimax(gameBoard.getBoard(), aimark);
        gameBoard.updateBoard(bestPlay.index[0], bestPlay.index[1]);
        gameController.endTurn();
    }

    return {
        aiPlay
    }
};
