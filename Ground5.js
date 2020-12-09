function Ground5(color) {
  this.color = color;
  this.outputNode = new Tone.Gain();
  this.outputNode2 = new Tone.Gain().chain(
    new Tone.Filter({ type: "lowpass", frequency: 1000 }),
    new Tone.Reverb({ decay: 10 }),
    OUTPUT_NODE
  );

  this.effects = new Tone.Vibrato(20, 1);
  const effectsChannel = new Tone.Channel();
  effectsChannel.receive("ground-5-send");
  effectsChannel.chain(this.effects, OUTPUT_NODE);

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
    ctx.fill(h, s, l + noise(x, y) * 16);
    ctx.rectMode(CENTER);
    ctx.rect(x, y, 100, 100);
  };

  this.getDetune = (noiseVal) => {
    return noiseVal * 10;
  };

  this.getPart = ({ sentence, synthOutput, synth, getState }) => {
    this.effects.set({ frequency: random(0.1, 10) });

    const sendChannel = new Tone.Channel();
    sendChannel.send("ground-5-send");
    // sendChannel.connect(effectsChannel);
    const dryOut = new Tone.Channel().connect(this.outputNode2);
    synthOutput.connect(sendChannel);
    synthOutput.fan(sendChannel, dryOut);

    synth.set({
      envelope: { attack: 2 },
    });

    synth.triggerAttack(parseInt(random(20, 1000)));

    const part = new Tone.Loop((time) => {
      const { isGrowing } = getState();
      if (isGrowing) {
        // sendAmount = 0;
        // sendAmount = constrain(sendAmount, -60, 0);
        sendChannel.volume.rampTo(0, 0.5);
        dryOut.volume.rampTo(-Infinity, 0.5);
      } else {
        sendChannel.volume.rampTo(-Infinity, 0.5);
        dryOut.volume.rampTo(0, 0.5);
      }
    }, 0.2);
    part.start();
    return part;
  };
}
