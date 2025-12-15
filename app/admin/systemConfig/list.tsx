import { DataTable, DateField, List, NumberField, TextField, Exporter, ExportButton, TopToolbar, CreateButton } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const systemConfigExporter: Exporter = (records) => {
    exportToXlsx('systemConfig', records, { sheetName: 'system_config' });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={systemConfigExporter} label="Export XLSX" />
    </TopToolbar>
);

export const SystemConfigList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.NumberCol source="systemStep" label="System Step" />
            <DataTable.Col source="linkWhatsappGroup" label="WhatsApp Group Link" />
            <DataTable.Col source="examDate">
                <DateField source="examDate" />
            </DataTable.Col>
            <DataTable.Col source="examEndDate">
                <DateField source="examEndDate" />
            </DataTable.Col>
            <DataTable.NumberCol source="numQuestion" label="Number of Questions" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
            <DataTable.Col source="updatedAt">
                <DateField source="updatedAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);

