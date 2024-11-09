import { z } from "zod"

export const TypOsoby = z.enum(["fyzicka", "pravnicka", "podnikatel", "baracnik"])

export const Reservation = z.object({
    date: z.string(),
    time: z.string(),
})

export const Subject = z.object({
    typOsoby: TypOsoby,
    obchodniJmeno: z.string(),
    platceDph: z.boolean(),
    ico: z.string(),
    dic: z.string(),
})

export const Responsible = z.object({
    jmeno: z.string(),
    telefon: z.string(),
    email: z.string(),
})

export const Contact = z.object({
    jmeno: z.string(),
    telefon: z.string(),
    email: z.string(),
})

export const Persons = z.object({
    contactSameAsResponsible: z.boolean(),
    responsible: Responsible,
    contact: Contact,
    confirmation: z.boolean(),
})

export const Address = z.object({
    typAdresy: z.string(),
    adresa: z.string(),
    pozemek: z.string(),
    mesto: z.string(),
    psc: z.string(),
    kraj: z.string(),
    poznamka: z.string(),
})

export const Configuration = z.object({
    typBetonu: z.string(),
    tloustkaKameniva: z.number(),
    kvalita: z.string(),
    vyska: z.string(),
    poznamka: z.string(),
})

export const Root = z.object({
    reservation: Reservation,
    subject: Subject,
    persons: Persons,
    address: Address,
    configuration: Configuration,
    remember: z.boolean(),
})

export const UserRequest = Root.extend({
    status: z.enum(["accepted", "rejected", "pending", "cancelled", "error"]),
})

export const AresApiResponse = z.object({
    ico: z.string(),
    obchodniJmeno: z.string(),
    sidlo: z.object({
        kodStatu: z.string(),
        nazevStatu: z.string(),
        kodKraje: z.number(),
        nazevKraje: z.string(),
        kodOkresu: z.number(),
        nazevOkresu: z.string(),
        kodObce: z.number(),
        nazevObce: z.string(),
        kodUlice: z.number(),
        nazevUlice: z.string(),
        cisloDomovni: z.number(),
        kodCastiObce: z.number(),
        nazevCastiObce: z.string(),
        kodAdresnihoMista: z.number(),
        psc: z.number(),
        textovaAdresa: z.string(),
        standardizaceAdresy: z.boolean(),
        typCisloDomovni: z.number(),
    }),
    pravniForma: z.string(),
    financniUrad: z.string(),
    datumVzniku: z.string(),
    datumAktualizace: z.string(),
    icoId: z.string(),
    adresaDorucovaci: z.object({
        radekAdresy1: z.string(),
        radekAdresy2: z.string(),
        radekAdresy3: z.string(),
    }),
    seznamRegistraci: z.object({
        stavZdrojeVr: z.string(),
        stavZdrojeRes: z.string(),
        stavZdrojeRzp: z.string(),
        stavZdrojeNrpzs: z.string(),
        stavZdrojeRpsh: z.string(),
        stavZdrojeRcns: z.string(),
        stavZdrojeSzr: z.string(),
        stavZdrojeDph: z.string(),
        stavZdrojeSd: z.string(),
        stavZdrojeIr: z.string(),
        stavZdrojeCeu: z.string(),
        stavZdrojeRs: z.string(),
        stavZdrojeRed: z.string(),
        stavZdrojeMonitor: z.string(),
    }),
    primarniZdroj: z.string(),
    dalsiUdaje: z.array(
        z.object({
            obchodniJmeno: z.array(
                z.object({
                    obchodniJmeno: z.string(),
                    primarniZaznam: z.boolean(),
                })
            ),
            sidlo: z.array(
                z.object({
                    sidlo: z.object({
                        kodStatu: z.string(),
                        nazevStatu: z.string(),
                        kodKraje: z.number(),
                        nazevKraje: z.string(),
                        kodOkresu: z.number(),
                        nazevOkresu: z.string(),
                        kodObce: z.number(),
                        nazevObce: z.string(),
                        kodUlice: z.number(),
                        nazevUlice: z.string(),
                        cisloDomovni: z.number(),
                        kodCastiObce: z.number(),
                        nazevCastiObce: z.string(),
                        kodAdresnihoMista: z.number(),
                        psc: z.number(),
                        textovaAdresa: z.string(),
                        standardizaceAdresy: z.boolean(),
                        typCisloDomovni: z.number(),
                    }),
                    primarniZaznam: z.boolean(),
                })
            ),
            pravniForma: z.string(),
            datovyZdroj: z.string(),
        })
    ),
    czNace: z.array(z.string()),
})

// // Usage example:
// const userRequest: z.Infer<typeof UserRequest> = {
//     status: "accepted",
//     reservation: {
//         date: "2022-01-01",
//         time: "10:00",
//     },
//     subject: {
//         typOsoby: "fyzicka",
//         obchodniJmeno: "John Doe",
//         platceDph: false,
//         ico: "12345678",
//         dic: "CZ12345678",
//     },
//     persons: {
//         contactSameAsResponsible: true,
//         responsible: {
//             jmeno: "John Doe",
//             telefon: "123456789",
//             email: "john.doe@example.com",
//         },
//         contact: {
//             jmeno: "John Doe",
//             telefon: "123456789",
//             email: "john.doe@example.com",
//         },
//         confirmation: true,
//     },
//     address: {
//         typAdresy: "main",
//         adresa: "123 Main St",
//         pozemek: "A1",
//         mesto: "Prague",
//         psc: "12345",
//         kraj: "CZ",
//         poznamka: "Some note",
//     },
//     configuration: {
//         typBetonu: "type1",
//         tloustkaKameniva: 10,
//         kvalita: "good",
//         vyska: "high",
//         poznamka: "Some note",
//     },
//     remember: true,
// };

// const validationResult = UserRequest.safeParse(userRequest);

// if (validationResult.success) {
//     console.log("User request is valid");
// } else {
//     console.log("User request is invalid");
//     console.log(validationResult.error);
// }
