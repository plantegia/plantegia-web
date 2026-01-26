import { COLORS } from '../../constants';
import { isLightOnAtHour, toggleHour, formatSchedule } from '../../utils/lightSchedule';

interface LightScheduleEditorProps {
  schedule: number;
  onChange: (schedule: number) => void;
}

// Colors for light/dark states
const LIGHT_ON_COLOR = '#F7DC6F';  // Gold/yellow - matches SPACE_COLORS
const LIGHT_OFF_COLOR = COLORS.backgroundDark;

export function LightScheduleEditor({ schedule, onChange }: LightScheduleEditorProps) {
  // 390px viewport - need to fit 24 hours
  // Each hour cell: ~14px width to fit within container
  const cellWidth = 14;
  const cellHeight = 28;
  const currentHour = new Date().getHours();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      {/* Header with label and format */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}>
        <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Light:</span>
        <span style={{ color: COLORS.teal, fontWeight: 'bold' }}>
          {formatSchedule(schedule)}
        </span>
      </div>

      {/* Hour toggle grid */}
      <div style={{
        display: 'flex',
        gap: 1,
        marginBottom: 4,
      }}>
        {hours.map((hour) => {
          const isLight = isLightOnAtHour(schedule, hour);
          const isCurrentHour = hour === currentHour;

          return (
            <button
              className="btn-tool"
              key={hour}
              onClick={() => onChange(toggleHour(schedule, hour))}
              style={{
                width: cellWidth,
                height: cellHeight,
                minWidth: cellWidth,
                padding: 0,
                border: isCurrentHour
                  ? `2px solid ${COLORS.orange}`
                  : `1px solid ${COLORS.border}`,
                background: isLight ? LIGHT_ON_COLOR : LIGHT_OFF_COLOR,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                boxSizing: 'border-box',
              }}
              title={`${hour}:00 - ${isLight ? 'Light ON' : 'Dark'}`}
            />
          );
        })}
      </div>

      {/* Hour markers (every 2 hours: 00, 02, 04, ...) */}
      <div style={{
        display: 'flex',
        gap: 1,
        fontSize: 9,
        color: COLORS.textMuted,
      }}>
        {hours.map((hour) => (
          <div
            key={hour}
            style={{
              width: cellWidth,
              minWidth: cellWidth,
              textAlign: 'center',
            }}
          >
            {hour % 2 === 0 ? hour.toString().padStart(2, '0') : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
