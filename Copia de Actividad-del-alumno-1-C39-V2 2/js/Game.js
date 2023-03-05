class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.move = false;
    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    powerCoins = new Group();

    this.addSprites(fuels, 4, fuelImg, 0.02 );
    this.addSprites(powerCoins, 18, coinImg, 0.09 );
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale){
    //automáticamente agregar sprites:
    for (var i = 0; i < numberOfSprites; i++) {
      
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);
      
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reiniciar juego");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Puntuación");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getRanking();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();
      this.showLife();

      //índice de la matriz
      var index = 0;
      for (var plr in allPlayers) {
        //agrega 1 al índice para cada bucle
        index = index + 1;

        //utilizar los datos de la base de datos para mostrar los autos en las direcciones x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          // cambiar la posición de la cámara en la dirección y
          camera.position.y = cars[index - 1].position.y;

          this.handleFuel(index);
          this.handlePowerCoins(index);
        }

        //  manejando eventos teclado
        this.handlePlayerControls();

        // cruzar meta
        const finishLine = height * 6 - 100;

        if(player.positionY > finishLine ){
         gameState = 2;
         player.rank += 1;
         Player.updateRanking(player.rank);
         player.update();
         this.showRank();
        }

      }


      drawSprites();
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        ranking: 0
      
      })
    window.location.reload();
  });
   }
  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    esta etiqueta se utiliza para mostrar cuatro espacios
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    this.move = false;
    if (keyIsDown(UP_ARROW)) {
      this.move = true;
      player.positionY += 10;
      player.update();
    }
    if(keyIsDown(LEFT_ARROW) && player.positionX > width/2 - 300){
      player.positionX -= 10;
      player.update();  
    }
    if(keyIsDown(RIGHT_ARROW) && player.positionX < width/2 + 300){
      player.positionX += 10;
      player.update();  
    }
   
  }

  handleFuel(index) {
    // Agregar combustible
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel = 185;
      //recolectado es el sprite en el grupo de recolectados que activaron 
      //el evento
      collected.remove();
    });

    // Reducir el combustible del auto
    if (player.fuel > 0 && this.move) {
      player.fuel -= 0.5;
    }

    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    } 
  }

  handlePowerCoins(index){
    //Se le resta un -1 uno al index para que pueda se 0
    cars[index - 1].overlap(powerCoins, function(coche, moneda){
      player.score += 21;
      player.update();
      moneda.remove();
    });
  }

  
  
  showRank(){
    swal({
      title: `Impresionante!${"\n"}Posición${"\n"}${player.rank}`,
      text: "Llegaste a la meta con éxito",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    }) 
  }

  gameOver(){
    swal({
      title: `Fin del juego`,
      text: "Ups",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    }) 
  }


  

  showLife(){
    push();
    image(fuelImg, width/2 - 130, height -player.positionY - 400, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 400, 185, 20 );
    fill("red");
    rect(width / 2 - 100, height - player.positionY - 400, player.fuel, 20 );
    noStroke();
    pop();
   
  }



  }


