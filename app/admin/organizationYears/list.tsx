import { DataTable, DateField, List, NumberField, ReferenceField, TextField, Exporter, ExportButton, TopToolbar, CreateButton } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const organizationYearsExporter: Exporter = (records) => {
    exportToXlsx('organizationYears', records, { sheetName: 'organizationYears' });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={organizationYearsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const OrganizationYearsList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="organizationId" label="Organization">
                <ReferenceField source="organizationId" reference="organizationInfo">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.NumberCol source="year" />
            <DataTable.Col source="notes" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
