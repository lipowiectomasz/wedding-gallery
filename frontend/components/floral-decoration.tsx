import Image from 'next/image';
import { isFloralDecorationEnabled } from '@/lib/feature-flags';

type FloralDecorationProps = {
  position: 'top-right' | 'bottom-left' | 'bottom-right-mirrored';
};

const positionClasses: Record<FloralDecorationProps['position'], string> = {
  'top-right': 'top-[-10px] right-[-70px] w-[290px] opacity-85',
  'bottom-left': 'bottom-[-30px] left-[-70px] w-[230px] opacity-50',
  'bottom-right-mirrored': 'bottom-[-40px] right-[-80px] w-[250px] opacity-40 -scale-x-100',
};

const imageSource: Record<FloralDecorationProps['position'], string> = {
  'top-right': '/floral-top.png',
  'bottom-left': '/floral-corner.png',
  'bottom-right-mirrored': '/floral-corner.png',
};

export function FloralDecoration({ position }: FloralDecorationProps) {
  if (!isFloralDecorationEnabled()) {
    return null;
  }

  return (
    <Image
      src={imageSource[position]}
      alt=""
      width={290}
      height={290}
      className={`pointer-events-none absolute ${positionClasses[position]}`}
      priority={false}
    />
  );
}
