'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gLevel
var gGame
var gInterval

function initGame(size = 4) {
    var mineCount = 0
    if (size === 4) mineCount = 2
    else if (size === 8) mineCount = 12
    else if (size === 12) mineCount = 30
    gLevel = {
        SIZE: size,
        MINES: mineCount
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minesLocations: []
    }
    document.querySelector('.board').innerHTML = ''
    gBoard = buildBoard(size)
    renderBoard(gBoard)
    document.querySelector('.board').style.pointerEvents = "all"
    stopStopper()
}

function buildBoard() {
    // 4x4 2
    // 8x8 12
    // 12x12 30
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }


    return board;
}

function checkVictory() {


    if (gLevel.SIZE ** 2 - gGame.shownCount === gGame.markedCount) {
        document.querySelector('.board').style.pointerEvents = "none"
    stopStopper()
alert('You won!')
    }
}

function renderBoard(board) {
    var htmlStr = ''
    for (var i = 0; i < board.length; i++) {
        htmlStr += '<tr>'
        var row = board[i]
        for (var j = 0; j < board.length; j++) {
            var cell = row[j]
            var id = '' + i + j
            htmlStr += '<td oncontextmenu="return false" onmousedown="cellClicked(event,this)" id="' + id + '" class="cell"></td>'
        }
        htmlStr += '</tr>'
    }


    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = htmlStr
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = (!board[i][j].isMine) ? countNeighbors(i, j, board) : 0
        }
    }
}


function countNeighbors(cellI, cellJ, mat) {
    var neighborsSum = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsSum++;
        }
    }
    return neighborsSum;

}
function isNeg(cell1I, cell1J, cell2I, cell2J, mat) {
    for (var i = parseInt(cell1I) - 1; i <= parseInt(cell1I) + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = parseInt(cell1J) - 1; j <= parseInt(cell1J) + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === parseInt(cell1I) && j === parseInt(cell1J)) continue;
            if (i === cell2I && j === cell2J) {
                return true
            }
        }
    }
    return false;
}

function mineClicked() {
    for (var i = 0; i < gGame.minesLocations.length; i++) {
        // var mineLocation = Array.from(gGame.minesLocations[i])
        var mineId = gGame.minesLocations[i]
        document.getElementById(mineId).innerHTML = MINE

    }
    document.querySelector('.board').style.pointerEvents = "none"
    stopStopper()
    alert('You lose!')
}

function firstMove(cellId) {
    startStopper()
    var cellPos = Array.from(cellId)
    for (var i = 0; i < gLevel.MINES;) {
        var y = getRandomInt(0, gLevel.SIZE)
        var x = getRandomInt(0, gLevel.SIZE)
        var nextMine = '' + y + x


        if (cellId !== nextMine && !gBoard[y][x].isMine && !isNeg(cellPos[0], cellPos[1], y, x, gBoard)) {
            gBoard[y][x].isMine = true
            gGame.minesLocations.push('' + y + x)
            i++
        }
    }
    setMinesNegsCount(gBoard)
    document.getElementById(cellId).innerText = gBoard[cellPos[0]][cellPos[1]].minesAroundCount
    gGame.shownCount++
}

function cellClicked(event, elCell) {
    var coord = getPosByIdArray(elCell.id)

    if (!gBoard[coord[0]][coord[1]].isShown) {


        if (event.which === 3) {
            if (!gBoard[coord[0]][coord[1]].isMarked) {
                gBoard[coord[0]][coord[1]].isMarked = true
                gGame.markedCount++
                elCell.innerText = FLAG
            } else {
                gBoard[coord[0]][coord[1]].isMarked = false
                gGame.markedCount--
                elCell.innerText = ''
            }
            checkVictory()
            return
        }
        else if (!gGame.isOn) {
            gGame.isOn = true
            firstMove(elCell.id)
        } else {
            if (event.which === 1) {
                if (gBoard[coord[0]][coord[1]].isMarked) {
                    checkVictory()
                    return
                } else if (gBoard[coord[0]][coord[1]].isMine) {
                    mineClicked()
                } else {
                    gBoard[coord[0]][coord[1]].isShown = true
                    gGame.shownCount++
                    elCell.innerText = gBoard[coord[0]][coord[1]].minesAroundCount
                }
            }
        }
        //  else return
    }
    checkVictory()
}

function getPosByIdArray(cellId) {
    return Array.from(cellId)
}

function startStopper() {

    var startTime = Date.now()

    gInterval = setInterval(function () {
        var elapsedTime = Date.now() - startTime
        document.getElementById("timer").innerHTML = (elapsedTime / 1000).toFixed(2)
    }, 1)

}

function stopStopper() {
    clearInterval(gInterval)

    return gInterval
}

function getRandomInt(num1, num2) {
    var max = (num1 > num2) ? num1 : num2
    var min = (num2 > num1) ? num1 : num2
    return (Math.floor(Math.random() * (max - min)) + min)
}

