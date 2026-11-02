import { Composition } from 'remotion'
import { DURATION, FPS } from './timeline'
import { YoridoIntro } from './YoridoIntro'

// YouTube 向けの 16:9（1920×1080）、50秒
export function Root() {
  return (
    <Composition id="YoridoIntro" component={YoridoIntro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
  )
}
