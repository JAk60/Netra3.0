/**
 * hooks/useIntentClassifier.ts
 * ----------------------------
 * Classifies the user's intent and matches ships from the live fleet list.
 *
 * Responsibilities (frontend only):
 *   1. Detect intent anchor (MISSION_CONFIG, RELIABILITY, RUL, RCM, SENSOR, GENERAL)
 *   2. Match ship names from the real fleet list against the query
 *   3. Detect negation and comparison signals
 *
 * Priority ordering:
 *   MISSION_CONFIG > RCM > RUL > RELIABILITY > SENSOR > GENERAL
 *
 *   MISSION_CONFIG takes absolute priority — "mission reliability" must
 *   NEVER be treated as multi-intent or fall through to RELIABILITY/GENERAL.
 *
 * What the backend receives:
 *   {
 *     intent: "MISSION_CONFIG",
 *     intents: ["MISSION_CONFIG"],
 *     matched: "anchor:mission",
 *     signals: {
 *       matched_ships: [],
 *       has_multiple_ships: false,
 *       has_negation: false,
 *       has_comparison: false,
 *     },
 *     error: null
 *   }
 */

import { useMemo } from 'react';
import { useShips } from './useShips';

/* ============================================================================
 * INTENT TYPES
 * ========================================================================== */

export enum IntentType {
    MISSION_CONFIG = 'MISSION_CONFIG',
    RCM = 'RCM',
    RUL = 'RUL',
    RELIABILITY = 'RELIABILITY',
    SENSOR = 'SENSOR',
    GENERAL = 'GENERAL',
}

/* ============================================================================
 * PUBLIC INTERFACES
 * ========================================================================== */

export interface MatchedShip {
    ship_id: string;
    ship_name: string;
}

export interface ClassifierSignals {
    matched_ships: MatchedShip[];
    has_multiple_ships: boolean;
    has_negation: boolean;
    has_comparison: boolean;
}

export interface ClassifierError {
    code: 'MULTI_INTENT' | 'EMPTY_INPUT';
    message: string;
    intents: IntentType[];
}

export interface ClassifierResult {
    intent: IntentType;
    intents: IntentType[];
    matched: string;
    signals: ClassifierSignals;
    error: null;
}

export interface ClassifierErrorResult {
    error: ClassifierError;
    intent: null;
    intents: IntentType[];
}

export type ClassifyOutput = ClassifierResult | ClassifierErrorResult;

/* ============================================================================
 * INTENT ANCHORS
 *
 * ORDER MATTERS — MISSION_CONFIG is checked first so "mission reliability"
 * never reaches the RELIABILITY pattern.
 * ========================================================================== */

const INTENT_ANCHORS: [IntentType, RegExp, string][] = [
    [IntentType.MISSION_CONFIG, /\bmission\b/i, 'anchor:mission'],
    [IntentType.RCM, /\brcm\b/i, 'anchor:rcm'],
    [IntentType.RUL, /\brul\b|remaining useful life/i, 'anchor:rul'],
    [IntentType.RELIABILITY, /\breliab\w*\b|\brel\b/i, 'anchor:reliability'],
    [IntentType.SENSOR, /\bsensor\s+readings?\b|\bsensor\s+values?\b|\bsensor\s+data\b|\breadings?\b|\bvalues?\b|\bshow\s+sensor\b|\bget\s+sensor\b/i, 'anchor:sensor'],
];

/* ============================================================================
 * DOMINANT INTENTS
 *
 * If one of these appears in a multi-intent match it takes full priority
 * instead of returning a MULTI_INTENT error.
 * ========================================================================== */

const DOMINANT_INTENTS: IntentType[] = [
    IntentType.MISSION_CONFIG,
];

/* ============================================================================
 * SIGNAL PATTERNS
 * ========================================================================== */

const NEGATION_PATTERN =
    /\b(not|except|without|exclude|excluding|apart from|other than)\b/i;

const COMPARISON_PATTERN =
    /\b(vs|versus|compare|comparison|between|difference|better|worse|higher|lower|more|less)\b/i;

const DOMAIN_NOUN_PATTERN =
    /\b(ins|gt|gtg|ac|srgm|sensor|assembly|equipment|maintenance|failure|overhaul)\b/i;

/* ============================================================================
 * HELPERS
 * ========================================================================== */

function normalise(s: string): string {
    return s.toLowerCase().replace(/[\s\-_]+/g, '').trim();
}

function safeTest(pattern: RegExp, text: string): boolean {
    return new RegExp(pattern.source, pattern.flags).test(text);
}

/* ============================================================================
 * SHIP MATCHING
 *
 * Two-pass matching against the live fleet list:
 *   Pass 1 — normalised exact: strip separators, lowercase, substring match.
 *   Pass 2 — word-by-word: every word of the ship name appears in the query.
 * ========================================================================== */

function matchShips(query: string, ships: Ship[]): MatchedShip[] {
    const normQuery = normalise(query)
    const matched = new Map<string, MatchedShip & { position: number }>()

    // Pass 1 — normalised substring match
    for (const ship of ships) {
        const normName = normalise(ship.ship_name)
        const pos = normQuery.indexOf(normName)
        if (pos !== -1) {
            matched.set(ship.ship_id, {
                ship_id: ship.ship_id,
                ship_name: ship.ship_name,
                position: pos,
            })
        }
    }

    // Pass 2 — word-by-word match for ships not already caught by Pass 1
    const queryWords = query.toLowerCase().split(/\s+/)
    for (const ship of ships) {
        if (matched.has(ship.ship_id)) continue
        const nameWords = ship.ship_name.toLowerCase().split(/\s+/)
        if (nameWords.every(word => queryWords.includes(word))) {
            // Find position of first word of ship name in original query
            const firstWord = nameWords[0]
            const pos = query.toLowerCase().indexOf(firstWord)
            matched.set(ship.ship_id, {
                ship_id: ship.ship_id,
                ship_name: ship.ship_name,
                position: pos === -1 ? Infinity : pos,
            })
        }
    }

    // ── Sort by position of mention in the query ──────────────────────────
    return Array.from(matched.values())
        .sort((a, b) => a.position - b.position)
        .map(({ ship_id, ship_name }) => ({ ship_id, ship_name }))
}

/* ============================================================================
 * CORE CLASSIFIER
 * ========================================================================== */

export function classifyIntent(
    text: string,
    ships: Ship[] = [],
): ClassifyOutput {

    if (!text || !text.trim()) {
        return {
            error: {
                code: 'EMPTY_INPUT',
                message: 'Query is empty.',
                intents: [],
            },
            intent: null,
            intents: [],
        };
    }

    // --- Intent detection ---
    const matchedIntents: IntentType[] = [];
    let primaryMatched = '';

    for (const [intent, pattern, label] of INTENT_ANCHORS) {
        if (safeTest(pattern, text)) {
            matchedIntents.push(intent);
            if (matchedIntents.length === 1) primaryMatched = label;
        }
    }

    // --- Multi-intent handling ---
    if (matchedIntents.length > 1) {
        // Check if a dominant intent is present — it wins outright,
        // no error, no ambiguity. "mission reliability" → MISSION_CONFIG.
        const dominant = DOMINANT_INTENTS.find(d => matchedIntents.includes(d));

        if (dominant) {
            const dominantLabel =
                INTENT_ANCHORS.find(([intent]) => intent === dominant)?.[2] ?? 'anchor:dominant';

            const signals: ClassifierSignals = {
                matched_ships: matchShips(text, ships),
                has_multiple_ships: false,
                has_negation: safeTest(NEGATION_PATTERN, text),
                has_comparison: safeTest(COMPARISON_PATTERN, text),
            };

            console.debug(
                `[classifier] dominant intent "${dominant}" overrides multi-match:`,
                matchedIntents,
            );

            return {
                intent: dominant,
                intents: [dominant],
                matched: dominantLabel,
                signals,
                error: null,
            };
        }

        // No dominant intent — genuine multi-intent ambiguity
        return {
            error: {
                code: 'MULTI_INTENT',
                message:
                    `Multi-intent queries are not supported. Found: ` +
                    matchedIntents.join(', ') +
                    `. Please ask about one topic at a time.`,
                intents: matchedIntents,
            },
            intent: null,
            intents: matchedIntents,
        };
    }

    // --- No intent matched ---
    if (matchedIntents.length === 0) {
        primaryMatched = safeTest(DOMAIN_NOUN_PATTERN, text)
            ? 'domain_noun:general'
            : 'no_signal:general';
        matchedIntents.push(IntentType.GENERAL);
    }

    // --- Ship matching against live fleet ---
    const matchedShips = matchShips(text, ships);

    // --- Remaining signals ---
    const signals: ClassifierSignals = {
        matched_ships: matchedShips,
        has_multiple_ships: matchedShips.length > 1,
        has_negation: safeTest(NEGATION_PATTERN, text),
        has_comparison: safeTest(COMPARISON_PATTERN, text),
    };

    return {
        intent: matchedIntents[0],
        intents: matchedIntents,
        matched: primaryMatched,
        signals,
        error: null,
    };
}

/* ============================================================================
 * REACT HOOK
 * ========================================================================== */

export const useIntentClassifier = (
    text: string,
): ClassifyOutput & { IntentType: typeof IntentType } => {
    const ships = useShips();

    console.debug('[classifier] ships loaded:', ships.map(s => s.ship_name));

    return useMemo(
        () => ({
            ...classifyIntent(text, ships),
            IntentType,
        }),
        [text, ships],
    );
};

export default useIntentClassifier;