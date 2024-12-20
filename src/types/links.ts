import { z } from "zod";

export const linkPayload = z.object({
    title: z.string(),
    description: z.string(),
    link: z.string()
})
