// Decision tree structure - Verified against rcmLogic.js (source of truth)
export const questionTree = {
    q1: {
        id: 'q1',
        question: 'Is it critical for safety?',
        type: 'decision',
        yesPath: 'q3',   // Safety=Yes → Sensor monitoring
        noPath: 'q2'     // Safety=No  → Mission question
    },
    q2: {
        id: 'q2',
        question: 'Is it Critical for Mission?',
        type: 'decision',
        yesPath: 'q3',   // ✅ FIX: Mission=Yes → Sensor monitoring (same as Safety=Yes path)
        noPath: 'q4'     // Mission=No → Operating Environment
    },
    q3: {
        id: 'q3',
        question: 'Is Sensor based condition monitoring available?',
        type: 'decision',
        yesPath: 'q5',   // Sensor=Yes → P-F interval
        noPath: 'q6'     // Sensor=No  → Inspection procedure
    },
    q4: {
        id: 'q4',
        question: 'Is it critical for operating environment?',
        type: 'decision',
        yesPath: 'q7',   // Operating=Yes → Downtime question
        noPath: 'q8'     // Operating=No  → Downtime question (different branch)
    },
    q5: {
        id: 'q5',
        question: 'Is P-F interval sufficiently long?',
        type: 'decision',
        yesPath: 'q9',   // PF=Yes → Continuous monitoring
        noPath: 'q10'    // PF=No  → Inspection procedure
    },
    q6: {
        id: 'q6',
        question: 'Is Inspection Procedure available?',
        type: 'decision',
        yesPath: 'q11',  // Inspection=Yes → Feasible?
        noPath: 'q12'    // Inspection=No  → Is it costly?
    },
    q7: {
        id: 'q7',
        question: 'Is it critical for downtime?',
        type: 'decision',
        yesPath: 'q13',    // Downtime=Yes → Conditional monitoring
        noPath: 'endpoint1' // Downtime=No  → Run to Failure
    },
    q8: {
        id: 'q8',
        question: 'Is it critical for downtime?',
        type: 'decision',
        yesPath: 'q13',    // Downtime=Yes → Conditional monitoring
        noPath: 'endpoint1' // Downtime=No  → Run to Failure
    },
    q9: {
        id: 'q9',
        question: 'Is Continuous Monitoring feasible?',
        type: 'decision',
        yesPath: 'endpoint2', // → Sensor based continuous monitoring
        noPath: 'endpoint3'   // → Sensor based intermittent monitoring
    },
    q10: {
        id: 'q10',
        question: 'Is Inspection Procedure available?',
        type: 'decision',
        yesPath: 'q11',  // Inspection=Yes → Feasible?
        noPath: 'q12'    // Inspection=No  → Is it costly?
    },
    q11: {
        id: 'q11',
        question: 'Is Feasible?',
        type: 'decision',
        yesPath: 'endpoint4', // Feasible=Yes → Inspection Based
        noPath: 'q14'         // Feasible=No  → Preventive Maintenance?
    },
    q12: {
        id: 'q12',
        question: 'Is it costly?',
        type: 'decision',
        yesPath: 'q15',       // Costly=Yes → Preventive Maintenance?
        noPath: 'q16'         // Costly=No  → Sensor based monitoring?
    },
    q13: {
        id: 'q13',
        question: 'Is conditional Monitoring available?',
        type: 'decision',
        yesPath: 'q12',  // Conditional=Yes → Is it costly?
        noPath: 'q16'    // Conditional=No  → Sensor based monitoring?
    },
    q14: {
        id: 'q14',
        question: 'Is Preventive Maintenance available?',
        type: 'decision',
        yesPath: 'q17',       // PM=Yes → Is the cost high?
        noPath: 'endpoint5'   // PM=No  → Design Improvement
    },
    q15: {
        id: 'q15',
        question: 'Is Preventive Maintenance available?',
        type: 'decision',
        yesPath: 'q18',       // PM=Yes → Is the cost high?
        noPath: 'endpoint5'   // PM=No  → Design Improvement
    },
    q16: {
        id: 'q16',
        question: 'Is Sensor based Monitoring available?',
        type: 'decision',
        yesPath: 'q19',       // Sensor=Yes → Continuous monitoring?
        noPath: 'endpoint6'   // Sensor=No  → Inspection!!
    },
    q17: {
        id: 'q17',
        question: 'Is the cost high?',
        type: 'decision',
        yesPath: 'endpoint7', // Cost=Yes → Age based PM
        noPath: 'endpoint8'   // Cost=No  → Calendar time based PM
    },
    q18: {
        id: 'q18',
        question: 'Is the cost high?',
        type: 'decision',
        yesPath: 'endpoint7', // Cost=Yes → Age based PM
        noPath: 'endpoint8'   // Cost=No  → Calendar time based PM
    },
    q19: {
        id: 'q19',
        question: 'Is Continuous Monitoring feasible?',
        type: 'decision',
        yesPath: 'endpoint9',  // → Sensor based continuous monitoring
        noPath: 'endpoint10'   // → Sensor based intermittent monitoring
    },

    // ── Endpoints ─────────────────────────────────────────────────────────────
    endpoint1: {
        id: 'endpoint1',
        type: 'endpoint',
        result: 'Component is non-critical - Run to Failure is recommended!!'
    },
    endpoint2: {
        id: 'endpoint2',
        type: 'endpoint',
        result: 'Sensor based continous monitoring!!'
    },
    endpoint3: {
        id: 'endpoint3',
        type: 'endpoint',
        result: 'Sensor based intermittent monitoring!!'
    },
    endpoint4: {
        id: 'endpoint4',
        type: 'endpoint',
        result: 'Inspection Based!!'
    },
    endpoint5: {
        id: 'endpoint5',
        type: 'endpoint',
        result: 'Design Improvement is Recommended!!'
    },
    endpoint6: {
        id: 'endpoint6',
        type: 'endpoint',
        result: 'Inspection!!'  // ✅ FIX: was "Impediment", matches old rcmLogic.js Sensor(alt)=No → "Inspection!!"
    },
    endpoint7: {
        id: 'endpoint7',
        type: 'endpoint',
        result: 'Age based preventive Maintenance!!'
    },
    endpoint8: {
        id: 'endpoint8',
        type: 'endpoint',
        result: 'Calendar time based preventive Maintenance!!'
    },
    endpoint9: {
        id: 'endpoint9',
        type: 'endpoint',
        result: 'Sensor based continous monitoring!!'
    },
    endpoint10: {
        id: 'endpoint10',
        type: 'endpoint',
        result: 'Sensor based intermittent monitoring!!'
    }
};