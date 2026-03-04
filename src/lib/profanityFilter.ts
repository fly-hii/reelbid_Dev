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
    'wanker', 'wank', 'tosser', 'twat', 'bellend',
    'douche', 'douchebag', 'dumbass', 'jackass', 'smartass', 'badass', 'fatass',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — Violence / Drug references
    // ═══════════════════════════════════════════════════════════════════
    'kill', 'murder', 'rape', 'rapist', 'molest', 'pedophile', 'paedophile',
    'terrorist', 'terrorism', 'bomb', 'suicide',
    'cocaine', 'heroin', 'meth', 'crack', 'weed', 'marijuana',

    // ═══════════════════════════════════════════════════════════════════
    //  ENGLISH — l33tspeak / obfuscation
    // ═══════════════════════════════════════════════════════════════════
    'sh1t', 'f*ck', 'f**k', 'fu*k', 'a$$', 'b!tch', 'b1tch',
    'p0rn', 'd1ck', 'c0ck', 'a**', 'a*s',
    'stfu', 'gtfo', 'lmfao',

    // ═══════════════════════════════════════════════════════════════════
    //  HINDI (Romanized) — Comprehensive
    // ═══════════════════════════════════════════════════════════════════
    'madarchod', 'madarchodh', 'madarchoot', 'maadarchod',
    'bhenchod', 'behenchod', 'banchod', 'bhenchoot',
    'chutiya', 'chutiye', 'chutiyap', 'chutiyapa', 'choot', 'chut',
    'gaand', 'gaandu', 'gandu', 'gand', 'gandmasti',
    'lund', 'lauda', 'lavda', 'lavde', 'laudu', 'lodu', 'loda',
    'randi', 'randwa', 'randibaaz', 'randikhanaa',
    'haramkhor', 'harami', 'haramzada', 'haramzadi', 'haram',
    'kamina', 'kamine', 'kaminey', 'kamini',
    'bhosdike', 'bhosdiwale', 'bhosda', 'bhosdika', 'bhosdiki',
    'jhatu', 'jhaatu', 'jhant', 'jhantu',
    'dalla', 'dalal', 'dallal',
    'chinal', 'chinaal',
    'saala', 'saali', 'sala', 'sali',
    'kutte', 'kutta', 'kutiya', 'kutti',
    'ullu', 'gadha', 'bakchod', 'bakchodi',
    'tatti', 'tatty', 'tatte', 'tattey',
    'suwar', 'suar', 'sooar',
    'raand', 'raandwa',
    'bhadwa', 'bhadwe', 'bhadwi',
    'chodu', 'chodna', 'chodumal',
    'maaki', 'teri maa', 'tera baap',
    'hijra', 'hijda', 'chakka',
    'gandphati', 'ghatiya', 'nalayak',
    'besharam', 'bewakoof', 'bewda',
    'mc', 'bc', 'mkc', 'bkl',
    'chodu', 'chudail',
    'pataka', 'item', 'maal',

    // ═══════════════════════════════════════════════════════════════════
    //  TELUGU (Romanized) — Comprehensive
    // ═══════════════════════════════════════════════════════════════════
    'lanja', 'lanjaa', 'lanjakodaka', 'lanjakoduku', 'lanjodaka',
    'lanjalakompa', 'lanjakoduku',
    'dengey', 'dengu', 'dengulata', 'dengichukko', 'dengadam',
    'modda', 'moddalu', 'moddalakodaka', 'modda guddu',
    'pooku', 'pookulo', 'puku', 'pukulo',
    'gudda', 'guddha', 'guddhalo',
    'sulli', 'sulla', 'sulligadu',
    'erripooku', 'erripuku', 'erripuka', 'erri',
    'bokka', 'bokkalo',
    'donga', 'dongalu',
    'kukka', 'kukkanaakoduku',
    'gadida', 'gadidha', 'gadidhakoothuru', 'gadidakoduku',
    'naakodaka', 'naakoduku', 'naakoothuru',
    'denga', 'denginaa',
    'ammanaakoduku', 'ammanaayi',
    'naakodaka', 'nee amma',
    'nee yamma', 'neeyabba',
    'pottelu', 'pottelodaa',
    'sachipovaali', 'sachipova',
    'nakku', 'nakkodaka',
    'reyy', 'reyyy',
    'muddha', 'muddhapuku',
    'lathkor', 'lathkoru',
    'vedhava', 'vedhavaa', 'vedhavalanja',
    'baadkow', 'lafoot', 'lafuut',
    'jaffa', 'jaffakoduku',
    'poorinaakoduku', 'pooriga',
    'dengutha', 'denguthaa',
    'kodaka', 'naakodaka',
    'pooku naa kodaka',
    'nee bondha', 'neebondha', 'bondha',
    'dhooram', 'dhoramga', 'dooranga',
    'lanjaa koduku', 'lanjakodthuru',
    'natakaaladhi', 'natakaalodu',
    'muudhapettu',

    // ═══════════════════════════════════════════════════════════════════
    //  TAMIL (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'thevdiya', 'thevidiya', 'thevidiyamavan', 'thevidiyapaiyan',
    'thevidiyapayale', 'thevidiyamunda',
    'oombu', 'oombuda', 'oombudi',
    'baadu', 'baadva', 'badu',
    'soothu', 'soothula', 'soothadi',
    'sunni', 'sunniya', 'sunniyan',
    'koothi', 'koothia', 'koothichi', 'koothimavane',
    'pundai', 'pundek', 'punda',
    'mayir', 'mayiru', 'myiru',
    'lavadai', 'lavada',
    'thayoli', 'thayoliyan', 'thayir',
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

    // ═══════════════════════════════════════════════════════════════════
    //  KANNADA (Romanized)
    // ═══════════════════════════════════════════════════════════════════
    'sule', 'sulemaga', 'sulemagane', 'sulemagne',
    'tullu', 'tullina', 'tullhakla',
    'tunne', 'tunnige', 'tunni',
    'gudde', 'gudda', 'guddige',
    'boli', 'bolimaga', 'bolimagne', 'bolimaklu',
    'shata', 'shatamaga', 'shathav',
    'myga', 'ninna amman', 'ninge',
    'baadu', 'baadvaa',
    'bevarsi', 'bevarse', 'bevarsu',
    'sakkath', 'haadimaga', 'hadi',
    'naayi', 'naayimaga', 'naayimagne',
    'yedde', 'yeddenu',
    'keya', 'keyakla',
    'gandu', 'gandsumaga',
    'kothi', 'kothimaga',
    'huchcha', 'huchmaga',
    'lowda', 'lowdakya',
    'mundhe',

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
    'haramjada', 'haramjadi',
    'gumarao', 'gudmarao',
    'bhoda', 'bhodai', 'bhodar',
    'narkelbari', 'chotolok',
    'dhon', 'dhonkhur',
    'choto', 'chodon',
    'malaun', 'maalaun',
    'fatao', 'phatao',

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
    'randvu', 'randi', 'randyu',
    'bhadudo', 'bhadudi',
    'matanu', 'maanu',
    'saandu', 'saandas',
    'dallu', 'dalali',
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
    'gfhp', 'lmkb', 'lmkc',
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

/**
 * Check if text contains profanity.
 * Returns the first matched bad word, or null if clean.
 *
 * Detection layers:
 *  1. Direct match (lowercased)
 *  2. Separators removed (_-.)
 *  3. ALL non-alpha stripped
 *  4. L33tspeak decoded
 *  5. Repeated characters collapsed ("lanjaaaa" → "lanja")
 *  6. Spaced-out characters collapsed ("l a n j a" → "lanja")
 *  7. Combined: deobfuscate + collapse repeats + strip separators
 *  8. Wildcard matching (* # @ as placeholders)
 *  9. Elongated regex: each char in banned word allows repeats + optional separators
 */
export function containsProfanity(text: string): string | null {
    if (!text) return null;

    // Create multiple normalized versions to check
    const lower = text.toLowerCase();

    // Version 1: Original with separators removed
    const v1 = lower.replace(/[_\-\.]/g, '');

    // Version 2: Strip ALL non-alphanumeric (catches f**k, s**t, f###k, etc.)
    const v2 = lower.replace(/[^a-z0-9]/g, '');

    // Version 3: Replace l33tspeak + strip remaining special chars
    const v3 = deobfuscate(lower).replace(/[^a-z]/g, '');

    // Version 4: Replace * and special chars with nothing (f**k → fk, then check patterns)
    // But also try replacing each * with each vowel for smarter matching
    const v4 = lower.replace(/[^a-z@$!10357+896]/g, '');
    const v4decoded = deobfuscate(v4);

    // Version 5: Collapse repeated characters ("lanjaaaa" → "lanja", "fuuuck" → "fuck")
    const v5 = collapseRepeats(v2);

    // Version 6: Collapse spaced-out characters ("l a n j a" → "lanja")
    const v6 = collapseSpacedChars(lower).replace(/[^a-z]/g, '');

    // Version 7: Combined — deobfuscate + strip separators + collapse repeats
    const v7 = collapseRepeats(deobfuscate(stripSeparators(lower)).replace(/[^a-z]/g, ''));

    // Version 8: Collapse repeats on the l33tspeak-decoded version
    const v8 = collapseRepeats(v3);

    const versions = [v1, v2, v3, v4decoded, v5, v6, v7, v8];

    for (const word of BANNED_WORDS) {
        // Skip very short words (2 chars) for elongated regex to avoid false positives
        const wordClean = word.replace(/\s+/g, '');

        for (const version of versions) {
            // Check if the word is contained directly
            if (version.includes(wordClean)) {
                return word;
            }
            // Check for exact word match using word boundaries
            const regex = new RegExp(`(^|[^a-z])${escapeRegex(wordClean)}([^a-z]|$)`, 'i');
            if (regex.test(version)) {
                return word;
            }
        }

        // Also check original text with * treated as wildcard letters
        // This catches patterns like f**k, s**t, b**ch etc.
        if (wordClean.length >= 3) {
            const wildcardPattern = wordClean.split('').map(ch => {
                const escaped = escapeRegex(ch);
                return `(?:${escaped}|[\\*\\#\\@\\$\\!\\?\\-\\_\\.])`;
            }).join('');
            const wildcardRegex = new RegExp(wildcardPattern, 'i');
            if (wildcardRegex.test(lower)) {
                return word;
            }
        }

        // ── Elongated / stretched word detection ──
        // Builds a regex where each character can be repeated 1+ times,
        // with optional separators (spaces, dots, dashes, underscores) in between.
        // "lanja" matches: "lanjaa", "lanjaaaa", "l.a.n.j.a", "l a n j a a a",
        //                  "lllanja", "laannjjaa", etc.
        if (wordClean.length >= 3) {
            const elongatedParts = wordClean.split('').map(ch => {
                const escaped = escapeRegex(ch);
                return `${escaped}+`;  // each char can repeat 1+ times
            });
            // Allow optional separators (space, dot, dash, underscore, *, #) between chars
            const elongatedPattern = elongatedParts.join('[\\s._\\-*#@!?]*');
            const elongatedRegex = new RegExp(elongatedPattern, 'i');
            if (elongatedRegex.test(lower)) {
                return word;
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

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
