import { DataTable, List, ReferenceField, TextField, BooleanField, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const userWrongQuestionsExporter: Exporter = (records) => {
    exportToXlsx('userWrongQuestions', records, { sheetName: 'userWrongQuestions' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={userWrongQuestionsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const UserWrongQuestionsList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId" label="User">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="questionId" label="Question">
                <ReferenceField source="questionId" reference="questions">
                    <TextField source="question" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="isNull" label="Is Null">
                <BooleanField source="isNull" />
            </DataTable.Col>
        </DataTable>
    </List>
);
