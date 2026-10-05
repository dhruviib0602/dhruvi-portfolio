// ======================= Thela, Thaila, Thikana — all the text =======================
// Everything on the page comes from here, so wording can be changed without
// touching the layout. Images: put files in public/images/thela/ and set `image`.

export const META = {
  title: 'Thela, Thaila, Thikana',
  sub: "an ethnographic study of Ahmedabad's Municipal Market",
  hero: { image: '/images/thela/hero-sign.jpg', alt: 'Municipal Market signboard on CG Road' },
  meta: [
    ['Team:', '6 people'],
    ['My role:', 'Research / Graphic Design'],
    ['Timeline:', '3 weeks'],
  ],
  year: '2025',
};

// three tl;dr cards — `mark` is the phrase that gets the red pen
export const TLDR = [
  { n: '01', title: 'what we studied', text: "How vendors, workers and shoppers cooperate, clash and adapt in one of Ahmedabad's oldest markets.", mark: 'cooperate, clash and adapt' },
  { n: '02', title: 'what we found', text: "People don't fight change, they fear losing their place in it, and quietly work around problems instead of fixing them.", mark: 'losing their place' },
  { n: '03', title: 'what we made', text: "A multisensory zine you could hear, smell and touch, holding the market's stories, tensions and memories.", mark: 'hear, smell and touch' },
];

export const MARKET = {
  copy: "Municipal Market, “MM” to most of Ahmedabad, sits on CG Road in Navrangpura. It opened in the 1970s and became one of the first hangouts in the western city during the 80s. Shops wrap around a central courtyard used for parking, and the western entrance spills over with food stalls that come alive every evening.",
  // zones of the line-drawn plan (hover / tap to read)
  zones: [
    { id: 'north', tag: 'shop owners · north row', text: 'Clothes, toys and accessories in small shops, leased from the municipal corporation since the 70s for ₹75–750 a month.' },
    { id: 'east', tag: 'shop owners · east row', text: 'More shops line the east side; together the three rows hold 49 small shops.' },
    { id: 'south', tag: 'cafés & shops · south row', text: 'Cafés and eateries like Momoman and Dairy Den sit alongside shops on the south side.' },
    { id: 'court', tag: 'parking courtyard', text: 'The middle of the market is parking. Busy days turn it into the crowd vendors rank as a problem.' },
    { id: 'west', tag: 'food stalls · west entrance', text: 'Pani puri, chhole kulche and tea stalls flood the western entrance, especially in the evenings.' },
    { id: 'road', tag: 'CG Road', text: "One of Ahmedabad's busiest streets, reached by AMTS buses and auto-rickshaws." },
    { id: 'temple', tag: 'the temple', text: 'Kuldeep Yadav has run a tea stall near the temple for about 50 years.' },
  ],
  numbers: [
    { value: 1970, suffix: 's', label: 'when the market opened' },
    { value: 7000, prefix: '~', suffix: ' m²', label: 'of shops, stalls and courtyard' },
    { value: 49, label: 'small shops' },
    { text: '₹75–750', label: 'original monthly rent, set by the AMC' },
    { value: 3, label: "renovation plans that never happened, because shopkeepers wouldn't accept new occupants", red: true },
  ],
};

export const PEOPLE = {
  copy: 'Sellers here range from kids of 7 or 8 to people in their 60s. Some have been here for decades; others, especially food stall workers, have come from far away.',
  origins: ['Nepal', 'Rajasthan', 'Bihar', 'Uttar Pradesh'],
  sellers: [
    { name: 'shop owners', note: 'Clothing, toys and accessories, many running the same shop for decades.' },
    { name: 'café owners', note: 'Places like Wahhh, Momoman and Dairy Den.' },
    { name: 'street food vendors', note: 'Pani puri, chhole kulche, tea. Many are migrants who rely on vending as their main income.' },
    { name: 'street-side sellers', note: 'Toys, footwear, coconuts and seasonal items, set up along the pavement.' },
  ],
  buyers: [
    { name: 'regulars', note: 'Locals who have visited for years and formed bonds with vendors.' },
    { name: 'teens & young adults', note: 'Here for affordable accessories and the buzz of the food stalls.' },
    { name: 'families', note: 'Strolling through the shops and sharing street food together.' },
  ],
  economy: [
    { name: 'economically disadvantaged', share: 1.4, note: 'Relying on street vending as their main source of income.' },
    { name: 'lower-middle class', share: 1, note: 'Vendors who have reached some economic stability.' },
    { name: 'middle class', share: 0.7, note: 'Mostly owners of established businesses or specialised products.' },
  ],
};

export const QUESTION = ['What drives ', { u: 'cooperation' }, ' and ', { u: 'conflict' }, ' among the people in Municipal Market, and how does it shape their openness or resistance to ', { u: 'change' }, '?'];

export const METHODS = [
  { id: 'interviews', n: '01', title: 'interviews', desc: 'Seven themes, from longevity to declining footfall' },
  { id: 'personas', n: '02', title: 'personas', desc: 'A resident, a vendor, a shopper, a delivery rider, a rickshaw driver' },
  { id: 'stakeholders', n: '03', title: 'stakeholders', desc: "Who's in the market, and who shapes it from outside" },
  { id: 'day', n: '04', title: 'a day in the life', desc: "Valiben's day behind a 5pm stall" },
  { id: 'shadowing', n: '05', title: 'shadowing', desc: 'An evening with Naresh and Vani' },
  { id: 'cards', n: '06', title: 'card sorting', desc: "Five vendors rank the market's problems" },
];

// ranked by how often we heard them; `people` show on hover as signboards
export const THEMES = [
  { name: 'longevity & continuity', line: 'The market stands on decades of commitment.', people: ['Bhupendra Shah · here since 1976', 'Neel · coconuts for 50 years', 'Kuldeep Yadav · tea for ~50 years'] },
  { name: 'satisfaction', line: 'A quiet sense of fulfilment runs through the market.', people: ['Vinodbhai · no complaints', 'Monika · feels safe, even late', "Ansar · fears change might spoil it"] },
  { name: 'disappointment & concern', line: 'Beneath the surface, murmurs of unease.', people: ['Krishna & Laxmanbhai · washrooms', 'Ravi Kumar · wages too low', 'Raju · branded stores'] },
  { name: 'hope & optimism', line: 'Dreams of a brighter future.', people: ['Manushree · better parking, new stores', 'Monika · more grocery shops'] },
  { name: 'nostalgia', line: 'A reservoir of cherished memories.', people: ['Monika · childhood visits', 'Manushree · a safe haven growing up'] },
  { name: 'adaptation', line: 'The spirit of perseverance is palpable.', people: ['Vinodbhai · toys, through everything', 'Ansar · staying steadfast'] },
  { name: 'declining footfall', line: 'Whispers of dwindling crowds.', people: ['Neel · fewer visitors', 'Raju · business slowing'] },
];

export const PERSONAS = [
  { name: 'Monika', role: 'local resident', image: '/images/thela/persona-monika.jpg' },
  { name: 'Naresh', role: 'vendor', image: '/images/thela/persona-naresh.jpg' },
  { name: 'Karan', role: 'consumer', image: '/images/thela/persona-karan.jpg' },
  { name: 'Rahul', role: 'delivery worker', image: '/images/thela/persona-rahul.jpg' },
  { name: 'Bilal', role: 'rickshaw driver', image: '/images/thela/persona-bilal.jpg' },
];

export const STAKEHOLDERS = {
  visible: ['vendors & shop owners', 'street hawkers', 'shoppers & visitors', 'market committee', 'police', 'AMC sanitation staff'],
  invisible: ['rickshaw & cab drivers', 'local residents', 'nearby businesses', 'waste pickers', 'malls & online stores', 'delivery agents', 'event organisers', 'the temple', 'bus stop'],
  line: 'Half the people who shape the market never stand inside it.',
  // power–interest grid: x/y in % (0,0 = top-left)
  quadrants: [
    { name: 'keep satisfied', note: 'High power, low daily interest.' },
    { name: 'manage closely', note: 'High power, high interest.' },
    { name: 'monitor', note: 'Low power, low interest.' },
    { name: 'keep informed', note: 'Low power, high interest.' },
  ],
  dots: [
    { name: 'police', x: 10, y: 34, q: 0, note: 'Enforce the rules on the pavement, but rarely part of daily life inside the market.' },
    { name: 'AMC', x: 28, y: 22, q: 0, note: 'Decides on renovations and fines, but is barely present day to day.' },
    { name: 'street vendors', x: 56, y: 12, q: 1 },
    { name: 'fruit seller', x: 78, y: 16, q: 1 },
    { name: 'shop owners', x: 56, y: 34, q: 1, note: 'Held off three renovation plans: the most power over what changes.' },
    { name: 'restaurant owners', x: 76, y: 38, q: 1 },
    { name: 'residents', x: 16, y: 74, q: 2 },
    { name: 'customers', x: 56, y: 62, q: 3 },
    { name: 'auto drivers', x: 78, y: 66, q: 3 },
    { name: 'AMC sweepers', x: 58, y: 82, q: 3, note: 'Keep the market clean, but have little say. Ravi Kumar struggles to cover basic needs on his wage.' },
    { name: 'tea stall', x: 80, y: 88, q: 3 },
  ],
};

// Valiben's day. start/end in hours (24h); kind: home | source | stall
export const DAY = {
  copy: 'Valiben runs a roadside toy stall. Her stall opens at 5pm, but her day starts at 6am.',
  steps: [
    { start: 6, end: 8, kind: 'home', text: 'Wakes up, fetches water from the local tank, starts the household chores.' },
    { start: 8, end: 12, kind: 'home', text: 'Gets the kids ready for school and finishes the remaining chores.' },
    { start: 12, end: 13, kind: 'home', text: 'Cooks lunch for the family with her sister.' },
    { start: 13, end: 14, kind: 'source', text: 'Checks her stock. If it is low, she goes with her husband to Kalupur market to buy toys and materials.' },
    { start: 14, end: 15, kind: 'home', text: 'Back home, eats lunch and finishes the last chores.' },
    { start: 15, end: 16, kind: 'home', text: 'Sleeps for about an hour to recharge before the market.' },
    { start: 16, end: 17, kind: 'stall', text: 'Packs her stall items and walks to the stall area.' },
    { start: 17, end: 20, kind: 'stall', text: 'Sets up with family, cleans around the stall to avoid fines, keeps the pavement clear for pedestrians.' },
    { start: 20, end: 24, kind: 'stall', text: 'They ask visitors to buy them dinner, or go home on an empty stomach after packing up.' },
  ],
  line: 'For every hour at the stall, nearly two hours of invisible work sit behind it.',
};

export const SHADOWING = {
  copy: 'Naresh and Vani have sold leather belts on the CG Road pavement for over 30 years. I spent an evening with them.',
  // add a photo later: photo: { image: '/images/thela/your-photo.jpg', alt: '…' },
  notes: [
    { title: '30 years at the same spot', text: 'Their stall is simple, but it reflects years of hard work and familiarity with the market.' },
    { title: 'They follow their own clock', text: "If yesterday's sales were good, they come early. If not, they wait till evening. That day they arrived at 4:30 and were ready by 5:15." },
    { title: 'Setting up is second nature', text: "They know exactly where each belt goes. You can tell they've done this hundreds of times." },
    { title: 'Bargaining is part of the job', text: 'They often lower the price, not because the belts are worth less, but because every sale helps meet daily needs.' },
    { title: "They're not alone in this", text: "When Naresh's UPI payment failed, a nearby vendor came over to help without hesitation." },
    { title: "But there's a lot of uncertainty", text: "They aren't sure if their licence is valid. Rules keep changing, and other belt sellers are just a few steps away." },
    { title: "They don't leave early", text: 'Even after sunset they stay, hoping for one more customer. That last sale means a lot.' },
    { title: 'Everyday survival, quiet strength', text: 'They keep going with patience, flexibility, and a strong connection to the place they call their workplace.' },
  ],
};

export const CARDS = {
  copy: "We asked five vendors to rank the market's five biggest problems.",
  problems: ['washrooms', 'waste', 'vendors', 'crowding', 'parking'],
  full: { washrooms: 'unsanitary washrooms', waste: 'waste management', vendors: 'unorganised vendors', crowding: 'overcrowding', parking: 'parking' },
  rows: [
    { name: 'Suresh', role: 'manager, Momoman', rank: ['washrooms', 'vendors', 'waste', 'crowding', 'parking'] },
    { name: 'Manish', role: 'waffle maker', rank: ['washrooms', 'waste', 'vendors', 'crowding', 'parking'] },
    { name: 'Mahesh', role: 'co-owner, Kenzeers', rank: ['washrooms', 'vendors', 'parking', 'waste', 'crowding'] },
    { name: 'Ravi', role: 'sevpuri seller', rank: ['washrooms', 'waste', 'crowding', 'parking', 'vendors'] },
    { name: 'Reema', role: 'accessory seller', rank: ['washrooms', 'parking', 'crowding', 'waste', 'vendors'] },
  ],
  parkingNote: 'Parking ranked low because it mostly troubles shoppers on busy days, not vendors.',
  customers: {
    q: 'who are your main customers?',
    bars: [
      { name: 'passers-by', first: 4 },
      { name: 'regulars', first: 1 },
      { name: 'tourists', first: 0 },
    ],
    line: 'The market runs on impulse, not loyalty.',
  },
};

// surface → underneath; the surface line gets crossed out with the red pen on hover
export const INSIGHTS = [
  { n: '01', title: 'Adaptation often replaces action.', surface: 'nobody complains about the washrooms', under: "They've stopped using them. Avoiding the problem removes the pressure to fix it, and the cycle of neglect goes on." },
  { n: '02', title: 'Resistance to change is rooted in belonging.', surface: 'vendors block renovation', under: "They aren't against progress; they can't see a version of the new market that still has a place for them." },
  { n: '03', title: 'Informal systems keep the market running.', surface: 'it looks chaotic', under: 'It runs on unspoken rules: toy sellers dodging AMC fines, food vendors hiding stock. People rely on each other, not on regulation.' },
];

export const OUTCOME = {
  copy: 'After analysing the complexity of the market, we wanted to create an outcome that reflects its layered nature. A zine felt like the right medium because it is raw, personal and accessible, much like the market itself. The interactive zine lets readers explore the space through its people, their memories and the quiet tensions that hold the market together.',
  senses: [
    { tag: 'sound', text: 'A sound sensor played a recording of the market (vendors calling out, traffic, chatter) as you turned the pages.' },
    { tag: 'smell', text: 'A page carried the actual smell of paan, the scent everyone links to the market.' },
    { tag: 'touch', text: 'Tactile elements across the pages, textures to feel and not just look at.' },
  ],
};

export const NAV = {
  prev: { title: 'Inclusive Navigation', to: '/work/inclusive-navigation' },
  next: { title: 'How to be Human', to: '/work/how-to-be-human' },
};
