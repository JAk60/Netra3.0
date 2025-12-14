import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { JSX } from 'react';

interface Answer {
    question: string;
    answer: string;
}

interface TableRow {
    equipment: string;
    assembly: string;
    recommendation: string;
}

interface RCMReportPDFProps {
    shipName: string;
    equipmentNames: string[];
    tableRows: TableRow[];
    answers: Answer[];
    generatedDate: string;
    generatedTime: string;
}

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
    // Table styles
    table: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0891b2',
        padding: 10,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderCell: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #e2e8f0',
        padding: 10,
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        flexDirection: 'row',
        borderBottom: '1 solid #e2e8f0',
        padding: 10,
        backgroundColor: '#f8fafc',
    },
    tableCell: {
        fontSize: 10,
        color: '#334155',
        flex: 1,
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
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pathSegment: {
        fontSize: 10,
        color: '#475569',
    },
    pathYes: {
        fontSize: 10,
        color: '#059669',
        fontWeight: 'bold',
    },
    pathNo: {
        fontSize: 10,
        color: '#dc2626',
        fontWeight: 'bold',
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

export const RCMReportPDF: React.FC<RCMReportPDFProps> = ({
    shipName,
    equipmentNames,
    tableRows,
    answers,
    generatedDate,
    generatedTime
}) => {

    const renderDecisionPath = (): JSX.Element[] => {
        return answers.map((a: Answer, index: number): JSX.Element => {
            const answerUpper = a.answer.toUpperCase();
            const isYes = answerUpper === 'YES';
            const isNo = answerUpper === 'NO';

            return (
                <Text key={index}>
                    <Text style={styles.pathSegment}>{a.question} → </Text>
                    <Text style={isYes ? styles.pathYes : isNo ? styles.pathNo : styles.pathSegment}>
                        {answerUpper}
                    </Text>
                    {index < answers.length - 1 && <Text style={styles.pathSegment}> | </Text>}
                </Text>
            );
        });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>RCM Analysis Report</Text>
                    <Text style={styles.subtitle}>Generated on {generatedDate} at {generatedTime}</Text>
                </View>

                {/* SHIP */}
                <View style={styles.section}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>SHIP</Text>
                        <Text style={styles.infoValue}>{shipName}</Text>
                    </View>

                    {/* EQUIPMENT */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>EQUIPMENT SELECTED</Text>
                        <Text style={styles.infoValue}>{equipmentNames.join(", ")}</Text>
                    </View>
                </View>

                {/* SECTION TITLE */}
                <Text style={styles.sectionTitle}>Maintenance Breakdown</Text>

                {/* TABLE */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderCell}>Equipment</Text>
                        <Text style={styles.tableHeaderCell}>Assembly</Text>
                        <Text style={styles.tableHeaderCell}>Maintenance Policy</Text>
                    </View>

                    {/* Table Rows */}
                    {tableRows.map((row: TableRow, index: number) => (
                        <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                            <Text style={styles.tableCell}>{row.equipment}</Text>
                            <Text style={styles.tableCell}>{row.assembly}</Text>
                            <Text style={styles.tableCell}>{row.recommendation}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Decision Path</Text>
                    <View style={styles.pathContainer}>
                        <Text style={styles.pathText}>{renderDecisionPath()}</Text>
                    </View>
                </View>

                {/* FOOTER */}
                <Text style={styles.footer}>
                    This report was automatically generated by the RCM Analysis System.
                </Text>

            </Page>
        </Document>
    );
};