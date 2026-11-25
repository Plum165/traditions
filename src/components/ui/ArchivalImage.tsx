import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ArchivalImageProps {
  src: string;
  alt: string;
  caption?: string;
  isIllustrative?: boolean;
  aspectRatio?: '16/9' | '4/3' | '3/2';
  priority?: boolean;
  className?: string;
}

const ASPECT_CLASSES: Record<NonNullable<ArchivalImageProps['aspectRatio']>, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
};

export function ArchivalImage({
  src,
  alt,
  caption,
  isIllustrative = true,
  aspectRatio = '4/3',
  priority = false,
  className = '',
}: ArchivalImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className={`m-0 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-lg border border-[#DDD4C7] bg-[#EFE8DC] ${ASPECT_CLASSES[aspectRatio]}`}
      >
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F3ECE1] to-[#E5DAC8] p-6 text-center text-[#5A5049]"
          >
            <ImageIcon className="h-8 w-8 text-[#7C2D36]/70" aria-hidden="true" />
            <p className="max-w-sm text-sm font-medium text-[#2D2724]">{alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs leading-relaxed text-[#6B6059]">
          {isIllustrative && (
            <span className="font-medium text-[#4A413B]">Illustrative media · </span>
          )}
          <span className="italic">{caption.replace(/^Illustrative photograph:\s*/i, '')}</span>
        </figcaption>
      )}
    </figure>
  );
}
