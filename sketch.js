const plants = [];
const waterDrops = [];

let waterDelta = 0;

let groundTriangles;

let activeSeedType = "CIRCLE";

let activeTool = "draw";
let randomBackgroundPoints;
let backgroundGraphics;

const getRandomBackgroundPoints = () =>
  [...new Array(1000)].map(() => ({
    x: parseInt(random(0, width)),
    y: parseInt(random(0, height)),
  }));

// function so that width and height are instantiated
const getGroundTriangles = () => [
  {
    color: [0, 10, 20],
    points: [
      { x: 0, y: height },
      { x: width / 3, y: height },
      { x: 0, y: 0 },
    ],
    renderGround: ({ x, y }, ctx_) => {
      const ctx = ctx_ || window;
      ctx.fill(0, 10, 20 + noise(x, y) * 6);
      ctx.ellipse(x, y, 100, 100);
    },
  },
  {
    color: [200, 10, 20],
    points: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width / 3, y: height },
    ],
    renderGround: ({ x, y }, ctx_) => {
      const ctx = ctx_ || window;
      ctx.fill(200, 10, 20 + noise(x, y) * 6);
      ctx.rect(x, y, 100, 100);
    },
  },
  {
    color: [40, 10, 20],
    points: [
      { x: width, y: height },
      { x: width, y: 0 },
      { x: width / 3, y: height },
    ],
    renderGround: ({ x, y }, ctx_) => {
      const ctx = ctx_ || window;
      ctx.beginShape();
      ctx.fill(40, 40, 20 + noise(x, y) * 6);
      ctx.vertex(x, y + 100);
      ctx.vertex(x + 90, y + 100);
      ctx.vertex(x + 50, y - 20);
      ctx.endShape(CLOSE);
    },
  },
];

const wateringNoise = new Tone.Noise("pink").chain(
  new Tone.Gain(0.1),
  OUTPUT_NODE
);

// const COLORS = { CIRCLE: [50, 80, 20], SQUARE: [200, 110, 10] };
const COLORS = {
  CIRCLE: [80, 50, 30],
  SQUARE: [10, 50, 50],
  TRIANGLE: [50, 60, 50],
  SAWTOOTH: [30, 50, 50],
  WATER: [190, 30, 65],
};

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
          { value: "FF", weight: 40 },
          { value: "F-G+", weight: 1 },
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

const plantTypes = {
  CIRCLE: {
    label: "circle",
    waveform: "sine",
    baseColor: COLORS.CIRCLE,
    ruleset: RULE_SETS[0],
    getInitialTheta: () => random(5, 20),
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      // ctx.fill(...COLORS.CIRCLE);
      ctx.noStroke();
      ctx.ellipse(x, y, 20, 20);
    },
  },
  SQUARE: {
    label: "square",
    waveform: "square",
    baseColor: COLORS.SQUARE,
    ruleset: RULE_SETS[1],
    getInitialTheta: () => 90,
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.noStroke();
      ctx.rectMode(CENTER);
      ctx.rect(x, y, 20, 20);
    },
  },
  TRIANGLE: {
    label: "triangle",
    waveform: "triangle",
    baseColor: COLORS.TRIANGLE,
    ruleset: RULE_SETS[1],
    getInitialTheta: () => 60,
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.noStroke();
      ctx.beginShape();
      ctx.vertex(x, y - 13);
      ctx.vertex(x - 13, y + 10);
      ctx.vertex(x + 13, y + 10);
      ctx.endShape(CLOSE);
    },
  },
  SAWTOOTH: {
    label: "sawtooth",
    waveform: "sawtooth",
    baseColor: COLORS.SAWTOOTH,
    ruleset: RULE_SETS[1],
    getInitialTheta: () => random(25, 35),
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.noStroke();
      ctx.beginShape();
      ctx.vertex(x - 18, y - 10);
      ctx.vertex(x - 18, y + 10);
      ctx.vertex(x + 18, y + 10);
      ctx.endShape(CLOSE);
    },
  },
};

const setSeedType = (type) => {
  activeSeedType = type;
};

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  groundTriangles = getGroundTriangles();
  randomBackgroundPoints = getRandomBackgroundPoints();
  backgroundGraphics = createGraphics(width, height);
  drawBackground();
}

const drawBackground = () => {
  backgroundGraphics.colorMode(HSL);
  backgroundGraphics.background(0, 50, 50);
  groundTriangles.forEach(({ points, color }) => {
    const [h, s, l] = color;
    backgroundGraphics.beginShape();
    backgroundGraphics.noStroke();
    backgroundGraphics.fill(h, s, l);

    points.forEach(({ x, y }) => {
      backgroundGraphics.vertex(x, y);
    });

    backgroundGraphics.endShape(CLOSE);
  });

  randomBackgroundPoints.forEach((p) => {
    for (let i = 0; i < groundTriangles.length; i++) {
      const { points, renderGround } = groundTriangles[i];
      if (pointInTriangle(...points)(p)) {
        // colorMode(HSL);
        backgroundGraphics.push();
        renderGround(p, backgroundGraphics);
        backgroundGraphics.pop();
      }
    }
  });
};

const drawWater = () => {
  if (mouseIsPressed) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < Math.min(waterDelta, 20); j++) {
        if (waterDelta > j) {
          fill(...COLORS.WATER, noise(i, j));
          const x = random(mouseX - 25, mouseX + 25);
          const y = mouseY + ((waterDelta * 2 + j * 12) % 200);
          ellipse(x, y, 2, 7);
        }
      }
    }
    waterDelta++;
  }
};

function draw() {
  // background(15);
  image(backgroundGraphics, 0, 0, width, height);
  plants
    // .sort((a, b) => a.startPos.y - b.startPos.y)
    .forEach((plant) => {
      push();
      plant.render2();
      pop();
    });

  if (activeTool === "draw") {
    fill(...COLORS[activeSeedType]);
    plantTypes[activeSeedType].drawSeed(mouseX, mouseY);
  }

  if (activeTool === "water") {
    fill(...COLORS.WATER, 130);
    ellipse(mouseX, mouseY, 50, 10);
    drawWater();
  }
}

function mouseReleased() {
  wateringNoise.volume.linearRampTo(-Infinity, 0.4);
  setTimeout(() => {
    wateringNoise.stop();
  }, 400);
}

function mousePressed() {
  if (mouseX > width || mouseY > height) return;

  waterDelta = 0;

  if (activeTool === "draw") {
    const startPos = { x: mouseX, y: mouseY };
    const isInGround = pointInTriangle(...groundTriangles[0].points)(startPos);

    const {
      baseColor,
      waveform,
      ruleset,
      drawSeed,
      getInitialTheta,
    } = plantTypes[activeSeedType];

    plants.push(
      new Plant({
        startPos,
        waveform,
        theta: getInitialTheta(),
        isInGround,
        baseColor,
        ruleset,
        drawSeed,
      })
    );
  }

  if (activeTool === "water") {
    wateringNoise.start();
    wateringNoise.volume.value = -Infinity;
    wateringNoise.volume.linearRampTo(0.3, 0.4);
  }
}

function keyPressed() {
  if (key === "1") {
    setSeedType("CIRCLE");
    activeTool = "draw";
  }
  if (key === "2") {
    setSeedType("SQUARE");
    activeTool = "draw";
  }
  if (key === "3") {
    setSeedType("TRIANGLE");
    activeTool = "draw";
  }
  if (key === "4") {
    setSeedType("SAWTOOTH");
    activeTool = "draw";
  }
  if (key === "5") {
    activeTool = "water";
  }
}

const updateToneListener = () => {
  Tone.Listener.positionX.value = mouseX;
  Tone.Listener.positionY.value = mouseY;
};

function mouseMoved() {
  updateToneListener();
}

function mouseDragged() {
  updateToneListener();
}
