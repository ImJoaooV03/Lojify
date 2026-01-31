import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  storeName?: string;
}

export function SEO({ title, description, image, url, storeName = 'Lojify' }: SEOProps) {
  const pageTitle = `${title} | ${storeName}`;
  const defaultDescription = `Confira os melhores produtos em ${storeName}.`;
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Basic */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={storeName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
