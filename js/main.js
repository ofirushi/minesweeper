'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'

var gBoard
var gLevel
var gGame
var gInterval
var gIsHint = false

function initGame(size = 4) {
    document.querySelector('input').src = 'img/idle.png'
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
        minesLocations: [],
        lives: 3,
        hints: [true, true, true]
    }
    document.querySelector('.board').innerHTML = ''
    document.querySelector('.hints').innerHTML = '<input id= "hint0" onclick=hint(0) type="image" src="img/on-hint.png" /><input id= "hint1" onclick=hint(1) type="image" src="img/on-hint.png" /><input id= "hint2" onclick=hint(2) type="image" src="img/on-hint.png" />'

    gBoard = buildBoard(size)
    renderBoard(gBoard)
    document.querySelector('.board').style.pointerEvents = "all"
    stopStopper()
    document.getElementById('lives').innerText = LIFE.repeat([gGame.lives])
    loadHighScore()
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
    if (gLevel.SIZE ** 2 - gGame.shownCount === gLevel.MINES) {
        document.querySelector('.board').style.pointerEvents = "none"
        stopStopper()
        document.querySelector('input').src = 'img/win.png'
        var name = prompt('You won!! Please enter your name: ')
        var time = document.getElementById('timer').innerText
        var level = getCurrLevel()
        if(parseInt(localStorage.getItem('score' + level + ''))>time){

            localStorage.setItem('name' + level, name)
            localStorage.setItem('score' + level, time)
        }


    }
}

function getCurrLevel() {
    switch (gLevel.SIZE) {
        case 4:
            return 1
        case 8:
            return 2
        case 12:
            return 3
        default:
            break;
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
            board[i][j].minesAroundCount = (!board[i][j].isMine) ? countNeighbors(i, j, board) : MINE
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

function mineClicked(cellId) {
    if (gGame.lives <= 1) {
        document.querySelector('input').src = 'img/lose.png'
        for (var i = 0; i < gGame.minesLocations.length; i++) {
            // var mineLocation = Array.from(gGame.minesLocations[i])
            var mineId = gGame.minesLocations[i]
            document.getElementById(mineId).innerHTML = MINE

        }
        document.querySelector('.board').style.pointerEvents = "none"
        stopStopper()
        alert('You lose!')
    } else {
        document.getElementById(cellId).innerHTML = MINE
        gGame.lives--
        document.getElementById('lives').innerText = LIFE.repeat([gGame.lives])
    }
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
    showCell(parseInt(cellPos[0]), parseInt(cellPos[1]))
    openNegs(parseInt(cellPos[0]), parseInt(cellPos[1]), gBoard)
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
                } else if (gIsHint) {
                    jigglePeak(parseInt(coord[0]), parseInt(coord[1]), gBoard)
                } else if (gBoard[coord[0]][coord[1]].isMine) {
                    mineClicked(elCell.id)
                } else {
                    if (gBoard[coord[0]][coord[1]].minesAroundCount === 0) openNegs(parseInt(coord[0]), parseInt(coord[1]), gBoard)

                    showCell(parseInt(coord[0]), parseInt(coord[1]))
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

function openNegsRecursion(cellI, cellJ, mat) {
    // debugger
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var cellId = '' + i + j
            document.getElementById(cellId).innerText = mat[i][j].minesAroundCount
            if (mat[i][j].minesAroundCount === 0) openNegsRecursion(i, j, mat)
            //    else return
        }
    }

}
function openNegs(cellI, cellJ, mat) {
    // debugger
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMarked) continue
            if (mat[i][j].isShown) continue
            showCell(i, j)
        }
    }
}

function showCell(cellI, cellJ) {
    gBoard[cellI][cellJ].isShown = true
    gGame.shownCount++
    var cellId = '' + cellI + cellJ
    document.getElementById(cellId).innerText = gBoard[cellI][cellJ].minesAroundCount
}



function hint(idx) {
    if (gGame.hints[idx]) {
        gIsHint = true
        gGame.hints[idx] = false
        document.getElementById("hint" + idx + "").src = "img/off-hint.png"

    }
}

function jigglePeak(cellI, cellJ, mat) {
    // debugger
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            var cellId = '' + i + j
            if (mat[i][j].isMine) document.getElementById(cellId).innerText = MINE
            else document.getElementById(cellId).innerText = gBoard[i][j].minesAroundCount
        }
    }
    setTimeout(function () {
        // debugger
        for (var k = cellI - 1; k <= cellI + 1; k++) {
            if (k < 0 || k >= mat.length) continue;
            for (var l = cellJ - 1; l <= cellJ + 1; l++) {
                if (l < 0 || l >= mat[k].length) continue;
                if(mat[k][l].isShown)continue
                var cellId = '' + k + l
                document.getElementById(cellId).innerText = ''
            }
        }
    }, 1000)
    gIsHint = false
}

function loadHighScore() {
    var level = getCurrLevel()
    var name = localStorage.getItem('name' + level + '')
    var score = localStorage.getItem('score' + level + '')
    document.getElementById('high-score').innerText = (typeof(score)==='object')? 'No high score':'High Score- Name: ' + name + ' | Score:' + score + ''

}
