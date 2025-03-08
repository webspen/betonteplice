export interface OrderDate {
    date: string;
    status: string;
    // add other properties that your API returns
}

export interface DatePickerMarker {
    date: Date | string;
    type: 'line';
    color: string;
    tooltip: Array<{
        text: string;
    }>;
}

export declare function getOrderDates(): Promise<OrderDate[]>;

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