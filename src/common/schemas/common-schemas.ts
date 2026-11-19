import { z } from 'zod';

export const uuidParamSchema = z.object({ id: z.uuid() });

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(200);

export const slugParamSchema = z.object({ slug: slugSchema });
