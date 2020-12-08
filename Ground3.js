function Ground3(color) {
  this.color = color;
  this.outputNode = new Tone.Gain().connect(OUTPUT_NODE);

  const musicScale = teoria.note("G4").scale("dorian");
  const notes = musicScale.notes();

  this.renderGround = ({ x, y }, ctx_) => {
    const ctx = ctx_ || window;
    ctx.fill(200, 10, 20 + noise(x, y) * 6);
    const w = 100 + random(-15, 15);
    ctx.rect(x, y, w, w);
  };

  this.getDetune = (noiseVal) => {
    return 0;
  };
  this.getPart = ({ sentence, synth, getState }) => {};
}
