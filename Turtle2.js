// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

function Turtle2(s, l, t) {
  this.todo = s;
  this.len = l;
  this.theta = t;

  const slider = createSlider(0, 360, 5);
  const slider2 = createSlider(1, 100, 40);
  let w = 5;
  let leafWidth = 10;
  let progress = 0;
  let currentLetterIndex = 0;
  const framesPerStep = 5;
  this.render = function () {
    const noiseVal = noise(frameCount / 50) * (1 / slider2.value());

    // for (var i = 0; i < this.todo.length; i++) {
    // const c = this.todo.charAt(currentLetterIndex);
    // console.log(c);
    // if (c === "F" || c === "G") {
    //   stroke(50, 80, 20, 200);
    //   strokeWeight(w);
    //   line(0, 0, lerp(0, this.len, progress / 30 > 1 ? 1 : progress / 30), 0);
    //   // translate(this.len, 0);
    // }
    progress++;
    if (
      frameCount % framesPerStep === 0 &&
      currentLetterIndex < this.todo.length
    ) {
      pop();
      progress = 0;

      const c = this.todo.charAt(currentLetterIndex);
      console.log(c);
      if (c === "F" || c === "G") {
        stroke(50, 80, 20, 200);
        strokeWeight(w);
        line(
          0,
          0,
          lerp(
            0,
            this.len,
            progress / framesPerStep > 1 ? 1 : progress / framesPerStep
          ),
          0
        );
        line(0, 0, this.len, 0);
        translate(this.len, 0);
      } else if (c === "+") {
        rotate(radians(slider.value() + noiseVal));
      } else if (c === "-") {
        rotate(radians(-slider.value() + noiseVal));
        if (w < 2) {
          noStroke();
          fill(random(10, 80), random(100, 120), 20, 150);
          ellipse(0 + noiseVal, 0, leafWidth);
        }
      } else if (c === "[") {
        w--;
        leafWidth--;
        push();
      } else if (c === "]") {
        w++;
        leafWidth++;
        pop();
      }
      push();
      currentLetterIndex++;
    }
  };

  this.setLen = function (l) {
    this.len = l;
    progress = 0;
  };

  this.changeLen = function (percent) {
    this.len *= percent;
    progress = 0;
  };

  this.setToDo = function (s) {
    this.todo = s;
  };

  this.setTheta = function (t) {
    this.theta = t;
  };
}
