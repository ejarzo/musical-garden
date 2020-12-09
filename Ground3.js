function Ground3(color) {
  this.color = color;
  this.outputNode = new Tone.Gain().connect(OUTPUT_NODE);

  const musicScale = teoria.note("G4").scale("dorian");
  const notes = musicScale.notes();
  this.getSynth = (waveform) => {
    return new Tone.FMSynth({
      volume: -Infinity,
      oscillator: { type: waveform },
      modulationIndex: 0,
    });
  };

  this.renderGround = ({ x, y }, ctx_) => {
    const ctx = ctx_ || window;
    const [h, s, l] = this.color;
    ctx.fill(h, s, l + noise(x, y) * 6);
    const w = 100 + random(-15, 15);
    ctx.rect(x, y, w, w);
  };

  this.getDetune = (noiseVal) => {
    return 0;
  };

  let duration = 0;
  const part = new Tone.Part((time, value) => {
    const { synth, note, velocity, getNoteDuration } = value;
    synth.triggerAttackRelease(note, getNoteDuration(), time, velocity);
  }, []).start(1);
  part.loop = true;

  this.getPart = ({ sentence, synth, getState }) => {
    let noteDuration = 0.1;
    // synth.triggerAttack("A1");
    let modulationIndex = 0;
    const noteIndex = Math.floor(
      map(mouseY, 0, height, -2 * notes.length, 2 * notes.length)
    );
    const time = map(mouseX, 0, width, 0, 1);
    const startX = mouseX;
    part.add({
      synth,
      time,
      note: musicScale.get(noteIndex).toString(),
      velocity: 1,
      getNoteDuration: () => noteDuration,
    });
    part.loopEnd = 1;

    const part2 = new Tone.Loop((time) => {
      const { isGrowing } = getState();
      if (isGrowing) {
        noteDuration += 0.005;
        modulationIndex++;
        synth.set({ modulationIndex });
        noteDuration = constrain(noteDuration, 0.01, 1);
      } else {
        modulationIndex--;
      }
      modulationIndex = constrain(modulationIndex, 0, 20);
    }, 0.1);
    part2.start(1);

    return {
      getWiggle: () => {
        const startPos = map(startX, 0, width, 0, 1);
        const percent = part.progress + startPos;
        rect(startPos, 10, 100, 20);
        return (sin(percent * 2 * PI) + 1) * 50;
      },
    };
  };
}
