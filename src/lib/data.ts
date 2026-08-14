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
  /** Literal breakdown of the Arabic/root name, sourced from the brand book. */
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
  /** Path (in /public) to a downloadable product-details PDF, e.g. "/zurtaan-card.pdf". */
  pdfCard?: string;
  /** Overrides the auto-generated <title> for this product's page. */
  seoTitle?: string;
  /** Overrides the auto-generated meta description for this product's page. */
  seoDescription?: string;
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
    meaning: "Naazif (نازيف) means pure, clean, clear — the symbol of freshness.",
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
    meaning: "Zurtaan is Arabic-root inspired, meaning strong, power, toughness.",
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
    pdfCard: "/zurtaan-card.pdf",
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
    meaning: "Zarfah (ظرفه) means a graceful, beautiful, elegant woman.",
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
    pdfCard: "/zarfah-card.pdf",
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
    id: "arabic",
    name: "Arabic Collection",
    subtitle: "Oud · Royal · Heritage",
    gradient: "linear-gradient(145deg, #1a1008 0%, #2d1f0a 50%, #1a1008 100%)",
    href: "/collections?cat=arabic",
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
    case "arabic":
      return true; // every PakAuraa fragrance is an Arabic-luxury composition
    case "signature":
      return product.collection === "Signature Collection";
    case "limited":
      return Boolean(product.limitedEdition);
    case "gifts":
      return product.occasions.includes("Gifting");
    default:
      return true;
  }
}

export const reviews: Review[] = [
  {
    id: 1,
    productId: "sultan-e-zafroon",
    quote:
      "Sultan-e-Zafroon is unlike anything I've experienced. The saffron and oud combination is world-class. I wore it to a wedding and received compliments all night.",
    author: "Ahmad R.",
    location: "Lahore",
    rating: 5,
  },
  {
    id: 2,
    productId: null,
    quote:
      "I gifted PakAuraa to my family in London and they thought I'd brought it from a boutique in Paris. The packaging alone is breathtaking.",
    author: "Sana M.",
    location: "Islamabad",
    rating: 5,
  },
  {
    id: 3,
    productId: "naazif",
    quote:
      "Naazif is my everyday signature now. Fresh, clean, and effortlessly luxurious. Nothing at this price range comes close.",
    author: "Zara K.",
    location: "Karachi",
    rating: 5,
  },
  {
    id: 4,
    productId: "zurtaan",
    quote:
      "Zurtaan is exactly what I wanted — bold, masculine, long-lasting. My colleagues ask me about it every single day.",
    author: "Usman T.",
    location: "Islamabad",
    rating: 5,
  },
  {
    id: 5,
    productId: "zarfah",
    quote:
      "Zarfah is the most beautiful floral fragrance I have ever worn. Soft, romantic, and completely unforgettable. PakAuraa has set a new standard.",
    author: "Nadia A.",
    location: "Karachi",
    rating: 5,
  },
];

/** Back-compat alias used by the homepage testimonials strip. */
export const testimonials = reviews;

export function getReviewsFor(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export const scentMoods = [
  { id: "seductive", label: "Seductive", arabic: "إغرائي", color: "#6B1A2A" },
  { id: "fresh", label: "Fresh", arabic: "منعش", color: "#0a1f1a" },
  { id: "powerful", label: "Powerful", arabic: "قوي", color: "#1a1008" },
  { id: "romantic", label: "Romantic", arabic: "رومانسي", color: "#1a0a12" },
  { id: "bold", label: "Bold", arabic: "جريء", color: "#12101a" },
  { id: "mysterious", label: "Mysterious", arabic: "غامض", color: "#0d0d1a" },
];

