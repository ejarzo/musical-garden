const plants = [];
const SEED_TYPES = { CIRCLE: "circle", SQUARE: "square" };

let activeSeedType = SEED_TYPES.CIRCLE;

const setSeedType = (type) => {
  activeSeedType = type;
};

const rulesets = [
  {
    startingLetter: "F",
    rules: [
      [
        "F",
        [
          { value: "FF+[F-G+]-[-GF+F]", weight: 5 },
          { value: "F-F+", weight: 1 },
          { value: "F+G-", weight: 1 },
        ],
      ],
      ["G", [{ value: "GG", weight: 1 }]],
    ],
    nGenerations: 4,
    segmentLength: 8,
  },
  {
    startingLetter: "G",
    rules: [
      ["G", [{ value: "F[+G]F[-G]+G", weight: 1 }]],
      [
        "F",
        [
          { value: "FF", weight: 7 },
          // { value: "FG", weight: 1 },
        ],
      ],
    ],
    nGenerations: 4,
    segmentLength: 15,
  },
];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

const baseColor = [50, 80, 20];

function draw() {
  background(15, 100);

  if (activeSeedType === SEED_TYPES.CIRCLE) {
    fill(...baseColor, 190);
    noStroke();
    ellipse(mouseX, mouseY, 20, 20);
  } else if (activeSeedType === SEED_TYPES.SQUARE) {
    // stroke(200, 10, 10, 100);
    fill(200, 10, 10, 190);
    noStroke();
    rectMode(CENTER);
    rect(mouseX, mouseY, 20, 20);
  }
  // noStroke();
  // rotate(-PI / 2);
  plants.forEach((plant) => {
    push();
    plant.render();
    pop();
  });
}

function mousePressed() {
  if (mouseX > width || mouseY > height) return;

  const plantData = {
    startPos: { x: mouseX, y: mouseY },
  };
  switch (activeSeedType) {
    case SEED_TYPES.CIRCLE:
      plantData.ruleset = rulesets[0];
      plantData.theta = random(5, 20);
      plantData.baseColor = [50, 80, 20];
      break;
    case SEED_TYPES.SQUARE:
      plantData.ruleset = rulesets[1];
      plantData.theta = 10;
      plantData.baseColor = [150, 10, 10];
      break;
    default:
      break;
  }
  plants.push(new Plant(plantData));
}

function keyPressed() {
  if (key === "1") {
    setSeedType(SEED_TYPES.CIRCLE);
  }
  if (key === "2") {
    setSeedType(SEED_TYPES.SQUARE);
  }
}
