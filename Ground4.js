function Ground4(color) {
  this.color = color;
  this.outputNode = new Tone.Gain().connect(OUTPUT_NODE);

  const musicScale = teoria.note("G4").scale("dorian");
  const notes = musicScale.notes();

  this.renderGround = ({ x, y }, ctx_) => {
    const ctx = ctx_ || window;
    // const w = 100 + random(-15, 15);
    const [h, s, l] = this.color;
    ctx.fill(h, s, l + noise(x, y) * 6);
    ctx.beginShape();
    ctx.vertex(x, y + 150);
    ctx.vertex(x + 100, y);
    ctx.vertex(x, y - 150);
    ctx.vertex(x - 50, y);
    ctx.endShape(CLOSE);
  };

  this.getDetune = (noiseVal) => {
    return 0;
  };

  this.getPart = ({ sentence, synth, getState }) => {};
}
