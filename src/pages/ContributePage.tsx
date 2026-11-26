import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { DocumentHead } from '../components/seo/DocumentHead';

const CONTRIBUTION_TEMPLATE_TEXT = `OUR CHILDHOOD ARCHIVE – CONTRIBUTION NOTES
------------------------------------------
1. Contribution Type: [New Game / Rule Correction / Alternative Rules / Memory / Photo]
2. Game Name (and any other names used):
3. Where & When You Played It (optional neighbourhood/town/decade):
4. Players & Equipment Needed:
5. How to Play (step by step, in your own words):
6. Things You Are Unsure About (so we mark them for confirmation):
7. A Memory or Story Connected to the Game (optional):
8. Attribution Preference: [Credit my name / Keep anonymous]`;

const WAYS_TO_CONTRIBUTE = [
  {
    title: '01. Submit a Childhood Game',
    description:
      'Share a card game, street game, playground game, or group activity you grew up playing, including equipment, setup, and how rounds end.',
  },
  {
    title: '02. Suggest Corrections',
    description:
      'Spot something unclear or incomplete in a published entry—or help answer open confirmation questions on entries like Sevens, Porridge (Sekaku), or Red or Black.',
  },
  {
    title: '03. Share Alternative House Rules',
    description:
      'Tell us how your household handled dealing, scoring, Jokers, or penalties so both versions can be preserved side by side.',
  },
  {
    title: '04. Share Childhood Memories',
    description:
      'Games live in stories—who taught you, where you played, and the friendly arguments that happened along the way.',
  },
  {
    title: '05. Suggest Alternative Names',
    description:
      'Many games travelled under different names across communities. Recording local names helps people find the games they remember.',
  },
  {
    title: '06. Offer Authentic Photographs',
    description:
      'Where appropriate and with permission, genuine family or neighbourhood photographs can help document real tools and spaces of play.',
  },
];

export function ContributePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(CONTRIBUTION_TEMPLATE_TEXT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <DocumentHead
        title="Contribute – Our Childhood Digital Cultural Games Archive"
        description="Learn how to submit a childhood game, share alternative house rules, suggest corrections, or contribute family memories to the Our Childhood archive."
      />

      <section className="border-b border-[#DDD4C7] bg-[#F4EFE7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
            Community Documentation
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1E1A18] sm:text-4xl lg:text-5xl">
            Contribute to the archive
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.75] text-[#3F3833] sm:text-lg">
            Every documented game relies on real people sharing what they remember. Whether you know
            a whole game or just one house rule from your grandmother’s kitchen table, your notes
            matter.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
          Six ways you can help
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WAYS_TO_CONTRIBUTE.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4A413B]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Honest Explanation of Current Phase & Preparation Guide */}
        <div
          id="share-variation"
          className="mt-14 scroll-mt-24 grid gap-8 border-t border-[#DDD4C7] pt-12 lg:grid-cols-12"
        >
          <div className="lg:col-span-6">
            <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
              How Submissions Work Right Now
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
              Editorial review before publication
            </h2>
            <p className="mt-4 text-base leading-[1.75] text-[#2D2724]">
              In this initial release, the archive does not yet have an automated web submission
              database. Rather than placing a dummy form that goes nowhere, we are building a
              moderated contribution workflow in the next phase so every submission is carefully
              reviewed, verified for clarity, and credited accurately.
            </p>
            <p className="mt-4 text-base leading-[1.75] text-[#2D2724]">
              In the meantime, you can prepare your notes using the checklist outline alongside—and
              check the open confirmation questions on{' '}
              <Link
                to="/games/sevens#rules-requiring-confirmation"
                className="font-medium text-[#7C2D36] underline underline-offset-4"
              >
                Sevens
              </Link>
              ,{' '}
              <Link
                to="/games/porridge#rules-requiring-confirmation"
                className="font-medium text-[#7C2D36] underline underline-offset-4"
              >
                Porridge (Sekaku)
              </Link>
              , or{' '}
              <Link
                to="/games/red-or-black#rules-requiring-confirmation"
                className="font-medium text-[#7C2D36] underline underline-offset-4"
              >
                Red or Black
              </Link>{' '}
              to help verify community rules.
            </p>
          </div>

          <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-5 sm:p-6 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD4C7] pb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                  Contribution Notes Outline
                </h3>
                <p className="text-xs text-[#6B6059]">
                  Helpful structure for recording a game or house rule
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#14532D]" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Outline</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#2D2724]">
              {CONTRIBUTION_TEMPLATE_TEXT}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
