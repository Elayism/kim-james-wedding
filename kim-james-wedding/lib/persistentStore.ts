import fs from "fs/promises";
import path from "path";

export interface GuestItem {
  name: string;
  meal: string;
}

export interface RsvpRecord {
  id: string;
  full_name: string;
  email?: string | null;
  attending: "accepts" | "declines";
  guest_count: number;
  meal_preference: string;
  dietary_restrictions?: string | null;
  message?: string | null;
  guest_details?: GuestItem[];
  is_deleted?: boolean;
  created_at: string;
}

const isVercel = process.env.VERCEL === "1";
const DATA_FILE = isVercel
  ? "/tmp/rsvps.json"
  : path.join(process.cwd(), "data", "rsvps.json");

const DEFAULT_RECORDS: RsvpRecord[] = [
  {
    id: "1",
    full_name: "Maria Santos",
    email: "maria@example.com",
    attending: "accepts",
    guest_count: 3,
    meal_preference: "Chicken",
    dietary_restrictions: "Nut Allergy",
    message: "So happy for both of you! See you there!",
    guest_details: [
      { name: "Maria Santos", meal: "Chicken" },
      { name: "Juan Santos", meal: "Beef" },
      { name: "Sofia Santos", meal: "Kids Meal" },
    ],
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "2",
    full_name: "Carlos Reyes",
    email: "carlos@example.com",
    attending: "accepts",
    guest_count: 2,
    meal_preference: "Beef",
    dietary_restrictions: "None",
    message: "Congratulations Kim & James!",
    guest_details: [
      { name: "Carlos Reyes", meal: "Beef" },
      { name: "Elena Reyes", meal: "Fish" },
    ],
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "3",
    full_name: "Ana Cruz",
    email: "ana@example.com",
    attending: "declines",
    guest_count: 1,
    meal_preference: "Vegetarian",
    dietary_restrictions: null,
    message: "Wishing you both a lifetime of love and happiness!",
    guest_details: [],
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
];

let fileCache: RsvpRecord[] | null = null;

async function loadFromFile(): Promise<RsvpRecord[] | null> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as RsvpRecord[];
    }
  } catch {
    // file doesn't exist yet
  }
  return null;
}

async function saveToFile(data: RsvpRecord[]): Promise<void> {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    fileCache = data;
  } catch (err) {
    console.error("Failed to persist RSVPs:", err);
  }
}

export async function getPersistentRecords(includeDeleted = false): Promise<RsvpRecord[]> {
  if (fileCache) {
    return fileCache.filter((r) => (includeDeleted ? true : !r.is_deleted));
  }

  const fromFile = await loadFromFile();
  if (fromFile) {
    fileCache = fromFile;
    return fromFile.filter((r) => (includeDeleted ? true : !r.is_deleted));
  }

  fileCache = DEFAULT_RECORDS.map((r) => ({ ...r }));
  await saveToFile(fileCache);
  return fileCache.filter((r) => (includeDeleted ? true : !r.is_deleted));
}

export async function addPersistentRSVP(
  data: Omit<RsvpRecord, "id" | "created_at" | "is_deleted">
): Promise<RsvpRecord> {
  const newRecord: RsvpRecord = {
    ...data,
    id: "local-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    is_deleted: false,
    created_at: new Date().toISOString(),
  };

  const records = (await loadFromFile()) || [...DEFAULT_RECORDS];
  records.unshift(newRecord);
  await saveToFile(records);
  fileCache = records;
  return newRecord;
}

export async function softDeletePersistentRSVP(id: string): Promise<boolean> {
  const records = await loadFromFile();
  if (!records) return false;

  const record = records.find((r) => String(r.id) === String(id));
  if (record) {
    record.is_deleted = true;
    await saveToFile(records);
    fileCache = records;
    return true;
  }
  return false;
}

export async function restorePersistentRSVP(id: string): Promise<boolean> {
  const records = await loadFromFile();
  if (!records) return false;

  const record = records.find((r) => String(r.id) === String(id));
  if (record) {
    record.is_deleted = false;
    await saveToFile(records);
    fileCache = records;
    return true;
  }
  return false;
}

export async function permanentDeletePersistentRSVP(id: string): Promise<boolean> {
  const records = await loadFromFile();
  if (!records) return false;

  const initialLength = records.length;
  const filtered = records.filter((r) => String(r.id) !== String(id));
  if (filtered.length !== initialLength) {
    await saveToFile(filtered);
    fileCache = filtered;
    return true;
  }
  return false;
}

export async function updatePersistentRSVP(id: string, updates: Partial<Omit<RsvpRecord, "id" | "created_at">>): Promise<RsvpRecord | null> {
  const records = await loadFromFile();
  if (!records) return null;

  const index = records.findIndex((r) => String(r.id) === String(id));
  if (index === -1) return null;

  records[index] = { ...records[index], ...updates };
  await saveToFile(records);
  fileCache = records;
  return records[index];
}

export async function checkDuplicatePersistentName(
  namesToCheck: string[]
): Promise<string | null> {
  const records = await loadFromFile();
  if (!records) return null;

  const activeRecords = records.filter((r) => !r.is_deleted && r.attending === "accepts");

  const existingNames = new Set<string>();
  activeRecords.forEach((r) => {
    if (r.full_name) existingNames.add(r.full_name.trim().toLowerCase());
    if (Array.isArray(r.guest_details)) {
      r.guest_details.forEach((g) => {
        if (g.name) existingNames.add(g.name.trim().toLowerCase());
      });
    }
  });

  for (const name of namesToCheck) {
    if (!name || name.trim() === "") continue;
    const clean = name.trim().toLowerCase();
    if (existingNames.has(clean)) {
      return name.trim();
    }
  }

  return null;
}
