import { z } from "zod";

export const guestDetailSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  meal: z.string().min(1, "Meal selection is required"),
});

export const rsvpSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || z.string().email().safeParse(val).success,
      { message: "Please enter a valid email address" }
    ),
  attending: z.enum(["accepts", "declines"], {
    message: "Please select whether you will attend",
  }),
  guest_count: z.number().min(1, "Guest count must be at least 1"),
  guests: z.array(guestDetailSchema).optional(),
  meal_preference: z.string().min(1, "Please select a meal preference"),
  meal_other: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  message: z.string().min(1, "Please leave us a message"),
});

export type RsvpFormData = z.infer<typeof rsvpSchema>;
export type GuestDetail = z.infer<typeof guestDetailSchema>;
