import { z } from "zod";

export const FormData = z.object({
  firstName: z.string().min(1).max(18),
  lastName: z.string().min(1).max(18),
  phone: z.string().min(10).max(14).optional(),
  email: z.string().email(),
  url: z.string().url().optional(),
});

/**
 * @expand
 */
export type FormDataType = typeof FormData.shape;

/**
 * @expand
 */
export type Inferred = z.infer<typeof FormData>;
