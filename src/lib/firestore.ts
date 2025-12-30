import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
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
