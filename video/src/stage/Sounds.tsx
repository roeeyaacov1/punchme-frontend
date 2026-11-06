import { Html5Audio, Sequence, staticFile } from "remotion";
import { cues } from "../cues.ts";

/** Every cue as a sound from `public/sfx`, starting on its frame. */
export function Sounds() {
  return (
    <>
      {cues().map((cue) => (
        <Sequence key={`${cue.frame}-${cue.sound}`} from={cue.frame} durationInFrames={45} layout="none" name={cue.sound}>
          <Html5Audio src={staticFile(`sfx/${cue.sound}.wav`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
}
