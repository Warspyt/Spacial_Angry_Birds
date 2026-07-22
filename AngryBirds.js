let gameState = "menu";

const { Bodies, Engine, World, Events, Body,
  Mouse, MouseConstraint, Constraint } = Matter;

let engine, world, mc, ground,
  boxes = [], pigs = [], planets = [],
  birds = [], currentBirdIndex = 0, slingshot,
  bgImg, boxImg, birdImages = [], pigImg,
  planetImg, bgSpacialImg, bgMenuImg, slingshotImg;

let currentLevel    = "nivel1";
let levelStartFrame = 0;
let birdsDepleted   = false;
let depletedFrame   = 0;

const GRACE_FRAMES   = 90;   // frames sin daño al inicio (evita muertes/victoria instantáneas)
const GAMEOVER_DELAY = 220;  // frames de espera tras agotar pájaros

// ─────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world  = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();

  mc = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { mask: 2 }
  });
  World.add(world, mc);

  bgImg        = loadImage("background.jpg");
  bgSpacialImg = loadImage("spacial_background.jpg");
  bgMenuImg    = loadImage("menu_background.jpg");
  boxImg       = loadImage("box.png");
  pigImg       = loadImage("pig.png");
  planetImg    = loadImage("planet.png");
  slingshotImg = loadImage("slingshot.png");

  birdImages = [
    loadImage("red.png"),
    loadImage("chuck.png"),
    loadImage("bomb.png")
  ];

  // Evento: soltar el pájaro de la honda
  Events.on(engine, "afterUpdate", () => {
    if (slingshot) slingshot.fly(mc);
  });

  // ── Colisiones: sistema de vida de cerdos y cajas de madera ──
  Events.on(engine, 'collisionStart', (event) => {
    if (gameState !== 'nivel1' && gameState !== 'nivel2') return;
    if (frameCount - levelStartFrame < GRACE_FRAMES) return;

    for (let pair of event.pairs) {
      let { bodyA, bodyB } = pair;
      let objA = bodyA.gameObject;
      let objB = bodyB.gameObject;

      if (objA instanceof Bird) {
        // Pájaro golpea cerdo → muerte
        if (objB instanceof Pig)                          objB.takeDamage(3);
        // Pájaro golpea caja de madera → destrucción directa
        if (objB instanceof Box && objB.type === 'wood')  objB.takeDamage(2);

      } else if (objB instanceof Bird) {
        if (objA instanceof Pig)                          objA.takeDamage(3);
        if (objA instanceof Box && objA.type === 'wood')  objA.takeDamage(2);

      } else {
        // Daño por impacto de alta velocidad
        if (objA instanceof Pig) {
          let spd = bodyA.speed;
          if (spd > 8)  objA.takeDamage(spd > 16 ? 3 : 1);
        }
        if (objB instanceof Pig) {
          let spd = bodyB.speed;
          if (spd > 8)  objB.takeDamage(spd > 16 ? 3 : 1);
        }
        // Caja de madera choca a alta velocidad → daño
        if (objA instanceof Box && objA.type === 'wood') {
          let spd = bodyA.speed;
          if (spd > 12) objA.takeDamage(spd > 22 ? 2 : 1);
        }
        if (objB instanceof Box && objB.type === 'wood') {
          let spd = bodyB.speed;
          if (spd > 12) objB.takeDamage(spd > 22 ? 2 : 1);
        }
      }
    }

    checkWinCondition();
  });
}

// ─────────────────────────────────────────────
//  LIMPIEZA DEL MUNDO
// ─────────────────────────────────────────────
function cleanupWorld() {
  World.clear(world);
  engine.world.gravity.y = 1;
  engine.world.gravity.x = 0;
  World.add(world, mc);

  boxes = []; pigs = []; planets = []; birds = [];
  currentBirdIndex = 0;
  slingshot  = null;
  ground     = null;
  birdsDepleted = false;
  depletedFrame = 0;
}

// Crea una caja aleatoria: 35% metal (indestructible), 65% madera (destruible)
function makeBox(x, y) {
  let isMetal = random() < 0.35;
  return new Box(x, y, 50, 50, isMetal ? null : boxImg, {}, isMetal ? 'metal' : 'wood');
}

// ─────────────────────────────────────────────
//  NIVEL 1 – Normal
// ─────────────────────────────────────────────
function setupNivel1() {
  cleanupWorld();
  currentLevel    = "nivel1";
  levelStartFrame = frameCount;

  ground = new Ground(width/2, height - 10, width, 20);

  // Columnas altas (8 pisos) – cajas aleatorias wood/metal
  for (let i = 1; i <= 8; i++) {
    const y = height - 50*i - 10;
    boxes.push(makeBox(1000, y));
    boxes.push(makeBox(1300, y));
  }
  // Columnas cortas (4 pisos)
  for (let i = 1; i <= 4; i++) {
    const y = height - 50*i - 10;
    boxes.push(makeBox(800,  y));
    boxes.push(makeBox(1100, y));
  }

  pigs.push(new Pig(1000, height - 50*9, 25, pigImg));
  pigs.push(new Pig(1100, height - 50*5, 25, pigImg));
  pigs.push(new Pig(800,  height - 50*5, 25, pigImg));
  pigs.push(new Pig(1300, height - 50*9, 25, pigImg));

  birds = [];
  currentBirdIndex = 0;
  for (let i = 0; i < 4; i++) {
    let index   = floor(random(0, birdImages.length));
    let newBird = new Bird(250, 450, 25, birdImages[index]);
    if (i !== 0) Body.setPosition(newBird.body, { x: -200, y: -200 });
    birds.push(newBird);
  }
  slingshot = new Slingshot(birds[0]);
}

// ─────────────────────────────────────────────
//  NIVEL 2 – Espacial
// ─────────────────────────────────────────────
function setupNivel2() {
  cleanupWorld();
  currentLevel    = "nivel2";
  levelStartFrame = frameCount;
  engine.world.gravity.y = 0;

  // Strengths reducidos ~50%: curva la trayectoria del pájaro de forma sutil
  planets.push(new Planet(600,  400, 150, 3000, planetImg));
  planets.push(new Planet(1000, 300, 100, 2000, planetImg));
  planets.push(new Planet(1300, 500, 180, 4000, planetImg));

  // ── Cluster 1: entre Planeta 1 y Planeta 2 (zona ~800, 260) ──
  // Distancias verificadas: ≥230px de P1, ≥200px de P2
  boxes.push(new Box(750,  265, 50, 50, boxImg));
  boxes.push(new Box(810,  265, 50, 50, boxImg));
  boxes.push(new Box(780,  215, 50, 50, boxImg));
  pigs.push(new Pig(780,   155, 25, pigImg));   // cerdo encima del cluster

  // ── Cluster 2: entre Planeta 2 y Planeta 3 (zona ~1150, 390) ──
  // Distancias verificadas: ≥160px de P2, ≥195px de P3
  boxes.push(new Box(1105, 400, 50, 50, boxImg));
  boxes.push(new Box(1165, 400, 50, 50, boxImg));
  boxes.push(new Box(1135, 350, 50, 50, boxImg));
  pigs.push(new Pig(1135,  295, 25, pigImg));   // cerdo encima del cluster

  birds = [];
  currentBirdIndex = 0;
  for (let i = 0; i < 4; i++) {
    let index   = floor(random(0, birdImages.length));
    let newBird = new Bird(250, 450, 25, birdImages[index]);
    if (i !== 0) Body.setPosition(newBird.body, { x: -200, y: -200 });
    birds.push(newBird);
  }
  slingshot = new Slingshot(birds[0]);
}

// ─────────────────────────────────────────────
//  CONDICIÓN DE VICTORIA
// ─────────────────────────────────────────────
function checkWinCondition() {
  if (frameCount - levelStartFrame < GRACE_FRAMES) return;
  if (pigs.length > 0 && pigs.every(p => p.dead)) {
    gameState = 'victory';
  }
}

// ─────────────────────────────────────────────
//  LAYOUTS DE BOTONES
// ─────────────────────────────────────────────
function menuLayout() {
  let btnW  = min(width * 0.30, 320);
  let btnH  = 64;
  let btnX  = width/2 - btnW/2;
  let btn1Y = height/2 - 30;
  let btn2Y = height/2 + 55;
  let btn3Y = height/2 + 140;
  return { btnW, btnH, btnX, btn1Y, btn2Y, btn3Y };
}

function gameOverLayout() {
  let btnW   = min(width * 0.22, 240);
  let btnH   = 58;
  let gap    = 24;
  let retryX = width/2 - btnW - gap/2;
  let menuX  = width/2 + gap/2;
  let btnY   = height/2 + 55;
  return { btnW, btnH, retryX, menuX, btnY };
}

// ─────────────────────────────────────────────
//  DRAW
// ─────────────────────────────────────────────
function draw() {
  background(0);

  if (gameState === "menu")         { drawMenu();          return; }
  if (gameState === "victory")      { drawVictory();       return; }
  if (gameState === "gameover")     { drawGameOver();      return; }
  if (gameState === "instrucciones"){ drawInstrucciones(); return; }

  // ── Fondo ──
  if (gameState === "nivel1") {
    image(bgImg, 0, 0, width, height);
  } else if (gameState === "nivel2") {
    image(bgSpacialImg, 0, 0, width, height);

    for (let planet of planets) {
      planet.show();
      // Solo el pájaro en vuelo es atraído por los planetas.
      // Cajas y cerdos flotan estáticos – no se atraen para evitar órbitas.
      if (!slingshot.hasBird() && currentBirdIndex < birds.length) {
        planet.attract(birds[currentBirdIndex].body);
      }
    }
  }

  Engine.update(engine);

  if (ground) ground.show();
  for (const box of boxes) box.show();
  for (const pig of pigs) pig.show();
  if (slingshot) slingshot.show();
  for (let b of birds) b.show();

  drawBirdQueue();
  checkWinCondition();

  // Auto-detección: último pájaro lanzado y sin más disponibles
  if (!birdsDepleted && birds.length > 0 &&
      currentBirdIndex === birds.length - 1 &&
      slingshot && !slingshot.hasBird()) {
    birdsDepleted = true;
    depletedFrame = frameCount;
  }

  // Derrota: pasó el delay tras quedar sin pájaros y aún quedan cerdos
  if (birdsDepleted && frameCount - depletedFrame > GAMEOVER_DELAY) {
    if (pigs.some(p => !p.dead)) {
      gameState = 'gameover';
    }
    birdsDepleted = false;
  }
}

function drawBirdQueue() {
  let queued = 0;
  for (let i = currentBirdIndex + 1; i < birds.length; i++) {
    push();
    imageMode(CENTER);
    image(birds[i].img, 70 + queued * 50, height - 80, 40, 40);
    pop();
    queued++;
  }
}

// ─────────────────────────────────────────────
//  MENÚ PRINCIPAL
// ─────────────────────────────────────────────
function drawMenu() {
  if (bgMenuImg && bgMenuImg.width > 0) {
    image(bgMenuImg, 0, 0, width, height);
  } else {
    background(20, 20, 50);
  }

  noStroke();
  fill(0, 0, 0, 110);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  noStroke();
  textSize(max(min(width * 0.03, 32), 18));
  fill(220, 230, 255);
  text("Selecciona un nivel", width/2, height/2 - 100);

  let { btnW, btnH, btnX, btn1Y, btn2Y, btn3Y } = menuLayout();
  let fontSize = min(btnW * 0.11, 26);

  // Botón Nivel Normal
  fill(50, 150, 50);
  rect(btnX, btn1Y, btnW, btnH, 14);
  fill(255);
  noStroke();
  textSize(fontSize);
  text("Nivel Normal", width/2, btn1Y + btnH/2);

  // Botón Nivel Espacial
  fill(40, 70, 190);
  rect(btnX, btn2Y, btnW, btnH, 14);
  fill(255);
  text("Nivel Espacial", width/2, btn2Y + btnH/2);

  // Botón Instrucciones
  fill(120, 70, 170);
  rect(btnX, btn3Y, btnW, btnH, 14);
  fill(255);
  text("Instrucciones", width/2, btn3Y + btnH/2);
}

// ─────────────────────────────────────────────
//  PANTALLA DE VICTORIA
// ─────────────────────────────────────────────
function drawVictory() {
  background(5, 20, 5);
  noStroke();
  for (let i = 0; i < 60; i++) {
    let sx   = (i * 317 + frameCount * 0.4) % width;
    let sy   = (i * 199 + frameCount * 0.15) % height;
    let alfa = 100 + 80 * sin(frameCount * 0.05 + i);
    fill(255, 255, 200, alfa);
    ellipse(sx, sy, 3, 3);
  }
  textAlign(CENTER, CENTER);

  let ts = min(width * 0.1, 100);
  textSize(ts);
  fill(255, 215, 0);
  stroke(180, 80, 0);
  strokeWeight(5);
  text("¡Victoria!", width/2, height/2 - 80);

  noStroke();
  textSize(min(width * 0.028, 28));
  fill(180, 255, 180);
  text("¡Todos los cerdos han sido eliminados!", width/2, height/2 + 20);

  textSize(min(width * 0.02, 20));
  fill(160, 180, 255);
  text("Haz clic para volver al menú", width/2, height/2 + 75);
}

// ─────────────────────────────────────────────
//  PANTALLA DE DERROTA
// ─────────────────────────────────────────────
function drawGameOver() {
  background(30, 5, 5);

  // Partículas de fondo
  noStroke();
  for (let i = 0; i < 40; i++) {
    let sx   = (i * 271 + frameCount * 0.3) % width;
    let sy   = (i * 157 + frameCount * 0.2) % height;
    let alfa = 60 + 50 * sin(frameCount * 0.04 + i);
    fill(200, 60, 60, alfa);
    ellipse(sx, sy, 4, 4);
  }

  textAlign(CENTER, CENTER);

  let ts = min(width * 0.09, 88);
  textSize(ts);
  fill(255, 70, 70);
  stroke(140, 0, 0);
  strokeWeight(4);
  text("¡Fallaste!", width/2, height/2 - 100);

  noStroke();
  textSize(min(width * 0.025, 24));
  fill(220, 200, 200);
  text("Todavía quedan cerdos con vida...", width/2, height/2 - 18);

  let { btnW, btnH, retryX, menuX, btnY } = gameOverLayout();
  let fontSize = min(btnW * 0.12, 22);

  // Botón Reintentar
  fill(50, 150, 50);
  rect(retryX, btnY, btnW, btnH, 12);
  fill(255);
  noStroke();
  textSize(fontSize);
  text("Reintentar", retryX + btnW/2, btnY + btnH/2);

  // Botón Volver al menú
  fill(70, 70, 160);
  rect(menuX, btnY, btnW, btnH, 12);
  fill(255);
  text("Volver al menú", menuX + btnW/2, btnY + btnH/2);
}

// ─────────────────────────────────────────────
//  INSTRUCCIONES
// ─────────────────────────────────────────────
function drawInstrucciones() {
  // Fondo oscuro semitransparente sobre la imagen de menu
  if (bgMenuImg && bgMenuImg.width > 0) {
    image(bgMenuImg, 0, 0, width, height);
  } else {
    background(15, 10, 30);
  }
  noStroke();
  fill(0, 0, 0, 175);
  rect(0, 0, width, height);

  // Panel central
  let panW = min(width * 0.72, 820);
  let panH = min(height * 0.82, 600);
  let panX = width/2  - panW/2;
  let panY = height/2 - panH/2;

  fill(20, 18, 45, 230);
  stroke(100, 80, 180);
  strokeWeight(2);
  rect(panX, panY, panW, panH, 18);
  noStroke();

  // Título del panel
  textAlign(CENTER, TOP);
  textSize(min(panW * 0.07, 34));
  fill(200, 170, 255);
  text("Cómo jugar", width/2, panY + 22);

  // Línea divisoria
  stroke(100, 80, 180, 160);
  strokeWeight(1);
  line(panX + 20, panY + 64, panX + panW - 20, panY + 64);
  noStroke();

  // ── Contenido en dos columnas ──
  let colL = panX + panW * 0.05;
  let colR = panX + panW * 0.53;
  let startY = panY + 80;
  let lineH  = min(panH * 0.072, 38);
  let fs     = min(panW * 0.028, 16);  // font size cuerpo
  let fsH    = min(panW * 0.035, 20);  // font size headers

  // ── Columna izquierda ──
  textAlign(LEFT, TOP);

  // Controles
  fill(255, 210, 80);
  textSize(fsH);
  text("Controles", colL, startY);
  fill(210, 210, 240);
  textSize(fs);
  text("Arrastra el pajaro con el raton", colL + 10, startY + lineH * 1.0);
  text("Suelta para lanzar", colL + 10, startY + lineH * 1.9);
  text("[Espacio]  Siguiente pajaro", colL + 10, startY + lineH * 2.8);

  // Objetivo
  fill(255, 210, 80);
  textSize(fsH);
  text("Objetivo", colL, startY + lineH * 4.1);
  fill(210, 210, 240);
  textSize(fs);
  text("Elimina todos los cerdos", colL + 10, startY + lineH * 5.0);
  text("antes de quedarte sin pajaros", colL + 10, startY + lineH * 5.9);

  // Victoria / Derrota
  fill(255, 210, 80);
  textSize(fsH);
  text("Victoria y Derrota", colL, startY + lineH * 7.2);
  fill(120, 255, 140);
  textSize(fs);
  text("  Todos los cerdos muertos  =  Victoria", colL + 10, startY + lineH * 8.1);
  fill(255, 110, 110);
  text("  Sin pajaros + cerdos vivos = Derrota", colL + 10, startY + lineH * 9.0);

  // ── Columna derecha ──
  // Tipos de pajaro
  fill(255, 210, 80);
  textSize(fsH);
  text("Tipos de pajaro", colR, startY);
  fill(210, 210, 240);
  textSize(fs);
  text("Rojo     – golpe directo estándar", colR + 10, startY + lineH * 1.0);
  text("Amarillo – velocidad extra (Chuck)", colR + 10, startY + lineH * 1.9);
  text("Negro    – mayor masa e impacto", colR + 10, startY + lineH * 2.8);

  // Tipos de caja (nivel normal)
  fill(255, 210, 80);
  textSize(fsH);
  text("Tipos de caja  (Nivel Normal)", colR, startY + lineH * 4.1);
  fill(200, 140, 80);
  textSize(fs);
  text("  Madera  – se destruye al impactar", colR + 10, startY + lineH * 5.0);
  fill(160, 175, 190);
  text("  Metal   – indestructible", colR + 10, startY + lineH * 5.9);

  // Nivel espacial
  fill(255, 210, 80);
  textSize(fsH);
  text("Nivel Espacial", colR, startY + lineH * 7.2);
  fill(210, 210, 240);
  textSize(fs);
  text("La gravedad de los planetas curva", colR + 10, startY + lineH * 8.1);
  text("la trayectoria del disparo", colR + 10, startY + lineH * 9.0);

  // Botón Volver
  let bW = min(panW * 0.32, 200);
  let bH = 46;
  let bX = width/2 - bW/2;
  let bY = panY + panH - bH - 18;

  fill(100, 60, 160);
  noStroke();
  rect(bX, bY, bW, bH, 12);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(min(bW * 0.14, 20));
  text("Volver al menú", width/2, bY + bH/2);
}
// ─────────────────────────────────────────────
function keyPressed() {
  // ESC en instrucciones vuelve al menú
  if (gameState === 'instrucciones' && keyCode === ESCAPE) {
    gameState = 'menu';
    return;
  }
  if (gameState !== 'nivel1' && gameState !== 'nivel2') return;
  if (!slingshot) return;

  if (key === " " && !slingshot.hasBird()) {
    World.remove(world, birds[currentBirdIndex].body);
    currentBirdIndex++;

    if (currentBirdIndex < birds.length) {
      let nextBird = birds[currentBirdIndex];
      Body.setPosition(nextBird.body, { x: 250, y: 450 });
      Body.setVelocity(nextBird.body, { x: 0, y: 0 });
      slingshot.attach(nextBird);
    }
  }
}

// ─────────────────────────────────────────────
//  RATÓN
// ─────────────────────────────────────────────
function mousePressed() {
  if (gameState === "menu") {
    let { btnW, btnH, btnX, btn1Y, btn2Y, btn3Y } = menuLayout();

    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btn1Y && mouseY < btn1Y + btnH) {
      gameState = "nivel1";
      setupNivel1();
    }
    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btn2Y && mouseY < btn2Y + btnH) {
      gameState = "nivel2";
      setupNivel2();
    }
    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btn3Y && mouseY < btn3Y + btnH) {
      gameState = "instrucciones";
    }

  } else if (gameState === "instrucciones") {
    // Botón Volver al menú (mismas coordenadas que en drawInstrucciones)
    let panW = min(width * 0.72, 820);
    let panH = min(height * 0.82, 600);
    let panY = height/2 - panH/2;
    let bW   = min(panW * 0.32, 200);
    let bH   = 46;
    let bX   = width/2 - bW/2;
    let bY   = panY + panH - bH - 18;
    if (mouseX > bX && mouseX < bX + bW &&
        mouseY > bY && mouseY < bY + bH) {
      gameState = "menu";
    }

  } else if (gameState === "victory") {
    cleanupWorld();
    gameState = "menu";

  } else if (gameState === "gameover") {
    let { btnW, btnH, retryX, menuX, btnY } = gameOverLayout();

    if (mouseX > retryX && mouseX < retryX + btnW &&
        mouseY > btnY   && mouseY < btnY   + btnH) {
      if (currentLevel === "nivel1") { setupNivel1(); gameState = "nivel1"; }
      else                           { setupNivel2(); gameState = "nivel2"; }
    }
    if (mouseX > menuX && mouseX < menuX + btnW &&
        mouseY > btnY  && mouseY < btnY  + btnH) {
      cleanupWorld();
      gameState = "menu";
    }
  }
}
