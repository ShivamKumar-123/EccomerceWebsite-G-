/**
 * Image with native lazy loading; use priority for above-the-fold hero / main product image.
 * @param {{
 *   src: string,
 *   alt?: string,
 *   className?: string,
 *   priority?: boolean,
 * } & Omit<import('react').ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'decoding' | 'fetchPriority'>
 * } props
 */
export default function LazyImage({ src, alt = '', className = '', priority = false, ...rest }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
