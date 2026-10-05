import Image from "next/image";
import Link from "next/link";

const stages = [
  {
    number: "01",
    title: "Start with something pure.",
    body:
      "We begin with raw soy wax — simple, natural and ready to become something more.",
    image: "/assets/handmade.jpg",
    alt: "Hands holding a block of candle wax",
    align: "text-left image-right",
  },
  {
    number: "02",
    title: "Shape it with our hands.",
    body:
      "This is where the making begins. The wax takes shape, the wick finds its place, and every piece slowly becomes a candle.",
    image: "/assets/candleprep.jpg",
    alt: "Hands preparing a candle mold and wick",
    align: "text-right image-left",
  },
  {
    number: "03",
    title: "Add the little things.",
    body:
      "Fragrance, colour, texture and the details that make each candle feel personal. Because the smallest touches can change the whole feeling.",
    image: "/assets/containercandle.png",
    alt: "Tweezers placing botanicals into a Lizardfy candle",
    align: "text-left image-right",
  },
  {
    number: "04",
    title: "Make it happen for real.",
    body:
      "And finally, something that started as raw wax becomes a candle made to be lit, gifted, remembered and enjoyed.",
    image: "/assets/gift.jpg",
    alt: "A handmade Lizardfy candle presented as a gift",
    align: "text-right image-left",
  },
];

export default function OurStoryPage() {
  return (
    <main className="story-page-shell">
      <header className="story-header-shell">
        <Link href="/" className="story-brand-link">
          Lizardfy
        </Link>

        <nav className="story-top-nav" aria-label="Our story navigation">
          <a href="#story">Our Story</a>
          <a href="#process">Process</a>
          <a href="#values">Values</a>
        </nav>
      </header>

      <section className="story-intro" id="story">
        <div className="story-intro-copy">
          <p className="story-kicker">THE LIZARDFY STORY</p>
          <h1>
            More than a candle,
            <span>it&apos;s a little piece of a moment.</span>
          </h1>
          <p className="story-intro-text">
            Every candle begins with something simple.
            A little wax, a little fragrance, a pair of hands —
            and an idea waiting to become real.
          </p>
          <p className="story-supporting-line">
            FROM RAW SOY TO SOMETHING MADE JUST FOR YOU.
          </p>
        </div>

        <div className="story-intro-visual">
          <Image
            src="/assets/candleholding.jpg"
            alt="Hands holding a candle while crafting it"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 52vw"
          />
        </div>
      </section>

      <section className="story-transition" id="process">
        <div className="story-transition-mark">✦</div>
        <p className="story-kicker story-kicker-center">OUR PROCESS</p>
        <h2>The journey of a candle</h2>
        <p className="story-transition-subtitle">
          Simple beginnings. Thoughtful hands. Something made to last.
        </p>
      </section>

      <section className="story-process" aria-label="Lizardfy candle process">
        {stages.map((stage) => (
          <article
            key={stage.number}
            className={`story-step ${stage.align}`}
          >
            <div className="story-step-copy">
              <span className="story-step-number">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </div>

            <div className="story-step-visual">
              <Image
                src={stage.image}
                alt={stage.alt}
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
          </article>
        ))}
      </section>

      <section className="story-closing" id="values">
        <p className="story-closing-line">Made by hand.</p>
        <p className="story-closing-line story-closing-line-second">
          Made for your moments.
        </p>

        <p className="story-closing-copy">
          Because every candle has a beginning.
          <br />
          Ours begins with the simple things —
          <br />
          and ends with something that feels like yours.
        </p>

        <div className="story-closing-actions">
          <Link href="/" className="story-primary-cta">
            EXPLORE OUR CANDLES
          </Link>
          <Link href="/" className="story-secondary-cta">
            CREATE YOUR OWN
          </Link>
        </div>
      </section>
    </main>
  );
}
