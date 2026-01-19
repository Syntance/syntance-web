'use client';

import Image, { ImageProps } from 'next/image';

interface ImageSmartProps extends ImageProps {
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
}

export default function ImageSmart(props: ImageSmartProps) {
  const { loading, decoding, sizes, ...rest } = props;
  
  return (
    <Image
      {...rest}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px'}
    />
  );
}
