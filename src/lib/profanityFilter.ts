/**
 * Profanity Filter for ReelBid
 * Checks text for abusive, offensive, or inappropriate words.
 */

// Comprehensive list of banned words (lowercase)
const BANNED_WORDS: string[] = [
    // Explicit sexual terms
    'fuck', 'fucker', 'fuckin', 'fucking', 'fucked', 'fucks', 'fuk', 'fck', 'fcuk',
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

    // Racial slurs and hate speech
    'nigger', 'nigga', 'niggas', 'negro',
    'chink', 'gook', 'spic', 'kike', 'wetback',
    'cracker', 'honky', 'gringo',
    'fag', 'faggot', 'fagot', 'fags',
    'dyke', 'tranny', 'shemale',
    'retard', 'retarded', 'retards',

    // Common abusive words
    'shit', 'shits', 'shitty', 'bullshit', 'horseshit', 'dipshit', 'shithead',
    'ass', 'asshole', 'asswipe', 'arsehole', 'arse',
    'bitch', 'bitches', 'bitchy', 'sonofabitch',
    'damn', 'dammit', 'goddamn', 'goddammit',
    'hell', 'bastard', 'bastards',
    'crap', 'cunt', 'cunts',
    'piss', 'pissed', 'pissoff',
    'wanker', 'wank', 'tosser', 'twat', 'bellend',
    'douche', 'douchebag', 'dumbass', 'jackass', 'smartass', 'badass', 'fatass',

    // Violence-related
    'kill', 'murder', 'rape', 'rapist', 'molest', 'pedophile', 'paedophile',
    'terrorist', 'terrorism', 'bomb', 'suicide',

    // Drug references
    'cocaine', 'heroin', 'meth', 'crack', 'weed', 'marijuana',

    // Common l33tspeak / obfuscation
    'sh1t', 'f*ck', 'f**k', 'fu*k', 'a$$', 'b!tch', 'b1tch',
    'p0rn', 'd1ck', 'c0ck', 'a**', 'a*s',
    'stfu', 'gtfo', 'lmfao',

    // Hindi/regional abusive words
    'madarchod', 'bhenchod', 'chutiya', 'chutiye', 'gaand', 'gandu',
    'lund', 'lavda', 'randi', 'haramkhor', 'harami', 'kamina', 'kamine',
    'bhosdike', 'bhosdiwale', 'jhatu', 'dalla', 'chinal',
    'saala', 'saali', 'behenchod', 'mc', 'bc',
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
 * Check if text contains profanity.
 * Returns the first matched bad word, or null if clean.
 * Catches obfuscated forms like f**k, s*x, b!tch, a$$, sh!t, etc.
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

    const versions = [v1, v2, v3, v4decoded];

    for (const word of BANNED_WORDS) {
        for (const version of versions) {
            // Check if the word is contained directly
            if (version.includes(word)) {
                return word;
            }
            // Check for exact word match using word boundaries
            const regex = new RegExp(`(^|[^a-z])${escapeRegex(word)}([^a-z]|$)`, 'i');
            if (regex.test(version)) {
                return word;
            }
        }

        // Also check original text with * treated as wildcard letters
        // This catches patterns like f**k, s**t, b**ch etc.
        if (word.length >= 3) {
            const wildcardPattern = word.split('').map(ch => {
                const escaped = escapeRegex(ch);
                return `(?:${escaped}|[\\*\\#\\@\\$\\!\\?\\-\\_\\.])`;
            }).join('');
            const wildcardRegex = new RegExp(wildcardPattern, 'i');
            if (wildcardRegex.test(lower)) {
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
