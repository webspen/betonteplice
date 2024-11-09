import { z } from "zod"
import * as schemas from "./schemas"

export type Reservation = z.infer<typeof schemas.Reservation>
export type Subject = z.infer<typeof schemas.Subject>
export type Responsible = z.infer<typeof schemas.Responsible>
export type Contact = z.infer<typeof schemas.Contact>
export type Persons = z.infer<typeof schemas.Persons>
export type Address = z.infer<typeof schemas.Address>
export type Configuration = z.infer<typeof schemas.Configuration>
export type Root = z.infer<typeof schemas.Root>
export type TypOsoby = z.infer<typeof schemas.TypOsoby>
export type UserRequest = z.infer<typeof schemas.UserRequest>
export type AresApiResponse = z.infer<typeof schemas.AresApiResponse>
