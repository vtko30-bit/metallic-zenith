'use server';

import fs from 'fs/promises';
import path from 'path';
import { InventoryState } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'inventory.json');

async function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialState: InventoryState = {
      warehouses: [],
      products: [],
      movements: [],
      recipes: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialState, null, 2));
  }
}

export async function getState(): Promise<InventoryState> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveState(state: InventoryState): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2));
}
