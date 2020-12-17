const plants = [];
const waterDrops = [];

let c; // the canvas

const btns = [];

const clearBtns = () => {
  btns.forEach((btn) => {
    btn.removeClass("isActive");
  });
};

let waterDelta = 0;
let groundTriangles;
let activeSeedType = "CIRCLE";
let activeTool = "draw";
let backgroundGraphics;

// function so that width and height are instantiated
const getGroundTriangles = () => [
  {
    ground: new Ground1([0, 10, 25]),
    points: [
      { x: 0, y: height },
      { x: width / 3, y: height },
      { x: 0, y: 0 },
    ],
  },
  {
    ground: new Ground3([200, 10, 25]),
    points: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width / 3, y: height },
    ],
  },
  {
    ground: new Ground2([40, 10, 25]),
    points: [
      { x: width, y: height },
      { x: width, y: 0 },
      { x: width / 3, y: height },
    ],
  },
  {
    ground: new Ground4([0, 54, 25]),
    points: [
      { x: width * 0.2, y: height },
      { x: width * 0.7, y: height },
      { x: width * 0.4, y: height * 0.8 },
    ],
  },
  {
    ground: new Ground5([0, 0, 0]),
    points: [
      { x: width * 0.4, y: height * 0.3 },
      { x: width * 1, y: 0 },
      { x: width * 0.5, y: height * 0.6 },
    ],
  },
];

const wateringNoise = new Tone.Noise("pink").chain(
  new Tone.Gain(0.15),
  OUTPUT_NODE
);

// const COLORS = { CIRCLE: [50, 80, 20], SQUARE: [200, 110, 10] };
const COLORS = {
  CIRCLE: [80, 50, 50],
  SQUARE: [10, 50, 50],
  TRIANGLE: [50, 60, 50],
  SAWTOOTH: [30, 50, 50],
  WATER: [190, 30, 65],
};

const plantTypes = {
  CIRCLE: {
    label: "circle",
    waveform: "sine",
    baseColor: COLORS.CIRCLE,
    ruleset: {
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
    getInitialTheta: () => random(5, 20),
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.stroke([...COLORS.CIRCLE]);
      ctx.strokeWeight(2);
      ctx.ellipse(x, y, 20, 20);
    },
  },
  SQUARE: {
    label: "square",
    waveform: "square",
    baseColor: COLORS.SQUARE,
    ruleset: {
      startingLetter: "G",
      rules: [
        [
          "G",
          [
            { value: "F+[-G]--F[+G]", weight: 1 },
            { value: "F-[+G]++F[-G]", weight: 1 },
          ],
        ],
        [
          "F",
          [
            { value: "FF", weight: 10 },
            { value: "F-F+", weight: 1 },
          ],
        ],
      ],
      nGenerations: 4,
      segmentLength: 19,
    },
    getInitialTheta: () => 90,
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.stroke([...COLORS.SQUARE]);
      ctx.strokeWeight(2);
      ctx.rectMode(CENTER);
      ctx.rect(x, y, 20, 20);
    },
  },
  TRIANGLE: {
    label: "triangle",
    waveform: "triangle",
    baseColor: COLORS.TRIANGLE,
    ruleset: {
      startingLetter: "F",
      rules: [
        [
          "F",
          [
            { value: "FF-[-F+F+F]+[+F-F-F]", weight: 9 },
            { value: "FF", weight: 2 },
            { value: "FFF", weight: 1 },
          ],
        ],
      ],
      nGenerations: 3,
      segmentLength: 15,
    },
    getInitialTheta: () => 30,
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.beginShape();
      ctx.stroke([...COLORS.TRIANGLE]);
      ctx.strokeWeight(2);
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
    ruleset: {
      startingLetter: "F",
      rules: [
        [
          "F",
          [
            { value: "F[+F]F[-F]F", weight: 9 },
            { value: "FF[+F]", weight: 1 },
            { value: "FF[-F]", weight: 1 },
          ],
        ],
      ],
      nGenerations: 4,
      segmentLength: 12,
    },
    getInitialTheta: () => random(25, 35),
    drawSeed: (x, y, ctx_) => {
      const ctx = ctx_ || window;
      ctx.colorMode(HSL);
      ctx.beginShape();
      ctx.stroke([...COLORS.SAWTOOTH]);
      ctx.strokeWeight(2);
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

const initButtons = () => {
  Object.keys(plantTypes).forEach((key, i) => {
    const { baseColor, label, drawSeed } = plantTypes[key];
    const btn = createButton("");
    btn.position(i * 50 + 10, 10);
    btn.addClass("btn");
    btns.push(btn);
    const [h, s, l] = baseColor;
    // btn.addClass(`btn--${label}`);
    if (activeSeedType === key) {
      btn.addClass(`isActive`);
    }
    btn.mousePressed(() => {
      activeSeedType = key;
      activeTool = "draw";
      clearBtns();
      btn.addClass(`isActive`);
    });
    btn.style(`border-color: hsla(${h}, ${s}%, ${l}%, 1)`);
    btn.style(`color: hsla(${h}, ${s}%, ${l}%, 1)`);
    btn.html(`<span class="btn--label">${i + 1}</span>`);
  });

  const waterBtn = createButton("");
  waterBtn.addClass("btn");
  waterBtn.addClass("btn--water");
  waterBtn.html(
    '<span class="btn--label">5</span><svg viewbox="0 0 30 42"><path d="M15 6 Q 15 6, 25 18 A 12.8 12.8 0 1 1 5 18 Q 15 6 15 6z" /></svg>'
  );
  waterBtn.position(230, 10);
  waterBtn.mousePressed(() => {
    clearBtns();
    activeTool = "water";
    waterBtn.addClass(`isActive`);
  });
  const [h, s, l] = COLORS.WATER;
  waterBtn.style(
    `color: hsl(${h}, ${s}%, ${l}%); border-color: hsl(${h}, ${s}%, ${l}%); `
  );

  btns.push(waterBtn);
};

const drawBackground = () => {
  const randomBackgroundPoints = [...new Array(1000)].map(() => ({
    x: parseInt(random(0, width)),
    y: parseInt(random(0, height)),
  }));

  backgroundGraphics.colorMode(HSL);
  backgroundGraphics.background(0, 50, 50);
  groundTriangles.forEach(({ points, ground }) => {
    const [h, s, l] = ground.color;
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
      const { points, ground } = groundTriangles[i];
      if (pointInTriangle(...points)(p)) {
        // colorMode(HSL);
        backgroundGraphics.push();
        ground.renderGround(p, backgroundGraphics);
        backgroundGraphics.pop();
      }
    }
  });
};

const getGroundTriangleForPoint = (p) => {
  for (let i = groundTriangles.length - 1; i >= 0; i--) {
    const { points } = groundTriangles[i];
    if (pointInTriangle(...points)(p)) {
      return groundTriangles[i];
    }
  }
  console.error("Point is not in any area", p);
};

const drawWater = () => {
  noStroke();
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

const drawButtons = () => {
  Object.values(plantTypes).forEach(({ baseColor, label, drawSeed }, i) => {
    push();
    colorMode(HSL);
    fill(...baseColor, 0.8);
    stroke(...baseColor);
    strokeWeight(2);
    rectMode(CENTER);
    ellipseMode(CENTER);
    translate(i * 50 + 40, 40);

    if (label === "circle") {
      scale(1.1);
    }
    if (label === "triangle") {
      scale(0.9);
    }
    if (label === "sawtooth") {
      scale(0.8);
    }

    drawSeed(0, 0);
    pop();
  });
};

function setup() {
  pixelDensity(1);
  c = createCanvas(window.innerWidth, window.innerHeight);
  c.mousePressed(canvasMousePressed);
  groundTriangles = getGroundTriangles();
  backgroundGraphics = createGraphics(width, height);
  drawBackground();
  initButtons();
  textFont("Roboto Mono");
}

function draw() {
  // background(15);
  image(backgroundGraphics, 0, 0, width, height);

  plants
    // .sort((a, b) => a.startPos.y - b.startPos.y)
    .forEach((plant) => {
      push();
      plant.render();
      pop();
    });

  drawButtons();

  if (activeTool === "draw" && mouseIsInDrawArea()) {
    fill(...COLORS[activeSeedType]);
    noStroke();
    textAlign(CENTER);
    text("Click to plant", mouseX, mouseY - 25);
  }

  if (activeTool === "water" && mouseIsInDrawArea()) {
    fill(...COLORS.WATER);
    noStroke();
    text("Hold to water", mouseX, mouseY - 25);
  }

  if (!mouseIsInDrawArea()) {
    return;
  }

  if (activeTool === "draw") {
    fill(...COLORS[activeSeedType], 0.3);
    plantTypes[activeSeedType].drawSeed(mouseX, mouseY);
  }

  if (activeTool === "water") {
    noStroke();
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

const canvasMousePressed = () => {
  if (!mouseIsInDrawArea()) return;

  waterDelta = 0;

  if (activeTool === "draw") {
    const startPos = { x: mouseX, y: mouseY };
    const { ground } = getGroundTriangleForPoint(startPos);
    // console.log(ground);
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
        baseColor,
        ruleset,
        drawSeed,
        getPart: ground.getPart,
        ground: ground,
      })
    );
  }

  if (activeTool === "water") {
    wateringNoise.start();
    wateringNoise.volume.value = -Infinity;
    wateringNoise.volume.linearRampTo(0.3, 0.4);
  }
};

function keyPressed() {
  if (key === "1") {
    setSeedType("CIRCLE");
    clearBtns();
    btns[0].addClass("isActive");
    activeTool = "draw";
  }
  if (key === "2") {
    setSeedType("SQUARE");
    clearBtns();
    btns[1].addClass("isActive");
    activeTool = "draw";
  }
  if (key === "3") {
    setSeedType("TRIANGLE");
    clearBtns();
    btns[2].addClass("isActive");
    activeTool = "draw";
  }
  if (key === "4") {
    setSeedType("SAWTOOTH");
    clearBtns();
    btns[3].addClass("isActive");
    activeTool = "draw";
  }
  if (key === "5") {
    clearBtns();
    btns[4].addClass("isActive");
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
