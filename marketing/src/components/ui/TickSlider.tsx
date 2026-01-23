import { COLORS, FONT } from '../../styles/tokens';

interface TickSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
  showTicks?: boolean;
  tickInterval?: number; // show tick label every N steps
}

export default function TickSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = '',
  showTicks = true,
  tickInterval = 1,
}: TickSliderProps) {
  const totalSteps = Math.floor((max - min) / step);
  const percentage = ((value - min) / (max - min)) * 100;

  const ticks: number[] = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const rawValue = min + percent * (max - min);
    const snappedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, snappedValue));
    onChange(clampedValue);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: FONT.sizeSmall,
            fontFamily: FONT.family,
            color: COLORS.textMuted,
          }}
        >
          {label}
        </label>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Slider container */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Track background */}
          <div
            onClick={handleTrackClick}
            style={{
              height: '8px',
              backgroundColor: COLORS.background,
              borderRadius: '4px',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Track fill */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${percentage}%`,
                backgroundColor: COLORS.green,
                borderRadius: '4px',
                transition: 'width 0.1s ease-out',
              }}
            />

            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `${percentage}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: COLORS.green,
                borderRadius: '50%',
                border: `2px solid ${COLORS.text}`,
                cursor: 'grab',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'left 0.1s ease-out',
                touchAction: 'none',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const track = e.currentTarget.parentElement;
                if (!track) return;

                const onMove = (moveEvent: MouseEvent) => {
                  const rect = track.getBoundingClientRect();
                  const x = moveEvent.clientX - rect.left;
                  const percent = Math.max(0, Math.min(1, x / rect.width));
                  const rawValue = min + percent * (max - min);
                  const snappedValue = Math.round(rawValue / step) * step;
                  const clampedValue = Math.max(min, Math.min(max, snappedValue));
                  onChange(clampedValue);
                };

                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };

                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const track = e.currentTarget.parentElement;
                if (!track) return;

                const onMove = (moveEvent: TouchEvent) => {
                  moveEvent.preventDefault();
                  const touch = moveEvent.touches[0];
                  const rect = track.getBoundingClientRect();
                  const x = touch.clientX - rect.left;
                  const percent = Math.max(0, Math.min(1, x / rect.width));
                  const rawValue = min + percent * (max - min);
                  const snappedValue = Math.round(rawValue / step) * step;
                  const clampedValue = Math.max(min, Math.min(max, snappedValue));
                  onChange(clampedValue);
                };

                const onEnd = () => {
                  document.removeEventListener('touchmove', onMove);
                  document.removeEventListener('touchend', onEnd);
                };

                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
              }}
            />
          </div>

          {/* Ticks */}
          {showTicks && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                paddingLeft: '2px',
                paddingRight: '2px',
              }}
            >
              {ticks.map((tick, i) => {
                const showLabel = i % tickInterval === 0;
                const isActive = tick <= value;
                return (
                  <div
                    key={tick}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '1px',
                      position: 'relative',
                    }}
                  >
                    {/* Tick mark */}
                    <div
                      style={{
                        width: '2px',
                        height: showLabel ? '8px' : '4px',
                        backgroundColor: isActive ? COLORS.green : COLORS.muted,
                        transition: 'background-color 0.1s',
                      }}
                    />
                    {/* Tick label */}
                    {showLabel && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: FONT.family,
                          color: isActive ? COLORS.text : COLORS.textMuted,
                          marginTop: '2px',
                          transition: 'color 0.1s',
                        }}
                      >
                        {tick}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Value display */}
        <div
          style={{
            minWidth: '48px',
            padding: '8px 12px',
            backgroundColor: COLORS.background,
            borderRadius: '4px',
            textAlign: 'center',
            fontFamily: FONT.family,
            fontSize: FONT.sizeBase,
            fontWeight: 'bold',
            color: COLORS.text,
          }}
        >
          {value}
          {unit && <span style={{ fontSize: FONT.sizeSmall, marginLeft: '2px' }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}
