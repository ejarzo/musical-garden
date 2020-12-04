const getHue = (h) => Math.floor(h < 0 ? 360 - h : h % 360);

const getSentence = (ruleset) => {
  const { rules, nGenerations, startingLetter } = ruleset;
  const lsys = new LSystem(
    startingLetter,
    rules.map((rls) => new Rule(...rls))
  );

  for (let i = 0; i < nGenerations; i++) {
    lsys.generate();
  }

  return lsys.getSentence();
};

function Plant(props) {
  const {
    ruleset,
    startPos,
    theta,
    baseColor,
    waveform,
    isInGround,
    drawSeed,
  } = props;
  this.startPos = startPos;
  const { segmentLength } = ruleset;

  let maxLetters = 0;
  let framesPerStep = 1;
  let growSpeed = 1;
  let isDoneGrowing = false;
  let isGrowing = true;
  this.count = 0;

  const musicScale = teoria.note("G4").scale("dorian");
  const notes = musicScale.notes();
  // const scale = teoria.note("G").scale("minorpentatonic");
  // console.log(musicScale.notes().toString());

  const getRandomNote = () =>
    musicScale.get(Math.floor(random(0, notes.length * 2)));

  // const osc = new Tone.Oscillator({
  //   volume: -Infinity,
  //   frequency: random(100, 400),
  //   type: waveform,
  // });

  const panner = new Tone.Panner3D({
    panningModel: "HRTF",
    positionX: startPos.x,
    positionY: startPos.y,
    distanceModel: "linear",
    maxDistance: 500,
  });

  const meter = new Tone.Meter();

  // osc.start(0);
  // osc.volume.linearRampTo(0.9, 0.4);
  // osc.chain(new Tone.Gain(0.4), panner, OUTPUT_NODE);
  const synth = new Tone.MonoSynth({
    volume: -Infinity,
    oscillator: { type: waveform },
    envelope: { attack: 0.01 },
  });
  // osc.volume.linearRampTo(0.9, 0.4);

  synth.chain(new Tone.Gain(0.5), panner, meter, OUTPUT_NODE);
  // synth.triggerAttack(getRandomNote().toString());
  synth.volume.linearRampTo(0.9, 0.4);

  const sentence = getSentence(ruleset);
  let currLetterIndex = 0;
  let currNoteIndex = Math.floor(random(0, notes.length * 3) / 2);

  const part = new Tone.Loop((time) => {
    if (!isGrowing) {
      if (isInGround) {
        const currLetter = sentence[currLetterIndex];
        if (currLetterIndex === 0) {
          // currNoteIndex = 0;
        }
        if (currLetter === "-") {
          currNoteIndex--;
        }
        if (currLetter === "+") {
          currNoteIndex++;
        }
        // console.log(sentence[currLetterIndex]);
        const note = musicScale.get(currNoteIndex);
        // osc.frequency.value = note.fq();
        synth.triggerAttackRelease(note.toString(), time + 0.1, 0.1);

        currLetterIndex++;
        currLetterIndex = currLetterIndex % maxLetters;
      }
    }

    if (isGrowing && !isDoneGrowing) {
      if (isInGround) {
        // const note = musicScale.get(getRandomNote());
        // osc.frequency.value = note.fq();
        synth.triggerAttackRelease(getRandomNote().toString(), time + 0.1, 0.1);
      } else {
        synth.triggerAttackRelease(random(20, 2000), time + 0.1, 0.1);
        // osc.frequency.value = random(20, 2000);
      }
    }
  }, 1 / (growSpeed * 5));

  part.start(0);

  const gr = createGraphics(width, height);
  const randomWidths = sentence.split("").map((_) => random(2, 15));
  let noiseAmt = 500;
  const [h, s, l] = baseColor;

  const leafHue = getHue(h + (random(20) - 10));
  const fruitHue = getHue(h + random(100, 180));

  // const stemColor = color(`hsla(${stemHue}, 40%, 20%, 1)`);
  const mouseMaxDistance = 300;
  let isStartPhase = true;

  this.render2 = function () {
    const mouseD = dist(mouseX, mouseY, startPos.x, startPos.y);
    let lightness = map(mouseD, 0, mouseMaxDistance, 10, -5);
    lightness = constrain(lightness, -5, 10);
    const mouseDiffX = Math.abs(mouseX - startPos.x);
    const mouseDiffY = mouseY - startPos.y;
    const isInColumn = mouseDiffX < 25 && mouseDiffY < 0;
    const isWatering = activeTool === "water" && isInColumn && mouseIsPressed;
    let w = 5;
    // console.log(opacity);
    isGrowing = isStartPhase || isWatering;

    if (this.count > 0) {
      isStartPhase = false;
    }

    if (mouseD > mouseMaxDistance && !isGrowing) {
      // tint(255, 000);
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
    gr.fill(h, s - 10, l + lightness);
    gr.scale(constrain(radiusScale, 0.5, 1.2));
    drawSeed(0, 0, gr);
    gr.pop();
    gr.rotate(-PI / 2);

    let wiggleAmt = isWatering
      ? Math.min(noiseAmt++ || 600)
      : Math.max(noiseAmt--, 500);
    wiggleAmt = wiggleAmt * 1 - map(mouseD, 0, mouseMaxDistance, 0, 1);
    const noiseVal = noise(this.count / 50) * (wiggleAmt / 50);

    // osc.detune.value = isInGround ? noiseVal * 4 - 2 : noiseVal * 50 - 25;
    synth.detune.value = isInGround ? noiseVal * 4 - 2 : noiseVal * 50 - 25;

    // gr.scale(map(startPos.y, 0, height, 0.3, 4));
    gr.colorMode(HSL);

    for (let i = 0; i < maxLetters; i++) {
      const c = sentence[i];
      const indexNoiseVal = noise(this.count / 80, i) - 0.5;
      const angle = radians(
        theta + ((indexNoiseVal * wiggleAmt) / 80) * (1 / (w / 2))
      );
      [];
      if (c === "F" || c === "G") {
        gr.stroke(h, s - 10, l + lightness);
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
          gr.fill(leafHue, 40, 40 + lightness, 0.7);
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
