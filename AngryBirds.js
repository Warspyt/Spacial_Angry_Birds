let gameState = "menu";

const { Bodies, Engine, World, Events, Body,
  Mouse, MouseConstraint, Constraint } = Matter;

let engine, world, ground,
  boxes = [], bird, pigs = [], slingshot,
  bgImg, boxImg, birdImages = [], pigImg, 
  planets = [], planetImg, birds = [],
  currentBirdIndex = 0;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  
  engine = Engine.create();
  world = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();

  const mc = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: {mask: 2}
  });
  World.add(world, mc);

  bgImg = loadImage("background.jpg");
  bgSpacialImg = loadImage("spacial_background.jpg");
  boxImg = loadImage("box.png");
  pigImg = loadImage("pig.png");
  planetImg = loadImage("planet.png");

  birdImages = [
    loadImage("red.png"),
    loadImage("chuck.png"),
    loadImage("bomb.png")
  ];

  Events.on(engine, "afterUpdate", () => {
    if (slingshot) slingshot.fly(mc);
  });
}

function setupNivel1() {
  boxes = [];
  pigs = [];
  
  ground = new Ground(width/2, height-10, width, 20);

  for(let i=1; i<=8; i++){
    const y = height - 50*i - 10;
    boxes.push(new Box(1000, y, 50, 50, boxImg));
    boxes.push(new Box(1300, y, 50, 50, boxImg));
  }

  for(let i=1; i<=4; i++){
    const y = height - 50*i - 10;
    boxes.push(new Box(800, y, 50, 50, boxImg));
    boxes.push(new Box(1100, y, 50, 50, boxImg));
  }

  pigs.push(new Pig(1000, height - 50*9, 25, pigImg));
  pigs.push(new Pig(1100, height - 50*5, 25, pigImg));
  pigs.push(new Pig(800, height - 50*5, 25, pigImg));
  pigs.push(new Pig(1300, height - 50*9, 25, pigImg));

  birds = [];
  currentBirdIndex = 0;
  
  for (let i = 0; i < 4; i++) {
    let index = floor(random(0, birdImages.length));
    let newBird = new Bird(250, 450, 25, birdImages[index]);
    
    if (i !== 0) {
      Body.setPosition(newBird.body, { x: -100, y: -100 });
    }
  
    birds.push(newBird);
  }
  
  slingshot = new Slingshot(birds[0]);
}

function setupNivel2() {
  boxes = [];
  pigs = [];
  planets = [];

  engine.world.gravity.y = 0;

  // Crear planetas
  planets.push(new Planet(600, 400, 150, 5, planetImg));
  planets.push(new Planet(1000, 300, 100, 8, planetImg));
  planets.push(new Planet(1300, 500, 180, 10, planetImg));

  for(let i=0; i<5; i++){
    boxes.push(new Box(800 + i*60, 200, 50, 50, boxImg));
  }

  pigs.push(new Pig(1000, 200, 25, pigImg));

  
  for (let i = 0; i < 4; i++) {
    let index = floor(random(0, birdImages.length));
    let newBird = new Bird(250, 450, 25, birdImages[index]);
    
    if (i !== 0) {
      Body.setPosition(newBird.body, { x: -100, y: -100 });
    }
  
    birds.push(newBird);
  }
  
  slingshot = new Slingshot(birds[0]);
}


function draw() {
  background(0);

  if (gameState === "menu") {
    drawMenu();
  } else {
    if (gameState === "nivel1") {
      image(bgImg, 0, 0, width, height);
    } 
    else if (gameState === "nivel2") {
      image(bgSpacialImg, 0, 0, width, height);
      
      for (let planet of planets) {
        
        planet.show();

        for (let box of boxes) {
          planet.attract(box.body);
        }
    
        for (let pig of pigs) {
          planet.attract(pig.body);
        }
    
        if (bird) {
          planet.attract(bird.body);
        }
      }
  
    }
  
    Engine.update(engine);
  
    if (ground) ground.show();
  
    for (const box of boxes) box.show();
    for (const pig of pigs) pig.show();
  
    slingshot.show();
    for (let b of birds) {
      b.show();
    }
    
    for (let i = currentBirdIndex + 1; i < birds.length; i++) {
      let b = birds[i];
      push();
      imageMode(CENTER);
      image(b.img, 200 - i*40, height - 100, 40, 40);
      pop();
    }

  }

}

function drawMenu() {
  background(30);

  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255);
  text("ANGRY BIRDS", width/2, height/3);

  // Botón nivel 1
  fill(200);
  rect(width/2 - 150, height/2, 300, 60);
  fill(0);
  textSize(25);
  text("Nivel Normal", width/2, height/2 + 30);

  // Botón nivel 2
  fill(200);
  rect(width/2 - 150, height/2 + 100, 300, 60);
  fill(0);
  text("Nivel Espacial", width/2, height/2 + 130);
}

function keyPressed(){
  if (key === " " && !slingshot.hasBird()) {

    World.remove(world, birds[currentBirdIndex].body);

    currentBirdIndex++;

    if (currentBirdIndex < birds.length) {

      let nextBird = birds[currentBirdIndex];

      // traer al slingshot
      Body.setPosition(nextBird.body, { x: 250, y: 450 });
      Body.setVelocity(nextBird.body, { x: 0, y: 0 });

      slingshot.attach(nextBird);
    }
  }
}

function mousePressed() {
  if (gameState === "menu") {

    // Nivel 1
    if (
      mouseX > width/2 - 150 &&
      mouseX < width/2 + 150 &&
      mouseY > height/2 &&
      mouseY < height/2 + 60
    ) {
      gameState = "nivel1";
      setupNivel1();
    }

    // Nivel 2
    if (
      mouseX > width/2 - 150 &&
      mouseX < width/2 + 150 &&
      mouseY > height/2 + 100 &&
      mouseY < height/2 + 160
    ) {
      gameState = "nivel2";
      setupNivel2();
    }
  }
}
