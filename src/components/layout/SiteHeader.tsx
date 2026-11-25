import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/games', label: 'Games' },
  { to: '/about', label: 'About' },
  { to: '/contribute', label: 'Contribute' },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    firstMobileLinkRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDD4C7] bg-[#FAF7F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Wordmark */}
        <Link
          to="/"
          className="font-serif text-lg font-semibold tracking-tight text-[#1E1A18] whitespace-nowrap shrink-0 transition-colors hover:text-[#7C2D36] sm:text-xl"
        >
          Our Childhood
        </Link>

        {/* Zone 2: Primary Navigation (Desktop) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#7C2D36] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#7C2D36]'
                    : 'text-[#4A413B] hover:text-[#1E1A18]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/games"
            className="hidden md:inline-flex items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2 text-sm font-medium text-[#FAF7F2] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#64222A]"
          >
            Browse Archive
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#DDD4C7] text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-[#DDD4C7] bg-[#FAF7F2] px-4 py-4 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((item, idx) => (
              <NavLink
                key={item.to}
                ref={idx === 0 ? firstMobileLinkRef : undefined}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EFE8DC] text-[#7C2D36]'
                      : 'text-[#2D2724] hover:bg-[#EFE8DC]/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 border-t border-[#DDD4C7] pt-3">
              <Link
                to="/games/sevens"
                className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2.5 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A]"
              >
                Read Sevens Rules
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
