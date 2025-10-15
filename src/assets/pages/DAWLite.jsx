import * as Tone from "tone";

export default function DAWLite() {
  const play = () => {
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease("C4", "8n");
  };
  return (
    <div>
      <h1>DAW-Lite Mode</h1>
      <button onClick={play}>Play Sound</button>
    </div>
  );
}
