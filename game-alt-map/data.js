QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'street_of_the_gods',
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
  hitpoints: 100,
});

QuestJs._create.createRoom('street_of_the_gods', {
  desc:
    'The street rises to north up to the High Temple, and drops south to the market square. It is lined with stone-built buildings reaching three or even four storeys into the sky, with towers, turrets and spires reaching even higher. Grandest of all is the temple itself, standing on a platform that raises it high above the rest of the city, accessed via a wide flight of steps, but you also see the Museum of Curios to the west and the House of Elil to the southeast, with the condensers of the Aether and Flux Company behind it.{timeOfDayComment}',
  west: new QuestJs._create.Exit('museum_of_curios'),
  south: new QuestJs._create.Exit('market_square'),
  north: new QuestJs._create.Exit('high_temple'),
  mapX: 400,
  mapY: 450,
  // mapRegion:'Halmuth',
});

QuestJs._create.createRoom('market_square', {
  desc:
    'The market square is the centre of the city, and is teeming with people. {timeOfDayComment} In the southeast corner you see the magnificent entrance of Estalia Manor.|In the centre of the square, a golden statue of Stratos and Geo embracing while looking north to the Great Temple stands on a stone plinth; their presence blesses all who pass through.',
  north: new QuestJs._create.Exit('street_of_the_gods'),
  west: new QuestJs._create.Exit('western_way_halmuth'),
  east: new QuestJs._create.Exit('wheat_road'),
  south: new QuestJs._create.Exit('merchants_street'),
  southeast: new QuestJs._create.Exit('estalia_manor'),
  mapX: 390,
  mapY: 535,
  timeStatus: [
    { to: 7, t: 'The market is quiet at this time of night.' },
    {
      to: 8,
      t: "Market stall owners are setting out their wares for the day.",
    },
    {
      to: 13,
      t:
        'The market is full of people looking, buying and selling; there are dozens of stalls, selling everything from mushrooms to marquetry, from songbirds to shawls.',
    },
    { to: 16, t: 'The market is quieter in the heat of the afternoon.' },
    { to: 17, t: 'The market stalls are being packed away.' },
    {
      to: 25,
      t:
        'The market stalls are closed, but a few people are still wondering through the square.',
    },
  ],
});

QuestJs._create.createItem('street_preacher', QuestJs._npc.NPC(false), {
  loc: 'market_square',
  scenery: true,
  locationStatus() {
    return 'A preacher is stood on an old crate, telling people about woe and doom that will befall them soon; most of the crowd are happy to ignore him.';
  },
});

QuestJs._create.createRoom('wheat_road', {
  desc:
    "The east side of Halmuth is the poorer side of the city. The tenement blocks on either are run down. Many have small shops or workshops on the ground floor, offering cheap goods of variable quality. Thandros' Arms and Armour to the northwest and Madame Rel's Little Shop of Wonders to the south catch your eye; the brothel to the southeast certainly does not! The upper floors are fronted by balconies, that are often bedecked with flowers or banners. To the northeast, on the corner of Tuppenny Lane, you see the gates of the Aether and Flux Company; towering over the wall are the condensers, focal towers and retorts.",
  west: new QuestJs._create.Exit('market_square'),
  south: new QuestJs._create.Exit('quayside_east'),
  east: new QuestJs._create.Exit('granite_bridge'),
  northwest: new QuestJs._create.Exit('madame_rels', {
    isUnlocked: QuestJs._util.openingTimes,
  }),
  mapX: 666,
  mapY: 532,
  mapRegion: 'Halmuth',
});

QuestJs._create.createRoom('madame_rels', {
  alias: "Madame Rel's Little Shop of Wonders",
  properName: true,
  desc: '.',
  southeast: new QuestJs._create.Exit('wheat_road'),
});

QuestJs._create.createRoom('merchants_street', {
  desc:
    "Merchant's Street slopes steeply down from the market place in the north to the quayside to the south. It takes it name from the many high-class shops that line it on both sides, many selling imported goods. Renfikk's Alchemical Emporium to the northeast catches your eye, on the corner with a narrow backstreet. A covered walkway spans the backstreet connecting the shop to Ulgat's Fine Goods to the southeast.",
  north: new QuestJs._create.Exit('market_square'),
  south: new QuestJs._create.Exit('quayside_west'),
  mapX: 385,
  mapY: 650,
});

QuestJs._create.createRoom('quayside_west', {
  desc:
    "A three-story inn, The Leviathon, dominates the west end of the quayside, on the corner with Merchants' Street. Beyond it, you can see a couple of warehouses. Some fishing boats are moored to the quay.",
  north: new QuestJs._create.Exit('merchants_street'),
  east: new QuestJs._create.Exit('quayside'),
  mapX: 380,
  mapY: 770,
});

QuestJs._create.createRoom('quayside', {
  desc: 'The Quayside is boring, the author really needs to put stuff in it.',
  west: new QuestJs._create.Exit('quayside_west'),
  east: new QuestJs._create.Exit('quayside_east'),
  south: new QuestJs._create.Exit('wharf'),
  mapX: 550,
  mapY: 763,
});

QuestJs._create.createRoom('quayside_east', {
  desc:
    'Warehouses line the east end of the quayside, storing goods inbound and outbound by ship. Most are in a state of disrepair. Some fishing boats are tied up on the quayside. A narrow road heads upwards and northwards to the Wheat Road; to the east you can see a boatyard.',
  west: new QuestJs._create.Exit('quayside'),
  north: new QuestJs._create.Exit('wheat_road'),
  mapX: 720,
  mapY: 750,
});

QuestJs._create.createRoom('wharf', {
  desc:
    'The wharf is a sturdy structure, built of dark wood, projecting out from the quay some two hundred feet. Ships are moored on either side, and dockworks hurry to unload and then load them as fast as they can.',
  north: new QuestJs._create.Exit('quayside'),
  mapX: 560,
  mapY: 900,
});

QuestJs._create.createRoom('western_way_halmuth', {
  desc:
    'This is the start of the Western Way that connects Halmuth to Ogarath. To the east of you is the market square, the actual start of the road, and to the west the city gates. To the northeast, the tall building is the back of the Museum of Curios, whilst the pillared building to the south is the House of Leetos.',
  east: new QuestJs._create.Exit('market_square'),
  west: new QuestJs._create.Exit('western_way_1'),
  mapX: 250,
  mapY: 535,
  mapRegion: 'Halmuth',
});

QuestJs._create.createRoom('museum_of_curios', {
  desc: 'The museum is boring, the author really needs to put stuff in it.',
  east: new QuestJs._create.Exit('street_of_the_gods'),
  up: new QuestJs._create.Exit('museum_of_curios_upstairs'),
  mapX: 300,
  mapY: 480,
});

QuestJs._create.createRoom('museum_of_curios_upstairs', {
  desc:
    'The upper level of the museum is boring, the author really needs to put stuff in it.',
  down: new QuestJs._create.Exit('museum_of_curios'),
});

QuestJs._create.createRoom('high_temple', {
  desc:
    'The High Temple is boring, the author really needs to put stuff in it.',
  south: new QuestJs._create.Exit('street_of_the_gods'),
  mapX: 414,
  mapY: 306,
});

QuestJs._create.createRoom('leviathon', {
  desc: 'The Leviathon is boring, the author really needs to put stuff in it.',
  southeast: new QuestJs._create.Exit('quayside_west'),
  mapX: 300,
  mapY: 706,
});

QuestJs._create.createRoom('estalia_manor', {
  desc: 'Estalia Manor is boring, the author really needs to put stuff in it.',
  northwest: new QuestJs._create.Exit('market_square'),
  mapX: 755,
  mapY: 477,
});

QuestJs._create.createRoom('western_way_1', {
  desc:
    'The Western Way is boring, the author really needs to put stuff in it. To the east is the city of Halbuth',
  east: new QuestJs._create.Exit('western_way_halmuth'),
  west: new QuestJs._create.Exit('western_way_2'),
  mapX: 706,
  mapY: 641,
  mapRegion: 'Small scale',
});

QuestJs._create.createRoom('western_way_2', {
  desc:
    'The Western Way is boring, the author really needs to put stuff in it. To the east is the city of Halbuth',
  east: new QuestJs._create.Exit('western_way_1'),
  west: new QuestJs._create.Exit('western_way_3'),
  mapX: 572,
  mapY: 659,
  mapRegion: 'Small scale',
});

QuestJs._create.createRoom('western_way_3', {
  desc:
    'The Western Way is boring, the author really needs to put stuff in it. To the east is the city of Halbuth',
  east: new QuestJs._create.Exit('western_way_2'),
  // west:new QuestJs._create.Exit('western_way_1'),
  mapX: 461,
  mapY: 646,
  mapRegion: 'Small scale',
});

QuestJs._create.createRoom('granite_bridge', {
  desc:
    'The Granite Bridge is boring, the author really needs to put stuff in it. To the east is the city of Halbuth',
  // east:new QuestJs._create.Exit('western_way_2'),
  west: new QuestJs._create.Exit('wheat_road'),
  mapX: 774,
  mapY: 617,
  mapRegion: 'Small scale',
});
