function Plant({ ruleset, startPos, theta, baseColor }) {
  const { rules, nGenerations, startingLetter, segmentLength } = ruleset;

  const lsys = new LSystem(
    startingLetter,
    rules.map((rls) => new Rule(...rls))
  );

  for (let i = 0; i < nGenerations; i++) {
    lsys.generate();
  }

  const sentence = lsys.getSentence();
  const randomWidths = sentence.split("").map((_) => random(2, 15));
  const noiseAmt = 15;

  let maxLetters = 0;
  let framesPerStep = 2;
  let growSpeed = 10;

  this.render = function () {
    push();
    noiseSeed(startPos.x);
    translate(startPos.x, startPos.y);
    fill(...baseColor);
    noStroke();
    ellipse(0, 0, 20, 20);
    rotate(-PI / 2);

    const noiseVal = noise(frameCount / 50) * (1 / noiseAmt);

    let w = 5;
    let lastInstruction = () => {};

    // const prevTranslate = segmentLength;
    // let state = {};
    let prevState = { segmentLength: 0, rotate: 0 };
    let prevTranslate = 0;
    let prevRotate = 0;
    let prevTranslateSum = 0;
    let prevRotateSum = 0;

    let popOnNext = false;

    const state = [prevState];
    for (let i = 0; i < maxLetters; i++) {
      const c = sentence[i];
      const indexNoiseVal = noise(frameCount / 80, i) - 0.5;

      const angle = radians(theta + noiseVal + indexNoiseVal);
      // translate(state[0].translate);
      // rotate(state[0].rotate);
      if (c === "F" || c === "G") {
        if (popOnNext) {
          rotate(prevRotate);
          translate(prevTranslate, 0);
          popOnNext = false;
        }

        stroke(...baseColor, 200);
        strokeWeight(w);
        line(0, 0, segmentLength, 0);
        translate(segmentLength, 0);
        prevTranslate += segmentLength;
      } else if (c === "+") {
        rotate(angle);
        prevRotate += angle;
      } else if (c === "-") {
        rotate(-angle);
        prevRotate -= angle;
      } else if (c === "[") {
        w--;
        prevTranslate = prevTranslateSum;
        prevRotate = prevRotateSum;
      } else if (c === "]") {
        w++;
        //  pop();
        // state.pop();
        prevTranslate = 0;
        prevRotate = 0;
        prevTranslateSum = 0;
        prevRotateSum = 0;
        popOnNext = true;
      }

      if (w < 3) {
        noStroke();
        const rand = randomWidths[i];
        push();
        if (Math.floor(rand) === 10) {
          fill(...baseColor, 150);
          // rotate(radians(indexNoiseVal * 90 - 90));
          ellipse(-2, 0, rand, rand);
        } else {
          fill(...baseColor, 100);
          ellipse(0, 0, rand, rand * 0.6);
        }
        pop();
      }
    }

    if (frameCount % framesPerStep === 0 && maxLetters < sentence.length) {
      maxLetters += growSpeed;
    }
    pop();
  };
}
