import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Intent types
export enum IntentType {
    RELIABILITY = 'RELIABILITY',
    SENSOR = 'SENSOR',
    RUL = 'RUL',
    MISSION_CONFIG = 'MISSION_CONFIG',
    GENERAL = 'GENERAL'
}

// Type definitions
interface IntentResult {
    intent: IntentType;
    confidence: number;
    method: string;
    isLoading: boolean;
    scores?: Record<string, number>;
}

interface ClassifierOptions {
    debounceMs?: number;
    minLength?: number;
    enableDebug?: boolean;
}

interface KeywordPriorities {
    high: string[];
    medium: string[];
    low: string[];
}

interface IntentKeywords {
    [IntentType.RELIABILITY]: KeywordPriorities;
    [IntentType.SENSOR]: KeywordPriorities;
    [IntentType.RUL]: KeywordPriorities;
    [IntentType.MISSION_CONFIG]: KeywordPriorities;
}

interface ContextPatterns {
    [IntentType.SENSOR]: RegExp[];
    [IntentType.RELIABILITY]: RegExp[];
    [IntentType.RUL]: RegExp[];
    [IntentType.MISSION_CONFIG]: RegExp[];
}

interface IntentVectors {
    [IntentType.RELIABILITY]: Record<string, number>;
    [IntentType.SENSOR]: Record<string, number>;
    [IntentType.RUL]: Record<string, number>;
    [IntentType.MISSION_CONFIG]: Record<string, number>;
}

interface ClassifierConfig {
    intentKeywords: IntentKeywords;
    contextPatterns: ContextPatterns;
    intentVectors: IntentVectors;
}

interface ClassificationResult {
    intent: IntentType;
    confidence: number;
    method: string;
    scores?: Record<string, number>;
}

interface UseIntentClassifierReturn {
    intent: IntentType;
    confidence: number;
    method: string;
    isLoading: boolean;
    classifyNow: (inputText?: string) => Promise<IntentResult>;
    IntentType: typeof IntentType;
}

// Static classifier configuration
const classifierConfig: ClassifierConfig = {
    intentKeywords: {
        [IntentType.RELIABILITY]: {
            high: ['reliability', 'reliable', 'mtbf', 'uptime'],
            medium: ['dependable', 'failure rate', 'availability', 'degradation', 'breakdown'],
            low: ['maintenance', 'stable', 'trustworthy', 'safe to use']
        },
        [IntentType.SENSOR]: {
            high: ['sensor', 'sensors', 'p1', 'p2', 'p3', 'probe', 'gauge'],
            medium: ['temperature', 'pressure', 'temp', 'thermal', 'reading', 'readings'],
            low: ['monitoring', 'measurement', 'data point', 'threshold', 'alert']
        },
        [IntentType.RUL]: {
            high: ['rul', 'remaining useful life', 'life expectancy', 'expected life', 'time to failure', 'ttf', 'remaining life', 'rl'],
            medium: ['lifespan', 'service life', 'operational life', 'end of life', 'eol', 'predict failure'],
            low: ['lifecycle', 'wear', 'aging', 'deterioration', 'longevity']
        },
        [IntentType.MISSION_CONFIG]: {
            high: ['mission configuration', 'mission config', 'configure mission', 'mission setup', 'perform mission'],
            medium: ['mission plan', 'mission planning', 'setup mission', 'create mission', 'mission sequence'],
            low: ['mission', 'configuration', 'config', 'planning', 'phase']
        }
    },
    contextPatterns: {
        [IntentType.SENSOR]: [
            /\b(sensor|p[123]|probe|gauge)\s+\w*\s*(malfunction|failure|error|issue)/i,
            /\b(temp|temperature|pressure|thermal)\s+(sensor|reading|probe)/i,
            /\bcheck\s+(sensor|p[123]|probe|temp)/i,
            /\b(sensor|probe)\s+(status|condition|health)/i
        ],
        [IntentType.RELIABILITY]: [
            /\b(system|equipment|device)\s+\w*\s*(reliability|breakdown|failure)/i,
            /\breliability\s+(of|analysis|assessment|check)/i,
            /\b(equipment|system)\s+(health|condition|status)/i
        ],
        [IntentType.RUL]: [
            /\b(remaining|expected|useful)\s+(life|lifespan)/i,
            /\b(predict|estimate|calculate|forecast)\s+\w*\s*(failure|life|lifespan)/i,
            /\bhow\s+(long|much)\s+\w*\s*(will|can|left|remaining)/i,
            /\b(time\s+to\s+failure|ttf|eol|end\s+of\s+life)/i,
            /\bwhen\s+will\s+\w*\s*(fail|break|die)/i
        ],
        [IntentType.MISSION_CONFIG]: [
            /\b(perform|start|begin|create|setup|configure)\s+\w*\s*(mission|config)/i,
            /\bmission\s+(configuration|config|setup|planning)/i,
            /\blet'?s\s+(perform|start|do|create)\s+\w*\s*(mission|config)/i,
            /\b(plan|configure|setup)\s+\w*\s*mission/i
        ]
    },
    intentVectors: {
        [IntentType.RELIABILITY]: {
            'reliability': 1, 'dependable': 1, 'stable': 1, 'maintenance': 1, 'uptime': 1,
            'degradation': 1, 'health': 1, 'condition': 1, 'durability': 1, 'performance': 1
        },
        [IntentType.SENSOR]: {
            'sensor': 1, 'measurement': 1, 'reading': 1, 'data': 1, 'monitor': 1,
            'temperature': 1, 'pressure': 1, 'probe': 1, 'detection': 1, 'thermal': 1
        },
        [IntentType.RUL]: {
            'remaining': 1, 'life': 1, 'useful': 1, 'expectancy': 1, 'predict': 1,
            'failure': 1, 'time': 1, 'lifespan': 1, 'forecast': 1, 'estimate': 1,
            'when': 1, 'long': 1, 'last': 1, 'left': 1, 'hours': 1
        },
        [IntentType.MISSION_CONFIG]: {
            'mission': 1, 'configuration': 1, 'config': 1, 'setup': 1, 'plan': 1,
            'planning': 1, 'phase': 1, 'duration': 1, 'sequence': 1, 'perform': 1,
            'configure': 1, 'create': 1
        }
    }
};

export const useIntentClassifier = (
    text: string,
    options: ClassifierOptions = {}
): UseIntentClassifierReturn => {
    const {
        debounceMs = 300,
        minLength = 3,
        enableDebug = false
    } = options;

    const [intentResult, setIntentResult] = useState<IntentResult>({
        intent: IntentType.GENERAL,
        confidence: 0,
        method: 'initial',
        isLoading: false
    });

    const textRef = useRef(text);
    textRef.current = text;

    const detectContext = useCallback((inputText: string): Record<string, number> => {
        const boosts: Record<string, number> = {};
        
        for (const [intent, patterns] of Object.entries(classifierConfig.contextPatterns)) {
            const hasContext = patterns.some((pattern: RegExp) => pattern.test(inputText));
            boosts[intent] = hasContext ? 1.3 : 1.0;
        }
        
        return boosts;
    }, []);

    const checkKeywords = useCallback((inputText: string): ClassificationResult => {
        const textLower = inputText.toLowerCase();
        const scores: Record<string, number> = {};
        const contextBoosts = detectContext(inputText);

        for (const [intent, priorityKeywords] of Object.entries(classifierConfig.intentKeywords)) {
            let score = 0;
            let matchCount = 0;
            let maxPriorityFound = 0;

            const priorityScores: Record<string, number> = { high: 1.0, medium: 0.6, low: 0.3 };
            
            for (const [priority, keywords] of Object.entries(priorityKeywords)) {
                const priorityValue = priorityScores[priority];
                
                for (const keyword of keywords as string[]) {
                    if (textLower.includes(keyword)) {
                        score += priorityValue;
                        matchCount++;
                        maxPriorityFound = Math.max(maxPriorityFound, priorityValue);
                    }
                }
            }

            if (matchCount > 0) {
                const baseScore = maxPriorityFound;
                const multipleBonus = Math.min((matchCount - 1) * 0.1, 0.3);
                const contextBoost = contextBoosts[intent] || 1.0;
                
                scores[intent] = Math.min((baseScore + multipleBonus) * contextBoost, 1.0);
            } else {
                scores[intent] = 0.0;
            }
        }

        const bestIntent = (Object.keys(scores) as IntentType[]).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        return {
            intent: bestIntent,
            confidence: scores[bestIntent],
            method: 'keyword',
            scores: scores
        };
    }, [detectContext]);

    const textToVector = useCallback((inputText: string): Record<string, number> => {
        const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = inputText.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 1 && !stopWords.includes(word));

        const vector: Record<string, number> = {};
        words.forEach(word => {
            vector[word] = (vector[word] || 0) + 1;
        });

        return vector;
    }, []);

    const cosineSimilarity = useCallback((vecA: Record<string, number>, vecB: Record<string, number>): number => {
        const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (const key of allKeys) {
            const valueA = vecA[key] || 0;
            const valueB = vecB[key] || 0;
            
            dotProduct += valueA * valueB;
            normA += valueA * valueA;
            normB += valueB * valueB;
        }

        if (normA === 0 || normB === 0) return 0;
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }, []);

    const calculateSemanticSimilarity = useCallback((inputText: string): ClassificationResult => {
        const inputVector = textToVector(inputText);
        const similarities: Record<string, number> = {};

        for (const [intent, intentVector] of Object.entries(classifierConfig.intentVectors)) {
            similarities[intent] = cosineSimilarity(inputVector, intentVector);
        }

        const bestIntent = (Object.keys(similarities) as IntentType[]).reduce((a, b) => 
            similarities[a] > similarities[b] ? a : b
        );
        
        return {
            intent: bestIntent,
            confidence: similarities[bestIntent],
            method: 'semantic',
            scores: similarities
        };
    }, [textToVector, cosineSimilarity]);

    const classifyIntent = useCallback(async (inputText: string): Promise<IntentResult> => {
        if (!inputText || inputText.trim().length < minLength) {
            return {
                intent: IntentType.GENERAL,
                confidence: 0.1,
                method: 'too_short',
                isLoading: false
            };
        }

        try {
            const keywordResult = checkKeywords(inputText);
            if (enableDebug) {
                console.log(`Keyword: ${keywordResult.intent} (${keywordResult.confidence.toFixed(2)})`, keywordResult.scores);
            }
            
            if (keywordResult.confidence >= 0.8) {
                return { ...keywordResult, method: 'keyword_fast_path', isLoading: false };
            }

            const semanticResult = calculateSemanticSimilarity(inputText);
            if (enableDebug) {
                console.log(`Semantic: ${semanticResult.intent} (${semanticResult.confidence.toFixed(2)})`, semanticResult.scores);
            }
            
            if (semanticResult.confidence >= 0.4) {
                return { ...semanticResult, method: 'semantic_smart_path', isLoading: false };
            }

            let finalResult: ClassificationResult;
            
            if (keywordResult.confidence >= 0.5) {
                finalResult = { ...keywordResult, method: 'keyword_chosen' };
            } else if (semanticResult.confidence >= 0.2) {
                finalResult = { ...semanticResult, method: 'semantic_chosen' };
            } else {
                finalResult = keywordResult.confidence >= semanticResult.confidence 
                    ? { ...keywordResult, method: 'best_of_weak' }
                    : { ...semanticResult, method: 'best_of_weak' };
            }

            if (finalResult.confidence < 0.25) {
                return {
                    intent: IntentType.GENERAL,
                    confidence: 0.5,
                    method: 'fallback_general',
                    isLoading: false
                };
            }

            return { ...finalResult, isLoading: false };

        } catch (error) {
            console.error('Classification error:', error);
            return {
                intent: IntentType.GENERAL,
                confidence: 0.3,
                method: 'error',
                isLoading: false
            };
        }
    }, [minLength, checkKeywords, calculateSemanticSimilarity, enableDebug]);

    useEffect(() => {
        if (!text) {
            setIntentResult({
                intent: IntentType.GENERAL,
                confidence: 0,
                method: 'empty',
                isLoading: false
            });
            return;
        }

        setIntentResult(prev => ({ ...prev, isLoading: true }));

        const timer = setTimeout(async () => {
            const currentText = textRef.current;
            if (currentText === text) {
                const result = await classifyIntent(currentText);
                setIntentResult(result);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [text, debounceMs]);

    const classifyNow = useCallback(async (inputText: string = text): Promise<IntentResult> => {
        setIntentResult(prev => ({ ...prev, isLoading: true }));
        const result = await classifyIntent(inputText);
        setIntentResult(result);
        return result;
    }, [classifyIntent, text]);

    return useMemo(() => ({
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        method: intentResult.method,
        isLoading: intentResult.isLoading,
        classifyNow,
        IntentType
    }), [
        intentResult.intent,
        intentResult.confidence, 
        intentResult.method,
        intentResult.isLoading,
        classifyNow
    ]);
};

export default useIntentClassifier;