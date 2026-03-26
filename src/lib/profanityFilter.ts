/**
 * Profanity Filter for ReelBid
 * Checks text for abusive, offensive, or inappropriate words.
 * Covers: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali,
 *         Marathi, Gujarati, Punjabi, Odia, Urdu, and common l33tspeak.
 * All regional words are in romanized (Latin script) form.
 */

// Comprehensive list of banned words (lowercase)
const BANNED_WORDS: string[] = [
    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — Explicit / Sexual
    // ═══════════════════════════════════════════════════════════════════
    'fuck', 'fucker', 'fuckin', 'fucking', 'fucked', 'fucks', 'fuk', 'fck', 'fcuk',
    'motherfucker', 'motherfucking', 'mfer', 'mofo',
    'sex', 'sexy', 'sexual', 'sexist',
    'porn', 'porno', 'pornstar', 'pornography',
    'dick', 'dicks', 'dickhead',
    'cock', 'cocks', 'cocksucker',
    'pussy', 'pussies',
    'vagina', 'penis', 'boner',
    'boob', 'boobs', 'boobies', 'tits', 'titties', 'titty',
    'nude', 'nudes', 'nudity', 'naked',
    'dildo', 'vibrator',
    'orgasm', 'cum', 'cumshot', 'jizz', 'semen',
    'masturbat', 'handjob', 'blowjob', 'rimjob', 'gangbang',
    'hentai', 'milf', 'anal', 'anus',
    'whore', 'slut', 'sluts', 'slutty', 'hooker', 'prostitute',
    'erotic', 'fetish', 'bdsm', 'bondage', 'kinky',
    'stripper', 'escort',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — Racial slurs / hate speech
    // ═══════════════════════════════════════════════════════════════════
    'nigger', 'nigga', 'niggas', 'negro',
    'chink', 'gook', 'spic', 'kike', 'wetback',
    'cracker', 'honky', 'gringo',
    'fag', 'faggot', 'fagot', 'fags',
    'dyke', 'tranny', 'shemale',
    'retard', 'retarded', 'retards',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — Common abusive words
    // ═══════════════════════════════════════════════════════════════════
    'shit', 'shits', 'shitty', 'bullshit', 'horseshit', 'dipshit', 'shithead',
    'ass', 'asshole', 'asswipe', 'arsehole', 'arse',
    'bitch', 'bitches', 'bitchy', 'sonofabitch',
    'damn', 'dammit', 'goddamn', 'goddammit',
    'hell', 'bastard', 'bastards',
    'crap', 'cunt', 'cunts',
    'piss', 'pissed', 'pissoff',
    'wanker', 'wank', 'wankstain', 'tosser', 'twat', 'twatwaffle', 'bellend', 'cockwomble',
    'douche', 'douchebag', 'dumbass', 'jackass', 'smartass', 'badass', 'fatass',
    'dickcheese', 'prick', 'pricks',
    'cuck', 'simp', 'incel',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — Violence / Drug references
    // ═══════════════════════════════════════════════════════════════════
    'kill', 'murder', 'rape', 'rapist', 'molest', 'pedophile', 'paedophile',
    'terrorist', 'terrorism', 'bomb', 'suicide',
    'cocaine', 'meth', 'crack', 'weed', 'marijuana',
    'junkie', 'dopehead', 'snitch',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — l33tspeak / obfuscation
    // ═══════════════════════════════════════════════════════════════════
    'sh1t', 'f*ck', 'f**k', 'fu*k', 'a$$', 'b!tch', 'b1tch',
    'p0rn', 'd1ck', 'c0ck', 'a**', 'a*s',
    'stfu', 'gtfo', 'lmfao',

    // ═══════════════════════════════════════════════════════════════════
    //  HINDI (Romanized) — Comprehensive
    // ═══════════════════════════════════════════════════════════════════
    'madarchod', 'madarchodh', 'madarchoot', 'maadarchod', 'maa ki chut', 'mkc', 'mc',
    'bhenchod', 'behenchod', 'banchod', 'bhenchoot',
    'behen ke laude', 'bhen ke laude', 'bkl',
    'chutiya', 'chutiye', 'chutiyap', 'chutiyapa', 'choot', 'chut',
    'chutmarani', 'chut marani',
    'gaand', 'gaandu', 'gandu', 'gand', 'gandmasti',
    'lund', 'lauda', 'lavda', 'lavde', 'laudu', 'lodu', 'loda',
    'lavde ke baal',
    'chod',
    'randwa', 'randibaaz', 'randikhanaa', 'randa',
    'haramkhor', 'harami', 'haramzada', 'haramzadi', 'haram',
    'kamina', 'kamine', 'kaminey', 'kamini', 'kamine ki aulaad',
    'bhosdike', 'bhosdiwale', 'bhosda', 'bhosdika', 'bhosdiki',
    'jhatu', 'jhaatu', 'jhant', 'jhantu',

    'chinal', 'chinaal',
    'saala', 'saali', 'sala', 'sali', 'saale harami',
    'kutte', 'kutta', 'kutiya', 'kutti',
    'ullu', 'gadha', 'bakchod', 'bakchodi',
    'ullu ka pattha', 'ullu ka patha',
    'tatti', 'tatty', 'tatte', 'tattey',
    'suwar', 'suar', 'sooar', 'suar ki nasal',
    'raand', 'raandwa',
    'bhadwa', 'bhadwe', 'bhadwi',
    'betichod', 'beti chod',
    'chodu', 'chodna', 'chodumal',
    'maaki', 'teri maa', 'tera baap',
    'hijra', 'hijda', 'chakka',
    'gandphati', 'ghatiya', 'nalayak',
    'besharam', 'bewakoof', 'bewda',
    'bc', 'bsdk', 'tmkb', 'tmkc',
    'chudail',
    'pataka', 'maal',

    // ═══════════════════════════════════════════════════════════════════
    //  TELUGU (Romanized) — Comprehensive
    // ═══════════════════════════════════════════════════════════════════
    'lanja', 'lanjaa', 'lanjakodaka', 'lanjakoduku', 'lanjodaka',
    'lanja kodaka', 'lanja koduku', 'lanjaa kodaka',
    'lanjalakompa',
    'dengey', 'dengu', 'dengulata', 'dengichukko', 'dengadam',
    'dengina', 'dengudu', 'dengutha', 'denguthaa',
    'modda', 'moddalu', 'moddalakodaka', 'modda guddu',
    'pooku', 'pookulo', 'puku', 'pukulo',
    'pooku na kodaka', 'pooku kodaka', 'nee amma pooku',
    'gudda', 'guddha', 'guddhalo', 'gudda dengu',
    'sulli', 'sulla', 'sulligadu', 'sulli na kodaka',
    'erripooku', 'erripuku', 'erripuka', 'erri', 'erri pooku',
    'bokka', 'bokkalo',
    'donga', 'dongalu',
    'kukka', 'kukkanaakoduku',
    'gadida', 'gadidha', 'gadidhakoothuru', 'gadidakoduku',
    'naakodaka', 'naakoduku', 'naakoothuru', 'na kodaka', 'naa kodaka',
    'denga', 'denginaa',
    'ammanaakoduku', 'ammanaayi',
    'nee amma', 'nee yamma', 'neeyabba',
    'nee akka', 'nee akka pooku', 'nee akka kodaka',
    'pottelu', 'pottelodaa',
    'sachipovaali', 'sachipova',
    'nakku', 'nakkodaka',
    'reyy', 'reyyy',
    'muddha', 'muddhapuku',
    'lathkor', 'lathkoru',
    'vedhava', 'vedhavaa', 'vedhavalanja', 'lanja vedhava',
    'baadkow', 'lafoot', 'lafuut',
    'jaffa', 'jaffakoduku',
    'poorinaakoduku', 'pooriga',
    'kodaka',
    'pooku naa kodaka',
    'nee bondha', 'neebondha', 'bondha',
    'dhooram', 'dhoramga', 'dooranga',
    'lanjaa koduku', 'lanjakodthuru',
    'natakaaladhi', 'natakaalodu',
    'muudhapettu',
    'pandi', 'pandi koduku', 'pandikoduku',

    // ═══════════════════════════════════════════════════════════════════
    //  TAMIL (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'thevdiya', 'thevidiya', 'thevidiyamavan', 'thevidiyapaiyan',
    'thevidiyapayale', 'thevidiyamunda',
    'thevidiya payyan', 'thevidiya mavane', 'thevidiyapayyan',
    'oombu', 'oombuda', 'oombudi',
    'ootha', 'oothu', 'oothadhe',
    'baadu', 'baadva', 'badu',
    'soothu', 'soothula', 'soothadi',
    'sunni', 'sunniya', 'sunniyan',
    'koothi', 'koothia', 'koothichi', 'koothimavane',
    'pundai', 'pundek', 'punda', 'pundamavane', 'punda maari', 'pundamaari', 'pundekku',
    'mayir', 'mayiru', 'myiru', 'mayirvechirukiya',
    'lavadai', 'lavada',
    'thayoli', 'thayoliyan', 'thayir', 'thayir vita',
    'okka', 'okkala',
    'peenai', 'naaye', 'naay',
    'mootram', 'kakkoos',
    'pottai', 'potta',
    'vesai', 'vesiya', 'vesi',
    'sowkiyama', 'angam',
    'molai', 'mulai',
    'ennada', 'otha', 'oththa',
    'puluthi', 'kena',
    'kena paiyan', 'kenapunda',
    'porikki', 'pichai',
    'loosu',
    'alagu punda', 'alagupunda',

    // ═══════════════════════════════════════════════════════════════════
    //  KANNADA (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'sule', 'sulemaga', 'sulemagane', 'sulemagne', 'sule maga',
    'tullu', 'tullina', 'tullhakla',
    'tunne', 'tunnige', 'tunni',
    'gudde', 'gudda', 'guddige',
    'boli', 'bolimaga', 'bolimagne', 'bolimaklu', 'boli maga',
    'shata', 'shatamaga', 'shathav',
    'myga', 'ninna amman', 'ninge',
    'ninn amma', 'ninn anna',
    'baadu', 'baadvaa',
    'bevarsi', 'bevarse', 'bevarsu',
    'sakkath', 'haadimaga', 'hadi',
    'naayi', 'naayimaga', 'naayimagne',
    'yedde', 'yeddenu',
    'keya', 'keyakla',
    'gandu', 'gandsumaga', 'gandu maga', 'gandumaga',
    'kothi', 'kothimaga',
    'huchcha', 'huchmaga',
    'lowda', 'lowdakya',
    'mundhe',
    'loose maga', 'loosemaga',
    'kurchi', 'kuri',

    // ═══════════════════════════════════════════════════════════════════
    //  MALAYALAM (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'myre', 'myru', 'myran', 'mayire',
    'pooru', 'poorumone', 'pooruthi',
    'kunna', 'kunnayil', 'kunnan',
    'thayoli', 'thayoliyan', 'thayolifamily',
    'thendi', 'thendimon', 'thendikuzhi',
    'pattikku', 'patti', 'pattimone',
    'kundhi', 'kundhimon',
    'koothichi', 'koothich',
    'mandan', 'mandanmon',
    'dayoos', 'dayoose',
    'vedi', 'vedikku',
    'pannada', 'pannadamone',
    'kudikka', 'poda', 'podi', 'podam',
    'kandaroli', 'ninde amma',
    'ookkan', 'ooku', 'ookada',
    'kumbasaari', 'mairan',
    'thettan', 'thettante mone', 'thettantemone',
    'kandam', 'kandam patti', 'kandampatti',
    'edi mone', 'edimone',

    // ═══════════════════════════════════════════════════════════════════
    //  BENGALI / BANGLA (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'banchod', 'banchot', 'baanchod',
    'chuda', 'chudi', 'chudir', 'chudmarani',
    'magi', 'magir', 'maagi', 'magichuda',
    'khankir', 'khanki', 'khankichele',
    'baal', 'baaler', 'baler',
    'shala', 'shali', 'shalir',
    'nangta', 'nengta',
    'bokachoda', 'boka',
    'haramjada', 'haramjadi', 'harami',
    'gumarao', 'gudmarao',
    'bhoda', 'bhodai', 'bhodar',
    'narkelbari', 'chotolok',
    'dhon', 'dhonkhur',
    'choto', 'chodon', 'chodu',
    'malaun', 'maalaun',
    'fatao', 'phatao',
    'bhaat', 'bhaater',

    // ═══════════════════════════════════════════════════════════════════
    //  MARATHI (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'zavnya', 'zavnyaa', 'zavla',
    'aaizhavadya', 'aaizhavnya', 'aaighali',
    'bhadvya', 'bhadva', 'bhadvyaa', 'bhadvi',
    'chiknya', 'chikne',
    'jhavnya', 'jhavla', 'jhavnya',
    'raand', 'raandechya',
    'gandu', 'gandya', 'gand', 'gandit',
    'choot', 'chootmarany',
    'ghalya', 'ghalshi',
    'bokya', 'bokyaa',
    'popat', 'popatrao',
    'ghanta', 'ghantaa',
    'madakya', 'maadakya',
    'chavat', 'chavatpana',
    'saandas', 'shengdaana',
    'haaldya', 'tondacha',
    'zhavnya', 'zhavadya',

    // ═══════════════════════════════════════════════════════════════════
    //  GUJARATI (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'bhosadu', 'bhosdi', 'bhosdichod',
    'gando', 'gandi', 'gandoo', 'gandiya',
    'lodu', 'lodiya', 'loda',
    'chodu', 'chodyu', 'chodvanu',
    'fattuchod', 'fattu',
    'randvu', 'randyu',
    'bhadudo', 'bhadudi',
    'matanu', 'maanu',
    'saandu', 'saandas',

    'haramnu', 'haramkhor',
    'ghelu', 'ghelchodu',
    'bawasir',

    // ═══════════════════════════════════════════════════════════════════
    //  PUNJABI (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'penchod', 'painchod', 'benchod',
    'kutte', 'kutteya', 'kuttiyan',
    'haraamzade', 'haraamzadi', 'haraamdi',
    'gandasa', 'gandasi',
    'bhendiyan', 'bhendi',
    'tatti', 'tattian', 'tattiyan',
    'ullu', 'ulluda', 'ullude',
    'khotey', 'khoteyda',
    'tawaif',
    'haulaa', 'haula',
    'chhinarr', 'chhinar',
    'badtameez', 'badmaash', 'badmashi',
    'phuddu', 'phuddian', 'phuddi',
    'lunn', 'lunndi',

    // ═══════════════════════════════════════════════════════════════════
    //  ODIA / ORIYA (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'badia', 'badiara', 'badiarani',
    'chhaka', 'chhakka',
    'gandiba', 'gandibanta',
    'harami', 'haramipua',
    'khasra', 'khasri',
    'magibara', 'magibari',
    'pahadi', 'pahadimaniku',
    'randibaja',
    'tampura', 'tampuri',

    // ═══════════════════════════════════════════════════════════════════
    //  URDU (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'haramzada', 'haramzadi',
    'kanjar', 'kanjari', 'kanjarro',
    'laanat', 'lanati', 'lanatullah',
    'badkaar', 'badkaari',
    'zaalim', 'zulm',
    'shaitan', 'shaitaan',
    'haiwan', 'haiwaan', 'haiwaniyat',
    'gashti', 'gashtian',
    'chudaap', 'chudaapi',
    'jhoothi', 'jhoothaa',
    'gadhera', 'gadhedi',
    'tharki', 'tharkii',
    'luuchha', 'luuchhi',
    'munh kala', 'manhoos',

    // ═══════════════════════════════════════════════════════════════════
    //  ASSAMESE (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'beya', 'beyar', 'beyapua',
    'phukoni', 'phuka',
    'siyal', 'siyalpua',
    'dangor', 'dangori',
    'haram', 'harampua',

    // ═══════════════════════════════════════════════════════════════════
    //  Common Indian multilingual slang & abbreviations
    // ═══════════════════════════════════════════════════════════════════
    'mc', 'bc', 'mkc', 'bkl', 'bsdk', 'tmkb', 'tmkc',
    'gfhp', 'lmkb', 'lmkc', 'bklog',
];

/**
 * Character substitution map for l33tspeak / obfuscation detection
 */
const CHAR_MAP: Record<string, string> = {
    '@': 'a', '4': 'a',
    '!': 'i', '1': 'i', '|': 'i',
    '$': 's', '5': 's',
    '0': 'o',
    '3': 'e',
    '7': 't',
    '+': 't',
    '8': 'b',
    '9': 'g',
    '6': 'g',
};

/**
 * Normalize text by replacing l33tspeak characters with their letter equivalents
 */
function deobfuscate(text: string): string {
    return text
        .split('')
        .map(ch => CHAR_MAP[ch] || ch)
        .join('');
}

/**
 * Collapse repeated consecutive characters into one.
 *   "lanjaaaa" → "lanja",  "fuuuck" → "fuck",  "shiiit" → "shit"
 */
function collapseRepeats(text: string): string {
    return text.replace(/(.)\1+/g, '$1');
}

/**
 * Remove spaces / separators between single characters.
 * Catches "l a n j a", "f.u.c.k", "l-a-n-j-a", "d e n g u" etc.
 */
function collapseSpacedChars(text: string): string {
    // Match patterns where single letters are separated by spaces/dots/dashes/underscores
    return text.replace(/\b([a-z])\s+(?=[a-z]\b)/gi, '$1');
}

/**
 * Remove all whitespace, dots, dashes, underscores between characters.
 *   "l . a . n . j . a" → "lanja"
 */
function stripSeparators(text: string): string {
    return text.replace(/[\s._\-]+/g, '');
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whitelist of common legitimate words that contain short banned substrings.
 * These words will be removed from the text before profanity checking to prevent
 * false positives (e.g., "ass" inside "association").
 */
const WHITELISTED_WORDS: string[] = [
    // Contains "ass"
    'association', 'associations', 'associate', 'associates', 'associated', 'associating',
    'class', 'classes', 'classic', 'classical', 'classics', 'classification', 'classified', 'classify',
    'pass', 'passed', 'passes', 'passing', 'passenger', 'passengers', 'passion', 'passionate', 'passive',
    'mass', 'masses', 'massive', 'massage', 'massachusetts',
    'bass', 'embassy', 'ambassador', 'embarrass', 'embarrassed', 'embarrassing',
    'glass', 'glasses', 'glassware',
    'grass', 'grasses', 'grassland', 'grassroots',
    'brass', 'brassy',
    'assess', 'assessed', 'assessment', 'assessments', 'assessing', 'assessor',
    'assign', 'assigned', 'assignment', 'assignments', 'assigning',
    'assist', 'assisted', 'assistant', 'assistance', 'assisting',
    'assert', 'asserted', 'assertion', 'assertive', 'asserting',
    'assemble', 'assembled', 'assembly', 'assembling',
    'asset', 'assets',
    'assume', 'assumed', 'assumes', 'assuming', 'assumption', 'assumptions',
    'assure', 'assured', 'assurance', 'assurances', 'assuring',
    'cassette', 'casserole', 'hassle', 'lasso', 'morass', 'crass',
    'assassin', 'assassinate', 'assassination',
    'password', 'passwords',
    // Contains "hell"
    'hello', 'shell', 'shells', 'shelling', 'michelin', 'seashell', 'eggshell', 'nutshell',
    'hellenistic', 'hellenic',
    // Contains "damn"
    'adamant', 'adamantly',
    // Contains "cum"
    'document', 'documents', 'documented', 'documenting', 'documentation',
    'circumstance', 'circumstances', 'circumvent',
    'accumulate', 'accumulated', 'accumulation',
    'cucumber', 'incumbent',
    // Contains "sex"
    'sextant', 'sextet', 'sextuple',
    // Contains "homo"
    'homogeneous', 'homogenize', 'homologous', 'homolog',
    // Contains "anal"
    'analog', 'analogy', 'analogous', 'analysis', 'analyst', 'analysts', 'analytical', 'analyze', 'analyzed',
    'canal', 'banal', 'final', 'finals', 'finalist', 'finalize',
    'national', 'international', 'functional', 'traditional', 'professional',
    'signal', 'penal', 'renal', 'journal',
    // Contains "ho"
    'honest', 'honestly', 'honesty', 'honor', 'honored', 'honorary', 'hope', 'hopeful',
    'home', 'homework', 'homemade', 'homepage', 'homecoming',
    'hospital', 'hospitality', 'host', 'hosted', 'hosting', 'hotel', 'house', 'household',
    'hour', 'hourly', 'holiday', 'holidays',
    // Contains "kill"
    'skill', 'skills', 'skilled', 'skillful', 'painkiller', 'thriller',
    // Contains "rape"
    'drape', 'drapes', 'scrape', 'scraped', 'grape', 'grapes', 'grapefruit',
    'trapeze', 'skyscraper',
    // Contains "drug"
    'shrug', 'shrugged', 'shrugging',
    // Contains "cock"
    'peacock', 'peacocks', 'hancock',
    // Contains "hoe"
    'shoe', 'shoes', 'horseshoe', 'phoenix',
    // Contains "nig"
    'night', 'nights', 'nighttime', 'nightmare', 'nightclub', 'nightly',
    'knight', 'knights',
    // Contains "fag"
    'flag', 'flags', 'flagged', 'flagship',
    // Contains "dyke"
    'vandyke',
    // Contains "crap"
    'scrap', 'scrape', 'scraps', 'scrapped', 'scraping',
    // Contains "piss"
    'mississippi',
    // Contains "weed"
    'tweed', 'seaweed',
    // Contains "crack"
    'cracker', 'firecracker',
    // Contains "bomb"
    'bombard', 'bombastic',
    // Contains "erotic"
    'heroic', 'heroics',
    // Contains "escort"
    'escorted', 'escorting',
    // Contains "fan" related
    'fan', 'fans', 'fanbase', 'fandom', 'fanatic', 'fanatics', 'fancy', 'fantasy', 'fantastic',
    'infant', 'infantry',
    // Contains "hit"
    'architecture', 'architect', 'white', 'exhibit', 'exhibition',
    // Other common false positives
    'therapist', 'therapeutic', 'therapy',
    'manslaughter',
    'scunthorpe', 'penistone', 'lightwater', 'cockermouth',
    'title', 'titled', 'titling', 'subtitle', 'subtitles', 'entitled',
    'button', 'buttons', 'buttress', 'butterscotch', 'butterfly', 'butter', 'buttermilk',
    'cocktail', 'cocktails',
    'fakepath',
];

// Build a Set for fast lookup
const WHITELIST_SET = new Set(WHITELISTED_WORDS);

/**
 * Remove whitelisted words from text to prevent false positives.
 * Replaces whitelisted words with spaces so they don't form new words.
 */
function removeWhitelistedWords(text: string): string {
    let result = text;
    // Sort by length descending so longer words are replaced first
    const sorted = [...WHITELISTED_WORDS].sort((a, b) => b.length - a.length);
    for (const word of sorted) {
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
        result = result.replace(regex, ' '.repeat(word.length));
    }
    return result;
}

/**
 * Check if a match is actually a false positive because it's part of a whitelisted word.
 * Examines the original text to see if the match position falls within a whitelisted word.
 */
function isWhitelistedContext(originalText: string, bannedWord: string): boolean {
    const lower = originalText.toLowerCase();
    const words = lower.split(/[^a-z]+/).filter(Boolean);
    
    // Check if any word in the original text is whitelisted and contains the banned word
    for (const w of words) {
        if (WHITELIST_SET.has(w) && w.includes(bannedWord)) {
            return true;
        }
    }
    return false;
}

/**
 * Check if text contains profanity.
 * Returns the first matched bad word, or null if clean.
 *
 * Detection layers:
 *  1. Word-boundary matching on original text
 *  2. Word-boundary matching on normalized versions (separators/l33t/repeats removed)
 *  3. Wildcard matching (* # @ as placeholders)
 *  4. Elongated regex: each char in banned word allows repeats + optional separators
 *
 * All checks use word-boundary matching and whitelist filtering to prevent
 * false positives on legitimate words like "association", "class", "pass", etc.
 */
export function containsProfanity(text: string): string | null {
    if (!text) return null;

    const lower = text.toLowerCase();

    // First, check if the entire text is composed of whitelisted / safe words
    // by removing whitelisted words and checking what remains
    const sanitized = removeWhitelistedWords(lower);

    // Create multiple normalized versions to check (from the sanitized text)
    const v1 = sanitized.replace(/[_\-\.]/g, ' ');
    const v2 = sanitized.replace(/[^a-z0-9\s]/g, '');
    const v3 = deobfuscate(sanitized).replace(/[^a-z\s]/g, '');
    const v4 = sanitized.replace(/[^a-z@$!10357+896\s]/g, '');
    const v4decoded = deobfuscate(v4);
    const v5 = collapseRepeats(sanitized.replace(/[^a-z0-9]/g, ' '));
    const v6 = collapseSpacedChars(sanitized).replace(/[^a-z\s]/g, '');
    const v7 = collapseRepeats(deobfuscate(stripSeparators(sanitized)).replace(/[^a-z]/g, ' '));
    const v8 = collapseRepeats(v3);

    const versions = [v1, v2, v3, v4decoded, v5, v6, v7, v8];

    for (const word of BANNED_WORDS) {
        const wordClean = word.replace(/\s+/g, '');

        // For very short banned words (≤3 chars like "ass", "cum", "fag", "ho"),
        // only match as whole words to avoid false positives
        const isShortWord = wordClean.length <= 3;

        for (const version of versions) {
            if (isShortWord) {
                // Only whole-word match for short words
                const wholeWordRegex = new RegExp(`(?:^|\\s|[^a-z])${escapeRegex(wordClean)}(?:\\s|[^a-z]|$)`, 'i');
                if (wholeWordRegex.test(version)) {
                    // Double-check against original text context
                    if (!isWhitelistedContext(text, wordClean)) {
                        return word;
                    }
                }
            } else {
                // For longer words, use word-boundary matching
                const boundaryRegex = new RegExp(`(?:^|[^a-z])${escapeRegex(wordClean)}(?:[^a-z]|$)`, 'i');
                if (boundaryRegex.test(version)) {
                    if (!isWhitelistedContext(text, wordClean)) {
                        return word;
                    }
                }
                // Also check simple includes but verify it's not whitelisted
                if (version.includes(wordClean)) {
                    if (!isWhitelistedContext(text, wordClean)) {
                        return word;
                    }
                }
            }
        }

        // Wildcard matching — only for longer words to avoid false positives
        if (wordClean.length >= 4) {
            const wildcardPattern = wordClean.split('').map(ch => {
                const escaped = escapeRegex(ch);
                return `(?:${escaped}|[\\*\\#\\@\\$\\!\\?\\-\\_\\.])`;
            }).join('');
            const wildcardRegex = new RegExp(`(?:^|[^a-z])${wildcardPattern}(?:[^a-z]|$)`, 'i');
            if (wildcardRegex.test(lower)) {
                if (!isWhitelistedContext(text, wordClean)) {
                    return word;
                }
            }
        }

        // Elongated / stretched word detection — only for words with 4+ chars
        if (wordClean.length >= 4) {
            const elongatedParts = wordClean.split('').map(ch => {
                const escaped = escapeRegex(ch);
                return `${escaped}+`;
            });
            const elongatedPattern = elongatedParts.join('[\\s._\\-*#@!?]*');
            const elongatedRegex = new RegExp(`(?:^|[^a-z])${elongatedPattern}(?:[^a-z]|$)`, 'i');
            if (elongatedRegex.test(lower)) {
                if (!isWhitelistedContext(text, wordClean)) {
                    return word;
                }
            }
        }
    }
    return null;
}

/**
 * Check if text is clean (no profanity).
 */
export function isCleanText(text: string): boolean {
    return containsProfanity(text) === null;
}

/**
 * Check multiple fields at once. Returns an error message or null if all clean.
 */
export function validateFields(fields: Record<string, string>): string | null {
    for (const [fieldName, value] of Object.entries(fields)) {
        const badWord = containsProfanity(value);
        if (badWord) {
            return `The field "${fieldName}" contains inappropriate language. Please remove offensive words.`;
        }
    }
    return null;
}
