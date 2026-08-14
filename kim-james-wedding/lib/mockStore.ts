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

// Global in-memory storage for local dev fallback
let inMemoryRSVPs: RsvpRecord[] = [
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

export const getInMemoryRSVPs = (includeDeleted = false) => {
  return inMemoryRSVPs.filter((r) => (includeDeleted ? true : !r.is_deleted));
};

export const addInMemoryRSVP = (data: Omit<RsvpRecord, "id" | "created_at" | "is_deleted">) => {
  const newRecord: RsvpRecord = {
    ...data,
    id: "local-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    is_deleted: false,
    created_at: new Date().toISOString(),
  };
  inMemoryRSVPs.unshift(newRecord);
  return newRecord;
};

export const softDeleteInMemoryRSVP = (id: string) => {
  const record = inMemoryRSVPs.find((r) => String(r.id) === String(id));
  if (record) {
    record.is_deleted = true;
    return true;
  }
  return false;
};

export const restoreInMemoryRSVP = (id: string) => {
  const record = inMemoryRSVPs.find((r) => String(r.id) === String(id));
  if (record) {
    record.is_deleted = false;
    return true;
  }
  return false;
};

export const permanentDeleteInMemoryRSVP = (id: string) => {
  const initialLength = inMemoryRSVPs.length;
  inMemoryRSVPs = inMemoryRSVPs.filter((r) => String(r.id) !== String(id));
  return inMemoryRSVPs.length !== initialLength;
};

export const checkDuplicateName = (allRecords: RsvpRecord[], namesToCheck: string[]) => {
  const activeRecords = allRecords.filter((r) => !r.is_deleted && r.attending === "accepts");
  
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
};
