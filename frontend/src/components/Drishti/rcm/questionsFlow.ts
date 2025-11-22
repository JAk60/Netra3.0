
// Decision tree structure
export const questionTree = {
    q1: {
        id: 'q1',
        question: 'Is it critical for safety?',
        type: 'decision',
        yesPath: 'q2',
        noPath: 'q3'
    },
    q2: {
        id: 'q2',
        question: 'Is it Critical for Mission?',
        type: 'decision',
        yesPath: 'q4',
        noPath: 'q4'
    },
    q3: {
        id: 'q3',
        question: 'Is Sensor based condition monitoring available?',
        type: 'decision',
        yesPath: 'q5',
        noPath: 'q6'
    },
    q4: {
        id: 'q4',
        question: 'Is it critical for operating environment?',
        type: 'decision',
        yesPath: 'q7',
        noPath: 'q8'
    },
    q5: {
        id: 'q5',
        question: 'Is P-F interval sufficiently long?',
        type: 'decision',
        yesPath: 'q9',
        noPath: 'q10'
    },
    q6: {
        id: 'q6',
        question: 'Is Inspection Procedure available?',
        type: 'decision',
        yesPath: 'q11',
        noPath: 'q12'
    },
    q7: {
        id: 'q7',
        question: 'Is it critical for downtime?',
        type: 'decision',
        yesPath: 'endpoint1',
        noPath: 'q13'
    },
    q8: {
        id: 'q8',
        question: 'Is Sensor based Monitoring available?',
        type: 'decision',
        yesPath: 'q5',
        noPath: 'q6'
    },
    q9: {
        id: 'q9',
        question: 'Is Continuous Monitoring feasible?',
        type: 'decision',
        yesPath: 'endpoint2',
        noPath: 'endpoint3'
    },
    q10: {
        id: 'q10',
        question: 'Is Inspection Procedure available?',
        type: 'decision',
        yesPath: 'q11',
        noPath: 'q12'
    },
    q11: {
        id: 'q11',
        question: 'Is Feasible?',
        type: 'decision',
        yesPath: 'endpoint4',
        noPath: 'q14'
    },
    q12: {
        id: 'q12',
        question: 'Is it cost?',
        type: 'decision',
        yesPath: 'q15',
        noPath: 'endpoint5'
    },
    q13: {
        id: 'q13',
        question: 'Is conditional Monitoring available?',
        type: 'decision',
        yesPath: 'q12',
        noPath: 'q16'
    },
    q14: {
        id: 'q14',
        question: 'Is Preventive Maintenance available?',
        type: 'decision',
        yesPath: 'q17',
        noPath: 'endpoint5'
    },
    q15: {
        id: 'q15',
        question: 'Is Preventive Maintenance available?',
        type: 'decision',
        yesPath: 'q18',
        noPath: 'endpoint5'
    },
    q16: {
        id: 'q16',
        question: 'Is Sensor based Monitoring available?',
        type: 'decision',
        yesPath: 'q19',
        noPath: 'endpoint6'
    },
    q17: {
        id: 'q17',
        question: 'Is the cost is high?',
        type: 'decision',
        yesPath: 'endpoint7',
        noPath: 'endpoint8'
    },
    q18: {
        id: 'q18',
        question: 'Is the cost is high?',
        type: 'decision',
        yesPath: 'endpoint7',
        noPath: 'endpoint8'
    },
    q19: {
        id: 'q19',
        question: 'Is Continuous Monitoring feasible?',
        type: 'decision',
        yesPath: 'endpoint9',
        noPath: 'endpoint10'
    },
    endpoint1: {
        id: 'endpoint1',
        type: 'endpoint',
        result: 'Component is non-critical - Run to Failure is recommended'
    },
    endpoint2: {
        id: 'endpoint2',
        type: 'endpoint',
        result: 'Sensor based continuous monitoring'
    },
    endpoint3: {
        id: 'endpoint3',
        type: 'endpoint',
        result: 'Sensor based intermittent monitoring'
    },
    endpoint4: {
        id: 'endpoint4',
        type: 'endpoint',
        result: 'Inspection Based'
    },
    endpoint5: {
        id: 'endpoint5',
        type: 'endpoint',
        result: 'Design Improvement is Recommended'
    },
    endpoint6: {
        id: 'endpoint6',
        type: 'endpoint',
        result: 'Impediment'
    },
    endpoint7: {
        id: 'endpoint7',
        type: 'endpoint',
        result: 'Age based preventive maintenance'
    },
    endpoint8: {
        id: 'endpoint8',
        type: 'endpoint',
        result: 'Calendar time based preventive maintenance'
    },
    endpoint9: {
        id: 'endpoint9',
        type: 'endpoint',
        result: 'Sensor based continuous monitoring'
    },
    endpoint10: {
        id: 'endpoint10',
        type: 'endpoint',
        result: 'Sensor based intermittent monitoring'
    }
};