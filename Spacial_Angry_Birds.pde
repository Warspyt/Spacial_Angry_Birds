import shiffman.box2d.*;
import org.jbox2d.collision.shapes.*;
import org.jbox2d.common.*;
import org.jbox2d.dynamics.*;

Box2DProcessing box2d;

ArrayList<Box> boxes;
ArrayList<Pig> pigs;

Bird bird;
Slingshot slingshot;
Ground ground;

PImage bgImg, boxImg, pigImg;
PImage[] birdImages;

void setup() {
  size(800, 560);
  
  box2d = new Box2DProcessing(this);
  box2d.createWorld();
  box2d.setGravity(0, -20);

  bgImg = loadImage("background.jpg");
  boxImg = loadImage("box.png");
  pigImg = loadImage("pig.png");

  birdImages = new PImage[3];
  birdImages[0] = loadImage("red.png");
  birdImages[1] = loadImage("chuck.png");
  birdImages[2] = loadImage("bomb.png");

  boxes = new ArrayList<Box>();
  pigs = new ArrayList<Pig>();

  ground = new Ground(width/2, height-10, width, 20);

  for (int i = 1; i <= 8; i++) {
    float y = height - 50*i - 10;
    boxes.add(new Box(600, y, 50, 50, boxImg));
    boxes.add(new Box(700, y, 50, 50, boxImg));
  }

  float y = height - 50*9;
  pigs.add(new Pig(600, y, 25, pigImg));
  pigs.add(new Pig(700, y, 25, pigImg));

  bird = new Bird(150, 450, 25, birdImages[0]);
  slingshot = new Slingshot(bird);
}

void draw() {
  background(128);
  imageMode(CORNER);
  bgImg.resize(width, height);
  image(bgImg, 0, 0);

  box2d.step();

  ground.show();

  for (Box b : boxes) b.show();
  for (Pig p : pigs) p.show();

  slingshot.show();
  bird.show();
}

void keyPressed() {
  if (key == ' ' && !slingshot.hasBird()) {
    int index = int(random(birdImages.length));
    bird = new Bird(150, 450, 25, birdImages[index]);
    slingshot.attach(bird);
  }
}

class Box {
  Body body;
  float w, h;
  PImage img;

  Box(float x, float y, float w, float h, PImage img) {
    this.w = w;
    this.h = h;
    this.img = img;

    BodyDef bd = new BodyDef();
    bd.type = BodyType.DYNAMIC;
    bd.position = box2d.coordPixelsToWorld(x, y);
    body = box2d.createBody(bd);

    PolygonShape ps = new PolygonShape();
    float box2dW = box2d.scalarPixelsToWorld(w/2);
    float box2dH = box2d.scalarPixelsToWorld(h/2);
    ps.setAsBox(box2dW, box2dH);

    FixtureDef fd = new FixtureDef();
    fd.shape = ps;
    fd.density = 1;
    fd.friction = 0.3;
    fd.restitution = 0.5;

    body.createFixture(fd);
  }

  void show() {
    Vec2 pos = box2d.getBodyPixelCoord(body);
    float a = body.getAngle();

    pushMatrix();
    translate(pos.x, pos.y);
    rotate(-a);

    imageMode(CENTER);
    if (img != null) {
      image(img, 0, 0, w, h);
    } else {
      rectMode(CENTER);
      rect(0, 0, w, h);
    }
    popMatrix();
  }
}

class Ground extends Box {
  Ground(float x, float y, float w, float h) {
    super(x, y, w, h, null);
    body.setType(BodyType.STATIC);
  }
}

class Animal {
  Body body;
  float r;
  PImage img;

  Animal(float x, float y, float r, PImage img) {
    this.r = r;
    this.img = img;

    BodyDef bd = new BodyDef();
    bd.type = BodyType.DYNAMIC;
    bd.position = box2d.coordPixelsToWorld(x, y);
    body = box2d.createBody(bd);

    CircleShape cs = new CircleShape();
    cs.m_radius = box2d.scalarPixelsToWorld(r);

    FixtureDef fd = new FixtureDef();
    fd.shape = cs;
    fd.density = 1;
    fd.restitution = 0.6;

    body.createFixture(fd);
  }

  void show() {
    Vec2 pos = box2d.getBodyPixelCoord(body);

    pushMatrix();
    translate(pos.x, pos.y);

    imageMode(CENTER);
    if (img != null) {
      image(img, 0, 0, r*2, r*2);
    } else {
      ellipse(0, 0, r*2, r*2);
    }

    popMatrix();
  }
}

class Bird extends Animal {
  Bird(float x, float y, float r, PImage img) {
    super(x, y, r, img);
  }
}

class Pig extends Animal {
  Pig(float x, float y, float r, PImage img) {
    super(x, y, r, img);
  }
}

class Slingshot {
  Bird bird;
  boolean dragging = false;

  Slingshot(Bird b) {
    bird = b;
  }

  void attach(Bird b) {
    bird = b;
  }

  boolean hasBird() {
    return bird != null;
  }

  void show() {
    if (bird != null) {
      Vec2 pos = box2d.getBodyPixelCoord(bird.body);
      stroke(0);
      line(150, 450, pos.x, pos.y);
    }
  }

  void startDrag(float mx, float my) {
    if (bird == null) return;

    Vec2 pos = box2d.getBodyPixelCoord(bird.body);
    float d = dist(mx, my, pos.x, pos.y);

    if (d < bird.r) {
      dragging = true;
      bird.body.setType(BodyType.KINEMATIC);
    }
  }

  void drag(float mx, float my) {
    if (dragging && bird != null) {
      Vec2 newPos = box2d.coordPixelsToWorld(mx, my);
      bird.body.setTransform(newPos, 0);
    }
  }

  void release(float mx, float my) {
    if (dragging && bird != null) {
      dragging = false;

      Vec2 pos = box2d.getBodyPixelCoord(bird.body);
      Vec2 force = new Vec2(150 - pos.x, 450 - pos.y);
      force.mulLocal(5);

      bird.body.setType(BodyType.DYNAMIC);
      bird.body.applyLinearImpulse(force, bird.body.getWorldCenter(), true);
      
      bird = null;
    }
  }
}

void mousePressed() {
  slingshot.startDrag(mouseX, mouseY);
}

void mouseDragged() {
  slingshot.drag(mouseX, mouseY);
}

void mouseReleased() {
  slingshot.release(mouseX, mouseY);
}
