let gameState = "menu";

const { Bodies, Engine, World, Events, Body,
  Mouse, MouseConstraint, Constraint } = Matter;

let engine, world, ground,
  boxes=[], bird, pigs = [], slingshot,
  bgImg, boxImg, birdImages = [], pigImg, planets = [];

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

  bird = new Bird(250, 450, 25, birdImages[0]);
  slingshot = new Slingshot(bird);
}

function setupNivel2() {
  function setupNivel2() {
  boxes = [];
  pigs = [];
  planets = [];

  // Quitar la gravedad global
  engine.world.gravity.y = 0;

  ground = new Ground(width/2, height-10, width, 20);

  // Crear planetas
  planets.push(new Planet(600, 400, 40, 0.05));
  planets.push(new Planet(1000, 300, 50, 0.08));
  planets.push(new Planet(1300, 500, 60, 0.1));

  // Objetos flotando
  for(let i=0; i<5; i++){
    boxes.push(new Box(800 + i*60, 200, 50, 50, boxImg));
  }

  pigs.push(new Pig(1000, 200, 25, pigImg));

  bird = new Bird(250, 450, 25, birdImages[1]);
  slingshot = new Slingshot(bird);
}
}


function draw() {
  background(0);

  if (gameState === "menu") {
    drawMenu();
  } 
  else {
    if (gameState === "nivel1") {
      image(bgImg, 0, 0, width, height);
    } 
    else if (gameState === "nivel2") {
      image(bgSpacialImg, 0, 0, width, height);
    }
  
    Engine.update(engine);
  
    ground.show();
  
    for (const box of boxes) box.show();
    for (const pig of pigs) pig.show();
  
    slingshot.show();
    bird.show();
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
  if (key === " " && !slingshot.hasBird()){
    World.remove(world, bird.body);
    
    index = floor(random(0, birdImages.length));
    
    bird = new Bird(150, 450, 25,
      birdImages[index]);
    slingshot.attach(bird);
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
