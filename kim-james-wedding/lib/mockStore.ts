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

export {
  getPersistentRecords as getInMemoryRSVPs,
  addPersistentRSVP as addInMemoryRSVP,
  softDeletePersistentRSVP as softDeleteInMemoryRSVP,
  restorePersistentRSVP as restoreInMemoryRSVP,
  permanentDeletePersistentRSVP as permanentDeleteInMemoryRSVP,
  checkDuplicatePersistentName as checkDuplicateName,
} from "./persistentStore";
