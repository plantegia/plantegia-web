import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SeedSlot } from './SeedSlot';
import { EmptySlot } from './EmptySlot';
import { SeedForm } from '../inspector/SeedForm';
import { COLORS } from '../../constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTutorial } from '../../tutorial/useTutorial';

const SLOTS_PER_PAGE = 4;

export function Inventory() {
  const [showSeedForm, setShowSeedForm] = useState(false);
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const { currentStep } = useTutorial();

  const inventory = useAppStore((s) => s.inventory);
  const strains = useAppStore((s) => s.strains);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);
  const selectSeed = useAppStore((s) => s.selectSeed);
  const expandedSection = useAppStore((s) => s.expandedHotbarSection);
  const setExpandedSection = useAppStore((s) => s.setExpandedHotbarSection);

  // Check if tutorial is highlighting something in inventory
  const tutorialHighlightsInventory = currentStep?.highlightSelector?.includes('data-slot');

  // On desktop always show expanded, on mobile respect expandedSection or tutorial highlight
  const isExpanded = !isMobile || expandedSection === 'inventory' || tutorialHighlightsInventory;

  // Calculate pages: each page has 4 slots, add extra page when current page is full
  const filledPages = Math.ceil(inventory.length / SLOTS_PER_PAGE);
  const needsExtraPage = inventory.length > 0 && inventory.length % SLOTS_PER_PAGE === 0;
  const totalPages = Math.max(1, filledPages + (needsExtraPage ? 1 : 0));
  const startIndex = page * SLOTS_PER_PAGE;
  const visibleSeeds = inventory.slice(startIndex, startIndex + SLOTS_PER_PAGE);
  const emptySlots = SLOTS_PER_PAGE - visibleSeeds.length;

  // Get selected seed info for collapsed view
  const selectedSeed = selectedSeedId ? inventory.find((s) => s.id === selectedSeedId) : null;
  const selectedStrain = selectedSeed ? strains.find((s) => s.id === selectedSeed.strainId) : null;

  // Collapsed view
  if (!isExpanded) {
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
            onClick={() => setExpandedSection('inventory')}
            style={{
              fontSize: 10,
              color: COLORS.textMuted,
              textTransform: 'uppercase',
              marginBottom: 6,
              cursor: 'pointer',
            }}
          >
            Seeds ›
          </span>
          {selectedSeed ? (
            <SeedSlot
              seed={selectedSeed}
              strain={selectedStrain ?? undefined}
              selected={true}
              onClick={() => setExpandedSection('inventory')}
            />
          ) : (
            <EmptySlot onClick={() => setExpandedSection('inventory')} />
          )}
        </div>
        {showSeedForm && <SeedForm onClose={() => setShowSeedForm(false)} />}
      </>
    );
  }

  // Expanded view
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

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          {totalPages > 1 && (
            <button
              className="btn-icon"
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
                fontSize: 28,
                cursor: page === 0 ? 'default' : 'pointer',
                borderRadius: 4,
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
                onClick={() => {
                  if (selectedSeedId === seed.id) {
                    selectSeed(null);
                  } else {
                    selectSeed(seed.id);
                    if (isMobile) {
                      setExpandedSection('toolbox');
                    }
                  }
                }}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <EmptySlot key={`empty-${i}`} onClick={() => setShowSeedForm(true)} />
            ))}
          </div>

          {totalPages > 1 && (
            <button
              className="btn-icon"
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
                fontSize: 28,
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                borderRadius: 4,
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
