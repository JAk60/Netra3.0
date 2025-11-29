import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2 solid #0891b2',
        paddingBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    infoBox: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 10,
        color: '#64748b',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    recommendationBox: {
        backgroundColor: '#ecfeff',
        border: '2 solid #06b6d4',
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
    },
    recommendationLabel: {
        fontSize: 10,
        color: '#0891b2',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    recommendationText: {
        fontSize: 16,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    answerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        marginBottom: 8,
        borderLeft: '3 solid #cbd5e1',
    },
    answerQuestion: {
        fontSize: 11,
        color: '#334155',
        flex: 1,
        marginRight: 10,
    },
    answerBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 'bold',
    },
    yesAnswer: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    noAnswer: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    pathContainer: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
    },
    pathText: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.6,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#94a3b8',
        borderTop: '1 solid #e2e8f0',
        paddingTop: 10,
    },
});

interface RCMReportPDFProps {
    shipName: string;
    equipmentName: string;
    recommendation: string;
    answers: Array<{
        questionId: string;
        question: string;
        answer: string;
    }>;
    generatedDate: string;
    generatedTime: string;
}

export const RCMReportPDF = ({
    shipName,
    equipmentName,
    recommendation,
    answers,
    generatedDate,
    generatedTime,
}: RCMReportPDFProps) => {
    // Create decision path text
    const getDecisionPath = () => {
        return answers
            .map((a) => `${a.question} → ${a.answer.toUpperCase()}`)
            .join(' | ');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>RCM Analysis Report</Text>
                    <Text style={styles.subtitle}>
                        Reliability Centered Maintenance | Generated on {generatedDate} at{' '}
                        {generatedTime}
                    </Text>
                </View>

                {/* Ship and Equipment Info */}
                <View style={styles.section}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>SHIP</Text>
                        <Text style={styles.infoValue}>{shipName}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>EQUIPMENT</Text>
                        <Text style={styles.infoValue}>{equipmentName}</Text>
                    </View>
                </View>

                {/* Recommendation */}
                <View style={styles.section}>
                    <View style={styles.recommendationBox}>
                        <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
                        <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                </View>

                {/* Decision Path */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Decision Path</Text>
                    <View style={styles.pathContainer}>
                        <Text style={styles.pathText}>{getDecisionPath()}</Text>
                    </View>
                </View>

                {/* Complete Answer Log */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Complete Answer Log</Text>
                    {answers.map((a, i) => (
                        <View key={i} style={styles.answerRow}>
                            <Text style={styles.answerQuestion}>{a.question}</Text>
                            <View
                                style={[
                                    styles.answerBadge,
                                    a.answer === 'yes' ? styles.yesAnswer : styles.noAnswer,
                                ]}
                            >
                                <Text>{a.answer.toUpperCase()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    This report was automatically generated by the RCM Analysis System
                </Text>
            </Page>
        </Document>
    );
};