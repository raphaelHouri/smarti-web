import { DataTable, DateField, List, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const organizationInfoExporter: Exporter = (records) => {
    exportToXlsx('organizationInfo', records, { sheetName: 'organizationInfo' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={organizationInfoExporter} label="Export XLSX" />
    </TopToolbar>
);

export const OrganizationInfoList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="contactEmail" label="Contact Email" />
            <DataTable.Col source="address" />
            <DataTable.Col source="city" />
            <DataTable.Col source="phone" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
