import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SeedSlot } from './SeedSlot';
import { EmptySlot } from './EmptySlot';
import { SeedForm } from '../inspector/SeedForm';
import { COLORS } from '../../constants';

const SEEDS_PER_PAGE = 4;

export function Inventory() {
  const [showSeedForm, setShowSeedForm] = useState(false);
  const [page, setPage] = useState(0);

  const inventory = useAppStore((s) => s.inventory);
  const strains = useAppStore((s) => s.strains);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);
  const selectSeed = useAppStore((s) => s.selectSeed);

  const totalPages = Math.ceil(inventory.length / SEEDS_PER_PAGE);
  const startIndex = page * SEEDS_PER_PAGE;
  const visibleSeeds = inventory.slice(startIndex, startIndex + SEEDS_PER_PAGE);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 12px 12px',
          background: COLORS.backgroundDark,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Seeds
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {totalPages > 1 && (
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                width: 20,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: page === 0 ? COLORS.border : COLORS.textMuted,
                fontSize: 14,
                cursor: page === 0 ? 'default' : 'pointer',
              }}
            >
              ‹
            </button>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            {visibleSeeds.map((seed) => (
              <SeedSlot
                key={seed.id}
                seed={seed}
                strain={strains.find((s) => s.id === seed.strainId)}
                selected={selectedSeedId === seed.id}
                onClick={() => selectSeed(selectedSeedId === seed.id ? null : seed.id)}
              />
            ))}
            <EmptySlot onClick={() => setShowSeedForm(true)} />
          </div>

          {totalPages > 1 && (
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                width: 20,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: page >= totalPages - 1 ? COLORS.border : COLORS.textMuted,
                fontSize: 14,
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              }}
            >
              ›
            </button>
          )}
        </div>
      </div>

      {showSeedForm && <SeedForm onClose={() => setShowSeedForm(false)} />}
    </>
  );
}
