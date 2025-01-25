<script setup lang="ts">
import type { DatePickerMarker } from "@vuepic/vue-datepicker";
import { Loader } from "@googlemaps/js-api-loader";
import DatePicker from "@vuepic/vue-datepicker";
import type { AresApiResponse } from "../types";
import { onMounted, computed, ref } from "vue";
import "@vuepic/vue-datepicker/dist/main.css";
import { watchDebounced } from "@vueuse/core";
import { useAsyncState } from "@vueuse/core";
import { form } from "./state";

async function ares(ico: string): Promise<AresApiResponse> {
  const response = await fetch(`${import.meta.env.VITE_ARES_URL}/${ico}`);
  const data = await response.json();
  return data as AresApiResponse;
}

const druhyAdresy = [
  { value: "existing", label: "Existující adresa" },
  { value: "construction", label: "Stavba - Pozemek" },
];

onMounted(async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    version: "weekly",
    language: "cs",
  });
  const Places = await loader.importLibrary("places");
  const input = document.getElementById("address-query") as HTMLInputElement;

  console.log("[Google Maps] input", input);

  //this object will be our second arg for the new instance of the Places API
  const options = {
    componentRestrictions: { country: "cz" }, // limiter for the places api search
    fields: ["address_components", "geometry", "icon", "name"], // allows the api to accept these inputs and return similar ones
    strictBounds: false, // optional
  };

  // per the Google docs create the new instance of the import above. I named it Places.
  const autocomplete = new Places.Autocomplete(input, options);

  console.log("[Google Maps] autocomplete", autocomplete); //optional log but will show you the available methods and properties of the new instance of Places.

  //add the place_changed listener to display results when inputs change
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
    console.log("[Google Maps] change - place", place);
    place.address_components.forEach((component: any) => {
      console.log("[Google Maps] change - component", component);
      if (component.types.includes("postal_code")) {
        form.address_zip = component.long_name;
      } else if (component.types.includes("locality")) {
        form.address_city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        form.address_note = component.long_name;
      }
    });
  });
});
({
  // Ares API response example
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
});

const typyOsob = [
  { value: "fyzicka", label: "Fyzická osoba" },
  { value: "podnikatel", label: "Fyzická osoba podnikatel" },
  { value: "pravnicka", label: "Společnost" },
  {
    value: "baracnik",
    label: "Baráčník (osoba, která si staví vlastní rodinný dům)",
  },
];

const druhyBetonu = [
  { value: "vlastni", label: "Vlastní" },
  { value: "betonTeplice", label: "Potřebuji beton dodat - Teplice" },
  { value: "betonMimo", label: "Potřebuji beton dodat - mimo Teplice" },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
form.date = tomorrow.toISOString().split("T")[0];
form.time = "07:00";

// const in30Days = new Date()
// in30Days.setDate(in30Days.getDate() + 30)

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

const markers = computed<DatePickerMarker[]>(() => [
  {
    date: "2024-09-29",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-06",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-10",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-13",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-16",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-17",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
  {
    date: "2024-10-18",
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  },
]);

const
    contactSameAsResponsible = ref<boolean>(true),
    confirmation = ref<boolean>(false),
    remember = ref<boolean>(false),
    addressQuery = ref<string>("");

watchDebounced(
  () => form,
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

const step = ref(1)

const nextStep = () => {
  if (step.value < 4) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const corsHeaders = {
  // "Access-Control-Allow-Origin": "*",
  // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  // "Access-Control-Allow-Headers":
  //   "Content-Type, Authorization, Content-Length, X-Requested-With",
  "Content-Type": "application/json",
};

// fetch orders
// const orders = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
// console.log(orders);

const onSubmit = async (formData, node) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      mode: "no-cors",
      headers: corsHeaders,
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error("Failed to submit order");
    }

    const data = await res.json();
    console.log("Order submitted:", data);
    // Show success message or redirect
  } catch (error) {
    console.error("Error submitting order:", error);
    // Show error message
  }
};
</script>
<template>
  <div class="flex flex-row justify-center bg-zinc-700 min-h-screen dark">
    <div id="poptavka" class="mx-auto my-12 w-full max-w-xl">
      <FormKit
        type="form"
        @submit="onSubmit"
        :value="form"
        submitLabel="Odeslat poptávku"
      >
        <FormKit :type="('multi-step' as any)" tab-style="progress">
          <FormKit
            :type="('step' as any)"
            name="reservation"
            label="Rezervace"
            nextLabel="Pokračovat"
          >
            <label
              for="date"
              class="block mb-2.5 font-medium text-gray-700 text-lg dark:text-gray-300"
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
              class="mx-auto mb-5"
              required
              locale="cs"
              autoApply
              :loading="disabledDates.isLoading.value"
              preventMinMaxNavigation
              disableYearSelect
            />
            <label
              for="time"
              class="block mb-2.5 font-medium text-gray-700 text-lg dark:text-gray-300"
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
              class="mx-auto mb-5"
              autoApply
              :minutesIncrement="15"
              :minutesGridIncrement="15"
              preventMinMaxNavigation
            />
            <p class="text-gray-400 text-sm">
              Rezervace je možná pouze od 7:00 do 14:00
            </p>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            label="Subjekt"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <FormKit
              type="select"
              name="customer_type"
              v-model="form.customer_type"
              label="Typ osoby"
              :options="typyOsob"
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
              field="customer_vat"
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
          <FormKit
            :type="('step' as any)"
            name="persons"
            label="Osoby"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <label class="font-semibold text-zinc-200">Odpovědná osoba</label>
            <FormKit type="text" label="Jméno" name="customer_name" />
            <FormKit type="text" label="Telefon" name="customer_phone" />
            <FormKit type="email" label="Email" name="customer_email" />
            <FormKit
              type="checkbox"
              label="Kontaktní osoba je stejná jako odpovědná"
              v-model="contactSameAsResponsible"
            />
            <FormKit
              type="checkbox"
              checked
              label="Potvrzuji, že jsem oprávněn jednat jménem subjektu"
              v-model="confirmation"
            />
            <div :class="{ 'hidden': contactSameAsResponsible }">
              <label class="font-semibold text-zinc-200">Kontaktní osoba</label>
              <FormKit type="text" label="Jméno" name="contact_name" />
              <FormKit type="text" label="Telefon" name="contact_phone" />
              <FormKit type="email" label="Email" name="contact_email" />
            </div>
          </FormKit>
          <FormKit
            :type="('step' as any)"
            label="Adresa"
            previousLabel="Zpět"
            nextLabel="Pokračovat"
          >
            <FormKit
              type="radio"
              label="Místo přistavění pumpy"
              name="address_type"
              v-model="form.address_type"
              :options="druhyAdresy"
              validation="required"
            />
            <FormKit
              id="address-query"
              v-if="form.address_type === 'existing'"
              type="search"
              label="Adresa"
              placeholder="Vyhledat adresu..."
              v-model="addressQuery"
            />
            <FormKit
              v-else-if="form.address_type === 'construction'"
              type="text"
              help="Nejbližší existující adresa"
              name="address_note"
              placeholder="Číslo pozemku"
              validation="required"
            />
            <FormKit
              type="text"
              :value="form.address_zip"
              name="address_zip"
              label="PSČ"
              placeholder="123 00"
              validation="required"
            />
            <FormKit
              type="text"
              :value="form.address_state"
              name="address_state"
              label="Kraj"
              placeholder="Středočeský"
              validation="required"
            />
            <FormKit
              type="text"
              :value="form.address_city"
              label="Město"
              placeholder="Město"
              name="address_city"
              validation="required"
            />
            <FormKit
              type="textarea"
              label="Poznámka"
              name="address_note"
              placeholder="Poznámka k adrese"
              max=""
            />
          </FormKit>
          <FormKit
            :type="('step' as any)"
            label="Beton"
            previousLabel="Zpět"
          >
              <FormKit
                type="select"
                label="Beton"
                name="config.type"
                :options="druhyBetonu"
                validation="required"
              />
              <FormKit
                type="text"
                label="Kvalita/Typ"
                name="config.quality"
                validation="required"
                :validation-messages="{
                  required: 'Toto pole je povinné',
                }"
                placeholder="Zadejte kvalitu/typ betonu"
              />
              <FormKit
                type="select"
                label="Tloušťka kameniva (max. 16mm)"
                name="config.thickness"
                :options="[
                  { value: 8, label: '4/8' },
                  { value: 16, label: '8/16' },
                ]"
              />
              <FormKit
                type="number"
                label="Délka hadic"
                name="config.hose_length"
                placeholder="bm"
                validation="required|number"
                max="100"
                help="Max. 100m, více pouze po dohodě"
              />
              <FormKit
                type="number"
                label="Do jaké výšky budeme beton čerpat"
                name="config.volume_height"
                placeholder="m"
                validation="required|number|max:10"
                max="10"
              />
              <FormKit
                type="textarea"
                label="Stručný popis práce"
                name="config.description"
                placeholder="Co se bude dělat (max 100 znaků)"
                max="100"
              />

              <FormKit
                type="checkbox"
                label="Zapamatovat pro příště"
                v-model="remember"
              />
          </FormKit>
        </FormKit>
      </FormKit>
    </div>
  </div>
  <p class="m-5 font-semibold text-green-400 text-lg">
    Vaše poptávka byla úspěšně odeslána. Děkujeme.
  </p>
</template>

<style>
:root {
  --dp-font-family: "Inter", sans-serif;
  --dp-menu-padding: 1rem;
  --dp-menu-min-width: 20rem;
  --dp-font-size: 1.25rem;
  --dp-time-font-size: 3rem;
  --dp-cell-size: 2.5rem;
  --dp-border-radius: 0.75rem;
  --dp-cell-border-radius: 0.75rem;
}

.dp__theme_dark {
  --dp-primary-color: #9a7d0d;
  --dp-background-color: #18181b;
}
</style>
