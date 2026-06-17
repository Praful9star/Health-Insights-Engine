import { Helmet } from "react-helmet-async";

const BASE_URL = "https://curecheck.in";
const DEFAULT_IMAGE = `${BASE_URL}/opengraph.jpg`;
const SITE_NAME = "CureCheck";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
}

export default function PageMeta({ title, description, path, image = DEFAULT_IMAGE, imageAlt }: PageMetaProps) {
  const canonical = `${BASE_URL}${path}`;
  const alt = imageAlt ?? title;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={alt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={alt} />
    </Helmet>
  );
}

export { BASE_URL };
