import { Link } from 'react-router-dom';
import { DocumentHead } from '../components/seo/DocumentHead';

export function NotFoundPage() {
  return (
    <>
      <DocumentHead
        title="Page Not Found – Our Childhood Archive"
        description="The requested page could not be found in the Our Childhood Digital Cultural Games Archive."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="font-mono text-xs text-[#6B6059] uppercase">404 · Page Not Found</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1E1A18] sm:text-4xl">
          This shelf of the archive is empty
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#4A413B]">
          The page you looked for does not exist or may have moved. You can return home or browse
          our documented games library.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
          >
            Return Home
          </Link>
          <Link
            to="/games"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            Open Games Library
          </Link>
        </div>
      </section>
    </>
  );
}
