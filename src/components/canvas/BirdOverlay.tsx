import { useEffect, useState, useCallback } from 'react';
import { COLORS } from '../../constants';
import { getBirdLeaderboard, submitBirdScore, type BirdScore } from '../../lib/firestore';
import { useAuth } from '../../hooks/useAuth';

interface BirdOverlayProps {
  screenX: number;
  screenY: number;
  distance: number;
}

// Default NPC leaderboard entries (shown until real players beat them)
const DEFAULT_LEADERBOARD: BirdScore[] = [
  { id: 'npc-1', userId: 'npc-1', userName: 'SkyMaster', distance: 18471000, createdAt: '2024-01-01' },
  { id: 'npc-2', userId: 'npc-2', userName: 'CloudRider', distance: 12847000, createdAt: '2024-01-02' },
  { id: 'npc-3', userId: 'npc-3', userName: 'WindChaser', distance: 8293000, createdAt: '2024-01-03' },
  { id: 'npc-4', userId: 'npc-4', userName: 'BirdBrain', distance: 5641000, createdAt: '2024-01-04' },
  { id: 'npc-5', userId: 'npc-5', userName: 'FeatherFly', distance: 3127000, createdAt: '2024-01-05' },
  { id: 'npc-6', userId: 'npc-6', userName: 'WingNut', distance: 1892000, createdAt: '2024-01-06' },
  { id: 'npc-7', userId: 'npc-7', userName: 'AeroAce', distance: 94200, createdAt: '2024-01-07' },
  { id: 'npc-8', userId: 'npc-8', userName: 'GlideGuru', distance: 31500, createdAt: '2024-01-08' },
  { id: 'npc-9', userId: 'npc-9', userName: 'FlapHappy', distance: 8740, createdAt: '2024-01-09' },
  { id: 'npc-10', userId: 'npc-10', userName: 'Newbie', distance: 827, createdAt: '2024-01-10' },
];

// Format distance with appropriate units
function formatDistance(meters: number): string {
  if (meters >= 1000000) {
    return `${(meters / 1000000).toFixed(1)}Mm`; // megameters
  } else if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}

export function BirdOverlay({ screenX, screenY, distance }: BirdOverlayProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<BirdScore[]>(DEFAULT_LEADERBOARD);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastSubmittedDistance, setLastSubmittedDistance] = useState(0);

  // Fetch leaderboard on mount and merge with defaults
  useEffect(() => {
    getBirdLeaderboard(10).then((dbScores) => {
      // Merge real scores with NPC defaults, keeping top 10
      const allScores = [...dbScores, ...DEFAULT_LEADERBOARD];
      const uniqueScores = allScores.reduce((acc, score) => {
        const existing = acc.find(s => s.userId === score.userId);
        if (!existing || score.distance > existing.distance) {
          return [...acc.filter(s => s.userId !== score.userId), score];
        }
        return acc;
      }, [] as BirdScore[]);

      uniqueScores.sort((a, b) => b.distance - a.distance);
      setLeaderboard(uniqueScores.slice(0, 10));
    }).catch(console.error);
  }, []);

  // Submit score periodically (every 500m improvement)
  const submitScore = useCallback(async () => {
    if (!user) return;

    const submitThreshold = 500; // Submit every 500m
    if (distance - lastSubmittedDistance >= submitThreshold) {
      try {
        await submitBirdScore(
          user.uid,
          user.displayName || 'Anonymous',
          Math.round(distance)
        );
        setLastSubmittedDistance(distance);

        // Refresh leaderboard
        const newLeaderboard = await getBirdLeaderboard(5);
        setLeaderboard(newLeaderboard);

        // Check if new personal best
        if (distance > personalBest) {
          setPersonalBest(distance);
          setIsNewRecord(true);
          setTimeout(() => setIsNewRecord(false), 2000);
        }
      } catch (err) {
        console.error('Failed to submit bird score:', err);
      }
    }
  }, [user, distance, lastSubmittedDistance, personalBest]);

  useEffect(() => {
    submitScore();
  }, [submitScore]);

  // Find user's rank
  const userRank = user
    ? leaderboard.findIndex((s) => s.userId === user.uid) + 1
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(screenX + 40, window.innerWidth - 160),
        top: Math.max(screenY - 60, 10),
        pointerEvents: 'none',
        fontFamily: 'monospace',
        fontSize: 11,
        color: COLORS.text,
        backgroundColor: 'rgba(21, 71, 44, 0.95)',
        border: `1px solid ${COLORS.border}`,
        padding: '6px 10px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        transform: 'rotateX(5deg)',
        transformOrigin: 'left center',
        minWidth: 190,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          color: COLORS.teal,
          fontWeight: 'bold',
          marginBottom: 4,
          fontSize: 10,
          letterSpacing: 1,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: 4,
        }}
      >
        BIRD TRACKER
      </div>

      {/* Current distance */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: isNewRecord ? COLORS.orange : COLORS.text,
          marginBottom: 6,
        }}
      >
        {formatDistance(distance)}
        {isNewRecord && (
          <span style={{ fontSize: 10, marginLeft: 4, color: COLORS.orange }}>
            NEW!
          </span>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <>
          <div
            style={{
              fontSize: 9,
              color: COLORS.textMuted,
              marginBottom: 3,
              letterSpacing: 0.5,
            }}
          >
            LEADERBOARD
          </div>
          <div style={{ fontSize: 10 }}>
            {leaderboard.slice(0, 3).map((score, index) => (
              <div
                key={score.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 1,
                  color:
                    user && score.userId === user.uid
                      ? COLORS.orange
                      : COLORS.textMuted,
                }}
              >
                <span>
                  {index + 1}. {score.userName}
                </span>
                <span style={{ textAlign: 'right' }}>{formatDistance(score.distance)}</span>
              </div>
            ))}
          </div>

          {/* User's rank if not in top 3 */}
          {user && userRank > 3 && (
            <div
              style={{
                marginTop: 4,
                paddingTop: 4,
                borderTop: `1px dashed ${COLORS.border}`,
                fontSize: 10,
                color: COLORS.orange,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>#{userRank} You</span>
              <span>{formatDistance(personalBest)}</span>
            </div>
          )}
        </>
      )}

      {/* Login prompt */}
      {!user && (
        <div
          style={{
            fontSize: 9,
            color: COLORS.textMuted,
            marginTop: 4,
            fontStyle: 'italic',
          }}
        >
          Sign in to save score
        </div>
      )}
    </div>
  );
}
