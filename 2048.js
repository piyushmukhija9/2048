// --- Add these variables at the top of your file ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

let board = [];
let score = 0;
const rows = 4;
const columns = 4;

window.onload = function() {
    setGame();
}

// ----------------------------------------------
// TOUCH CONTROLS (Add this section)
// ----------------------------------------------
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;
    const threshold = 30; // Minimum distance to be considered a swipe

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > threshold) {
            if (dx > 0) slideRight();
            else slideLeft();
        }
    } else {
        if (Math.abs(dy) > threshold) {
            if (dy > 0) slideDown();
            else slideUp();
        }
    }
}

// ----------------------------------------------
// GAME SETUP + RESET
// ----------------------------------------------
function setGame() {
    document.getElementById("board").innerHTML = "";
    score = 0;
    
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r + "-" + c;
            updateTile(tile, board[r][c]);
            document.getElementById("board").append(tile);
        }
    }

    setTwo();
    setTwo();
    syncHUD();
}

document.getElementById("resetBtn").addEventListener("click", () => {
    const go = document.getElementById("gameOver");
    if (go) go.style.display = "none";
    setGame();
});

// ----------------------------------------------
// TILE UPDATER
// ----------------------------------------------
function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = "";
    tile.classList.add("tile");

    if (num > 0) {
        tile.innerText = num;
        if (num <= 4096) {
            tile.classList.add("x" + num);
        } else {
            tile.classList.add("x9182");
        }
    }
}

// ----------------------------------------------
// KEYBOARD CONTROLS
// ----------------------------------------------
document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") slideLeft();
    else if (e.code === "ArrowRight") slideRight();
    else if (e.code === "ArrowUp") slideUp();
    else if (e.code === "ArrowDown") slideDown();
});

// ----------------------------------------------
// SLIDE / MERGE LOGIC
// ----------------------------------------------
function filterZero(row) {
    return row.filter(num => num != 0);
}

function slide(row) {
    row = filterZero(row);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }
    row = filterZero(row);
    while (row.length < columns) {
        row.push(0);
    }
    return row;
}

// Updated Move Functions with "Change Detection"
function slideLeft() {
    let original = JSON.stringify(board);
    for (let r = 0; r < rows; r++) {
        board[r] = slide(board[r]);
        for (let c = 0; c < columns; c++) {
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
    if (original !== JSON.stringify(board)) afterMove();
}

function slideRight() {
    let original = JSON.stringify(board);
    for (let r = 0; r < rows; r++) {
        let row = board[r].slice().reverse();
        row = slide(row);
        board[r] = row.reverse();
        for (let c = 0; c < columns; c++) {
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
    if (original !== JSON.stringify(board)) afterMove();
}

function slideUp() {
    let original = JSON.stringify(board);
    for (let c = 0; c < columns; c++) {
        let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        col = slide(col);
        for (let r = 0; r < rows; r++) {
            board[r][c] = col[r];
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
    if (original !== JSON.stringify(board)) afterMove();
}

function slideDown() {
    let original = JSON.stringify(board);
    for (let c = 0; c < columns; c++) {
        let col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
        col = slide(col);
        col.reverse();
        for (let r = 0; r < rows; r++) {
            board[r][c] = col[r];
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
    if (original !== JSON.stringify(board)) afterMove();
}

function afterMove() {
    setTwo();
    syncHUD();
}

// ----------------------------------------------
// RANDOM TILE SPAWNER
// ----------------------------------------------
function setTwo() {
    if (!hasEmptyTile()) return;
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] === 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r + "-" + c);
            updateTile(tile, 2);
            found = true;
        }
    }
}

function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 0) return true;
        }
    }
    return false;
}

// ----------------------------------------------
// HUD: SCORE + MOVES + GAME OVER
// ----------------------------------------------
function updateScore() {
    document.getElementById("score").innerText = score;
}

function canMoveLeft() {
    for (let r = 0; r < rows; r++) {
        for (let c = 1; c < columns; c++) {
            if (board[r][c] === 0) continue;
            if (board[r][c - 1] === 0 || board[r][c - 1] === board[r][c]) return true;
        }
    }
    return false;
}

function canMoveRight() {
    for (let r = 0; r < rows; r++) {
        for (let c = columns - 2; c >= 0; c--) {
            if (board[r][c] === 0) continue;
            if (board[r][c + 1] === 0 || board[r][c + 1] === board[r][c]) return true;
        }
    }
    return false;
}

function canMoveUp() {
    for (let c = 0; c < columns; c++) {
        for (let r = 1; r < rows; r++) {
            if (board[r][c] === 0) continue;
            if (board[r - 1][c] === 0 || board[r - 1][c] === board[r][c]) return true;
        }
    }
    return false;
}

function canMoveDown() {
    for (let c = 0; c < columns; c++) {
        for (let r = rows - 2; r >= 0; r--) {
            if (board[r][c] === 0) continue;
            if (board[r + 1][c] === 0 || board[r + 1][c] === board[r][c]) return true;
        }
    }
    return false;
}

function countPossibleMoves() {
    let cnt = 0;
    if (canMoveLeft()) cnt++;
    if (canMoveRight()) cnt++;
    if (canMoveUp()) cnt++;
    if (canMoveDown()) cnt++;
    return cnt;
}

function syncHUD() {
    updateScore();
    let moves = countPossibleMoves();
    const movesDisplay = document.getElementById("moves");
    if (movesDisplay) movesDisplay.innerText = moves;

    const go = document.getElementById("gameOver");
    if (go) go.style.display = (moves === 0) ? "block" : "none";
}
