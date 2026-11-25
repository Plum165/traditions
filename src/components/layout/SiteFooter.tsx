import { Link } from 'react-router-dom';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#DDD4C7] bg-[#F4EFE7]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link
              to="/"
              className="font-serif text-xl font-semibold tracking-tight text-[#1E1A18]"
            >
              Our Childhood
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#524943]">
              A long-term digital cultural archive dedicated to documenting and preserving
              Coloured childhood games, neighbourhood traditions, and family house rules across
              generations.
            </p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-[#6B6059]">
              Every household remembers a game slightly differently. Documented entries reflect
              recorded community versions rather than a single universal rulebook.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
              Archive
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/games" className="text-[#2D2724] hover:text-[#7C2D36]">
                  Games Library
                </Link>
              </li>
              <li>
                <Link to="/games/sevens" className="text-[#2D2724] hover:text-[#7C2D36]">
                  Sevens (First Entry)
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#2D2724] hover:text-[#7C2D36]">
                  About the Project
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
              Community
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/contribute" className="text-[#2D2724] hover:text-[#7C2D36]">
                  How to Contribute
                </Link>
              </li>
              <li>
                <Link
                  to="/contribute#share-variation"
                  className="text-[#2D2724] hover:text-[#7C2D36]"
                >
                  Share House Rules
                </Link>
              </li>
              <li>
                <Link
                  to="/games/sevens#rules-requiring-confirmation"
                  className="text-[#2D2724] hover:text-[#7C2D36]"
                >
                  Open Rule Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#DDD4C7] pt-6 text-xs text-[#6B6059] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Our Childhood – Digital Cultural Games Archive.</p>
          <p>Preserving memory, one game at a time.</p>
        </div>
      </div>
    </footer>
  );
}
