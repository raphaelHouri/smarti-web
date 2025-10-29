
import { DataTable, DateField, List, ReferenceField, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const lessonQuestionGroupsExporter: Exporter = (records) => {
    exportToXlsx('lessonQuestionGroups', records, { sheetName: 'lessonQuestionGroups' });
};

const ListActions = () => (
    <TopToolbar>
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