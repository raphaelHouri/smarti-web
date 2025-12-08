import { DataTable, DateField, List, NumberField, Exporter, ExportButton, TopToolbar, BooleanField, useRecordContext } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const plansExporter: Exporter = (records) => {
    exportToXlsx('plans', records, { sheetName: 'plans' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={plansExporter} label="Export XLSX" />
    </TopToolbar>
);

const ProductsIdsField = () => {
    const record = useRecordContext();
    if (!record?.productsIds) return <span>-</span>;
    const ids = Array.isArray(record.productsIds) ? record.productsIds : [];
    return <span>{ids.length > 0 ? ids.join(', ') : '-'}</span>;
};

const DisplayDataField = () => {
    const record = useRecordContext();
    if (!record?.displayData) return <span>-</span>;
    try {
        const json = typeof record.displayData === 'string'
            ? JSON.parse(record.displayData)
            : record.displayData;
        return <span>{JSON.stringify(json, null, 2)}</span>;
    } catch {
        return <span>{String(record.displayData)}</span>;
    }
};

export const PlanList = () => (
    <List exporter={false} actions={<ListActions />}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="description" />
            <DataTable.Col source="internalDescription" label="Internal Description" />
            <DataTable.Col source="packageType" label="Package Type" />
            <DataTable.Col source="productsIds" label="Products IDs">
                <ProductsIdsField />
            </DataTable.Col>
            <DataTable.NumberCol source="days" />
            <DataTable.NumberCol source="price" />
            <DataTable.NumberCol source="order" />
            <DataTable.Col source="isActive">
                <BooleanField source="isActive" />
            </DataTable.Col>
            <DataTable.NumberCol source="systemStep" label="System Step" />
            <DataTable.Col source="displayData" label="Display Data">
                <DisplayDataField />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
