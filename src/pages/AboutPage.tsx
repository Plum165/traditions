import { Link } from 'react-router-dom';
import { DocumentHead } from '../components/seo/DocumentHead';
import { ArchivalImage } from '../components/ui/ArchivalImage';

export function AboutPage() {
  return (
    <>
      <DocumentHead
        title="About the Archive – Our Childhood"
        description="Learn why the Our Childhood Digital Cultural Games Archive exists, our commitment to respecting different household traditions, and how the collection grows."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
                About the Project
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1E1A18] sm:text-4xl lg:text-5xl">
                Why we document the games of our childhood
              </h1>
              <p className="mt-4 max-w-xl text-base leading-[1.75] text-[#3F3833] sm:text-lg">
                Our Childhood is a long-term digital cultural archive built to preserve the games,
                house rules, and shared recreational traditions of Coloured communities across
                generations.
              </p>
            </div>

            <div className="lg:col-span-6">
              <ArchivalImage
                src="/src/assets/images/about_memory_table_1795614812611.jpg"
                alt="An open handwritten notebook beside playing cards and a warm teacup on an oak table in afternoon sunlight"
                caption="Illustrative photograph: Handwritten notes and playing cards gathered on a family table. Not an archival family photograph."
                isIllustrative
                aspectRatio="4/3"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-12">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
              Preserving knowledge that lives in memory
            </h2>
            <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724]">
              Many of the games we played growing up were never written down. They lived in the
              minds of cousins, grandparents, neighbours, and schoolyard friends. When people move
              away or generations pass, the smaller details—how many cards were dealt, what a game
              was called on a particular street, or how a tie was settled—can quietly disappear.
            </p>
            <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724]">
              By recording these games clearly, the archive gives younger generations a way to
              learn them and gives older generations a space to revisit familiar afternoons.
            </p>
          </div>

          <div className="border-t border-[#DDD4C7] pt-10">
            <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
              No single household owns the only version
            </h2>
            <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724]">
              Coloured communities are diverse, spanning different cities, towns, neighbourhoods,
              and family traditions. Two families living two streets apart may know the same game
              by different names or play it with different house rules.
            </p>
            <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724]">
              Because of that, this archive follows three strict editorial principles:
            </p>
            <ul className="mt-4 list-disc space-y-2.5 pl-5 text-base leading-relaxed text-[#2D2724]">
              <li>
                We treat documented rules as a recorded community or family version rather than a
                universal law.
              </li>
              <li>
                We clearly separate verified rules, personal recollections, and unresolved
                questions needing confirmation.
              </li>
              <li>
                We never invent historical claims, origins, or rule details just to make an entry
                appear complete.
              </li>
            </ul>
          </div>

          <div className="border-t border-[#DDD4C7] pt-10">
            <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
              How the archive grows
            </h2>
            <p className="mt-4 max-w-prose text-base leading-[1.75] text-[#2D2724]">
              Rather than launching with dozens of hurried summaries, the archive grows carefully
              with transparent, thoroughly structured entries—including{' '}
              <Link to="/games/sevens" className="font-medium text-[#7C2D36] underline underline-offset-4">
                Sevens
              </Link>
              ,{' '}
              <Link to="/games/porridge" className="font-medium text-[#7C2D36] underline underline-offset-4">
                Porridge (Sekaku)
              </Link>
              , and{' '}
              <Link to="/games/red-or-black" className="font-medium text-[#7C2D36] underline underline-offset-4">
                Red or Black
              </Link>
              , and{' '}
              <Link to="/games/go-fish" className="font-medium text-[#7C2D36] underline underline-offset-4">
                Go Fish
              </Link>
              . Every addition uses a shared template supporting card games, street games,
              playground games, and group traditions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/games"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
              >
                Browse Documented Games
              </Link>
              <Link
                to="/contribute"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
              >
                How to Contribute
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
