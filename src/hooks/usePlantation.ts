import { useEffect, useRef, useState } from 'react';
import { getPlantation, updatePlantation } from '../lib/firestore';
import { useAppStore } from '../store/useAppStore';
import type { Plantation } from '../types';

const DEBOUNCE_MS = 1500;

export function usePlantation(plantationId: string) {
  const [plantation, setPlantation] = useState<Plantation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlantation = useAppStore((s) => s.loadPlantation);
  const spaces = useAppStore((s) => s.spaces);
  const plants = useAppStore((s) => s.plants);
  const strains = useAppStore((s) => s.strains);
  const inventory = useAppStore((s) => s.inventory);
  const currentPlantationId = useAppStore((s) => s.currentPlantationId);

  const saveTimeoutRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  // Load plantation on mount
  useEffect(() => {
    if (!plantationId) {
      setLoading(false);
      setError('No plantation ID');
      return;
    }

    setLoading(true);
    setError(null);
    initialLoadRef.current = true;

    getPlantation(plantationId)
      .then((p) => {
        if (p) {
          setPlantation(p);
          loadPlantation(p);
        } else {
          setError('Plantation not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load plantation');
      })
      .finally(() => {
        setLoading(false);
        // Allow saving after initial load completes
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 100);
      });
  }, [plantationId, loadPlantation]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    // Skip if still loading initial data or plantation not loaded yet
    if (initialLoadRef.current || !plantation || currentPlantationId !== plantationId) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for saving
    saveTimeoutRef.current = window.setTimeout(() => {
      updatePlantation(plantationId, {
        spaces,
        plants,
        strains,
        inventory,
      }).catch((err) => {
        console.error('Failed to save plantation:', err);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [spaces, plants, strains, inventory, plantationId, plantation, currentPlantationId]);

  return { plantation, loading, error };
}
