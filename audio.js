Tone.context.latencyHint = "playbackrate";
Tone.Transport.start();

const outputGain = 0.3;
const OUTPUT_NODE = new Tone.Gain(outputGain);
const limiter = new Tone.Limiter();
const compressor = new Tone.Compressor();
OUTPUT_NODE.chain(compressor, limiter, Tone.Destination);
