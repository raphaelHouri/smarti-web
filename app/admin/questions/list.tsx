import { DataTable, DateField, FunctionField, List, ReferenceField, TextField, Exporter, ExportButton, TopToolbar, CreateButton } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const questionsExporter: Exporter = (records) => {
    const rows = records.map((r: any) => ({
        id: r.id,
        content: r.content,
        question: r.question,
        format: r.format,
        optionA: r?.options?.a,
        optionB: r?.options?.b,
        optionC: r?.options?.c,
        optionD: r?.options?.d,
        categoryId: r.categoryId,
        topicType: r.topicType,
        explanation: r.explanation,
        createdAt: r.createdAt,
    }));
    exportToXlsx('questions', rows, {
        sheetName: 'questions',
        headersOrder: ['id', 'content', 'question', 'format', 'optionA', 'optionB', 'optionC', 'optionD', 'categoryId', 'topicType', 'explanation', 'createdAt'],
        headersLabel: {
            id: 'id',
            content: 'content',
            question: 'question',
            format: 'format',
            optionA: 'options.a',
            optionB: 'options.b',
            optionC: 'options.c',
            optionD: 'options.d',
            categoryId: 'categoryId',
            topicType: 'topicType',
            explanation: 'explanation',
            createdAt: 'createdAt',
        },
    });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={questionsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const QuestionList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="content" />
            <DataTable.Col source="question" />
            <DataTable.Col source="format" />
            <DataTable.Col source="options.a" label="Option A" />
            <DataTable.Col source="options.b" label="Option B" />
            <DataTable.Col source="options.c" label="Option C" />
            <DataTable.Col source="options.d" label="Option D" />
            <DataTable.Col source="categoryId" label="Category">
                <ReferenceField source="categoryId" reference="lessonCategory">
                    <TextField source="categoryType" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="topicType" />
            <DataTable.Col source="explanation" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);