export interface GuestItem {
  name: string;
  meal: string;
}

export interface RsvpRecord {
  id: string | number;
  full_name: string;
  email?: string | null;
  attending: "accepts" | "declines";
  guest_count: number;
  meal_preference: string;
  dietary_restrictions?: string | null;
  message?: string | null;
  guest_details?: GuestItem[];
  is_deleted?: boolean;
  created_at?: string;
}

export const SAMPLE_DATA: RsvpRecord[] = [
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
      { name: "Sofia Santos", meal: "Chicken" },
    ],
    is_deleted: false,
    created_at: "2026-08-10T10:00:00Z",
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
    created_at: "2026-08-11T14:30:00Z",
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
    created_at: "2026-08-12T09:15:00Z",
  },
  {
    id: "4",
    full_name: "David Kim",
    email: "david@example.com",
    attending: "accepts",
    guest_count: 2,
    meal_preference: "Pork",
    dietary_restrictions: "Gluten-free",
    message: "Excited to celebrate with you!",
    guest_details: [
      { name: "David Kim", meal: "Pork" },
      { name: "Lisa Kim", meal: "Chicken" },
    ],
    is_deleted: false,
    created_at: "2026-08-13T16:45:00Z",
  },
  {
    id: "5",
    full_name: "Sophie Turner",
    email: "sophie@example.com",
    attending: "accepts",
    guest_count: 1,
    meal_preference: "Other",
    dietary_restrictions: "Vegan",
    message: "So happy for you both!",
    guest_details: [
      { name: "Sophie Turner", meal: "Other" },
    ],
    is_deleted: false,
    created_at: "2026-08-14T11:20:00Z",
  },
  {
    id: "6",
    full_name: "Michael Brown",
    email: "michael@example.com",
    attending: "declines",
    guest_count: 1,
    meal_preference: "Chicken",
    dietary_restrictions: null,
    message: "Sorry we can't make it.",
    guest_details: [],
    is_deleted: false,
    created_at: "2026-08-15T08:00:00Z",
  },
  {
    id: "7",
    full_name: "Jessica Lee",
    email: "jessica@example.com",
    attending: "accepts",
    guest_count: 4,
    meal_preference: "Chicken",
    dietary_restrictions: "Shellfish allergy",
    message: "Can't wait to celebrate!",
    guest_details: [
      { name: "Jessica Lee", meal: "Chicken" },
      { name: "Tom Lee", meal: "Beef" },
      { name: "Amy Lee", meal: "Fish" },
      { name: "Jerry Lee", meal: "Chicken" },
    ],
    is_deleted: false,
    created_at: "2026-08-16T13:10:00Z",
  },
  {
    id: "8",
    full_name: "Ryan Garcia",
    email: "ryan@example.com",
    attending: "accepts",
    guest_count: 2,
    meal_preference: "Vegetarian",
    dietary_restrictions: null,
    message: "Congratulations!",
    guest_details: [
      { name: "Ryan Garcia", meal: "Vegetarian" },
      { name: "Mia Garcia", meal: "Vegetarian" },
    ],
    is_deleted: false,
    created_at: "2026-08-17T10:45:00Z",
  },
  {
    id: "9",
    full_name: "Emily Watson",
    email: "emily@example.com",
    attending: "declines",
    guest_count: 1,
    meal_preference: "Fish",
    dietary_restrictions: null,
    message: "Sad to miss it!",
    guest_details: [],
    is_deleted: false,
    created_at: "2026-08-18T15:30:00Z",
  },
  {
    id: "10",
    full_name: "Daniel Martinez",
    email: "daniel@example.com",
    attending: "accepts",
    guest_count: 3,
    meal_preference: "Beef",
    dietary_restrictions: "Dairy allergy",
    message: "Looking forward to it!",
    guest_details: [
      { name: "Daniel Martinez", meal: "Beef" },
      { name: "Anna Martinez", meal: "Chicken" },
      { name: "Lucas Martinez", meal: "Beef" },
    ],
    is_deleted: false,
    created_at: "2026-08-19T09:00:00Z",
  },
];
