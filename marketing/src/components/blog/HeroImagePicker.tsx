import { useState, useCallback } from 'react';
import { searchPexelsImages, getRandomPhoto, type PexelsPhoto } from '../../lib/pexels';
import { COLORS } from '../../styles/tokens';

interface Props {
  initialSrc: string;
  searchQuery: string;
  alt?: string;
}

export default function HeroImagePicker({ initialSrc, searchQuery, alt = '' }: Props) {
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastUrl, setToastUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isDev = import.meta.env.DEV;
  const apiKey = import.meta.env.PUBLIC_PEXELS_API_KEY;

  const handleReload = useCallback(async () => {
    if (!apiKey) {
      setError('PEXELS_API_KEY not configured');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const photos = await searchPexelsImages(searchQuery, apiKey);
      const photo = getRandomPhoto(photos);

      if (photo) {
        const newUrl = photo.src.large2x;
        setCurrentSrc(newUrl);
        setToastUrl(newUrl);
        setShowToast(true);
      } else {
        setError('No images found');
        setShowToast(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, apiKey]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(toastUrl);
  }, [toastUrl]);

  const closeToast = useCallback(() => {
    setShowToast(false);
    setError(null);
  }, []);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={currentSrc}
        alt={alt}
        style={{
          width: '100%',
          maxHeight: '300px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />

      {/* Reload button - only in dev mode */}
      {isDev && (
        <button
          onClick={handleReload}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isHovered ? 0.8 : 0.3,
            transition: 'opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
          title={`Reload image (search: "${searchQuery}")`}
        >
          {isLoading ? '...' : '\u21BB'}
        </button>
      )}

      {/* Toast with URL */}
      {isDev && showToast && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            background: error ? COLORS.danger : COLORS.backgroundDark,
            border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            fontFamily: '"Space Mono", monospace',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: COLORS.textMuted }}>
              {error ? 'Error' : 'New image URL:'}
            </span>
            <button
              onClick={closeToast}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.textMuted,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '14px',
              }}
            >
              x
            </button>
          </div>
          {error ? (
            <div style={{ color: '#fff', marginTop: '4px' }}>{error}</div>
          ) : (
            <div style={{ marginTop: '4px' }}>
              <input
                type="text"
                value={toastUrl}
                readOnly
                style={{
                  width: '100%',
                  background: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '2px',
                  padding: '4px 8px',
                  color: COLORS.text,
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '10px',
                  marginBottom: '4px',
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  background: COLORS.green,
                  border: 'none',
                  borderRadius: '2px',
                  padding: '4px 8px',
                  color: COLORS.text,
                  cursor: 'pointer',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '10px',
                }}
              >
                Copy URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
