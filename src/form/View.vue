<script setup lang="ts">
import type { AresApiResponse } from "../types";
import { watchDebounced, useVModel, useAsyncState } from "@vueuse/core";
import { form, metadata, step } from "./state";
import superjson from "superjson";

async function ares(ico: string): Promise<AresApiResponse> {
  const response = await fetch(`${import.meta.env.VITE_ARES_URL}/${ico}`);
  const data = await response.json();
  return data as AresApiResponse;
}

const prikladAres = {
  ico: "1234567",
  obchodniJmeno: "John Dee",
  sidlo: {
    kodStatu: "CZ",
    nazevStatu: "Česká republika",
    kodKraje: 21,
    nazevKraje: "Prague",
    kodOkresu: 1234,
    nazevOkresu: "Prague",
    kodObce: 123456,
    nazevObce: "Prague",
    kodUlice: 12545,
    nazevUlice: "Street",
    cisloDomovni: 123,
    kodCastiObce: 12345,
    nazevCastiObce: "Address 2",
    kodAdresnihoMista: 1234567,
    psc: 12345,
    textovaAdresa: "Street 123, City",
    standardizaceAdresy: true,
    typCisloDomovni: 1,
  },
  pravniForma: "101",
  financniUrad: "001",
  datumVzniku: "2023-10-05",
  datumAktualizace: "2024-10-11",
  icoId: "17503400",
  adresaDorucovaci: {
    radekAdresy1: "Street 123",
    radekAdresy2: "Address 2",
    radekAdresy3: "12345 Prague",
  },
  primarniZdroj: "rzp",
};

const disabledDates = useAsyncState<string[]>(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
  return [
    "2024-09-29",
    "2024-10-06",
    "2024-10-10",
    "2024-10-13",
    "2024-10-16",
    "2024-10-17",
    "2024-10-18",
  ];
}, []);

watchDebounced(
  form,
  async () => {
    if (form.customer_cid) {
      const { pravniForma, sidlo, obchodniJmeno } = await ares(
        form.customer_cid
      );

      const psc = sidlo.psc.toString();

      // https://www.cnb.cz/export/sites/cnb/cs/statistika/.galleries/predpisy_CNB_statistika/predpisy_menove_bank_stat/vykazy_metodika_2011/cast_V/download/5_BA0062_1101.pdf
      if (Number(pravniForma) > 100 && Number(pravniForma) < 108) {
        form.customer_type = "podnikatel";
        form.contact_name = obchodniJmeno;
      } else {
        form.customer_type = "pravnicka";
      }

      form.address_street = sidlo.textovaAdresa;
      form.address_city = sidlo.nazevObce;
      form.address_zip = `${psc.slice(0, 3)} ${psc.slice(3)}`;
      form.customer_name = obchodniJmeno;
    }
  },
  {
    deep: true,
    debounce: 2500,
  }
);

const nextStep = () => {
  if (step.value < 4) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const onSubmit = async () => {
  const res = await fetch(import.meta.env.VITE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  console.log("[Submit]", form);
};
</script>
<template>
  <div class="dark flex min-h-screen flex-row justify-center bg-zinc-700">
    <div id="poptavka" class="max-w-xl w-full mx-auto my-12">
      <FormKit
        type="form"
        @submit="onSubmit"
        submitLabel="Odeslat poptávku"
        :value="form"
        @input="(data) => Object.assign(form, data)"
        useLocalStorage
      >
        <FormKit type="multi-step" tab-style="progress">
          <FormKit
            type="step"
            name="reservation"
            label="Rezervace"
            nextLabel="Pokračovat"
          >
            <FormKit type="group" name="reservation">
              <label
                for="date"
                class="block text-lg mb-2.5 font-medium text-gray-700 dark:text-gray-300"
                >Datum&nbsp;rezervace</label
              >
              <DatePicker
                id="date"
                v-model="form.date"
                dark
                inline
                :enableTimePicker="false"
                :minDate="tomorrow"
                :disabledDates="disabledDates.state.value"
                :disabledWeekDays="[0, 6]"
                :markers="markers"
                class="mb-5 mx-auto"
                required
                locale="cs"
                autoApply
                :loading="disabledDates.isLoading.value"
                preventMinMaxNavigation
                disableYearSelect
              />
              <label
                for="time"
                class="block text-lg mb-2.5 font-medium text-gray-700 dark:text-gray-300"
                >Čas příjezdu (v kolik máme přijet)</label
              >
              <DatePicker
                id="time"
                v-model="form.time"
                inline
                timePicker
                dark
                :minTime="{ hours: 6, minutes: 0 }"
                :maxTime="{ hours: 14, minutes: 15 }"
                required
                class="mb-5 mx-auto"
                autoApply
                :minutesIncrement="15"
                :minutesGridIncrement="15"
                preventMinMaxNavigation
              />
              <p class="text-sm text-gray-400">
                Rezervace je možná pouze od 7:00 do 14:00
              </p>
            </FormKit>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            name="subject"
            label="Subjekt"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <FormKit type="group" name="subject">
              <FormKit
                type="select"
                name="typOsoby"
                v-model="form.customer_type"
                label="Typ osoby"
                :options="['fyzicka', 'podnikatel', 'pravnicka', 'baracnik']"
                required
              />
              <FormKit
                v-if="['podnikatel', 'pravnicka'].includes(form.customer_type)"
                type="text"
                label="IČO"
                name="ico"
                min="8"
                max="8"
                validation="required|number"
              />
              <FormKit
                v-if="form.customer_type !== 'baracnik'"
                type="checkbox"
                label="Plátce DPH"
                v-model="form.customer_vat"
              />
              <FormKit
                v-if="form.customer_type !== 'baracnik' && form.customer_vat"
                type="text"
                label="DIČ"
                name="dic"
                min="8"
                max="12"
              />
              <FormKit
                type="text"
                name="jmeno"
                v-model="form.customer_name"
                :label="
                  form.customer_type === 'pravnicka'
                    ? 'Obchodní Jméno'
                    : 'Jméno a Příjmení'
                "
                min="3"
                max="200"
                required
              />
            </FormKit>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            name="persons"
            label="Osoby"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <FormKit type="group" name="persons">
              <FormKit type="group" name="responsible">
                <label class="font-semibold text-zinc-200"
                  >Odpovědná osoba</label
                >
                <FormKit type="text" label="Jméno" name="jmeno" />
                <FormKit type="text" label="Telefon" name="telefon" />
                <FormKit type="email" label="Email" name="email" />
              </FormKit>
              <FormKit
                type="checkbox"
                label="Kontaktní osoba je stejná jako odpovědná"
                name="contactSameAsResponsible"
              />
              <FormKit
                type="checkbox"
                checked
                label="Potvrzuji, že jsem oprávněn jednat jménem subjektu"
                name="confirmation"
              />
              <FormKit
                type="group"
                name="contact"
                v-if="!metadata.contactSameAsResponsible"
              >
                <label class="font-semibold text-zinc-200"
                  >Kontaktní osoba</label
                >
                <FormKit type="text" label="Jméno" name="contact_name" />
                <FormKit type="text" label="Telefon" name="contact_phone" />
                <FormKit type="email" label="Email" name="contact_email" />
              </FormKit>
            </FormKit>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            name="address"
            label="Adresa"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <FormKit type="group" name="address">
              <FormKit
                type="radio"
                label="Místo přistavění pumpy"
                name="typAdresy"
                :options="druhyAdresy"
                validation="required"
              />
              <FormKit
                v-if="form.typAdresy === 'existujici'"
                type="search"
                label="Adresa"
                name="adresa"
                placeholder="Vyhledat adresu..."
                validation="required"
              />
              <FormKit
                v-else-if="form.typAdresy === 'pozemek'"
                type="text"
                help="Nejbližší existující adresa"
                name="pozemek"
                placeholder="Číslo pozemku"
                validation="required"
              />
              <FormKit
                type="text"
                :value="form.psc"
                name="psc"
                label="PSČ"
                placeholder="123 00"
                validation="required"
              />
              <FormKit
                type="text"
                name="kraj"
                label="Kraj"
                placeholder="Středočeský"
                validation="required"
              />
              <FormKit
                type="text"
                label="Město"
                placeholder="Město"
                name="mesto"
                validation="required"
              />
              <FormKit
                type="textarea"
                label="Poznámka"
                name="poznamka"
                placeholder="Poznámka k adrese"
                max=""
              />
            </FormKit>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            name="configuration"
            label="Beton"
            previousLabel="Zpět"
          >
            <FormKit type="group" name="configuration">
              <FormKit
                type="select"
                label="Beton"
                name="druhBetonu"
                :options="druhyBetonu"
                validation="required"
              />
              <FormKit
                required
                type="text"
                label="Kvalita/Typ"
                name="kvalitaTyp"
              />
              <FormKit
                type="select"
                label="Tloušťka kameniva (max. 16mm)"
                name="tloustkaKameniva"
                :options="[
                  { value: 8, label: '4/8' },
                  { value: 16, label: '8/16' },
                ]"
              />
              <FormKit
                type="number"
                label="Délka hadic"
                name="delkaHadic"
                placeholder="bm"
                validation="required|number"
                max="100"
                help="Max. 100m, více pouze po dohodě"
              />
              <FormKit
                type="number"
                label="Do jaké výšky budeme beton čerpat"
                name="vyska"
                placeholder="m"
                validation="required|number|max:10"
                max="10"
              />
              <FormKit
                type="textarea"
                label="Stručný popis práce"
                name="poznamka"
                placeholder="Co se bude dělat (max 100 znaků)"
                max="100"
              />

              <FormKit
                type="checkbox"
                label="Zapamatovat pro příště"
                name="remember"
              />
            </FormKit>
          </FormKit>
        </FormKit>
      </FormKit>
    </div>
  </div>
  <p class="font-semibold text-lg text-green-400 m-5">
    Vaše poptávka byla úspěšně odeslána. Děkujeme.
  </p>
</template>
