function Ground1(color) {
  this.color = color;
  const musicScale = teoria.note("G4").scale("dorian");
  const notes = musicScale.notes();

  const getRandomNote = () =>
    musicScale.get(Math.floor(random(0, notes.length * 2)));

  this.outputNode = new Tone.Gain(0.1);
  const compressor = new Tone.Compressor();
  this.outputNode.chain(compressor, OUTPUT_NODE);

  this.getSynth = (waveform) => {
    return new Tone.MonoSynth({
      volume: -Infinity,
      oscillator: { type: waveform },
      envelope: { attack: 0.01 },
      filter: {
        type: "lowpass",
        frequency: 20000,
        rolloff: -12,
        Q: 1,
        gain: 0,
      },
      filterEnvelope: {
        attack: 0.1,
        baseFrequency: 20000,
        decay: 0.2,
        exponent: 2,
        octaves: 3,
        release: 2,
        sustain: 0.5,
      },
    });
  };

  this.renderGround = ({ x, y }, ctx_) => {
    const ctx = ctx_ || window;
    const [h, s, l] = this.color;
    ctx.fill(h, s, l + noise(x, y) * 6);
    const r = 100 + random(-15, 15);
    ctx.ellipse(x, y, r, r);
  };

  this.getDetune = (noiseVal) => {
    // const val = noiseVal;
    return 0;
  };

  this.getPart = ({ sentence, synth, getState }) => {
    synth.set({
      envelope: { attack: 0.4, release: 0.4 },
      filter: { type: "lowpass", frequency: 15000, gain: 1 },
      filterEnvelope: { baseFrequency: 15000, attack: 0.3 },
    });

    const { growSpeed } = getState();
    let currLetterIndex = 0;
    let currNoteIndex = Math.floor(random(0, notes.length * 3) / 2);

    const part = new Tone.Loop((time) => {
      const { isGrowing, isDoneGrowing, maxLetters } = getState();
      const t = time + 0.1;
      console.log(t);
      if (maxLetters === 0) {
        const note = musicScale.get(currNoteIndex);

        synth.triggerAttackRelease(note.toString(), t, 0.5);
      } else if (!isGrowing) {
        const currLetter = sentence[currLetterIndex];
        // if (currLetterIndex === 0) {
        //   currNoteIndex = 0;
        // }
        if (currLetter === "-") {
          currNoteIndex--;
        }
        if (currLetter === "+") {
          currNoteIndex++;
        }
        const note = musicScale.get(currNoteIndex);
        // console.log(currNoteIndex);
        synth.triggerAttackRelease(note.toString(), t, 0.5);

        currLetterIndex++;
        // currLetterIndex = currLetterIndex % maxLetters;
      } else {
        if (!isDoneGrowing) {
          currNoteIndex = Math.floor(random(0, notes.length * 3) / 2);
          synth.triggerAttackRelease(
            musicScale.get(currNoteIndex).toString(),
            t,
            0.1
          );
        }
      }
    }, 1 / (5 * growSpeed));

    part.start(1);

    return part;
  };
}
