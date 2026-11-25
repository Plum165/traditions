import { useState } from 'react';
import { AlertCircle, ChevronDown, HelpCircle, Info } from 'lucide-react';
import type { ContentBlock, FaqItem } from '../../types/game';
import { ArchivalImage } from '../ui/ArchivalImage';
import { PlayingCardDiagram } from '../ui/PlayingCardDiagram';

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#DDD4C7] rounded-lg border border-[#DDD4C7] bg-[#F4EFE7]">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        const triggerId = `faq-trigger-${idx}`;

        return (
          <div key={item.question}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex min-h-[48px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-serif text-base font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC]/70 sm:text-lg"
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#6B6059] transition-transform duration-150 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="border-t border-[#E6DED2] bg-[#FAF7F2] px-5 py-4 text-sm leading-relaxed text-[#3F3833] sm:text-base"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={`p-${index}`}
                className="max-w-prose text-base leading-[1.75] text-[#2D2724]"
              >
                {block.text}
              </p>
            );

          case 'ordered-list':
            return (
              <ol key={`ol-${index}`} className="space-y-4">
                {block.items.map((item, stepIndex) => (
                  <li
                    key={`step-${stepIndex}`}
                    className="flex gap-4 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#CFC4B4] bg-[#FAF7F2] font-mono text-xs font-medium text-[#7C2D36] tabular-nums"
                      aria-hidden="true"
                    >
                      {String(stepIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      {item.title && (
                        <h4 className="font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
                          {item.title}
                        </h4>
                      )}
                      <p
                        className={`text-sm leading-relaxed text-[#3F3833] sm:text-base ${
                          item.title ? 'mt-1' : ''
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            );

          case 'unordered-list':
            return (
              <ul
                key={`ul-${index}`}
                className="list-disc space-y-2 pl-5 text-base leading-relaxed text-[#2D2724]"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`li-${itemIdx}`}>{item}</li>
                ))}
              </ul>
            );

          case 'table':
            return (
              <div
                key={`table-${index}`}
                className="my-4 overflow-hidden rounded-lg border border-[#DDD4C7] bg-[#FAF7F2]"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                    {block.caption && (
                      <caption className="border-b border-[#DDD4C7] bg-[#F4EFE7] px-4 py-3 text-left text-xs font-medium text-[#524943]">
                        {block.caption}
                      </caption>
                    )}
                    <thead>
                      <tr className="border-b border-[#DDD4C7] bg-[#F4EFE7]/70 text-xs font-semibold tracking-wide text-[#4A413B] uppercase">
                        {block.headers.map((header) => (
                          <th key={header} scope="col" className="px-4 py-3">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6DED2]">
                      {block.rows.map((row, rowIdx) => (
                        <tr key={`row-${rowIdx}`} className="align-top">
                          {row.map((cell, cellIdx) => (
                            <td
                              key={`cell-${rowIdx}-${cellIdx}`}
                              className={`px-4 py-3 text-[#2D2724] tabular-nums ${
                                cellIdx === 0 ? 'font-medium text-[#1E1A18]' : ''
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case 'card-example':
            return (
              <PlayingCardDiagram
                key={`cards-${index}`}
                title={block.title}
                description={block.description}
                cards={block.cards}
                caption={block.caption}
              />
            );

          case 'callout': {
            const Icon =
              block.variant === 'warning'
                ? AlertCircle
                : block.variant === 'unconfirmed'
                  ? HelpCircle
                  : Info;

            const surfaceClass =
              block.variant === 'unconfirmed'
                ? 'border-[#C8B08A] bg-[#F6EFE2]'
                : block.variant === 'warning'
                  ? 'border-[#C9A4A8] bg-[#F8F0F0]'
                  : 'border-[#DDD4C7] bg-[#F4EFE7]';

            const iconColor =
              block.variant === 'unconfirmed'
                ? 'text-[#7B5218]'
                : block.variant === 'warning'
                  ? 'text-[#7C2D36]'
                  : 'text-[#4A413B]';

            return (
              <aside
                key={`callout-${index}`}
                className={`rounded-lg border p-5 ${surfaceClass}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif text-base font-semibold text-[#1E1A18]">
                      {block.title}
                    </h4>
                    {block.text && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#3F3833] sm:text-base">
                        {block.text}
                      </p>
                    )}
                    {block.items && block.items.length > 0 && (
                      <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#3F3833] sm:text-base">
                        {block.items.map((item, idx) => (
                          <li key={`c-item-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </aside>
            );
          }

          case 'image':
            return (
              <ArchivalImage
                key={`img-${index}`}
                src={block.src}
                alt={block.alt}
                caption={block.caption}
                isIllustrative={block.isIllustrative}
              />
            );

          case 'faq':
            return <FaqAccordion key={`faq-${index}`} items={block.items} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
