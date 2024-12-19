import z from 'zod'
export const SignupPayload = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fname: z.string(),
    lname:z.string()
})
export const SigninPayload = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})