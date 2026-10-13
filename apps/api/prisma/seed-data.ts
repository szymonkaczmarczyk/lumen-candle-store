import type { ScentFamily } from "@lumen/shared";

interface SeedTranslation {
  name: string;
  tagline: string;
  description: string;
  mood: string;
  ritual: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
}

interface SeedVariant {
  weightGrams: number;
  burnHours: number;
  priceGrosze: number;
  stock: number;
}

export interface SeedProduct {
  slug: string;
  family: ScentFamily;
  accentColor: string;
  featured: boolean;
  variants: SeedVariant[];
  pl: SeedTranslation;
  en: SeedTranslation;
}

const classicAndGrand = (classicPrice: number, grandPrice: number, classicStock: number, grandStock: number): SeedVariant[] => [
  { weightGrams: 180, burnHours: 45, priceGrosze: classicPrice, stock: classicStock },
  { weightGrams: 380, burnHours: 85, priceGrosze: grandPrice, stock: grandStock },
];

export const demoProducts: SeedProduct[] = [
  {
    slug: "ambra-nocturna",
    family: "WOODY",
    accentColor: "#8A5A3C",
    featured: true,
    variants: classicAndGrand(16900, 27900, 24, 12),
    pl: {
      name: "Ambra Nocturna",
      tagline: "Ciepło bursztynu po zmroku",
      description: "Gęsta, otulająca kompozycja dla wieczorów, które mają trwać dłużej. Ambra i labdanum spotykają się z wanilią burbońską, a na końcu zostaje miękki, żywiczny ślad drewna.",
      mood: "Wieczór we dwoje, ciężkie zasłony, muzyka winylowa",
      ritual: "Zapal godzinę przed gośćmi, żeby zapach zdążył wypełnić pokój",
      notesTop: ["różowy pieprz", "bergamota"],
      notesHeart: ["labdanum", "ambra"],
      notesBase: ["wanilia burbońska", "drzewo sandałowe"],
    },
    en: {
      name: "Ambra Nocturna",
      tagline: "The warmth of amber after dark",
      description: "A dense, enveloping blend for evenings meant to last. Amber and labdanum meet Bourbon vanilla, leaving a soft, resinous trail of wood behind.",
      mood: "An evening for two, heavy curtains, vinyl records",
      ritual: "Light it an hour before guests arrive so the scent can fill the room",
      notesTop: ["pink pepper", "bergamot"],
      notesHeart: ["labdanum", "amber"],
      notesBase: ["Bourbon vanilla", "sandalwood"],
    },
  },
  {
    slug: "cedr-i-dym",
    family: "WOODY",
    accentColor: "#5B5247",
    featured: true,
    variants: classicAndGrand(15900, 26900, 18, 9),
    pl: {
      name: "Cedr i Dym",
      tagline: "Kominek w górskiej chacie",
      description: "Suchy cedr atlaski, wetiweria i dziegieć brzozowy. Zapach drewna, które dopiero co zgasło, z nutą skóry i chłodnego powietrza za oknem.",
      mood: "Gruby sweter, ciężka książka, śnieg za oknem",
      ritual: "Najlepsza w chłodne popołudnia, w dużym pokoju z wysokim sufitem",
      notesTop: ["kardamon", "jałowiec"],
      notesHeart: ["cedr atlaski", "skóra"],
      notesBase: ["wetiweria", "dziegieć brzozowy"],
    },
    en: {
      name: "Cedar & Smoke",
      tagline: "A fireplace in a mountain cabin",
      description: "Dry Atlas cedar, vetiver and birch tar. The scent of wood that has just gone out, with a hint of leather and cold air outside the window.",
      mood: "A thick jumper, a heavy book, snow outside",
      ritual: "Best on cold afternoons, in a large room with a high ceiling",
      notesTop: ["cardamom", "juniper"],
      notesHeart: ["Atlas cedar", "leather"],
      notesBase: ["vetiver", "birch tar"],
    },
  },
  {
    slug: "figa-srodziemna",
    family: "FRESH",
    accentColor: "#6E7B4F",
    featured: true,
    variants: classicAndGrand(15900, 26900, 30, 14),
    pl: {
      name: "Figa Śródziemna",
      tagline: "Cień drzewa figowego w południe",
      description: "Zielony liść figi, mleczny miąższ owocu i ciepłe drewno nagrzane słońcem. Lekka, ale z charakterem, pachnie jak pierwszy dzień urlopu.",
      mood: "Lniane zasłony, otwarte okno, popołudniowa sjesta",
      ritual: "Zapal rano w kuchni albo w łazience, gdzie jest najwięcej światła",
      notesTop: ["liść figi", "cytryna"],
      notesHeart: ["miąższ figi", "mleko kokosowe"],
      notesBase: ["cedr", "białe piżmo"],
    },
    en: {
      name: "Mediterranean Fig",
      tagline: "The shade of a fig tree at noon",
      description: "Green fig leaf, milky fruit flesh and warm, sun-baked wood. Light yet full of character, it smells like the first day of a holiday.",
      mood: "Linen curtains, an open window, an afternoon siesta",
      ritual: "Light it in the morning in the kitchen or bathroom, where the light is brightest",
      notesTop: ["fig leaf", "lemon"],
      notesHeart: ["fig flesh", "coconut milk"],
      notesBase: ["cedar", "white musk"],
    },
  },
  {
    slug: "biala-herbata",
    family: "FRESH",
    accentColor: "#A39E86",
    featured: false,
    variants: classicAndGrand(14900, 24900, 26, 15),
    pl: {
      name: "Biała Herbata",
      tagline: "Cisza o poranku",
      description: "Delikatna biała herbata, bergamota i jaśmin na tle czystego piżma. Najspokojniejszy zapach w kolekcji, stworzony do pracy i odpoczynku.",
      mood: "Pusty stół, filiżanka herbaty, pierwsze światło dnia",
      ritual: "Zapal na biurku na początku dnia pracy",
      notesTop: ["bergamota", "zielona mandarynka"],
      notesHeart: ["biała herbata", "jaśmin"],
      notesBase: ["białe piżmo", "ambretta"],
    },
    en: {
      name: "White Tea",
      tagline: "Morning silence",
      description: "Delicate white tea, bergamot and jasmine over clean musk. The calmest scent in the collection, made for focus and rest.",
      mood: "An empty table, a cup of tea, the first light of day",
      ritual: "Light it on your desk at the start of the working day",
      notesTop: ["bergamot", "green mandarin"],
      notesHeart: ["white tea", "jasmine"],
      notesBase: ["white musk", "ambrette"],
    },
  },
  {
    slug: "roza-damascenska",
    family: "FLORAL",
    accentColor: "#B5646A",
    featured: true,
    variants: classicAndGrand(17900, 29900, 16, 8),
    pl: {
      name: "Róża Damasceńska",
      tagline: "Ogród różany po deszczu",
      description: "Bogata róża damasceńska z soczystym liczi i ciemną paczulą. Nowoczesna róża, bardziej aksamitna niż słodka.",
      mood: "Świeże kwiaty na stole, jedwab, popołudniowe światło",
      ritual: "Zapal w sypialni na pół godziny przed snem i zgaś przed zaśnięciem",
      notesTop: ["liczi", "różowy grejpfrut"],
      notesHeart: ["róża damasceńska", "piwonia"],
      notesBase: ["paczula", "kaszmeran"],
    },
    en: {
      name: "Damask Rose",
      tagline: "A rose garden after rain",
      description: "Rich Damask rose with juicy lychee and dark patchouli. A modern rose, more velvet than sweet.",
      mood: "Fresh flowers on the table, silk, afternoon light",
      ritual: "Light it in the bedroom half an hour before sleep and put it out before you drift off",
      notesTop: ["lychee", "pink grapefruit"],
      notesHeart: ["Damask rose", "peony"],
      notesBase: ["patchouli", "cashmeran"],
    },
  },
  {
    slug: "neroli-o-swicie",
    family: "CITRUS",
    accentColor: "#C98A3E",
    featured: false,
    variants: classicAndGrand(14900, 24900, 4, 10),
    pl: {
      name: "Neroli o Świcie",
      tagline: "Pierwsze promienie w gaju pomarańczowym",
      description: "Kwiat gorzkiej pomarańczy, petitgrain i odrobina soli morskiej. Jasny, energetyczny zapach, który budzi dom.",
      mood: "Śniadanie na tarasie, białe prześcieradła, wiatr od morza",
      ritual: "Zapal w salonie w weekendowy poranek",
      notesTop: ["gorzka pomarańcza", "petitgrain"],
      notesHeart: ["neroli", "kwiat pomarańczy"],
      notesBase: ["sól morska", "drzewo gwajakowe"],
    },
    en: {
      name: "Neroli at Dawn",
      tagline: "First light in an orange grove",
      description: "Bitter orange blossom, petitgrain and a touch of sea salt. A bright, energising scent that wakes up the home.",
      mood: "Breakfast on the terrace, white sheets, a sea breeze",
      ritual: "Light it in the living room on a weekend morning",
      notesTop: ["bitter orange", "petitgrain"],
      notesHeart: ["neroli", "orange blossom"],
      notesBase: ["sea salt", "guaiac wood"],
    },
  },
  {
    slug: "tyton-i-wanilia",
    family: "GOURMAND",
    accentColor: "#7A4B2A",
    featured: false,
    variants: classicAndGrand(16900, 27900, 20, 0),
    pl: {
      name: "Tytoń i Wanilia",
      tagline: "Biblioteka dżentelmena",
      description: "Suszony liść tytoniu, wanilia i bób tonka z nutą kakao. Słodka, ale dojrzała kompozycja, która dodaje wnętrzu głębi.",
      mood: "Skórzany fotel, stare książki, kieliszek koniaku",
      ritual: "Zapal w gabinecie albo w bibliotece późnym wieczorem",
      notesTop: ["suszona śliwka", "imbir"],
      notesHeart: ["liść tytoniu", "kakao"],
      notesBase: ["wanilia", "bób tonka"],
    },
    en: {
      name: "Tobacco & Vanilla",
      tagline: "A gentleman's library",
      description: "Dried tobacco leaf, vanilla and tonka bean with a hint of cocoa. Sweet yet grown-up, it gives any room depth.",
      mood: "A leather armchair, old books, a glass of cognac",
      ritual: "Light it in the study or library late in the evening",
      notesTop: ["dried plum", "ginger"],
      notesHeart: ["tobacco leaf", "cocoa"],
      notesBase: ["vanilla", "tonka bean"],
    },
  },
  {
    slug: "las-po-deszczu",
    family: "SPICY",
    accentColor: "#3F5A4A",
    featured: false,
    variants: classicAndGrand(15900, 26900, 22, 11),
    pl: {
      name: "Las po Deszczu",
      tagline: "Spacer między sosnami",
      description: "Igliwie, mech dębowy i wilgotna ziemia z przyprawą czarnego pieprzu. Zapach lasu, który przynosi spokój do miejskiego mieszkania.",
      mood: "Kalosze w przedpokoju, mokre liście, zapach ziemi",
      ritual: "Zapal po powrocie z pracy, żeby oddzielić dzień od wieczoru",
      notesTop: ["czarny pieprz", "igliwie sosnowe"],
      notesHeart: ["mech dębowy", "liść fiołka"],
      notesBase: ["wilgotna ziemia", "cedr wirginijski"],
    },
    en: {
      name: "Forest After Rain",
      tagline: "A walk among pine trees",
      description: "Pine needles, oakmoss and damp earth spiced with black pepper. The scent of a forest that brings calm to a city flat.",
      mood: "Wellies in the hallway, wet leaves, the smell of soil",
      ritual: "Light it when you get home from work to separate the day from the evening",
      notesTop: ["black pepper", "pine needles"],
      notesHeart: ["oakmoss", "violet leaf"],
      notesBase: ["damp earth", "Virginia cedar"],
    },
  },
];
