import { useEffect } from 'react';

const SEOHead = ({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title 
      ? `${title} | Goldy Mart` 
      : "Goldy Mart - India's #1 Agricultural & Food Processing Equipment";
    document.title = fullTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) ogDescription.setAttribute('content', description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) ogImage.setAttribute('content', image);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && url) ogUrl.setAttribute('content', url);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', type);

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) twitterDescription.setAttribute('content', description);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && image) twitterImage.setAttribute('content', image);

  }, [title, description, keywords, image, url, type]);

  return null;
};

export default SEOHead;
