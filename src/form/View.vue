<script setup lang="ts">
import type { DatePickerMarker } from "@vuepic/vue-datepicker";
import { Loader } from "@googlemaps/js-api-loader";
import DatePicker from "@vuepic/vue-datepicker";
import type { AresApiResponse } from "../types";
import { onMounted, computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { z } from "zod";
import { useAsyncState } from "@vueuse/core";
import "@vuepic/vue-datepicker/dist/main.css";
import { form } from "./state";

// Validation schema
const orderSchema = z.object({
  customer_type: z.enum(["fyzicka", "podnikatel", "pravnicka", "baracnik"]),
  customer_cid: z.string().optional(),
  customer_name: z.string().min(3).max(200),
  customer_vat: z.boolean().default(false),
  customer_vat_number: z.string().optional(),
  customer_phone: z.string().min(9),
  customer_email: z.string().email(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  address_type: z.enum(["existing", "construction"]),
  address_street: z.string(),
  address_state: z.string(),
  address_city: z.string(),
  address_zip: z.string(),
  address_country: z.string().default("CZ"),
  address_note: z.string().optional(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) =>
      val instanceof Date ? val.toISOString().split("T")[0] : val
    ),
  time: z
    .union([
      z.string(),
      z.object({
        hours: z.number(),
        minutes: z.number(),
        seconds: z.number().optional(),
      }),
    ])
    .transform((val) => (typeof val === "object" ? formatTime(val) : val)),
  config: z.object({
    type: z.enum(["vlastni", "betonTeplice", "betonMimo"]),
    thickness: z.number().min(8).max(16).optional(),
    quality: z.string(),
    height: z.number().optional(),
    hose_length: z.number().max(100),
    volume_height: z.number().max(10),
    description: z.string().max(100).optional(),
  }),
});

type OrderForm = z.infer<typeof orderSchema>;

// Form state
const form = ref<OrderForm>({
  customer_type: "fyzicka",
  customer_name: "",
  customer_vat: false,
  customer_phone: "",
  customer_email: "",
  address_type: "existing",
  address_street: "",
  address_state: "",
  address_city: "",
  address_zip: "",
  address_country: "CZ",
  date: "",
  time: "07:00",
  config: {
    type: "vlastni",
    quality: "",
    hose_length: 0,
    volume_height: 0,
  },
});

// Form validation state
const errors = ref<Record<string, string>>({});

// Form steps
const steps = [
  { id: 1, title: "Rezervace" },
  { id: 2, title: "Subjekt" },
  { id: 3, title: "Osoby" },
  { id: 4, title: "Adresa" },
  { id: 5, title: "Beton" },
];

const currentStep = ref(1);

// Options for select fields
const personTypes = [
  { value: "fyzicka", label: "Fyzická osoba" },
  { value: "podnikatel", label: "Fyzická osoba podnikatel" },
  { value: "pravnicka", label: "Společnost" },
  { value: "baracnik", label: "Baráčník" },
];

const addressTypes = [
  { value: "existing", label: "Existující adresa" },
  { value: "construction", label: "Stavba - Pozemek" },
];

const concreteTypes = [
  { value: "vlastni", label: "Vlastní" },
  { value: "betonTeplice", label: "Potřebuji beton dodat - Teplice" },
  { value: "betonMimo", label: "Potřebuji beton dodat - mimo Teplice" },
];

// ARES API integration
async function fetchAresData(ico: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_ARES_URL}/${ico}`);
    const data = (await response.json()) as AresApiResponse;

    if (data) {
      form.value.customer_name = data.obchodniJmeno;
      form.value.address_street = data.sidlo.textovaAdresa;
      form.value.address_city = data.sidlo.nazevObce;
      form.value.address_zip = data.sidlo.psc.toString();
      form.value.address_state = data.sidlo.nazevKraje;
    }
  } catch (error) {
    console.error("Error fetching ARES data:", error);
  }
}

// Watch for ICO changes
watch(
  () => form.value.customer_cid,
  (newIco) => {
    if (newIco && newIco.length === 8) {
      fetchAresData(newIco);
    }
  }
);

// Add this type
type OrderDate = {
  date: string;
  status: "accepted" | "pending";
};

// Replace the existing disabledDates ref with this
const { state: disabledDates } = useAsyncState(getOrderDates(), [], {
  immediate: true,
});

// Add this function to fetch order dates
async function getOrderDates(): Promise<Date[]> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/orders/dates`
    );
    if (!response.ok) throw new Error("Failed to fetch order dates");

    const orders: OrderDate[] = await response.json();

    // Convert accepted order dates to Date objects
    return orders
      .filter((order) => order.status === "accepted")
      .map((order) => new Date(order.date));
  } catch (error) {
    console.error("Error fetching order dates:", error);
    return [];
  }
}

// Update the markers computed property to use the fetched dates
const markers = computed<DatePickerMarker[]>(() =>
  disabledDates.value.map((date) => ({
    date,
    color: "red",
    type: "line",
    tooltip: [{ text: "Obsazeno" }],
  }))
);

// Initialize tomorrow's date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
form.value.date = tomorrow.toISOString().split("T")[0];

// Form navigation
const nextStep = async () => {
  try {
    // Validate current step
    const validationResult = await validateCurrentStep();
    if (validationResult && currentStep.value < steps.length) {
      currentStep.value++;
    }
  } catch (error) {
    console.error("Validation error:", error);
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Add this to your script section
const addressQuery = ref("");
const remember = ref(false);

// Add validation for steps 4 and 5 in validateCurrentStep
const validateCurrentStep = async () => {
  try {
    switch (currentStep.value) {
      case 1:
        await orderSchema
          .pick({ date: true, time: true })
          .parseAsync(form.value);
        break;
      case 2:
        await orderSchema
          .pick({
            customer_type: true,
            customer_name: true,
            customer_cid: true,
            customer_vat: true,
            customer_vat_number: true,
          })
          .parseAsync(form.value);
        break;
      case 3:
        // Validate required fields
        const validationFields = {
          customer_name: true,
          customer_phone: true,
          customer_email: true,
        };

        // Add contact person fields if not same as responsible
        if (!contactSameAsResponsible.value) {
          Object.assign(validationFields, {
            contact_name: true,
            contact_phone: true,
            contact_email: true,
          });
        }

        // Validate the fields
        await orderSchema.pick(validationFields).parseAsync(form.value);

        // Validate confirmation checkbox
        if (!confirmation.value) {
          throw new z.ZodError([
            {
              code: "custom",
              path: ["confirmation"],
              message: "Musíte potvrdit oprávnění jednat jménem subjektu",
            },
          ]);
        }
        break;
      case 4:
        await orderSchema
          .pick({
            address_type: true,
            address_street: true,
            address_state: true,
            address_city: true,
            address_zip: true,
            address_note: true,
          })
          .parseAsync(form.value);
        break;
      case 5:
        await orderSchema
          .pick({
            config: true,
          })
          .parseAsync(form.value);
        break;
    }
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = error.errors.reduce((acc, curr) => {
        acc[curr.path.join(".")] = curr.message;
        return acc;
      }, {} as Record<string, string>);
    }
    return false;
  }
};

// Add this helper function after the imports
function formatTime(timeObj: {
  hours: number;
  minutes: number;
  seconds?: number;
}) {
  const hours = String(timeObj.hours).padStart(2, "0");
  const minutes = String(timeObj.minutes).padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

// Update the onSubmit function
const onSubmit = async () => {
  try {
    const formData = { ...form.value };

    // Format time before submission
    if (typeof formData.time === "object") {
      formData.time = formatTime(formData.time);
    }

    // Format date if needed
    if (formData.date instanceof Date) {
      formData.date = formData.date.toISOString().split("T")[0];
    }

    const validatedData = await orderSchema.parseAsync(formData);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit order");
    }

    const result = await response.json();
    console.log("Order submitted successfully:", result);
    // Show success message or redirect
  } catch (error) {
    console.error("Error submitting order:", error);
    // Show error message
  }
};

// Initialize Google Maps Places Autocomplete
onMounted(async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    version: "weekly",
    language: "cs",
  });

  const Places = await loader.importLibrary("places");
  const input = document.getElementById("address-query") as HTMLInputElement;

  if (input) {
    const autocomplete = new Places.Autocomplete(input, {
      componentRestrictions: { country: "cz" },
      fields: ["address_components", "geometry", "icon", "name"],
      strictBounds: false,
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        place.address_components.forEach((component: any) => {
          if (component.types.includes("postal_code")) {
            form.value.address_zip = component.long_name;
          } else if (component.types.includes("locality")) {
            form.value.address_city = component.long_name;
          } else if (component.types.includes("administrative_area_level_1")) {
            form.value.address_state = component.long_name;
          }
        });
      }
    });
  }
});

// Add these refs to your script section after the form ref
const contactSameAsResponsible = ref(true);
const confirmation = ref(false);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-zinc-700">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <div v-for="step in steps" :key="step.id" class="flex items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                currentStep >= step.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-zinc-500 text-zinc-300',
              ]"
            >
              {{ step.id }}
            </div>
            <div
              v-if="step.id < steps.length"
              :class="[
                'h-1 w-16',
                currentStep > step.id ? 'bg-yellow-600' : 'bg-zinc-500',
              ]"
            ></div>
          </div>
        </div>
        <div class="flex justify-between text-sm text-zinc-300">
          <span v-for="step in steps" :key="step.id">{{ step.title }}</span>
        </div>
      </div>

      <!-- Form content -->
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Step 1: Reservation -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold text-zinc-100 mb-6">Rezervace</h2>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Datum rezervace
            </label>
            <DatePicker
              v-model="form.date"
              dark
              inline
              :enableTimePicker="false"
              :disabled-dates="disabledDates"
              :disabled-weekdays="[0, 6]"
              :markers="markers"
              :min-date="tomorrow"
              class="w-full"
              required
              locale="cs"
              auto-apply
            />
            <span v-if="errors.date" class="text-red-500 text-sm">
              {{ errors.date }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Čas příjezdu
            </label>
            <DatePicker
              v-model="form.time"
              dark
              timePicker
              :minTime="{ hours: 6, minutes: 0 }"
              :maxTime="{ hours: 14, minutes: 15 }"
              class="w-full"
              required
              :minutesIncrement="15"
            />
            <span v-if="errors.time" class="text-red-500 text-sm">
              {{ errors.time }}
            </span>
          </div>
        </div>

        <!-- Step 2: Subject -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold text-zinc-100 mb-6">Subjekt</h2>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Typ osoby
            </label>
            <select
              v-model="form.customer_type"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
            >
              <option
                v-for="type in personTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            <span v-if="errors.customer_type" class="text-red-500 text-sm">
              {{ errors.customer_type }}
            </span>
          </div>

          <div
            v-if="['podnikatel', 'pravnicka'].includes(form.customer_type)"
            class="mb-6"
          >
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              IČO
            </label>
            <input
              v-model="form.customer_cid"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              maxlength="8"
              placeholder="12345678"
            />
            <span v-if="errors.customer_cid" class="text-red-500 text-sm">
              {{ errors.customer_cid }}
            </span>
          </div>

          <div v-if="form.customer_type !== 'baracnik'" class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              <input
                type="checkbox"
                v-model="form.customer_vat"
                class="mr-2 rounded bg-zinc-600 text-yellow-600 focus:ring-yellow-500"
              />
              Plátce DPH
            </label>
          </div>

          <div
            v-if="form.customer_type !== 'baracnik' && form.customer_vat"
            class="mb-6"
          >
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              DIČ
            </label>
            <input
              v-model="form.customer_vat_number"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              minlength="8"
              maxlength="12"
              placeholder="CZ12345678"
            />
            <span
              v-if="errors.customer_vat_number"
              class="text-red-500 text-sm"
            >
              {{ errors.customer_vat_number }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              {{
                form.customer_type === "pravnicka"
                  ? "Obchodní Jméno"
                  : "Jméno a Příjmení"
              }}
            </label>
            <input
              v-model="form.customer_name"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              minlength="3"
              maxlength="200"
              required
              :placeholder="
                form.customer_type === 'pravnicka'
                  ? 'Název společnosti'
                  : 'Jan Novák'
              "
            />
            <span v-if="errors.customer_name" class="text-red-500 text-sm">
              {{ errors.customer_name }}
            </span>
          </div>
        </div>

        <!-- Step 3: Persons -->
        <div v-if="currentStep === 3">
          <h2 class="text-2xl font-bold text-zinc-100 mb-6">Osoby</h2>

          <!-- Responsible Person -->
          <div class="mb-8">
            <h3 class="font-semibold text-zinc-200 mb-4">Odpovědná osoba</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Jméno
                </label>
                <input
                  v-model="form.customer_name"
                  type="text"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  required
                />
                <span v-if="errors.customer_name" class="text-red-500 text-sm">
                  {{ errors.customer_name }}
                </span>
              </div>

              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Telefon
                </label>
                <input
                  v-model="form.customer_phone"
                  type="tel"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  required
                  placeholder="+420 123 456 789"
                />
                <span v-if="errors.customer_phone" class="text-red-500 text-sm">
                  {{ errors.customer_phone }}
                </span>
              </div>

              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  v-model="form.customer_email"
                  type="email"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  required
                  placeholder="email@example.com"
                />
                <span v-if="errors.customer_email" class="text-red-500 text-sm">
                  {{ errors.customer_email }}
                </span>
              </div>
            </div>
          </div>

          <!-- Checkboxes -->
          <div class="space-y-4 mb-8">
            <label class="flex items-center text-zinc-300">
              <input
                type="checkbox"
                v-model="contactSameAsResponsible"
                class="mr-2 rounded bg-zinc-600 text-yellow-600 focus:ring-yellow-500"
              />
              <span>Kontaktní osoba je stejná jako odpovědná</span>
            </label>

            <label class="flex items-center text-zinc-300">
              <input
                type="checkbox"
                v-model="confirmation"
                class="mr-2 rounded bg-zinc-600 text-yellow-600 focus:ring-yellow-500"
              />
              <span>Potvrzuji, že jsem oprávněn jednat jménem subjektu</span>
            </label>
          </div>

          <!-- Contact Person -->
          <div v-show="!contactSameAsResponsible" class="mb-6">
            <h3 class="font-semibold text-zinc-200 mb-4">Kontaktní osoba</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Jméno
                </label>
                <input
                  v-model="form.contact_name"
                  type="text"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  :required="!contactSameAsResponsible"
                />
                <span v-if="errors.contact_name" class="text-red-500 text-sm">
                  {{ errors.contact_name }}
                </span>
              </div>

              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Telefon
                </label>
                <input
                  v-model="form.contact_phone"
                  type="tel"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  :required="!contactSameAsResponsible"
                  placeholder="+420 123 456 789"
                />
                <span v-if="errors.contact_phone" class="text-red-500 text-sm">
                  {{ errors.contact_phone }}
                </span>
              </div>

              <div>
                <label class="block text-zinc-300 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  v-model="form.contact_email"
                  type="email"
                  class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
                  :required="!contactSameAsResponsible"
                  placeholder="email@example.com"
                />
                <span v-if="errors.contact_email" class="text-red-500 text-sm">
                  {{ errors.contact_email }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Address -->
        <div v-if="currentStep === 4">
          <h2 class="text-2xl font-bold text-zinc-100 mb-6">Adresa</h2>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Místo přistavění pumpy
            </label>
            <div class="space-y-2">
              <label
                v-for="type in addressTypes"
                :key="type.value"
                class="flex items-center text-zinc-300"
              >
                <input
                  type="radio"
                  v-model="form.address_type"
                  :value="type.value"
                  class="mr-2 rounded-full bg-zinc-600 text-yellow-600 focus:ring-yellow-500"
                />
                <span>{{ type.label }}</span>
              </label>
            </div>
            <span v-if="errors.address_type" class="text-red-500 text-sm">
              {{ errors.address_type }}
            </span>
          </div>

          <div v-if="form.address_type === 'existing'" class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Adresa
            </label>
            <input
              id="address-query"
              v-model="addressQuery"
              type="search"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Vyhledat adresu..."
            />
          </div>

          <div v-else-if="form.address_type === 'construction'" class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Číslo pozemku
            </label>
            <input
              v-model="form.address_note"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Číslo pozemku"
              required
            />
            <span v-if="errors.address_note" class="text-red-500 text-sm">
              {{ errors.address_note }}
            </span>
            <p class="mt-1 text-sm text-zinc-400">
              Nejbližší existující adresa
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              PSČ
            </label>
            <input
              v-model="form.address_zip"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="123 00"
              required
            />
            <span v-if="errors.address_zip" class="text-red-500 text-sm">
              {{ errors.address_zip }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Kraj
            </label>
            <input
              v-model="form.address_state"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Středočeský"
              required
            />
            <span v-if="errors.address_state" class="text-red-500 text-sm">
              {{ errors.address_state }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Město
            </label>
            <input
              v-model="form.address_city"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Město"
              required
            />
            <span v-if="errors.address_city" class="text-red-500 text-sm">
              {{ errors.address_city }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Poznámka
            </label>
            <textarea
              v-model="form.address_note"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Poznámka k adrese"
              rows="3"
            ></textarea>
            <span v-if="errors.address_note" class="text-red-500 text-sm">
              {{ errors.address_note }}
            </span>
          </div>
        </div>

        <!-- Step 5: Concrete -->
        <div v-if="currentStep === 5">
          <h2 class="text-2xl font-bold text-zinc-100 mb-6">Beton</h2>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Beton
            </label>
            <select
              v-model="form.config.type"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              required
            >
              <option
                v-for="type in concreteTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            <span v-if="errors['config.type']" class="text-red-500 text-sm">
              {{ errors["config.type"] }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Kvalita/Typ
            </label>
            <input
              v-model="form.config.quality"
              type="text"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Zadejte kvalitu/typ betonu"
              required
            />
            <span v-if="errors['config.quality']" class="text-red-500 text-sm">
              {{ errors["config.quality"] }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Tloušťka kameniva (max. 16mm)
            </label>
            <select
              v-model="form.config.thickness"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
            >
              <option :value="8">4/8</option>
              <option :value="16">8/16</option>
            </select>
            <span
              v-if="errors['config.thickness']"
              class="text-red-500 text-sm"
            >
              {{ errors["config.thickness"] }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Délka hadic
            </label>
            <input
              v-model.number="form.config.hose_length"
              type="number"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="bm"
              max="100"
              required
            />
            <span
              v-if="errors['config.hose_length']"
              class="text-red-500 text-sm"
            >
              {{ errors["config.hose_length"] }}
            </span>
            <p class="mt-1 text-sm text-zinc-400">
              Max. 100m, více pouze po dohodě
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Do jaké výšky budeme beton čerpat
            </label>
            <input
              v-model.number="form.config.volume_height"
              type="number"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="m"
              max="10"
              required
            />
            <span
              v-if="errors['config.volume_height']"
              class="text-red-500 text-sm"
            >
              {{ errors["config.volume_height"] }}
            </span>
          </div>

          <div class="mb-6">
            <label class="block text-zinc-300 text-sm font-bold mb-2">
              Stručný popis práce
            </label>
            <textarea
              v-model="form.config.description"
              class="w-full bg-zinc-600 text-zinc-100 rounded-lg p-2.5"
              placeholder="Co se bude dělat (max 100 znaků)"
              maxlength="100"
              rows="3"
            ></textarea>
            <span
              v-if="errors['config.description']"
              class="text-red-500 text-sm"
            >
              {{ errors["config.description"] }}
            </span>
          </div>

          <div class="mb-6">
            <label class="flex items-center text-zinc-300">
              <input
                type="checkbox"
                v-model="remember"
                class="mr-2 rounded bg-zinc-600 text-yellow-600 focus:ring-yellow-500"
              />
              <span>Zapamatovat pro příště</span>
            </label>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex justify-between mt-8">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            type="button"
            class="px-6 py-2 bg-zinc-600 text-zinc-100 rounded-lg hover:bg-zinc-500"
          >
            Zpět
          </button>
          <button
            v-if="currentStep < steps.length"
            @click="nextStep"
            type="button"
            class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500"
          >
            Další
          </button>
          <button
            v-if="currentStep === steps.length"
            type="submit"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            Odeslat
          </button>
        </div>
      </form>
    </div>
  </div>
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
