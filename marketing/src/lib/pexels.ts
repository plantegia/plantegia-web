// Pexels API utility for fetching hero images

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

export async function searchPexelsImages(
  query: string,
  apiKey: string,
  perPage: number = 15
): Promise<PexelsPhoto[]> {
  const url = `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}`;

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data: PexelsSearchResponse = await response.json();
  return data.photos;
}

export function getRandomPhoto(photos: PexelsPhoto[]): PexelsPhoto | null {
  if (photos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * photos.length);
  return photos[randomIndex];
}
