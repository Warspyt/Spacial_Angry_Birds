// Box  –  tipo 'wood' (destruible) | 'metal' (indestructible) | 'ground' (suelo)
class Box {
  constructor(x, y, w, h, img, options={}, type='wood'){
    this.w    = w;
    this.h    = h;
    this.img  = img;
    this.type = type;
    this.dead = false;
    this.body = Bodies.rectangle(x, y, w, h, options);

    // Solo wood y metal participan en el sistema de colisiones de juego
    if (type === 'wood' || type === 'metal') {
      this.body.gameObject = this;
    }

    if (type === 'wood') {
      this.maxHealth = 2;
      this.health    = 2;
    }

    World.add(world, this.body);
  }

  takeDamage(amount) {
    if (this.type !== 'wood' || this.dead) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.dead   = true;
      World.remove(world, this.body);
    }
  }

  show(){
    if (this.dead) return;

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (this.type === 'metal') {
      // ── Caja de metal (dibujada programáticamente) ──
      rectMode(CENTER);
      fill(140, 152, 165);
      stroke(90, 100, 112);
      strokeWeight(2);
      rect(0, 0, this.w, this.h, 3);
      // Remaches en esquinas
      fill(100, 112, 125);
      noStroke();
      let rv = 5, off = 8;
      ellipse(-this.w/2 + off, -this.h/2 + off, rv);
      ellipse( this.w/2 - off, -this.h/2 + off, rv);
      ellipse(-this.w/2 + off,  this.h/2 - off, rv);
      ellipse( this.w/2 - off,  this.h/2 - off, rv);
      // Reflejo superior-izquierdo
      stroke(210, 220, 230, 130);
      strokeWeight(1.5);
      line(-this.w/2+4, -this.h/2+4, this.w/2-4, -this.h/2+4);
      line(-this.w/2+4, -this.h/2+4, -this.w/2+4, this.h/2-4);

    } else if (this.type === 'wood') {
      // ── Caja de madera ──
      imageMode(CENTER);
      if (this.img) {
        if (this.health < this.maxHealth) tint(255, 130, 130); // tinte rojo si dañada
        image(this.img, 0, 0, this.w, this.h);
        noTint();
      } else {
        rectMode(CENTER);
        fill(this.health < this.maxHealth ? color(130, 70, 30) : color(160, 100, 50));
        noStroke();
        rect(0, 0, this.w, this.h);
      }

    } else {
      // Ground u otros
      rectMode(CENTER);
      noStroke();
      fill(86, 125, 70);
      rect(0, 0, this.w, this.h);
    }
    pop();
  }
}

// Ground
class Ground extends Box {
  constructor(x, y, w, h, img){
    super(x, y, w, h, img, { isStatic: true }, 'ground');
  }
}

// Animal (base para Bird y Pig)
class Animal {
  
  constructor(x, y, r, category, img){
    this.r = r;
    this.img = img;
    this.body = Bodies.circle(x, y, r, {
      restitution: 0.6,
      collisionFilter: {
        category: category
      }
    });
    
    // Referencia al objeto de juego para la detección de colisiones
    this.body.gameObject = this;
    Body.setMass(this.body, 10);
    
    World.add(world, this.body);
  }
  
  show() {
    push();
    translate(this.body.position.x,
      this.body.position.y);
    rotate(this.body.angle);
    
    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0,
        2 * this.body.circleRadius,
        2 * this.body.circleRadius);
    } else {
      ellipse(0, 0,
        2 * this.body.circleRadius,
        2 * this.body.circleRadius);
    }
    pop();
  }
}

// Bird
class Bird extends Animal {
  constructor(x, y, r, img){
    super(x, y, r, 2, img);
  }
}

// Pig – con sistema de vida
class Pig extends Animal {
  constructor(x, y, r, img){
    super(x, y, r, 1, img);
    this.maxHealth = 3;
    this.health    = 3;
    this.dead      = false;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.dead   = true;
      World.remove(world, this.body);
    }
  }

  show() {
    if (this.dead) return;

    let x = this.body.position.x;
    let y = this.body.position.y;
    let r = this.body.circleRadius;

    // Dibujar imagen del cerdo (con rotación)
    push();
    translate(x, y);
    rotate(this.body.angle);
    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0, 2*r, 2*r);
    } else {
      fill(0, 200, 0);
      noStroke();
      ellipse(0, 0, 2*r, 2*r);
    }
    pop();

    // Barra de vida (en espacio de pantalla, sin rotación)
    let barW = r * 2.6;
    let barH = 6;
    let barX = x - barW / 2;
    let barY = y - r - 14;

    push();
    noStroke();
    // Fondo rojo (vida perdida)
    fill(200, 0, 0);
    rect(barX, barY, barW, barH, 3);
    // Barra verde (vida restante)
    fill(0, 210, 0);
    rect(barX, barY, barW * (this.health / this.maxHealth), barH, 3);
    pop();
  }
}

// Slingshot
class Slingshot {
  constructor(bird){
    this.sling = Constraint.create({
      pointA: {
        x: bird.body.position.x,
        y: bird.body.position.y
      },
      bodyB: bird.body,
      length: 5,
      stiffness: 0.05,
      damping : 0.05
    });
    World.add(world, this.sling);
  }
  
  fly(mc){      
    if (this.sling.bodyB &&
      mc.mouse.button === -1 &&
      this.sling.bodyB.position.x >
      this.sling.pointA.x + 10) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    }
  }
  
  hasBird(){
    return this.sling.bodyB != null;
  }
  
  attach(bird){
    this.sling.bodyB = bird.body;
  }
  
  show(){
    let ax = this.sling.pointA.x;
    let ay = this.sling.pointA.y;

    // Imagen del slingshot (cargada globalmente en AngryBirds.js)
    if (typeof slingshotImg !== 'undefined' && slingshotImg && slingshotImg.width > 0) {
      push();
      imageMode(CENTER);
      image(slingshotImg, ax, ay + 38, 85, 120);
      pop();
    }

    // Bandas elásticas desde los dos dientes del tenedor
    if (this.sling.bodyB) {
      let bx = this.sling.bodyB.position.x;
      let by = this.sling.bodyB.position.y;
      // Horquilla izquierda y derecha del slingshot
      let forkL = { x: ax - 14, y: ay - 12 };
      let forkR = { x: ax + 14, y: ay - 12 };

      stroke(80, 40, 10);
      strokeWeight(3);
      line(forkL.x, forkL.y, bx, by);
      line(forkR.x, forkR.y, bx, by);
      noStroke();
    }
  }
}

// Planet – con gravedad ajustada para trayectoria sutil
class Planet {
  constructor(x, y, r, strength, img) {
    this.pos      = createVector(x, y);
    this.r        = r;
    this.strength = strength;
    this.img      = img;
    this.angle    = 0;

    this.body = Bodies.circle(x, y, r * 0.8, {
      isStatic:    true,
      restitution: 0.6,
      friction:    0.1,
      frictionAir: 0.01
    });

    World.add(world, this.body);
  }

  attract(body) {
    let force = createVector(
      this.body.position.x - body.position.x,
      this.body.position.y - body.position.y
    );

    let distance = force.mag();

    // Rango ampliado: hasta 500px para que la atracción alcance la trayectoria del pájaro
    distance = constrain(distance, 25, 500);

    force.normalize();

    // F = strength / d²  (ley gravitacional ajustada)
    let strength = this.strength / (distance * distance);
    force.mult(strength);

    Body.applyForce(body, body.position, force);
  }

  show() {
    push();
    translate(this.body.position.x, this.body.position.y);
    this.angle += 0.01;
    rotate(this.angle);
    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0, this.r * 2, this.r * 2);
    } else {
      fill(100, 150, 255);
      noStroke();
      ellipse(0, 0, this.r * 2);
    }
    pop();
  }
}
