import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Plantation, Space, Plant, Strain, Seed } from '../types';
import { migratePlantation } from '../utils/migration';

const PLANTATIONS = 'plantations';

export interface PlantationData {
  ownerId: string;
  name: string;
  isPublic: boolean;
  isTutorial?: boolean;
  tutorialId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  spaces: Space[];
  plants: Plant[];
  strains: Strain[];
  inventory: Seed[];
}

function toPlantation(id: string, data: PlantationData): Plantation {
  const plantation: Plantation = {
    id,
    ownerId: data.ownerId,
    name: data.name,
    isPublic: data.isPublic,
    isTutorial: data.isTutorial ?? false,
    tutorialId: data.tutorialId,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    spaces: data.spaces || [],
    plants: data.plants || [],
    strains: data.strains || [],
    inventory: data.inventory || [],
  };

  // Migrate plants to segment-based structure
  return migratePlantation(plantation);
}

export async function getPlantation(id: string): Promise<Plantation | null> {
  const docRef = doc(db, PLANTATIONS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return toPlantation(docSnap.id, docSnap.data() as PlantationData);
}

export async function getUserPlantations(userId: string): Promise<Plantation[]> {
  const q = query(collection(db, PLANTATIONS), where('ownerId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => toPlantation(doc.id, doc.data() as PlantationData));
}

export async function findTutorialPlantation(
  userId: string,
  tutorialId: string
): Promise<Plantation | null> {
  const q = query(
    collection(db, PLANTATIONS),
    where('ownerId', '==', userId),
    where('tutorialId', '==', tutorialId)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return toPlantation(querySnapshot.docs[0].id, querySnapshot.docs[0].data() as PlantationData);
}

export async function createPlantation(
  userId: string,
  name: string
): Promise<Plantation> {
  const docRef = doc(collection(db, PLANTATIONS));

  const data: Omit<PlantationData, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    ownerId: userId,
    name,
    isPublic: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    spaces: [],
    plants: [],
    strains: [],
    inventory: [],
  };

  await setDoc(docRef, data);

  return {
    id: docRef.id,
    ownerId: userId,
    name,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spaces: [],
    plants: [],
    strains: [],
    inventory: [],
  };
}

export async function updatePlantation(
  id: string,
  data: {
    spaces: Space[];
    plants: Plant[];
    strains: Strain[];
    inventory: Seed[];
    isTutorial?: boolean;
    tutorialId?: string;
  }
): Promise<void> {
  const docRef = doc(db, PLANTATIONS, id);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updatePlantationSettings(
  id: string,
  settings: { name?: string; isPublic?: boolean }
): Promise<void> {
  const docRef = doc(db, PLANTATIONS, id);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deletePlantation(id: string): Promise<void> {
  const docRef = doc(db, PLANTATIONS, id);
  await deleteDoc(docRef);
}

// =============================================================================
// Bird Leaderboard
// =============================================================================

const BIRD_LEADERBOARD = 'bird_leaderboard';

export interface BirdScore {
  id: string;
  userId: string;
  userName: string;
  distance: number;
  createdAt: string;
}

interface BirdScoreData {
  userId: string;
  userName: string;
  distance: number;
  createdAt: Timestamp;
}

export async function getBirdLeaderboard(topN: number = 10): Promise<BirdScore[]> {
  const q = query(
    collection(db, BIRD_LEADERBOARD),
    orderBy('distance', 'desc'),
    limit(topN)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as BirdScoreData;
    return {
      id: doc.id,
      userId: data.userId,
      userName: data.userName,
      distance: data.distance,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  });
}

export async function getUserBirdScore(userId: string): Promise<BirdScore | null> {
  const q = query(
    collection(db, BIRD_LEADERBOARD),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data() as BirdScoreData;
  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName,
    distance: data.distance,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function submitBirdScore(
  userId: string,
  userName: string,
  distance: number
): Promise<void> {
  // Check if user already has a score
  const existing = await getUserBirdScore(userId);

  if (existing) {
    // Only update if new score is higher
    if (distance > existing.distance) {
      const docRef = doc(db, BIRD_LEADERBOARD, existing.id);
      await setDoc(docRef, {
        userId,
        userName,
        distance,
        createdAt: serverTimestamp(),
      });
    }
  } else {
    // Create new score
    const docRef = doc(collection(db, BIRD_LEADERBOARD));
    await setDoc(docRef, {
      userId,
      userName,
      distance,
      createdAt: serverTimestamp(),
    });
  }
}
