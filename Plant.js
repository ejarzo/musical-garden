const getHue = (h) => (h < 0 ? 360 - h : h % 360);

function Plant({ ruleset, startPos, theta, baseColor, type }) {
  const { rules, nGenerations, startingLetter, segmentLength } = ruleset;

  const lsys = new LSystem(
    startingLetter,
    rules.map((rls) => new Rule(...rls))
  );

  for (let i = 0; i < nGenerations; i++) {
    lsys.generate();
  }

  const gr = createGraphics(width, height);
  const sentence = lsys.getSentence();
  const randomWidths = sentence.split("").map((_) => random(2, 15));
  const noiseAmt = 100;
  const baseHue = hue(color(baseColor));
  const leafHue = Math.floor(getHue(baseHue + (random(20) - 10)));
  const fruitHue = Math.floor(getHue(baseHue + random(100, 180)));
  const leafColor = color(`hsla(${leafHue}, 40%, 40%, 0.4)`);
  const fruitColor = color(`hsla(${fruitHue}, 50%, 50%, 0.8)`);

  let maxLetters = 0;
  let framesPerStep = 1;
  let growSpeed = 100;

  let isDoneGrowing = false;

  this.count = 0;

  this.render2 = function () {
    const mouseD = dist(mouseX, mouseY, startPos.x, startPos.y);

    if (mouseD > 200 && isDoneGrowing) {
      image(gr, 0, 0, width, height);
      return;
    }

    gr.resetMatrix();
    gr.clear();

    gr.noiseSeed(startPos.x);
    gr.translate(startPos.x, startPos.y);
    gr.fill(...baseColor);
    gr.noStroke();
    if (type === SEED_TYPES.CIRCLE) {
      gr.ellipse(0, 0, 20, 20);
    }
    if (type === SEED_TYPES.SQUARE) {
      gr.rectMode(CENTER);
      gr.rect(0, 0, 20, 20);
    }
    gr.rotate(-PI / 2);

    const noiseVal = noise(this.count / 50) * (noiseAmt / 50);
    let w = 5;

    for (let i = 0; i < maxLetters; i++) {
      const c = sentence[i];
      const indexNoiseVal = noise(this.count / 80, i) - 0.5;
      const angle = radians(theta + noiseVal + indexNoiseVal);

      if (c === "F" || c === "G") {
        gr.stroke(...baseColor, 200);
        gr.strokeWeight(w);
        gr.line(0, 0, segmentLength, 0);
        gr.translate(segmentLength, 0);
      } else if (c === "+") {
        gr.rotate(angle);
      } else if (c === "-") {
        gr.rotate(-angle);
      } else if (c === "[") {
        w--;
        gr.push();
      } else if (c === "]") {
        w++;
        gr.pop();
      }

      if (w < 3) {
        const rand = randomWidths[i];
        gr.push();
        gr.noStroke();
        if (Math.floor(rand) === 10) {
          gr.fill(fruitColor);
          gr.ellipse(-2, 0, rand, rand);
        } else {
          gr.fill(leafColor);
          gr.ellipse(0, 0, rand, rand * 0.6);
        }
        gr.pop();
      }
    }

    if (frameCount % framesPerStep === 0 && maxLetters < sentence.length) {
      maxLetters += growSpeed;
    }

    if (maxLetters >= sentence.length) {
      isDoneGrowing = true;
    }

    image(gr, 0, 0, width, height);
    this.count++;
  };
}
