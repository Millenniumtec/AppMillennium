let highscore = localStorage.getItem('highscore') || 0; // Recupera o highscore do localStorage ou inicializa com 0
//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodlerWidth = 60;
let doodlerHeight = 60;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

//physics
let velocityX = 0;
let velocityY = 2; //doodler jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

const backgroundImage = new Image();
backgroundImage.src = 'images/backgroundGame.png';
backgroundImage.onload = function() {
    drawBackground();
}



var maleCharacterImage = 'images/lelekopixel.png';
var femaleCharacterImage = 'images/lelekapixel.png';

const backgroundMusic = new Audio('sounds/bgMusic.mp3');
backgroundMusic.volume = 0.2; // Definir o volume da música de fundo
backgroundMusic.loop = true; // Definir para tocar em loop  

// Função para iniciar o jogo com o personagem selecionado
function startGameWithCharacter(characterImage, rightImg, leftImg) {
    doodler.img = new Image();
    doodler.img.src = characterImage;
    doodlerRightImg = new Image();
    doodlerRightImg.src = rightImg;
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = leftImg;
    document.getElementById('character-selection').style.display = 'none';
    backgroundMusic.play(); // Iniciar a música de fundo ao iniciar o jogo

    resetGame();

}

document.addEventListener('DOMContentLoaded', function() {
    const leleka = document.getElementById('female-character');
    const lelko = document.getElementById('male-character');
    const characterSelection = document.getElementById('character-selection');

    leleka.addEventListener('mouseover', function() {
        characterSelection.classList.add('rosa');
        characterSelection.classList.remove('verde');
    });

    leleka.addEventListener('mouseout', function() {
        characterSelection.classList.remove('rosa');
    });

    lelko.addEventListener('mouseover', function() {
        characterSelection.classList.add('verde');
        characterSelection.classList.remove('rosa');
    });

    lelko.addEventListener('mouseout', function() {
        characterSelection.classList.remove('verde');
    });
});

// Adicionar event listeners aos botões de seleção de personagem
window.onload = function () {
    document.getElementById('male-character').addEventListener('click', () => {
        startGameWithCharacter('images/lelekopixel.png', 'images/lelekopixel.png', 'images/leleko-left.png');
    });

    document.getElementById('female-character').addEventListener('click', () => {
        startGameWithCharacter('images/lelekapixel.png', 'images/lelekapixel.png', 'images/leleka-left.png');
    });

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "images/doodler-right.png";
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "images/doodler-left.png";

    platformImg = new Image();
    platformImg.src = "images/platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
}

function drawBackground() {
    context.drawImage(backgroundImage, 0, 0, board.width, board.height);
}


function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    drawBackground();

    //doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
        checkHighScore(); // Verifica e atualiza o highscore se necessário
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; //slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; //jump
            let jumpSoundInstance = new Audio('sounds/jumpSound.mp3');
            jumpSoundInstance.volume = 0.2;
            jumpSoundInstance.play();
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "25px 'handjet', sans-serif"; // Use a fonte personalizada
    context.fillText(score, 15, 30);
    context.fillText("Maior Pontuação: " + highscore, 80, 560); // Exibe o highscore

    if (gameOver) {
        context.fillText("Pressione 'Espaço' para jogar de novo", boardWidth/12, boardHeight*7/13);
    }
}

function checkHighScore() {
    // Verifica se o score atual é maior que o highscore
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore); // Salva o highscore no localStorage
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        //reset
        doodler = {
            img : doodlerRightImg,
            x : doodlerX,
            y : doodlerY,
            width : doodlerWidth,
            height : doodlerHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        }
    
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50*Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}