import { z } from "zod";

export const freeStudyMaterials = z.object({
    title: z.string(),
  description:z.string(),
  link:z.string(),
  categories:z.string().array()
})

export const freeSoftwares = z.object({
    title: z.string(),
  description:z.string(),
  link:z.string(),
    category: z.string(),
  version : z.string()
})

export const jobsAndInternships = z.object({
    title: z.string(),
  description:z.string(),
  link:z.string(),
    skills: z.string().array(),
    role : z.string()
})

export const scholarships = z.object({
    title: z.string(),
  description:z.string(),
  link:z.string(),
    org : z.string()
})

export const hackathons = z.object({
    title: z.string(),
  description:z.string(),
  link:z.string(),
    location : z.string(),
    domain : z.string(),
})

