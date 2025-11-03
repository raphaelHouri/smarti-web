
import { DataTable, DateField, List, ReferenceField, Exporter, ExportButton, TopToolbar, CreateButton } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const lessonQuestionGroupsExporter: Exporter = (records) => {
    const rows = records.map((r: any) => ({
        id: r.id,
        lessonId: r.lessonId,
        categoryId: r.categoryId,

        questionIds: Array.isArray(r.questionList) ? r.questionList.join(';') : r.questionList,
        time: r.time,
        createdAt: r.createdAt,
    }));
    exportToXlsx('lessonQuestionGroups', rows, {
        sheetName: 'lessonQuestionGroups',
        headersOrder: ['id', 'lessonId', 'categoryId', 'questionIds', 'time', 'createdAt'],
        headersLabel: {
            id: 'id',
            lessonId: 'lessonId',
            categoryId: 'categoryId',
            questionIds: 'questionIds',
            time: 'time',
            createdAt: 'createdAt',
        },
    });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={lessonQuestionGroupsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const LessonQuestionGroupList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="lessonId" />
            <DataTable.Col source="categoryId" />
            <DataTable.Col source="questionList" />
            <DataTable.NumberCol source="time" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);