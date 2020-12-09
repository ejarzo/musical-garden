function Ground2(color) {
  this.color = color;

  let currentChordRoot = 1;
  this.reverb = new Tone.FeedbackDelay(0.4, 0.5);
  const reverbChannel = new Tone.Channel();
  reverbChannel.receive("ground-2-send");
  reverbChannel.chain(this.reverb, OUTPUT_NODE);

  this.outputNode = new Tone.Gain(2);
  this.outputNode.chain(OUTPUT_NODE);

  const musicScale = teoria.note("D").scale("minor");
  const notes = musicScale.notes();

  const updateChordLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.9) {
      currentChordRoot = Math.floor(random(0, 8));
    }
  }, 1);

  updateChordLoop.start(0);

  const getChord = () => [
    musicScale.get(currentChordRoot),
    musicScale.get(currentChordRoot + 2),
    musicScale.get(currentChordRoot + 4),
    musicScale.get(currentChordRoot + 6),
  ];

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
    ctx.beginShape();
    const [h, s, l] = this.color;
    ctx.fill(h, s, l + noise(x, y) * 6);
    ctx.vertex(x, y + 100);
    ctx.vertex(x + 90, y + 100);
    ctx.vertex(x + 50, y - 20);
    ctx.endShape(CLOSE);
  };

  this.getDetune = (noiseVal) => {
    const val = noiseVal * 0.6;
    return val - val / 2;
  };

  this.getPart = ({ sentence, synth, synthOutput, getState }) => {
    const { growSpeed } = getState();
    let sendAmount = -60;

    let filterFreq = 50;

    const sendChannel = new Tone.Channel();
    sendChannel.send("ground-2-send", sendAmount);
    sendChannel.connect(reverbChannel);

    synthOutput.connect(sendChannel);

    synth.set({
      portamento: random(0, 1),
      envelope: { attack: 0.4 },
      filter: { type: "lowpass", frequency: filterFreq, gain: 1, q: 15 },
      filterEnvelope: { baseFrequency: filterFreq },
    });

    const chordIndex = Math.floor(random(0, getChord().length));

    const octave = Math.floor(random(1, 4));

    let currLetterIndex = 0;
    let currNoteIndex = Math.floor(
      random(0, musicScale.notes().length * 3) / 2
    );

    const part = new Tone.Loop((time) => {
      const note = getChord()[chordIndex];
      const { isGrowing, isDoneGrowing, maxLetters } = getState();
      synth.triggerAttack((note.fq() * 2) / octave, time + 0.1, 0.1);

      if (isDoneGrowing) {
        sendAmount += 5;
        sendAmount = constrain(sendAmount, -60, 0);
        sendChannel.send("ground-2-send", sendAmount);
      }

      if (!isGrowing) {
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

        currLetterIndex++;
        currLetterIndex = currLetterIndex % maxLetters;
      } else {
        // while being watered
        filterFreq *= 2;
        filterFreq = constrain(filterFreq, 20, 20000);
        synth.set({
          filter: { type: "lowpass", frequency: filterFreq },
          filterEnvelope: { baseFrequency: filterFreq },
        });
        if (!isDoneGrowing) {
          // synth.triggerAttackRelease(
          //   getRandomNoteInChord().toString(),
          //   time + 0.1,
          //   0.1
          // );
        }
      }
    }, 1 / growSpeed);

    part.start();
    return part;
  };
}
