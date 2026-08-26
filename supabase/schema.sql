-- PakAuraa Supabase schema.
-- Run in the Supabase SQL editor once a project is created, then set
-- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
-- in your environment to bring auth, the admin panel, and orders online.

-- ── Profiles (extends Supabase auth.users) ──────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists address text;
alter table profiles add column if not exists city text;

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Products (admin-managed catalog; src/lib/data.ts is the zero-config seed/fallback) ──
create table if not exists products (
  id text primary key,
  name text not null,
  price integer not null,
  stock integer not null default 0,
  data jsonb not null, -- full Product shape from src/lib/data.ts
  updated_at timestamptz not null default now()
);

alter table products add column if not exists created_at timestamptz not null default now();

alter table products enable row level security;
create policy "Products are publicly readable" on products for select using (true);
create policy "Only admins can modify products" on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Seed the 5 launch products from src/lib/data.ts so the admin panel has
-- real, editable rows from day one. Only runs once (guarded by an empty-table check).
do $$
begin
  if not exists (select 1 from products limit 1) then
    insert into products (id, name, price, stock, data) values
    ('sultan-e-zafroon', 'Sultan-e-Zafroon', 18500, 100, $json$
      {"id":"sultan-e-zafroon","name":"Sultan-e-Zafroon","arabicName":"سلطان الزعفران","meaning":"Sultan — King, Ruler. Zafroon — Saffron. Together: the King of Saffron Perfumes.","tagline":"The King of Saffron Perfumes","collection":"Signature Collection","category":"Premium Arabic Oud + Saffron","fragranceFamily":["Oriental","Oud","Spicy","Amber"],"gender":"unisex","audience":["Men + Unisex","Luxury buyers","Oud lovers"],"vibe":"Royal · Deep · Arabic · Expensive","description":"The King of Saffron Perfumes. Premium oud meets Kashmir saffron in a royal Arabic declaration.","longDescription":"Sultan-e-Zafroon is not a fragrance. It is a declaration. The name says everything — Sultan, the King; Zafroon, the Saffron. The opening breath of golden saffron unfurls over a majestic heart of premium oud blend, revered across centuries of Arabic perfumery. Amber resin deepens the composition with warmth and mystery, while black musk and patchouli anchor it in an earthy depth that lasts from dusk until dawn. This is the scent of presence. Of authority. Of a man — or woman — who walks into a room and commands it without saying a word. Our flagship, positioned for the luxury buyer and the true oud lover.","price":18500,"sizes":[{"ml":30,"price":9500},{"ml":50,"price":14500},{"ml":100,"price":18500}],"size":"50ml","gradient":"product-gradient-sultan","image":"/sultan-e-zafroon-v2.jpeg","gallery":["/sultan-e-zafroon-v2.jpeg"],"badge":"FLAGSHIP","comingSoon":true,"notes":{"top":["Saffron Oil"],"heart":["Oud Blend (Premium)","Amber Resin"],"base":["Black Musk","Patchouli"]},"longevity":10,"projection":9,"sillage":9,"concentration":"Extrait de Parfum","occasions":["Evening","Wedding","Royal Events","Special Occasion"],"seasons":["Autumn","Winter"],"dayNight":"night","madeIn":"Pakistan","ingredients":"Alcohol Denat., Parfum (Fragrance), Aqua (Water), Oud Blend, Saffron Oil, Amber Resin, Black Musk, Patchouli."}
    $json$::jsonb),
    ('naazif', 'Naazif', 9500, 100, $json$
      {"id":"naazif","name":"Naazif","arabicName":"نازيف","meaning":"Naazif (نازيف) means pure, clean, clear — the symbol of freshness.","tagline":"Just Showered Luxury Feel","collection":"Fresh Collection","category":"Fresh + Clean + Modern Arabic","fragranceFamily":["Fresh","Citrus","Aqua","Musk"],"gender":"unisex","audience":["Men & Women (Unisex)","Young & modern niche","Office / Daily wear"],"vibe":"Clean · Classy · Refreshing","description":"Pure. Clean. Clear. The luxury of freshness — a shower-fresh Arabic modern signature.","longDescription":"Naazif — the Arabic word for pure, clean, and clear — worn as a fragrance. Italian bergamot and cool mint open like a morning window thrown wide; crisp, immediate, and invigorating. Green tea oil softens the freshness into something refined and considered, while vetiver adds a quiet earthy base that keeps the composition grounded. White musk is the final note — clean skin that smells quietly expensive without trying. Naazif is for every moment that demands clarity of presence: the office, the city, the day. A young, modern, unisex niche signature for daily wear and effortless gifting.","price":9500,"sizes":[{"ml":30,"price":5500},{"ml":50,"price":9500},{"ml":100,"price":16500}],"size":"50ml","gradient":"product-gradient-naazif","image":"/naazif.jpeg","gallery":["/naazif.jpeg","/packaging-lifestyle.jpeg"],"badge":"NEW ARRIVAL","comingSoon":true,"notes":{"top":["Bergamot","Mint Blend"],"heart":["Green Tea Oil","Vetiver"],"base":["White Musk"]},"longevity":7,"projection":6,"sillage":5,"concentration":"Eau de Parfum","occasions":["Daily","Office","Morning","Gifting"],"seasons":["Spring","Summer"],"dayNight":"day","madeIn":"Pakistan","ingredients":"Alcohol Denat., Parfum (Fragrance), Aqua (Water), Bergamot, Green Tea Oil, White Musk, Mint Blend, Vetiver."}
    $json$::jsonb),
    ('zurtaan', 'Zurtaan', 2199, 100, $json$
      {"id":"zurtaan","name":"Zurtaan","arabicName":"زرتان","meaning":"Zurtaan means strong, power, toughness.","tagline":"Fresh in the Opening. Bold at Heart. Powerful in the Dry Down.","collection":"Signature Collection","category":"Woody Spicy Perfume for Men","fragranceFamily":["Woody","Spicy"],"gender":"men","audience":["Everyday Wear","Office","Casual Outings","Evening","Dinner","Social Gatherings","Special Occasions"],"vibe":"Fresh · Energetic · Aromatic · Spicy · Woody · Sophisticated","description":"Zurtaan is a bold Woody Spicy fragrance created for the modern man. It opens with a refreshing blend of lemon, ginger, lavender and mint, develops into an aromatic heart of apple, juniper, cardamom and geranium, and settles into a warm woody base of tonka bean, amberwood and vetiver.","longDescription":"Zurtaan opens with a vibrant burst of lemon, ginger, lavender and mint, creating a fresh and energetic first impression. As the fragrance develops, apple, juniper, cardamom and geranium reveal an aromatic heart that balances fruity freshness with warm spice. The fragrance finally settles into a sophisticated base of tonka bean, amberwood and vetiver, leaving behind a warm, woody and earthy character. Zurtaan is designed for the man who wants his fragrance to feel confident, refined and memorable.","price":2199,"originalPrice":2499,"sizes":[{"ml":50,"price":2199}],"size":"50ml","gradient":"product-gradient-zurtaan","image":"/zurtaan perfume.png","gallery":["/zurtaan perfume.png"],"pdfCard":"/Zurtaan-card.png","seoTitle":"Zurtaan | Woody Spicy Perfume for Men | PakAuraa","seoDescription":"Discover Zurtaan by PakAuraa — a bold Woody Spicy fragrance with fresh lemon, ginger, lavender and mint, an aromatic heart of apple, juniper, cardamom and geranium, and a warm woody base of tonka bean, amberwood and vetiver.","notes":{"top":["Lemon","Ginger","Lavender","Mint"],"heart":["Apple","Juniper","Cardamom","Geranium"],"base":["Tonka Bean","Amberwood","Vetiver"]},"longevity":9,"projection":8,"sillage":8,"concentration":"Eau de Parfum","occasions":["Everyday Wear","Office","Casual Outings","Evening","Dinner","Social Gatherings","Special Occasions"],"seasons":["Spring","Autumn","Winter"],"dayNight":"both","madeIn":"Pakistan","ingredients":"Alcohol Denat., Parfum (Fragrance), Aqua (Water), Lemon, Ginger, Lavender, Mint, Apple, Juniper, Cardamom, Geranium, Tonka Bean, Amberwood, Vetiver."}
    $json$::jsonb),
    ('zarfah', 'Zarfah', 1999, 100, $json$
      {"id":"zarfah","name":"Zarfah","arabicName":"ظرفه","meaning":"Zarfah means a graceful, beautiful, elegant woman.","tagline":"Fresh. Feminine. Unforgettable.","collection":"Fruity Floral Collection","category":"Women's Fragrance — Fruity Floral","fragranceFamily":["Fruity","Floral","Fresh","Sweet","Citrus"],"gender":"women","audience":["Women","Day & Evening","Casual & Special Occasions"],"vibe":"Fresh · Fruity · Feminine · Sweet · Elegant · Vibrant","description":"Fresh. Feminine. Unforgettable. Zarfah blends juicy fruits, delicate florals and a smooth musky-woody base into an elegant fragrance designed to make every moment memorable.","longDescription":"Zarfah is a vibrant and feminine fragrance created for women who love to leave a beautiful, unforgettable impression. It opens with a sparkling burst of juicy fruits and bright citrus, moves into a soft floral heart, and settles into a smooth, warm and elegant base of musk, woods and oakmoss. The result is a fresh, playful and sophisticated scent that feels confident, graceful and effortlessly attractive.","price":1999,"originalPrice":2299,"sizes":[{"ml":50,"price":1999}],"size":"50ml","gradient":"product-gradient-zarfah","image":"/zarfah perfume.png","gallery":["/zarfah perfume.png"],"pdfCard":"/Zarfah-card.png","performanceText":"8–10 Hours","seoTitle":"Zarfah Women's Perfume | Fruity Floral Fragrance | PakAuraa","seoDescription":"Discover Zarfah by PakAuraa — a vibrant women's fruity floral fragrance with juicy fruits, delicate florals, musk and woods. Long-lasting 8–10 hour performance.","notes":{"top":["Purple Passion Fruit","Grapefruit","Pineapple","Tangerine","Strawberry"],"heart":["Peony","Vanilla Orchid","Red Berries","Jasmine","Lily of the Valley"],"base":["Musk","Blonde Woods","Oakmoss"]},"sillage":6,"longevity":7,"projection":6,"concentration":"Eau de Parfum","occasions":["Day & Evening","Casual Outings","Special Occasions"],"seasons":["Spring","Summer"],"dayNight":"both","madeIn":"Pakistan","ingredients":"Alcohol Denat., Parfum (Fragrance), Aqua (Water), Purple Passion Fruit, Grapefruit, Pineapple, Tangerine, Strawberry, Peony, Vanilla Orchid, Red Berries, Jasmine, Lily of the Valley, Musk, Blonde Woods, Oakmoss."}
    $json$::jsonb),
    ('nuxtar', 'Nuxtar', 10800, 100, $json$
      {"id":"nuxtar","name":"Nuxtar","arabicName":"نكستار","meaning":"NUX — Night. TAR — Star. Together: Night Star, dark attraction.","tagline":"Night King Perfume","collection":"Night Collection","category":"Night, Sweet, Smoky Masculine","fragranceFamily":["Oriental","Sweet","Warm","Magnetic"],"gender":"men","audience":["Men","Evening / Winter","Party & date perfume"],"vibe":"Dark · Mysterious · Attractive","description":"Night Star. A dark, sweet, smoky masculine for those who own the night.","longDescription":"Nuxtar. Night Star. NUX — Night. TAR — Star. The fragrance that rules the dark hours. Cardamom and cinnamon burn bright in the opening — warm, seductive, and impossible to ignore. Amber and vanilla bean form a heart that deepens as the evening progresses, becoming richer, more magnetic, more dangerous. A woody base keeps the composition grounded with an almost hypnotic gravity — the kind that makes people lean closer and ask, what are you wearing? Nuxtar is the perfume for the party, the dinner, the winter evening that was meant to be remembered.","price":10800,"sizes":[{"ml":30,"price":6000},{"ml":50,"price":10800},{"ml":100,"price":18000}],"size":"50ml","gradient":"product-gradient-nuxtar","image":"/nuxtar-v2.jpeg","gallery":["/nuxtar-v2.jpeg"],"badge":"LIMITED","limitedEdition":true,"comingSoon":true,"notes":{"top":["Cardamom","Cinnamon"],"heart":["Amber","Vanilla Bean"],"base":["Woody Base"]},"longevity":9,"projection":8,"sillage":8,"concentration":"Eau de Parfum","occasions":["Evening","Party","Date Night","Winter Formal"],"seasons":["Autumn","Winter"],"dayNight":"night","madeIn":"Pakistan","ingredients":"Alcohol Denat., Parfum (Fragrance), Aqua (Water), Amber, Vanilla Bean, Cardamom, Cinnamon, Woody Base."}
    $json$::jsonb);
  end if;
end $$;

-- ── Orders ───────────────────────────────────────────────────────────
create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users (id),
  items jsonb not null,
  total integer not null,
  payment_method text not null check (payment_method in ('cod', 'card', 'easypaisa', 'jazzcash', 'giftcard')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cod', 'shipped', 'delivered', 'cancelled')),
  customer jsonb not null,
  created_at timestamptz not null default now()
);

alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists gift_card_code text;
alter table orders add column if not exists gift_card_amount integer not null default 0;
alter table orders add column if not exists referral_code text;
alter table orders add column if not exists courier_company text;
alter table orders add column if not exists courier_helpline text;
alter table orders add column if not exists rider_name text;
alter table orders add column if not exists rider_phone text;
alter table orders add column if not exists delivered_by text;
alter table orders add column if not exists delivered_to text;
alter table orders add column if not exists delivered_at timestamptz;
alter table orders add column if not exists cancel_reason text;
alter table orders add column if not exists cancel_note text;
alter table orders add column if not exists cancelled_by text;
alter table orders add column if not exists cancelled_at timestamptz;
alter table orders add column if not exists gift_cards_issued boolean not null default true;

alter table orders enable row level security;
create policy "Users can view their own orders"
  on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders"
  on orders for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update orders"
  on orders for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Coupons ──────────────────────────────────────────────────────────
create table if not exists coupons (
  code text primary key,
  percent_off integer check (percent_off between 1 and 100),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table coupons add column if not exists min_order_value integer not null default 0;
alter table coupons add column if not exists max_uses integer;
alter table coupons add column if not exists used_count integer not null default 0;

alter table coupons enable row level security;
create policy "Admins manage coupons" on coupons for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Reviews ──────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references products (id),
  user_id uuid references auth.users (id),
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  author text not null,
  location text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;
create policy "Approved reviews are publicly readable"
  on reviews for select using (approved = true);
create policy "Users can submit reviews"
  on reviews for insert with check (auth.uid() = user_id);
create policy "Admins manage all reviews" on reviews for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Seed the 5 launch reviews from src/lib/data.ts, pre-approved, so the PDP
-- doesn't go from 5 reviews to 0 the moment reviews become DB-driven.
do $$
begin
  if not exists (select 1 from reviews limit 1) then
    insert into reviews (product_id, rating, quote, author, location, approved) values
    ('sultan-e-zafroon', 5, 'Sultan-e-Zafroon is unlike anything I''ve experienced. The saffron and oud combination is world-class. I wore it to a wedding and received compliments all night.', 'Ahmad R.', 'Lahore', true),
    (null, 5, 'I gifted PakAuraa to my family in London and they thought I''d brought it from a boutique in Paris. The packaging alone is breathtaking.', 'Sana M.', 'Islamabad', true),
    ('naazif', 5, 'Naazif is my everyday signature now. Fresh, clean, and effortlessly luxurious. Nothing at this price range comes close.', 'Zara K.', 'Karachi', true),
    ('zurtaan', 5, 'Zurtaan is exactly what I wanted — bold, masculine, long-lasting. My colleagues ask me about it every single day.', 'Usman T.', 'Islamabad', true),
    ('zarfah', 5, 'Zarfah is the most beautiful floral fragrance I have ever worn. Soft, romantic, and completely unforgettable. PakAuraa has set a new standard.', 'Nadia A.', 'Karachi', true);
  end if;
end $$;

-- ── Contact form submissions ─────────────────────────────────────────
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;
create policy "Anyone can send a contact message"
  on contact_messages for insert with check (true);
create policy "Admins can read contact messages" on contact_messages for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Newsletter subscribers ───────────────────────────────────────────
create table if not exists newsletter_subscribers (
  email text primary key,
  subscribed_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert with check (true);
create policy "Admins can read subscribers" on newsletter_subscribers for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Page views (built-in visitor analytics for the admin dashboard) ──
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at);
create index if not exists page_views_session_id_idx on page_views (session_id);

alter table page_views enable row level security;
create policy "Anyone can record a page view"
  on page_views for insert with check (true);
create policy "Admins can read page views" on page_views for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Stock notifications ("Notify Me When Back in Stock") ──────────────
create table if not exists stock_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id text references products (id) on delete cascade,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists stock_notifications_product_idx on stock_notifications (product_id, notified);

alter table stock_notifications enable row level security;
create policy "Anyone can request a stock notification"
  on stock_notifications for insert with check (true);
create policy "Admins can view stock notifications" on stock_notifications for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update stock notifications" on stock_notifications for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Loyalty / reward points (PKR 200 spent = 1 point, 1 point = PKR 1) ─
-- Points are "pending" on order placement — they only become real (counted in
-- balance) when the admin marks the order as "paid". This prevents points from
-- being awarded on orders that never actually get paid (e.g. JazzCash screenshot
-- was fake, or the customer cancels before paying). If an order is later
-- cancelled or returned, the pending points are reversed.
-- Balance = SUM(points) WHERE reason = 'earned' — computed from ledger, never
-- stored as a mutable column (RSLs prevent self-edit abuse).
create table if not exists loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id text references orders (id) on delete set null,
  points integer not null,
  reason text not null check (reason in ('pending', 'earned', 'redeemed', 'adjustment')),
  created_at timestamptz not null default now()
);

create index if not exists loyalty_ledger_user_idx on loyalty_ledger (user_id);

alter table loyalty_ledger enable row level security;
create policy "Users can view their own loyalty ledger"
  on loyalty_ledger for select using (auth.uid() = user_id);
create policy "Admins can view all loyalty ledger" on loyalty_ledger for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Gift cards (fixed PKR 2k/5k/10k/20k or custom amount) ──────────────
create table if not exists gift_cards (
  code text primary key,
  initial_amount integer not null check (initial_amount > 0),
  balance integer not null check (balance >= 0),
  recipient_email text not null,
  recipient_name text,
  sender_name text,
  message text,
  order_id text references orders (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table gift_cards enable row level security;
create policy "Admins manage gift cards" on gift_cards for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Affiliate & referral program ────────────────────────────────────
create table if not exists affiliates (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  commission_rate numeric not null default 0.01 check (commission_rate between 0 and 1),
  created_at timestamptz not null default now()
);

alter table affiliates enable row level security;
create policy "Users can view their own affiliate record"
  on affiliates for select using (auth.uid() = user_id);
create policy "Admins can view all affiliates" on affiliates for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references auth.users (id) on delete cascade,
  order_id text references orders (id) on delete set null,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'available', 'paid', 'cancelled')),
  earned_at timestamptz,
  available_at timestamptz,
  cancelled boolean not null default false,
  cancel_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_commissions_affiliate_idx on affiliate_commissions (affiliate_user_id);
create index if not exists affiliate_commissions_order_idx on affiliate_commissions (order_id);
create index if not exists affiliate_commissions_status_idx on affiliate_commissions (status, available_at);

-- Drop the original 3-state check if it exists from earlier deploys so we
-- can extend to 4 states (pending → available → paid, plus cancelled).
alter table affiliate_commissions drop constraint if exists affiliate_commissions_status_check;

-- 10-day payout holding period: commissions earn on order delivery and
-- become available for payout 10 days later. A daily Vercel cron flips
-- status from "pending" to "available" once available_at is in the past.
-- If a customer returns the product inside the 7-day return window, the
-- admin marks the return as "completed" and the related commission is
-- reversed (status → cancelled, with reason + timestamp) so the affiliate
-- dashboard can show why it was clawed back.

alter table affiliate_commissions enable row level security;
create policy "Users can view their own commissions"
  on affiliate_commissions for select using (auth.uid() = affiliate_user_id);
create policy "Admins can manage all commissions" on affiliate_commissions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Blog / Journal (SEO content) ────────────────────────────────────
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_image text,
  author text not null default 'PakAuraa',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "Published posts are publicly readable"
  on blog_posts for select using (published = true);
create policy "Admins manage all posts" on blog_posts for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Press & Media mentions ───────────────────────────────────────────
create table if not exists press_mentions (
  id uuid primary key default gen_random_uuid(),
  outlet text not null,
  title text not null,
  excerpt text,
  image text,
  link text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table press_mentions enable row level security;
create policy "Published press mentions are publicly readable"
  on press_mentions for select using (published = true);
create policy "Admins manage all press mentions" on press_mentions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Abandoned cart recovery ──────────────────────────────────────────
-- No public RLS policies at all — every read/write goes through server
-- routes using the service-role client, since this holds customer carts.
create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  items jsonb not null,
  total integer not null,
  last_seen_at timestamptz not null default now(),
  reminder_sent boolean not null default false,
  recovered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists abandoned_carts_email_idx on abandoned_carts (email);
create index if not exists abandoned_carts_reminder_idx on abandoned_carts (reminder_sent, recovered, last_seen_at);

alter table abandoned_carts enable row level security;

-- ── Announcement bar (site-wide promo strip above the header) ───────
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link text,
  active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists announcements_active_order_idx on announcements (active, sort_order);

alter table announcements enable row level security;
create policy "Active announcements are publicly readable"
  on announcements for select using (active = true);
create policy "Admins manage announcements" on announcements for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ── Returns / refunds (7-day return window) ──────────────────────────
-- Created when a customer asks to return a product within the return
-- window. The admin panel flips its `status` to approved/rejected/completed
-- and on completion the related affiliate commission is reversed.
create table if not exists return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders (id) on delete cascade,
  customer_id uuid references auth.users (id),
  customer_email text not null,
  product_id text not null,
  product_name text not null,
  reason text not null,
  customer_note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  refund_amount integer not null default 0,
  admin_note text,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists return_requests_order_idx on return_requests (order_id);
create index if not exists return_requests_customer_idx on return_requests (customer_id);
create index if not exists return_requests_status_idx on return_requests (status);

alter table return_requests enable row level security;
create policy "Customers can view their own return requests"
  on return_requests for select using (auth.uid() = customer_id);
create policy "Customers can create return requests"
  on return_requests for insert with check (auth.uid() = customer_id);
create policy "Admins manage all return requests"
  on return_requests for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
