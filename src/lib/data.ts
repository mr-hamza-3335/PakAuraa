export interface ProductSize {
  ml: number;
  price: number;
}

export type Gender = "men" | "women" | "unisex";

export interface Review {
  id: string | number;
  productId: string | null;
  quote: string;
  author: string;
  location: string;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  /** Literal breakdown of the name's meaning, sourced from the brand book. */
  meaning: string;
  /** Short quoted brand tagline from the brand book. */
  tagline: string;
  collection: string;
  /** PDF "Category" line. */
  category: string;
  /** PDF "Fragrance Family" bullets. */
  fragranceFamily: string[];
  gender: Gender;
  /** PDF "Audience" bullets, verbatim. */
  audience: string[];
  /** PDF "Vibe" line. */
  vibe: string;
  description: string;
  longDescription: string;
  price: number;
  /** Pre-discount price shown struck through beside `price` when this product is on sale. */
  originalPrice?: number;
  sizes: ProductSize[];
  size: string;
  gradient: string;
  image: string;
  /** Every real photo we have for this product — primary shot first. */
  gallery: string[];
  badge?: string;
  limitedEdition?: boolean;
  notes: { top: string[]; heart: string[]; base: string[] };
  longevity: number;
  projection: number;
  /** How far the scent trail carries as the wearer moves through a room — distinct from projection (how far it reads from the skin). 1–10. */
  sillage: number;
  /** Verbatim expected-performance claim (e.g. "8–10 Hours") shown on the product page. Omit rather than invent a figure. */
  performanceText?: string;
  concentration: string;
  occasions: string[];
  seasons: string[];
  dayNight: "day" | "night" | "both";
  madeIn: string;
  ingredients: string;
  /** Live inventory count, set via the admin panel. Undefined = always orderable (seed catalog default). */
  stock?: number;
  /** ISO timestamp, set for products added through the admin panel — powers "Newest" sort. */
  createdAt?: string;
  /** Hides this product from active listings/search and renders it as a non-purchasable "Coming Soon" tile instead. */
  comingSoon?: boolean;
  /** Path (in /public) to a downloadable product-details card image, e.g. "/zurtaan-card.png". */
  pdfCard?: string;
  /** Overrides the auto-generated <title> for this product's page. */
  seoTitle?: string;
  /** Overrides the auto-generated meta description for this product's page. */
  seoDescription?: string;
  /** A 5ml sample/discovery-size product — flagged so checkout can apply the flat taster delivery fee instead of free shipping. */
  isTaster?: boolean;
}

/** The size shown by default on cards and as the pre-selected PDP option. */
export function defaultSize(product: Product): ProductSize {
  return product.sizes[1] ?? product.sizes[0];
}

export interface Collection {
  id: string;
  name: string;
  subtitle: string;
  gradient: string;
  href: string;
}

export const products: Product[] = [
  // ⭐ FLAGSHIP — Sultan-e-Zafroon
  {
    id: "sultan-e-zafroon",
    name: "Sultan-e-Zafroon",
    arabicName: "سلطان الزعفران",
    meaning: "Sultan — King, Ruler. Zafroon — Saffron. Together: the King of Saffron Perfumes.",
    tagline: "The King of Saffron Perfumes",
    collection: "Signature Collection",
    category: "Premium Arabic Oud + Saffron",
    fragranceFamily: ["Oriental", "Oud", "Spicy", "Amber"],
    gender: "unisex",
    audience: ["Men + Unisex", "Luxury buyers", "Oud lovers"],
    vibe: "Royal · Deep · Arabic · Expensive",
    description: "The King of Saffron Perfumes. Premium oud meets Kashmir saffron in a royal Arabic declaration.",
    longDescription:
      "Sultan-e-Zafroon is not a fragrance. It is a declaration. The name says everything — Sultan, the King; Zafroon, the Saffron. The opening breath of golden saffron unfurls over a majestic heart of premium oud blend, revered across centuries of Arabic perfumery. Amber resin deepens the composition with warmth and mystery, while black musk and patchouli anchor it in an earthy depth that lasts from dusk until dawn. This is the scent of presence. Of authority. Of a man — or woman — who walks into a room and commands it without saying a word. Our flagship, positioned for the luxury buyer and the true oud lover.",
    price: 18500,
    sizes: [
      { ml: 30, price: 9500 },
      { ml: 50, price: 14500 },
      { ml: 100, price: 18500 },
    ],
    size: "50ml",
    gradient: "product-gradient-sultan",
    image: "/sultan-e-zafroon-v2.jpeg",
    gallery: ["/sultan-e-zafroon-v2.jpeg"],
    badge: "FLAGSHIP",
    comingSoon: true,
    notes: {
      top: ["Saffron Oil"],
      heart: ["Oud Blend (Premium)", "Amber Resin"],
      base: ["Black Musk", "Patchouli"],
    },
    longevity: 10,
    projection: 9,
    sillage: 9,
    concentration: "Extrait de Parfum",
    occasions: ["Evening", "Wedding", "Royal Events", "Special Occasion"],
    seasons: ["Autumn", "Winter"],
    dayNight: "night",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Oud Blend, Saffron Oil, Amber Resin, Black Musk, Patchouli.",
  },

  // 2 — Naazif
  {
    id: "naazif",
    name: "Naazif",
    arabicName: "نازيف",
    meaning: "Naazif means pure, clean, clear — the symbol of freshness.",
    tagline: "Just Showered Luxury Feel",
    collection: "Fresh Collection",
    category: "Fresh + Clean + Modern Arabic",
    fragranceFamily: ["Fresh", "Citrus", "Aqua", "Musk"],
    gender: "unisex",
    audience: ["Men & Women (Unisex)", "Young & modern niche", "Office / Daily wear"],
    vibe: "Clean · Classy · Refreshing",
    description: "Pure. Clean. Clear. The luxury of freshness — a shower-fresh Arabic modern signature.",
    longDescription:
      "Naazif — the Arabic word for pure, clean, and clear — worn as a fragrance. Italian bergamot and cool mint open like a morning window thrown wide; crisp, immediate, and invigorating. Green tea oil softens the freshness into something refined and considered, while vetiver adds a quiet earthy base that keeps the composition grounded. White musk is the final note — clean skin that smells quietly expensive without trying. Naazif is for every moment that demands clarity of presence: the office, the city, the day. A young, modern, unisex niche signature for daily wear and effortless gifting.",
    price: 9500,
    sizes: [
      { ml: 30, price: 5500 },
      { ml: 50, price: 9500 },
      { ml: 100, price: 16500 },
    ],
    size: "50ml",
    gradient: "product-gradient-naazif",
    image: "/naazif.jpeg",
    gallery: ["/naazif.jpeg", "/packaging-lifestyle.jpeg"],
    badge: "NEW ARRIVAL",
    comingSoon: true,
    notes: {
      top: ["Bergamot", "Mint Blend"],
      heart: ["Green Tea Oil", "Vetiver"],
      base: ["White Musk"],
    },
    longevity: 7,
    projection: 6,
    sillage: 5,
    concentration: "Eau de Parfum",
    occasions: ["Daily", "Office", "Morning", "Gifting"],
    seasons: ["Spring", "Summer"],
    dayNight: "day",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Bergamot, Green Tea Oil, White Musk, Mint Blend, Vetiver.",
  },

  // 3 — Zurtaan
  {
    id: "zurtaan",
    name: "Zurtaan",
    arabicName: "زرتان",
    meaning: "Zurtaan means strong, power, toughness.",
    tagline: "Fresh in the Opening. Bold at Heart. Powerful in the Dry Down.",
    collection: "Signature Collection",
    category: "Woody Spicy Perfume for Men",
    fragranceFamily: ["Woody", "Spicy"],
    gender: "men",
    audience: ["Everyday Wear", "Office", "Casual Outings", "Evening", "Dinner", "Social Gatherings", "Special Occasions"],
    vibe: "Fresh · Energetic · Aromatic · Spicy · Woody · Sophisticated",
    description:
      "Zurtaan is a bold Woody Spicy fragrance created for the modern man. It opens with a refreshing blend of lemon, ginger, lavender and mint, develops into an aromatic heart of apple, juniper, cardamom and geranium, and settles into a warm woody base of tonka bean, amberwood and vetiver.",
    longDescription:
      "Zurtaan opens with a vibrant burst of lemon, ginger, lavender and mint, creating a fresh and energetic first impression. As the fragrance develops, apple, juniper, cardamom and geranium reveal an aromatic heart that balances fruity freshness with warm spice. The fragrance finally settles into a sophisticated base of tonka bean, amberwood and vetiver, leaving behind a warm, woody and earthy character. Zurtaan is designed for the man who wants his fragrance to feel confident, refined and memorable.",
    price: 2199,
    originalPrice: 2499,
    sizes: [{ ml: 50, price: 2199 }],
    size: "50ml",
    gradient: "product-gradient-zurtaan",
    image: "/zurtaan-v2.jpeg",
    gallery: ["/zurtaan-v2.jpeg"],
    pdfCard: "/Zurtaan-card.png",
    seoTitle: "Zurtaan | Woody Spicy Perfume for Men | PakAuraa",
    seoDescription:
      "Discover Zurtaan by PakAuraa — a bold Woody Spicy fragrance with fresh lemon, ginger, lavender and mint, an aromatic heart of apple, juniper, cardamom and geranium, and a warm woody base of tonka bean, amberwood and vetiver.",
    notes: {
      top: ["Lemon", "Ginger", "Lavender", "Mint"],
      heart: ["Apple", "Juniper", "Cardamom", "Geranium"],
      base: ["Tonka Bean", "Amberwood", "Vetiver"],
    },
    longevity: 9,
    projection: 8,
    sillage: 8,
    concentration: "Eau de Parfum",
    occasions: ["Everyday Wear", "Office", "Casual Outings", "Evening", "Dinner", "Social Gatherings", "Special Occasions"],
    seasons: ["Spring", "Autumn", "Winter"],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Lemon, Ginger, Lavender, Mint, Apple, Juniper, Cardamom, Geranium, Tonka Bean, Amberwood, Vetiver.",
  },

  // 4 — Zarfah
  {
    id: "zarfah",
    name: "Zarfah",
    arabicName: "ظرفه",
    meaning: "Zarfah means a graceful, beautiful, elegant woman.",
    tagline: "Fresh. Feminine. Unforgettable.",
    collection: "Fruity Floral Collection",
    category: "Women's Fragrance — Fruity Floral",
    fragranceFamily: ["Fruity", "Floral", "Fresh", "Sweet", "Citrus"],
    gender: "women",
    audience: ["Women", "Day & Evening", "Casual & Special Occasions"],
    vibe: "Fresh · Fruity · Feminine · Sweet · Elegant · Vibrant",
    description:
      "Fresh. Feminine. Unforgettable. Zarfah blends juicy fruits, delicate florals and a smooth musky-woody base into an elegant fragrance designed to make every moment memorable.",
    longDescription:
      "Zarfah is a vibrant and feminine fragrance created for women who love to leave a beautiful, unforgettable impression. It opens with a sparkling burst of juicy fruits and bright citrus, moves into a soft floral heart, and settles into a smooth, warm and elegant base of musk, woods and oakmoss. The result is a fresh, playful and sophisticated scent that feels confident, graceful and effortlessly attractive.",
    price: 1999,
    originalPrice: 2299,
    sizes: [{ ml: 50, price: 1999 }],
    size: "50ml",
    gradient: "product-gradient-zarfah",
    image: "/zarfah-v2.jpeg",
    gallery: ["/zarfah-v2.jpeg"],
    pdfCard: "/Zarfah-card.png",
    performanceText: "8–10 Hours",
    seoTitle: "Zarfah Women's Perfume | Fruity Floral Fragrance | PakAuraa",
    seoDescription:
      "Discover Zarfah by PakAuraa — a vibrant women's fruity floral fragrance with juicy fruits, delicate florals, musk and woods. Long-lasting 8–10 hour performance.",
    notes: {
      top: ["Purple Passion Fruit", "Grapefruit", "Pineapple", "Tangerine", "Strawberry"],
      heart: ["Peony", "Vanilla Orchid", "Red Berries", "Jasmine", "Lily of the Valley"],
      base: ["Musk", "Blonde Woods", "Oakmoss"],
    },
    sillage: 6,
    longevity: 7,
    projection: 6,
    concentration: "Eau de Parfum",
    occasions: ["Day & Evening", "Casual Outings", "Special Occasions"],
    seasons: ["Spring", "Summer"],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Purple Passion Fruit, Grapefruit, Pineapple, Tangerine, Strawberry, Peony, Vanilla Orchid, Red Berries, Jasmine, Lily of the Valley, Musk, Blonde Woods, Oakmoss.",
  },

  // 5 — Nuxtar
  {
    id: "nuxtar",
    name: "Nuxtar",
    arabicName: "نكستار",
    meaning: "NUX — Night. TAR — Star. Together: Night Star, dark attraction.",
    tagline: "Night King Perfume",
    collection: "Night Collection",
    category: "Night, Sweet, Smoky Masculine",
    fragranceFamily: ["Oriental", "Sweet", "Warm", "Magnetic"],
    gender: "men",
    audience: ["Men", "Evening / Winter", "Party & date perfume"],
    vibe: "Dark · Mysterious · Attractive",
    description: "Night Star. A dark, sweet, smoky masculine for those who own the night.",
    longDescription:
      "Nuxtar. Night Star. NUX — Night. TAR — Star. The fragrance that rules the dark hours. Cardamom and cinnamon burn bright in the opening — warm, seductive, and impossible to ignore. Amber and vanilla bean form a heart that deepens as the evening progresses, becoming richer, more magnetic, more dangerous. A woody base keeps the composition grounded with an almost hypnotic gravity — the kind that makes people lean closer and ask, what are you wearing? Nuxtar is the perfume for the party, the dinner, the winter evening that was meant to be remembered.",
    price: 10800,
    sizes: [
      { ml: 30, price: 6000 },
      { ml: 50, price: 10800 },
      { ml: 100, price: 18000 },
    ],
    size: "50ml",
    gradient: "product-gradient-nuxtar",
    image: "/nuxtar-v2.jpeg",
    gallery: ["/nuxtar-v2.jpeg"],
    badge: "LIMITED",
    limitedEdition: true,
    comingSoon: true,
    notes: {
      top: ["Cardamom", "Cinnamon"],
      heart: ["Amber", "Vanilla Bean"],
      base: ["Woody Base"],
    },
    longevity: 9,
    projection: 8,
    sillage: 8,
    concentration: "Eau de Parfum",
    occasions: ["Evening", "Party", "Date Night", "Winter Formal"],
    seasons: ["Autumn", "Winter"],
    dayNight: "night",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Amber, Vanilla Bean, Cardamom, Cinnamon, Woody Base.",
  },

  // 6 — Zurtaan Taster (5ml discovery size)
  {
    id: "zurtaan-taster",
    name: "Zurtaan — Taster 5ml",
    arabicName: "",
    meaning: "A 5ml discovery size of Zurtaan, our Woody Spicy signature for him.",
    tagline: "Try Zurtaan Before You Commit",
    collection: "Taster Collection",
    category: "Woody Spicy Perfume for Men — 5ml Taster",
    fragranceFamily: ["Woody", "Spicy"],
    gender: "men",
    audience: ["First-time buyers", "Gifting", "Travel size"],
    vibe: "Fresh · Energetic · Aromatic · Spicy · Woody · Sophisticated",
    description:
      "A 5ml taster of Zurtaan — the exact same Woody Spicy formulation as the full 50ml bottle, in a compact size to try before you commit.",
    longDescription:
      "This is a genuine 5ml taster of Zurtaan, poured from the same batch as the full-size bottle — not a diluted or reformulated version. It carries the same fresh lemon, ginger, lavender and mint opening, the same aromatic apple, juniper, cardamom and geranium heart, and the same warm woody base of tonka bean, amberwood and vetiver. A simple, honest way to experience Zurtaan on your own skin before choosing the full 50ml bottle.",
    price: 299,
    sizes: [{ ml: 5, price: 299 }],
    size: "5ml",
    gradient: "product-gradient-zurtaan",
    image: "/zurtaan-taster.jpeg",
    gallery: ["/zurtaan-taster.jpeg"],
    isTaster: true,
    badge: "TASTER",
    notes: {
      top: ["Lemon", "Ginger", "Lavender", "Mint"],
      heart: ["Apple", "Juniper", "Cardamom", "Geranium"],
      base: ["Tonka Bean", "Amberwood", "Vetiver"],
    },
    longevity: 9,
    projection: 8,
    sillage: 8,
    concentration: "Eau de Parfum",
    occasions: ["Everyday Wear", "Gifting"],
    seasons: ["Spring", "Autumn", "Winter"],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Lemon, Ginger, Lavender, Mint, Apple, Juniper, Cardamom, Geranium, Tonka Bean, Amberwood, Vetiver.",
  },

  // 7 — Zarfah Taster (5ml discovery size)
  {
    id: "zarfah-taster",
    name: "Zarfah — Taster 5ml",
    arabicName: "",
    meaning: "A 5ml discovery size of Zarfah, our Fruity Floral signature for her.",
    tagline: "Try Zarfah Before You Commit",
    collection: "Taster Collection",
    category: "Women's Fragrance — Fruity Floral — 5ml Taster",
    fragranceFamily: ["Fruity", "Floral", "Fresh", "Sweet", "Citrus"],
    gender: "women",
    audience: ["First-time buyers", "Gifting", "Travel size"],
    vibe: "Fresh · Fruity · Feminine · Sweet · Elegant · Vibrant",
    description:
      "A 5ml taster of Zarfah — the exact same Fruity Floral formulation as the full 50ml bottle, in a compact size to try before you commit.",
    longDescription:
      "This is a genuine 5ml taster of Zarfah, poured from the same batch as the full-size bottle — not a diluted or reformulated version. It carries the same sparkling juicy-fruit and citrus opening, the same soft floral heart, and the same warm musk-and-woods base as the 50ml bottle. A simple, honest way to experience Zarfah on your own skin before choosing the full size.",
    price: 299,
    sizes: [{ ml: 5, price: 299 }],
    size: "5ml",
    gradient: "product-gradient-zarfah",
    image: "/zarfah-taster.jpeg",
    gallery: ["/zarfah-taster.jpeg"],
    isTaster: true,
    badge: "TASTER",
    notes: {
      top: ["Purple Passion Fruit", "Grapefruit", "Pineapple", "Tangerine", "Strawberry"],
      heart: ["Peony", "Vanilla Orchid", "Red Berries", "Jasmine", "Lily of the Valley"],
      base: ["Musk", "Blonde Woods", "Oakmoss"],
    },
    sillage: 6,
    longevity: 7,
    projection: 6,
    concentration: "Eau de Parfum",
    occasions: ["Day & Evening", "Gifting"],
    seasons: ["Spring", "Summer"],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Purple Passion Fruit, Grapefruit, Pineapple, Tangerine, Strawberry, Peony, Vanilla Orchid, Red Berries, Jasmine, Lily of the Valley, Musk, Blonde Woods, Oakmoss.",
  },

  // 8 — Taster Duo (Zurtaan + Zarfah, one 5ml each)
  {
    id: "taster-duo",
    name: "Zurtaan + Zarfah Taster Duo",
    arabicName: "",
    meaning: "One 5ml taster of Zurtaan and one 5ml taster of Zarfah, together at a bundled price.",
    tagline: "Try Both, Save More",
    collection: "Taster Collection",
    category: "Taster Duo — One 5ml Zurtaan + One 5ml Zarfah",
    fragranceFamily: ["Woody", "Spicy", "Fruity", "Floral"],
    gender: "unisex",
    audience: ["First-time buyers", "Gifting", "Couples"],
    vibe: "Fresh · Woody · Fruity · Floral",
    description:
      "One 5ml Zurtaan taster and one 5ml Zarfah taster, bundled together at PKR 500 — cheaper than buying both individually.",
    longDescription:
      "The Taster Duo pairs a genuine 5ml taster of Zurtaan (our Woody Spicy signature for him) with a genuine 5ml taster of Zarfah (our Fruity Floral signature for her) — both poured from the same batches as the full-size bottles. Bought separately the two tasters would cost PKR 598; bundled here they're PKR 500. A simple way for a couple, or anyone curious about both fragrances, to try each on skin before committing to a full 50ml bottle.",
    price: 500,
    sizes: [{ ml: 10, price: 500 }],
    size: "5ml + 5ml",
    gradient: "product-gradient-default",
    image: "/taster-duo.jpeg",
    gallery: ["/taster-duo.jpeg"],
    isTaster: true,
    badge: "BEST VALUE",
    notes: {
      top: ["Lemon", "Ginger", "Lavender", "Mint", "Purple Passion Fruit", "Grapefruit", "Pineapple"],
      heart: ["Apple", "Juniper", "Cardamom", "Geranium", "Peony", "Jasmine"],
      base: ["Tonka Bean", "Amberwood", "Vetiver", "Musk", "Blonde Woods"],
    },
    longevity: 8,
    projection: 7,
    sillage: 7,
    concentration: "Eau de Parfum",
    occasions: ["Everyday Wear", "Gifting"],
    seasons: ["Spring", "Autumn", "Winter", "Summer"],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua (Water) — Zurtaan taster: Lemon, Ginger, Lavender, Mint, Apple, Juniper, Cardamom, Geranium, Tonka Bean, Amberwood, Vetiver. Zarfah taster: Purple Passion Fruit, Grapefruit, Pineapple, Tangerine, Strawberry, Peony, Vanilla Orchid, Red Berries, Jasmine, Lily of the Valley, Musk, Blonde Woods, Oakmoss.",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Curated homepage collection tiles — the seven categories the brand sells by. */
export const collections: Collection[] = [
  {
    id: "men",
    name: "For Him",
    subtitle: "Bold · Powerful · Commanding",
    gradient: "linear-gradient(145deg, #0f1008 0%, #1a1808 50%, #0f1008 100%)",
    href: "/collections?cat=men",
  },
  {
    id: "women",
    name: "For Her",
    subtitle: "Elegant · Floral · Graceful",
    gradient: "linear-gradient(145deg, #1a0a12 0%, #2d1020 50%, #1a0a12 100%)",
    href: "/collections?cat=women",
  },
  {
    id: "unisex",
    name: "Unisex",
    subtitle: "Modern · Versatile · Effortless",
    gradient: "linear-gradient(145deg, #0a1212 0%, #0f1f1d 50%, #0a1212 100%)",
    href: "/collections?cat=unisex",
  },
  {
    id: "signature",
    name: "Signature Collection",
    subtitle: "The House's Defining Fragrances",
    gradient: "linear-gradient(145deg, #120a0a 0%, #2a1010 50%, #120a0a 100%)",
    href: "/collections?cat=signature",
  },
  {
    id: "limited",
    name: "Limited Edition",
    subtitle: "Rare · Exclusive · Numbered",
    gradient: "linear-gradient(145deg, #0d0d1a 0%, #12101f 50%, #0d0d1a 100%)",
    href: "/collections?cat=limited",
  },
  {
    id: "gifts",
    name: "Gift Sets",
    subtitle: "Curated · Luxurious · Wrapped",
    gradient: "linear-gradient(145deg, #0a1210 0%, #0f1f1a 50%, #0a1210 100%)",
    href: "/collections?cat=gifts",
  },
  {
    id: "tasters",
    name: "Tasters",
    subtitle: "5ml · Try Before You Commit",
    gradient: "linear-gradient(145deg, #0a0a0a 0%, #1a140a 50%, #0a0a0a 100%)",
    href: "/collections?cat=tasters",
  },
];

/** Maps a collection-tile id to the product predicate that populates it. */
export function matchesCategory(product: Product, cat: string): boolean {
  switch (cat) {
    case "men":
      return product.gender === "men" || product.gender === "unisex";
    case "women":
      return product.gender === "women";
    case "unisex":
      return product.gender === "unisex";
    case "signature":
      return product.collection === "Signature Collection";
    case "limited":
      return Boolean(product.limitedEdition);
    case "gifts":
      return product.occasions.includes("Gifting");
    case "tasters":
      return Boolean(product.isTaster);
    default:
      return true;
  }
}

export const scentMoods = [
  { id: "seductive", label: "Seductive", color: "#6B1A2A" },
  { id: "fresh", label: "Fresh", color: "#0a1f1a" },
  { id: "powerful", label: "Powerful", color: "#1a1008" },
  { id: "romantic", label: "Romantic", color: "#1a0a12" },
  { id: "bold", label: "Bold", color: "#12101a" },
  { id: "mysterious", label: "Mysterious", color: "#0d0d1a" },
];

