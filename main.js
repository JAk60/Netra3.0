
    let tool_calls= [
        {
            "name": "calculate_rul",
            "arguments": {
                "rul_query": "Show me the RUL of the GT_1_S2 sensor on GT1 of INS One.",
                "name": [
                    "GT 1"
                ],
                "ships": [
                    "INS ONE"
                ]
            },
            "result": {
                "success": true,
                "data": {
                    "rul_query": "Show me the RUL of the GT_1_S2 sensor on GT1 of INS One.",
                    "name": [
                        "GT 1"
                    ],
                    "ships": [
                        "INS ONE"
                    ],
                    "results": [
                        {
                            "nomenclature": "GT 1",
                            "ship": "INS ONE",
                            "sensors": {
                                "GT_1_S2": {
                                    "P": 25.0,
                                    "F": 95.0,
                                    "confidence": [
                                        0.8,
                                        0.85,
                                        0.9,
                                        0.95
                                    ],
                                    "remaining_life": [
                                        482.65,
                                        384.81,
                                        280.62,
                                        162.98
                                    ],
                                    "Table": {
                                        "0.8": 482.65,
                                        "0.85": 384.81,
                                        "0.9": 280.62,
                                        "0.95": 162.98
                                    },
                                    "weibull_params": {
                                        "beta": 1.53,
                                        "eta": 244.87
                                    },
                                    "latest_readings": {
                                        "vc": 499,
                                        "tp": 38.92,
                                        "t0": 59.79
                                    }
                                }
                            },
                            "sensor_list": [
                                "GT_1_S2"
                            ],
                            "summary": {
                                "average_rul_hours_90pct": 280.62,
                                "minimum_rul_hours_90pct": 280.62,
                                "critical_sensor": "GT_1_S2",
                                "total_sensors_analyzed": 1
                            }
                        }
                    ],
                    "summary": {
                        "total_nomenclatures_analyzed": 1,
                        "total_sensors_analyzed": 1,
                        "nomenclatures": [
                            "GT 1"
                        ],
                        "ships": [
                            "INS ONE"
                        ],
                        "sensors": [
                            "GT_1_S2"
                        ],
                        "overall_average_rul_hours_90pct": 280.62,
                        "overall_minimum_rul_hours_90pct": 280.62,
                        "most_critical_nomenclature": "GT 1",
                        "most_critical_sensor": "GT_1_S2"
                    },
                    "status": "success",
                    "metadata": {
                        "requested": [
                            "GT 1"
                        ],
                        "successful": [
                            "GT 1"
                        ],
                        "failed": [],
                        "ships_requested": [
                            "INS ONE"
                        ],
                        "ships_returned": [
                            "INS ONE"
                        ],
                        "rul_query": "Show me the RUL of the GT_1_S2 sensor on GT1 of INS One.",
                        "sensors_extracted": [
                            "GT_1_S2"
                        ]
                    },
                    "description": "Calculated RUL for GT 1 sensors (GT_1_S2) on INS ONE. Most critical: GT_1_S2 with 280.62 hours remaining (90% confidence).",
                    "urgency_level": "MODERATE - Monitor closely"
                }
            }
        }
    ]
    
    const hasRulToolCall = (toolCalls) => {
        if (!toolCalls || !Array.isArray(toolCalls)) return false
        return toolCalls.some(tool => tool.name === 'calculate_rul')
    }

    console.log('hasRulToolCall', hasRulToolCall(tool_calls))