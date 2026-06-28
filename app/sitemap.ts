import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://csreq.likosertugrul.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/app`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
