const plants = [];
const SEED_TYPES = { CIRCLE: "circle", SQUARE: "square" };
const COLORS = { CIRCLE: [50, 80, 20], SQUARE: [200, 110, 10] };

const RULE_SETS = [
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
  {
    startingLetter: "F",
    rules: [["F", [{ value: "F[+F]F", weight: 1 }]]],
    nGenerations: 3,
    segmentLength: 50,
  },
];

let activeSeedType = SEED_TYPES.CIRCLE;
const setSeedType = (type) => {
  activeSeedType = type;
};

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(15, 100);

  plants.forEach((plant) => {
    push();
    plant.render2();
    pop();
  });

  if (activeSeedType === SEED_TYPES.CIRCLE) {
    fill(...COLORS.CIRCLE, 190);
    noStroke();
    ellipse(mouseX, mouseY, 20, 20);
  } else if (activeSeedType === SEED_TYPES.SQUARE) {
    fill(...COLORS.SQUARE, 190);
    noStroke();
    rectMode(CENTER);
    rect(mouseX, mouseY, 20, 20);
  }
}

function mousePressed() {
  if (mouseX > width || mouseY > height) return;

  const plantData = {
    startPos: { x: mouseX, y: mouseY },
    type: activeSeedType,
  };
  switch (activeSeedType) {
    case SEED_TYPES.CIRCLE:
      plantData.ruleset = RULE_SETS[0];
      plantData.theta = random(5, 20);
      plantData.baseColor = COLORS.CIRCLE;
      break;
    case SEED_TYPES.SQUARE:
      plantData.ruleset = RULE_SETS[1];
      plantData.theta = 90;
      plantData.baseColor = COLORS.SQUARE;
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
