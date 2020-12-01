// Modified from: The Nature of Code by Daniel Shiffman -- http://natureofcode.com

function Turtle(s, l, t, baseColor) {
  this.todo = s;
  this.len = l;
  this.theta = t;

  // const slider = createSlider(0, 360, 15);
  // const slider2 = createSlider(1, 100, 40);

  let maxLetters = 0;
  let framesPerStep = 2;
  let growSpeed = 10;

  const noiseAmt = 15;

  const randomWidths = this.todo.split("").map((_) => random(2, 15));
  // const baseColor = [50, 80, 20];

  this.render = function () {
    push();
    fill(...baseColor, 10);
    stroke(baseColor, 200);
    strokeWeight(2);
    // noStroke();
    ellipse(0, 0, 20, 20);
    rotate(-PI / 2);

    const noiseVal = noise(frameCount / 50) * (1 / noiseAmt);

    let w = 5;

    for (var i = 0; i < maxLetters; i++) {
      var c = this.todo.charAt(i);

      const indexNoiseVal = noise(frameCount / 80, i) - 0.5;

      if (c === "F" || c === "G") {
        stroke(...baseColor, 200);
        strokeWeight(w);
        line(0, 0, this.len, 0);
        translate(this.len, 0);
      } else if (c === "+") {
        rotate(radians(this.theta + noiseVal + indexNoiseVal));
      } else if (c === "-") {
        rotate(radians(-this.theta + noiseVal + indexNoiseVal));
      } else if (c === "[") {
        w--;
        push();
      } else if (c === "]") {
        w++;
        pop();
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

    if (frameCount % framesPerStep === 0 && l < this.todo.length) {
      maxLetters += growSpeed;
    }

    pop();
  };

  this.setLen = function (l) {
    this.len = l;
  };

  this.changeLen = function (percent) {
    this.len *= percent;
  };

  this.setToDo = function (s) {
    this.todo = s;
  };

  this.setTheta = function (t) {
    this.theta = t;
  };
}
