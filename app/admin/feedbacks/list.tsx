import { DataTable, DateField, List, ReferenceField, TextField, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const feedbacksExporter: Exporter = (records) => {
    exportToXlsx('feedbacks', records, { sheetName: 'feedbacks' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={feedbacksExporter} label="Export XLSX" />
    </TopToolbar>
);

export const FeedbackList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="screenName" />
            <DataTable.Col source="identifier" />
            <DataTable.Col source="rate" />
            <DataTable.Col source="title" />
            <DataTable.Col source="description" />
            <DataTable.Col source="systemStep" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);