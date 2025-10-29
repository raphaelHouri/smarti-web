import { DataTable, DateField, List, ReferenceField, BooleanField, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const lessonsExporter: Exporter = (records) => {
    exportToXlsx('lessons', records, {
        sheetName: 'lessons',
        headersOrder: ['id', 'lessonCategoryId', 'lessonOrder', 'isPremium', 'createdAt'],
    });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={lessonsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const LessonList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="lessonCategoryId" label="Category" />
            <DataTable.NumberCol source="lessonOrder" />
            <DataTable.Col source="isPremium" label="Premium">
                <BooleanField source="isPremium" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);