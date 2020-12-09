function Plant(props) {
  const {
    ruleset,
    startPos,
    theta,
    baseColor,
    waveform,
    drawSeed,
    ground,
  } = props;
  this.startPos = startPos;
  const { segmentLength } = ruleset;

  let maxLetters = 0;
  let framesPerStep = parseInt(segmentLength / 8);
  let growSpeed = 1;
  let isDoneGrowing = false;
  let isGrowing = true;
  this.count = 0;

  const panner = new Tone.Panner3D({
    panningModel: "HRTF",
    positionX: startPos.x,
    positionY: startPos.y,
    distanceModel: "linear",
    maxDistance: 500,
  });

  const meter = new Tone.Meter();

  const synth = ground.getSynth(waveform);

  const synthOutput = new Tone.Gain();
  synth.chain(
    new Tone.Gain(0.5),
    panner,
    synthOutput,
    meter,
    ground.outputNode
  );
  synth.volume.linearRampTo(0.9, 0.4);

  const sentence = getSentence(ruleset);

  const { getWiggle, getStemWiggle } =
    ground.getPart({
      sentence,
      synth,
      synthOutput,
      getState: () => ({
        growSpeed,
        isGrowing,
        isDoneGrowing,
        maxLetters,
      }),
    }) || {};

  const gr = createGraphics(width, height);
  const randomWidths = sentence.split("").map((_) => random(2, 15));
  // let noiseAmt = 500;
  let wiggleAmt = 500;

  const [h, s, l] = baseColor;
  const stemHue = getHue(h + (random(12) - 6));
  const leafHue = getHue(h + (random(20) - 10));
  const fruitHue = getHue(h + random(100, 180));

  const mouseMaxDistance = 300;
  let isStartPhase = false;

  let saturationMultiplier = 1;
  if (ground.color[1] === 0) {
    saturationMultiplier = 0;
  }

  this.render2 = function () {
    const mouseD = dist(mouseX, mouseY, startPos.x, startPos.y);
    let lightness = map(mouseD, 0, mouseMaxDistance, 10, -5);
    lightness = constrain(lightness, -5, 10);
    const mouseDiffX = Math.abs(mouseX - startPos.x);
    const mouseDiffY = mouseY - startPos.y;
    const isInColumn = mouseDiffX < 25 && mouseDiffY < 0 && mouseDiffY > -200;
    const isWatering = activeTool === "water" && isInColumn && mouseIsPressed;
    let w = 5;

    isGrowing = isStartPhase || isWatering;

    if (this.count > 0) {
      isStartPhase = false;
    }

    if (mouseD > mouseMaxDistance && !isGrowing) {
      image(gr, 0, 0, width, height);
      return;
    }

    gr.resetMatrix();
    gr.clear();

    gr.noiseSeed(startPos.x);
    gr.translate(startPos.x, startPos.y);

    // const widthAdd = map(meter.getValue(), -50, 0, -1, 1);
    const radiusScale = map(meter.getValue(), -20, 0, 0.5, 1.2);
    gr.push();
    gr.scale(1);
    // console.log(meter.getValue());
    gr.fill(
      lerpColor(
        color(
          ground.color[0],
          ground.color[1] * saturationMultiplier,
          ground.color[2]
        ),
        color(stemHue, (s - 10) * saturationMultiplier, l + lightness),
        0.4
      )
    );

    gr.stroke(stemHue, s * saturationMultiplier, l);
    gr.strokeWeight(2);
    gr.scale(constrain(radiusScale, 0.5, 1.2));
    drawSeed(0, 0, gr);
    gr.pop();
    gr.rotate(-PI / 2);

    if (saturationMultiplier === 0) {
      if (isWatering) {
        wiggleAmt += 5;
      } else {
        wiggleAmt -= 5;
      }
      wiggleAmt = constrain(wiggleAmt, 10, 600);
    } else {
      if (isWatering) {
        wiggleAmt += 1;
      } else {
        wiggleAmt -= 1;
      }
      wiggleAmt = constrain(wiggleAmt, 10, 100);
    }

    const noiseVal = noise(this.count / 50) * (wiggleAmt / 50);

    wiggleAmt = wiggleAmt * 1 - map(mouseD, 0, mouseMaxDistance, 0, 1);
    if (getWiggle) {
      wiggleAmt = getWiggle();
    }
    if (synth.detune) {
      synth.detune.value = ground.getDetune(noiseVal);
    }
    gr.colorMode(HSL);

    for (let i = 0; i < maxLetters; i++) {
      const c = sentence[i];
      const indexNoiseVal =
        (getStemWiggle && getStemWiggle()) || noise(this.count / 80, i) - 0.5;
      const angle = radians(theta + indexNoiseVal * wiggleAmt * (1 / w));
      if (c === "F" || c === "G") {
        const stemColor = gr.lerpColor(
          color(
            ground.color[0],
            ground.color[1] * saturationMultiplier,
            ground.color[2]
          ),
          color(stemHue, (s - 10) * saturationMultiplier, l + lightness),
          i / maxLetters + 0.5
        );
        gr.stroke(stemColor);

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
          gr.fill(fruitHue, 50, 50 + lightness, 0.9);
          gr.ellipse(-2, 0, rand, rand);
        } else {
          gr.push();
          // gr.colorMode(RGB);
          gr.fill(leafHue, 40 * saturationMultiplier, 40 + lightness, 0.7);
          if (parseInt(rand) % 2) {
            gr.translate(0, -rand / 2);
            gr.rotate(-10 + noiseVal / 100);
            gr.ellipse(0, 0, rand, rand * 0.6);
          } else {
            gr.translate(0, rand / 2);
            gr.rotate(10 + noiseVal / 100);
            gr.ellipse(0, 0, rand, rand * 0.6);
          }
          gr.pop();
        }
        gr.pop();
      }
    }

    if (
      isGrowing &&
      frameCount % framesPerStep === 0 &&
      maxLetters < sentence.length
    ) {
      // console.log("incrementing");
      maxLetters += growSpeed;
      if (maxLetters >= sentence.length) {
        isDoneGrowing = true;
      }
    }

    image(gr, 0, 0, width, height);
    tint(255, 100);

    this.count++;
  };
}
