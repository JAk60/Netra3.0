import { useMemo } from 'react';

/* ============================================================================
 * INTENT TYPES
 * ========================================================================== */

export enum IntentType {
    MISSION_CONFIG = 'MISSION_CONFIG',
    RCM            = 'RCM',
    RUL            = 'RUL',
    RELIABILITY    = 'RELIABILITY',
    SENSOR         = 'SENSOR',
    GENERAL        = 'GENERAL',
}

/* ============================================================================
 * PUBLIC INTERFACES
 * ========================================================================== */

export interface IntentResult {
    intent:   IntentType;
    matched:  string;   // which pattern fired — useful for debugging
}

/* ============================================================================
 * INTENT PATTERNS
 *
 * ORDER MATTERS — checked top to bottom, first match wins.
 *
 * Priority reasoning:
 *   1. MISSION_CONFIG first — "mission reliability" must NOT fall to RELIABILITY
 *   2. RCM before GENERAL — "rcm" is unambiguous
 *   3. RUL before GENERAL — "rul" is unambiguous
 *   4. RELIABILITY — explicit keyword
 *   5. SENSOR — "values" or "readings"
 *   6. GENERAL — has domain nouns but no specific intent keyword
 *      → routed to SQL-gen LLM on the backend
 *
 * Why \b (word boundary) matters:
 *   - Prevents "accrual" matching "rul", "formula" matching "rcm" etc.
 *   - "insone" has no boundary around "ins" so DOMAIN_NOUNS uses a broader match.
 *
 * ========================================================================== */

const INTENT_PATTERNS: [IntentType, RegExp, string][] = [
    //  intent                  pattern                                     label
    [IntentType.MISSION_CONFIG, /\bmission\b/i,                            'anchor:mission'],
    [IntentType.RCM,            /\brcm\b/i,                                'anchor:rcm'],
    [IntentType.RUL,            /\brul\b|remaining useful life/i,          'anchor:rul'],
    [IntentType.RELIABILITY,    /\breliability\b/i,                        'anchor:reliability'],
    [IntentType.SENSOR,         /\bvalues?\b|\breadings?\b/i,              'anchor:values/readings'],
];

/* ============================================================================
 * DOMAIN NOUN PATTERN
 *
 * If none of the above intent patterns fire but the text contains domain nouns,
 * classify as GENERAL → backend SQL-gen LLM handles it.
 *
 * Covers:
 *   - Installation names:  ins, insone, ins one, ins two, instwo
 *   - Equipment types:     gt, gtg, ac, srgm
 *   - Generic domain words: sensor, assembly, equipment, maintenance, failure
 * ========================================================================== */

const DOMAIN_NOUN_PATTERN = /\b(ins|gt|gtg|ac|srgm|sensor|assembly|equipment|maintenance|failure|overhaul)\b|ins\s*one|ins\s*two|insone|instwo/i;

/* ============================================================================
 * CORE CLASSIFY FUNCTION
 * Pure function — no side effects, no state, runs in < 1ms.
 * ========================================================================== */

export function classifyIntent(text: string): IntentResult {
    if (!text || !text.trim()) {
        return { intent: IntentType.GENERAL, matched: 'empty_input' };
    }

    // Step 1: check specific intent patterns in priority order
    for (const [intent, pattern, label] of INTENT_PATTERNS) {
        if (pattern.test(text)) {
            return { intent, matched: label };
        }
    }

    // Step 2: no specific intent fired — check if domain nouns present
    // If yes → GENERAL (SQL-gen LLM will handle it)
    // If no  → still GENERAL for now (OUT_OF_SCOPE added later)
    if (DOMAIN_NOUN_PATTERN.test(text)) {
        return { intent: IntentType.GENERAL, matched: 'domain_noun:general' };
    }

    // Step 3: no domain signal at all — still GENERAL until OUT_OF_SCOPE is defined
    return { intent: IntentType.GENERAL, matched: 'no_signal:general' };
}

/* ============================================================================
 * REACT HOOK
 * Wraps classifyIntent in useMemo — re-runs only when text changes.
 * No debounce needed: pure regex, sub-millisecond execution.
 * ========================================================================== */

export const useIntentClassifier = (text: string) => {
    return useMemo(() => {
        const result = classifyIntent(text);
        return {
            intent:    result.intent,
            matched:   result.matched,
            IntentType,
        };
    }, [text]);
};

export default useIntentClassifier;


/* ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 * const { intent, IntentType } = useIntentClassifier(userInput);
 *
 * switch (intent) {
 *     case IntentType.RELIABILITY:    → call reliability endpoint
 *     case IntentType.RUL:            → call RUL endpoint
 *     case IntentType.SENSOR:         → call sensor values endpoint
 *     case IntentType.RCM:            → call RCM policy endpoint
 *     case IntentType.MISSION_CONFIG: → call mission config endpoint
 *     case IntentType.GENERAL:        → call SQL-gen LLM endpoint
 * }
 *
 * ============================================================================
 * TEST CASES — expected outputs
 * ============================================================================
 *
 * classifyIntent("show me reliability of GT 1 of ins one over 50 hours")
 *   → RELIABILITY  (anchor:reliability)
 *
 * classifyIntent("show me rul of the GT_1_S2 sensor on GT1, GT2 of insone")
 *   → RUL  (anchor:rul)
 *
 * classifyIntent("show me values of the GT_1_S2 sensor on GT1 for last 20 days")
 *   → SENSOR  (anchor:values/readings)
 *
 * classifyIntent("show me rcm policy of GT 1 assemblies on insone")
 *   → RCM  (anchor:rcm)
 *
 * classifyIntent("let's perform mission reliability")
 *   → MISSION_CONFIG  (anchor:mission) ← NOT RELIABILITY, priority ordering wins
 *
 * classifyIntent("which equipment has highest reliability over 50 hours on insone")
 *   → RELIABILITY  (anchor:reliability)
 *
 * classifyIntent("compare GT 1 on ins one and ins two wrt reliability")
 *   → RELIABILITY  (anchor:reliability)
 *
 * classifyIntent("what sensors does ins one have?")
 *   → GENERAL  (domain_noun:general)
 *
 * classifyIntent("what is GT 1?")
 *   → GENERAL  (domain_noun:general)
 *
 * classifyIntent("GT 1 on ins one")
 *   → GENERAL  (domain_noun:general)
 *
 * classifyIntent("show me values for all available sensors of ins one for year 2025")
 *   → SENSOR  (anchor:values/readings)
 *
 * classifyIntent("Calculate the RUL for GTG_S4 sensor on GTG 1 of INS One")
 *   → RUL  (anchor:rul)
 *
 * ============================================================================ */