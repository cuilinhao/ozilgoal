import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/content/public-pages";
import { ludogoretsArticle as article, ludogoretsArticleUrl as url } from "@/content/ozil-ludogorets";
import "../blog.css";
import "@/components/ozil-goal/blog.css";
import "./article.css";

const imageUrl = `${SITE_URL}${article.image}`;

export function generateMetadata(): Metadata {
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    openGraph: {
      title: article.title, description: article.description, url,
      siteName: "Ozil Goal Generator", type: "article", locale: "en_US",
      publishedTime: article.datePublished, modifiedTime: article.datePublished,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [imageUrl] },
  };
}

export default function LudogoretsArticlePage() {
  const schema = {
    "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`,
    headline: article.title, description: article.description, url, mainEntityOfPage: url,
    datePublished: article.datePublished, dateModified: article.datePublished, inLanguage: "en",
    image: imageUrl,
    author: { "@type": "Organization", name: article.author, url: SITE_URL },
    publisher: { "@type": "Organization", name: "Ozil Goal Generator", url: SITE_URL },
    citation: Object.values(article.sources).map(source => source.url),
  };

  return <article className="geo-page blog-article ozil-blog ludogorets-article" lang="en">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="geo-header section-container">
      <nav className="geo-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Ozil Goal</Link><span aria-hidden="true">/</span><span aria-current="page">The Ludogorets goal</span>
      </nav>
      <p className="eyebrow">FOOTBALL HISTORY · THE ORIGINAL MOMENT</p>
      <h1>{article.title}</h1>
      <p className="geo-intro">A ball lifted over a goalkeeper, defenders left chasing, and a finish that looked almost unhurried. Özil&apos;s late winner in Sofia is memorable for the decisions before the shot as much as the shot itself. Here is the match behind the clip, and what makes the move worth watching closely.</p>
      <p className="geo-note blog-byline">By {article.author} · Published <time dateTime={article.datePublished}>16 October 2026</time></p>
      <figure className="ludogorets-cover">
        <img src={article.image} width="1200" height="630" alt={article.imageAlt} fetchPriority="high" />
        <figcaption>Original editorial match graphic by Ozil Goal Generator. This is an illustration of the scoreline, not a match photograph.</figcaption>
      </figure>
    </header>

    <nav className="section-container ozil-blog-contents" aria-label="Article contents"><strong>In this article</strong><ol>
      <li><a href="#the-match">The match and the comeback</a></li>
      <li><a href="#the-goal">How the winning goal unfolded</a></li>
      <li><a href="#why-it-matters">Why it stands out</a></li>
      <li><a href="#make-your-clip">Make an AI trend clip</a></li>
    </ol></nav>

    <section id="the-match" className="geo-section section-container">
      <h2>The Match: A 3–2 Comeback in the Champions League Group Stage</h2>
      <div className="geo-prose blog-prose">
        <p>On <time dateTime="2016-11-01">1 November 2016</time>, Arsenal visited Ludogorets for a UEFA Champions League Group A match in Sofia. The hosts led 2–0 through Jonathan Cafú and Claudiu Keșerü. Arsenal recovered through Granit Xhaka and Olivier Giroud, making it 2–2 before half-time.</p>
        <p>Özil supplied the decisive late goal to make the final score Ludogorets 2–3 Arsenal. The victory secured Arsenal&apos;s place in the last 16. The <a href={article.sources.match.url}>UEFA match report</a> records both the two-goal deficit and the turnaround.</p>
        <p>That context changes how the finish reads. It was a winner in a level game after a difficult start, with little time left to repair a missed chance. The patience on the ball becomes more striking when you keep that pressure in mind.</p>
      </div>
    </section>

    <section id="the-goal" className="geo-section section-container">
      <h2>The Goal: The Chip, the Defenders and the Finish</h2>
      <div className="geo-prose blog-prose">
        <p>Mohamed Elneny&apos;s forward pass sent Özil through. Goalkeeper Milan Borjan came out to meet him, but Özil lifted the ball over him and continued towards goal. He still had two recovering defenders to deal with before placing the ball into the net. The <a href={article.sources.sequence.url}>contemporary report from Sofia</a> describes that sequence.</p>
        <h3>Getting beyond the goalkeeper</h3>
        <p>The chip was a way past the first obstacle, rather than the final shot. It kept the move alive without forcing a finish through the goalkeeper. When watching the sequence, follow the ball after it drops: the scoring chance still needs another decision.</p>
        <h3>Making space before finishing</h3>
        <p>Beating Borjan did not leave a completely clear route. Özil used close control and changes of direction to evade the defenders arriving behind him. He made room for the finish before committing to it.</p>
        <p>The final touch is the quietest part of the move. By then, the difficult work has already happened. That contrast between the busy recovery around him and the simple finish gives the goal its distinctive rhythm.</p>
      </div>
    </section>

    <section id="why-it-matters" className="geo-section section-container">
      <h2>Why It Is Called One of His Best Goals</h2>
      <div className="geo-prose blog-prose">
        <p>Calling a goal a player&apos;s best is a judgment, not an official career ranking. There is, however, a concrete measure of the recognition this one received: UEFA&apos;s technical observers placed it sixth in their <a href={article.sources.technical.url}>top ten goals of the 2016/17 Champions League season</a>.</p>
        <h3>What makes this Özil goal iconic?</h3>
        <p>Our reading is that it tells a complete story in a few touches. The goalkeeper presents one problem; the recovering defenders present another. Each solution creates the next moment of suspense. You can understand the sequence without needing a long explanation of tactics or positioning.</p>
        <p>Among Özil&apos;s goals, this one offers a particularly clear example of composure as a finishing skill. Power and distance are easy to notice. Here, the appeal is the ability to wait for a better opening while the chance appears to be closing. Whether it is your favourite depends on what you value in a goal, but the case for remembering it is easy to make.</p>
      </div>
    </section>

    <section id="sources" className="geo-section section-container">
      <h2>Sources and Further Reading</h2>
      <p className="geo-note">Match facts were checked against UEFA. The explanation above is original editorial commentary; the reports below provide the historical record.</p>
      <ul className="blog-sources">{Object.values(article.sources).map(source => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}</ul>
    </section>

    <section id="make-your-clip" className="geo-cta section-container">
      <h2>Recreate the Goal Trend With Your Own Photo</h2>
      <p className="ludogorets-cta-copy">The real match is the starting point for a different kind of creative video. Read the <Link href="/ozil-goal-generator/ozil-goal-trend">Ozil Goal trend guide</Link> to understand the format, or use the generator to put your own photo into a football scene inspired by it.</p>
      <p className="ludogorets-cta-copy">The result is an AI-generated interpretation, not match footage or a guaranteed frame-for-frame recreation of the 2016 goal. Player movement, timing and details can vary.</p>
      <Link href="/ozil-goal-generator" className="pill-gradient-button">Make my AI goal video</Link>
      <p className="geo-note">Ozil Goal Generator is an independent AI creation service. It is not affiliated with or endorsed by Mesut Özil, Arsenal, Ludogorets, UEFA or any football club.</p>
    </section>
  </article>;
}
