import { ExternalLink } from 'lucide-react';
import { VideoCard } from '@/components/video-card';
import { ozilGoalExamples } from '@/content/ozil-goal-examples';

export function OzilGoalExamples() {
  return <section id="video-examples" className="reference-examples-section og-examples-section" aria-labelledby="ozil-video-examples-title">
    <div className="og-container">
      <header className="reference-examples-intro">
        <p className="reference-examples-eyebrow">One goal, endless versions</p>
        <h2 id="ozil-video-examples-title">Ozil Goal AI video examples</h2>
        <p className="reference-examples-description">One photo in, a 15-second 9:16 clip out — no app, no prompt. Explore these trend references from other creators, with links to their original sources. Reference clips vary in length and style. Copyright stays with the original creators; contact us to have a clip removed.</p>
      </header>
      <div className="reference-landscape-grid og-examples-grid">
        {ozilGoalExamples.map(example => <figure key={example.id} className={`reference-example reference-example-${example.orientation}`}>
          <VideoCard src={example.src} poster={example.poster} label={example.title} portrait={example.orientation === 'portrait'} previewOnVisible />
          <figcaption>
            <h3>{example.title}</h3>
            <a href={example.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
              Trend reference — the kind of clip people are making right now · Source: {example.sourceName}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}
