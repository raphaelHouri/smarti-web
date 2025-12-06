
import { DataTable, DateField, List, Exporter, ExportButton, TopToolbar, CreateButton } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const lessonCategoryExporter: Exporter = (records) => {
    exportToXlsx('lessonCategory', records, { sheetName: 'lessonCategory' });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={lessonCategoryExporter} label="Export XLSX" />
    </TopToolbar>
);

export const LessonCategoryList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="categoryType" />
            <DataTable.Col source="title" />
            <DataTable.Col source="description" />
            <DataTable.Col source="systemStep" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
            <DataTable.Col source="imageSrc" />
        </DataTable>
    </List>
);