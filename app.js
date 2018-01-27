var mode = "", p1 = "", p2 = "", activeP = p1, firstP = p1, disableHI = false;
var board = [0,1,2,3,4,5,6,7,8], boardCM = [0,2,4,6,8], boardRL = [], stats = {c: 0, t: 0, d: 0};
var dificultyL = 0, masterMove = "", noviceMove = "";

function minimax(newBoard, player){
    var cellAvail = emptyCells(newBoard);

    if (winCombinations(newBoard, p2)) return {score:10};
    if (winCombinations(newBoard, p1)) return {score:-10};
    if (cellAvail.length === 0) return {score:0};

    var moves = [];

    for (var i = 0; i < cellAvail.length; i++) {
        var move = {};
        move.index = newBoard[cellAvail[i]];

        newBoard[cellAvail[i]] = player;

        if (player == p2){
            var result = minimax(newBoard, p1);
            move.score = result.score;
        }
        else{
            var result = minimax(newBoard, p2);
            move.score = result.score;
        }

        newBoard[cellAvail[i]] = move.index;
        moves.push(move);
    }

    var bestMove;
    if (player === p2) {
        var bestScore = -Infinity;
        for(var i = 0; i < moves.length; i++){
            if (moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = Infinity;
        for(var i = 0; i < moves.length; i++){
            if (moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function winCombinations(board, player) {
    if (board[0] == player && board[1] == player && board[2] == player) return [0,1,2];
    if (board[3] == player && board[4] == player && board[5] == player) return [3,4,5];
    if (board[6] == player && board[7] == player && board[8] == player) return [6,7,8];
    if (board[0] == player && board[3] == player && board[6] == player) return [0,3,6];
    if (board[1] == player && board[4] == player && board[7] == player) return [1,4,7];
    if (board[2] == player && board[5] == player && board[8] == player) return [2,5,8];
    if (board[0] == player && board[4] == player && board[8] == player) return [0,4,8];
    if (board[2] == player && board[4] == player && board[6] == player) return [2,4,6];

    return false;
}

function emptyCells(board){
    return board.filter(function(e){
        return e != "circle" && e != "times"
    });
}

function switchP(update) {
    if (update) {activeP = (activeP == p1) ? p2 : p1};
    indicatorP();
}

function randomNumber(start, end) {
    return Math.floor(Math.random(start) * end);
}

function checkResults() {
    if(winCombinations(board, activeP) || !emptyCells(board).length) {
        disableHI = true;
        cellAnimation(); updateStats();
        setTimeout(resetBoard, 2000);
        return true;
    }
    return false;
}

function firstMove() {
    if(firstP == p1) {
        firstP = activeP = p2;
        if(mode == "pc"){
            disableHI = true;
            setTimeout(function() {computerPlays(true);}, randomNumber(0, 1000) + 500);
        }
    } else {
        firstP = activeP = p1;
        disableHI = false;
    }
    indicatorP();
}

function takeAMove(cell) {
    var cellD = cell.dataset;
    if(cellD.checked == "true") return false;

    cellD.checked = "true";
    $(cell).removeClass("hover animated fadeIn");
    $(cell).addClass(activeP == "circle" ? "circle animated bounceIn" : "times animated bounceIn");
    $(cell.children[0]).addClass(cellIcon());

    if(cellD.index) board[cellD.index] = activeP;
    return true;
}

function computerPlays(startGame) {
    activeP = p2;
    masterMove = $(".cell")[minimax(board, activeP).index];
    noviceMove = $(".cell")[emptyCells(board)[randomNumber(0, emptyCells(board).length)]];

    if(startGame) {
        takeAMove($(".cell")[boardCM[randomNumber(0, boardCM.length)]]);
    } else {
        if(dificultyL == 1) (randomNumber(0, 100) < 30) ? takeAMove(masterMove) : takeAMove(noviceMove);
        if(dificultyL == 2) (randomNumber(0, 100) < 70) ? takeAMove(masterMove) : takeAMove(noviceMove);
        if(dificultyL == 3) takeAMove(masterMove);
    }

    if(checkResults()) return setTimeout(firstMove, 2005);
    switchP(true); disableHI = false;
}

function resetBoard() {
    board = [0,1,2,3,4,5,6,7,8];
    disableHI = false;

    Array.prototype.slice.call($(".cell")).forEach(function(e, i, a) {
        e.dataset.checked = false;
        e.className = "cell";
        e.children[0].className = "fa";
    });

    if(boardRL[boardRL.length-1] == "draw") {
        $(".result .draw").fadeOut(300, function() {
            $(".result").fadeOut(300).removeClass().addClass("result");
        });
    } else {
        $(".result .win").fadeOut(300, function() {
            $(".result").fadeOut(300).removeClass().addClass("result");
        });

    }
}

function cellIcon() {
    return (activeP == "circle") ? "fa-circle-o" : "fa-times";
}

function indicatorP() {
    $(".indicator .icon").removeClass("active");
    $((activeP == "circle") ? ".indicator .circle" : ".indicator .times").addClass("active");
}

function cellAnimation(result) {
    // 1 = win, 2 = draw, 0 = error
    var cells = $(".cell"), combinationR = (winCombinations(board, activeP)),
        result = result || (combinationR ? 1 : (!combinationR && !emptyCells(board).length) ? 2 : 0);

    if(result == 1) {
        boardRL.push(activeP);
        (activeP === "circle") ? stats.c++ : stats.t++;
        for (var i = 0; i < combinationR.length; i++) {
            $(cells[combinationR[i]]).addClass("won animated bounceOut");
        }
        setTimeout(function(){showResults(result, activeP)}, 800);
    }

    if(result == 2) {
        boardRL.push("draw");
        stats.d++;
        for (var i = 0; i < board.length; i++) {$(cells[i]).addClass("draw animated fadeOut");}
        setTimeout(function(){showResults(result, activeP)}, 800);
    }
}

function updateStats() {
    var counters = $(".stats").children();
    for(var i = 0; i < counters.length; i++) {
        if($(counters[i]).hasClass("circle"))
            $(counters[i]).children(".counter").html((stats.c > 1) ? stats.c+" wins" : stats.c+" win");

        if($(counters[i]).hasClass("times"))
            $(counters[i]).children(".counter").html((stats.t > 1) ? stats.t+" wins" : stats.t+" win");

        if($(counters[i]).hasClass("draw"))
            $(counters[i]).children(".counter").html((stats.d > 1) ? stats.d+" draws" : stats.d+" draw");
    }
}

function showResults(status, side) {
    if(status == 2) {
        $(".result").addClass("d");
        $(".result").fadeIn(300, function() {
            $(".result .draw").fadeIn(300, false);
        }).css("display", "flex");
    };

    if(status == 1) {
        $(".result").addClass(side == "circle" ? "c" : "t");
        if(mode == "pc") $(".result .win .status").html(activeP == p1 ? "You Win" : "Computer Wins");
        if(mode == "p2") $(".result .win .status").html(activeP == p1 ? "You Win" : "Player2 Wins");

        $(".result").fadeIn(300, function() {
            $(".result .win").fadeIn(300, false);
        }).css("display", "flex");
    }
}

$(".game .cell").on("click", function(e) {
    if((disableHI) || !takeAMove(this)) return;
    if(checkResults()) return setTimeout(firstMove, 2005);
    switchP(true);
    if(mode == "pc") {
        disableHI = true;
        setTimeout(computerPlays, randomNumber(0, 1000) + 500);
    }
});

function cellHover(cell, mode) {
    if(disableHI) return;
    if(cell.dataset.checked == "false") {
        if(mode == 1) {
            $(cell).addClass("hover animated fadeIn");
            $(cell.children[0]).addClass(cellIcon());
        } else {
            $(cell).removeClass("hover animated fadeIn");
            $(cell.children[0]).removeClass(cellIcon());
        }
    }
}

$(".game .cell").on("mouseenter", function(e) {
    cellHover(this,1);
}).on("mouseleave", function() {
    cellHover(this,0);
});

$("#game-ref").on("click", function(e) {
    if(emptyCells(board).length == 9) return;
    disableHI = true;
    cellAnimation(2); updateStats();
    setTimeout(resetBoard, 2000);
    setTimeout(firstMove, 2005);
});

$("#game-res").on("click", function(e) {
    mode = ""; p1 = ""; p2 = ""; activeP = ""; firstP = ""; stats = {c: 0, t: 0, d: 0}; dificultyL = 0;

    resetBoard(); updateStats();

    $(".game").fadeOut(300, function() {
        $(".mode").fadeIn();
    });
});

$(".dificulty .level").on("click", function(e) {
    dificultyL = parseInt(this.dataset.level);

    $(".dificulty").fadeOut(300, function() {
        $(".level").removeClass().addClass("level");
        $(".level span").css("display", "none");

        $(".game").fadeIn().css("display", "flex");
    });
    indicatorP();
});

$(".sides .side").on("click", function(e) {
    if(this.dataset.side) p1 = this.dataset.side; activeP = p1; firstP = p1;
    p2 = p1 == "circle" ? "times" : "circle";

    if(mode == "pc") {
        $(".level").addClass(p1 == "circle" ? "circle" : "times");
        $(p1 == "circle" ? ".icon-circle" : ".icon-times").css("display", "block");
    }

    $(".sides").fadeOut(300, function() {
        if(mode == "pc") $(".dificulty").fadeIn().css("display", "flex");
        else $(".game").fadeIn().css("display", "flex");
    });
});

$(".mode .type").on("click", function(e) {
    if (this.dataset.mode) mode = this.dataset.mode;
    $(".mode").fadeOut(300, function() {
        $(".sides").fadeIn().css("display", "flex");
    });

    $("#game-mode").html(mode == "pc" ? "VS. Computer" : "VS. Player");
});

/*
https://www.flaticon.com/packs/arcade-center-7
https://sites.google.com/site/reflection4learning/why-reflect
https://github.com/grab/front-end-guide
https://forum.freecodecamp.org/t/my-journey-from-noob-to-fcc-front-end-certificate/166315

https://www.howtographql.com/
https://medium.com/personal-growth/77-important-truths-ive-learned-about-life-2476f940f12d
https://www.coursera.org/specializations/data-structures-algorithms
https://www.coursera.org/specializations/algorithms

https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-1-introduction/
https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-3-tic-tac-toe-ai-finding-optimal-move/
http://www.angelfire.com/ny5/consigliere/tictactoe.html
https://cdn.sstatic.net/Sites/codereview/img/pattern.png?v=8286dee84d00

https://mostafa-samir.github.io/Tic-Tac-Toe-AI/
https://github.com/rafaltrzop/NoughtsAndCrosses
https://softwareengineering.stackexchange.com/questions/299543/best-approach-to-implement-multiple-levels-of-difficulty-to-a-minimax-ai

A great way to learn a concept is to write a blog post about it

✍️ Remember taking notes in school?

It's like that, but more polished, organized, & filled with links + your own definitions (which helps you think it through)

Blogging = public notes u can reference & share 😎

https://medium.freecodecamp.org/how-i-went-from-programming-with-a-feature-phone-to-working-for-an-mit-startup-40ca3be4fa0f
http://blog.teamtreehouse.com/top-5-programming-languages-to-learn


https://forum.freecodecamp.org/t/im-self-taught-and-i-got-the-job-but/166602
https://www.webpagefx.com/blog/web-design/free-books-code/
*/
