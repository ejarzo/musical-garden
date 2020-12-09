function Ground4(color) {
  const musicScale = teoria.note("D").scale("minor");
  const notes = musicScale.notes();
  this.wiggleAmt = 0;
  this.color = color;
  this.outputNode = new Tone.Gain();
  this.outputNode2 = new Tone.Gain().chain(
    new Tone.Filter({ type: "lowpass", frequency: 14000 }),
    new Tone.Reverb({ decay: 10 }),
    OUTPUT_NODE
  );

  this.effects = new Tone.Distortion({ distortion: 0.1, wet: 0.5 });
  const reverb = new Tone.Reverb({ decay: 10, wet: 0.1 });
  const chorus = new Tone.Chorus();
  const effectsChannel = new Tone.Channel();
  effectsChannel.receive("ground-4-send");
  effectsChannel.chain(this.effects, chorus, reverb, OUTPUT_NODE);

  this.getSynth = (waveform) => {
    return new Tone.MembraneSynth({
      volume: -Infinity,
      oscillator: { type: waveform },
    });
  };

  this.renderGround = ({ x, y }, ctx_) => {
    const ctx = ctx_ || window;
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
    return noiseVal / 2;
  };

  this.getWiggleAmt = () => {
    return this.wiggleAmt;
  };

  this.getPart = ({ sentence, synthOutput, synth, getState }) => {
    this.effects.set({ frequency: random(0.1, 10) });
    let note = musicScale.get(Math.floor(random(0, notes.length * 3)));
    const durOptions = [0.5, 1 / 3, 2 / 3, 5 / 4, 2 / 5, 1, 2, 3, 4];
    const loopDuration = durOptions[Math.floor(random(0, durOptions.length))];
    const sendChannel = new Tone.Channel({ volume: 5 });
    let wiggle = 0;
    sendChannel.send("ground-4-send");
    // sendChannel.connect(effectsChannel);
    const dryOut = new Tone.Channel().connect(this.outputNode2);
    synthOutput.connect(sendChannel);
    synthOutput.fan(sendChannel, dryOut);

    synth.set({
      envelope: {
        attack: 0.001,
        decay: 1.4,
        release: 0.2,
      },
    });

    sendChannel.volume.rampTo(0, 0.5);
    dryOut.volume.rampTo(-Infinity, 0.5);
    const part = new Tone.Loop((time) => {
      wiggle = random(11, 800);
      synth.triggerAttack(note.fq() / 2, time);
      const { isGrowing } = getState();
      if (isGrowing) {
        synth.set({ pitchDecay: 0.5 });
        note = musicScale.get(Math.floor(random(0, notes.length * 3)));
      } else {
        synth.set({ pitchDecay: 0.05 });
      }
    }, loopDuration);

    part.start(0);

    return {
      getWiggle: () => wiggle,
      getStemWiggle: () => 1,
    };
  };
}
