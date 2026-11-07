import { Html5Audio, Sequence, staticFile } from "remotion";
import { cues } from "../cues.ts";

/** The track from the first frame, and every cue as a sound from `public/sfx`, starting on its frame. */
export function Sounds() {
  return (
    <>
      <Html5Audio src={staticFile("sfx/music.wav")} />
      {cues().map((cue) => (
        <Sequence key={`${cue.frame}-${cue.sound}`} from={cue.frame} durationInFrames={45} layout="none" name={cue.sound}>
          <Html5Audio src={staticFile(`sfx/${cue.sound}.wav`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
}
