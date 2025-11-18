import { DataTable, DateField, List, NumberField, Exporter, ExportButton, TopToolbar, BooleanField } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const plansExporter: Exporter = (records) => {
    exportToXlsx('plans', records, { sheetName: 'plans' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={plansExporter} label="Export XLSX" />
    </TopToolbar>
);

export const PlanList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="description" />
            <DataTable.NumberCol source="days" />
            <DataTable.NumberCol source="price" />
            <DataTable.Col source="isActive">
                <BooleanField source="isActive" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
