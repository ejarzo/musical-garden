// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// LSystem Rule class

function Rule(a_, bs_) {
  this.a = a_;
  this.bVals = bs_;

  this.getA = function () {
    return this.a;
  };

  // select B based on assigned weights
  this.getB = () => {
    const indexes = [];
    this.bVals &&
      this.bVals.forEach(({ value, weight }, index) => {
        for (let i = 0; i < weight; i++) {
          indexes.push(index);
        }
      });

    const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
    return this.bVals[randomIndex].value;
  };
}
