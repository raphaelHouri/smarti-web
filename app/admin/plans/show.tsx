import { DateField, NumberField, Show, SimpleShowLayout, TextField, BooleanField, useRecordContext } from 'react-admin';

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
        return (
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(json, null, 2)}
            </pre>
        );
    } catch {
        return <span>{String(record.displayData)}</span>;
    }
};

export const PlanShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="internalDescription" label="Internal Description" />
            <TextField source="packageType" label="Package Type" />
            <ProductsIdsField label="Products IDs" />
            <NumberField source="days" />
            <NumberField source="price" />
            <NumberField source="order" />
            <BooleanField source="isActive" />
            <NumberField source="systemStep" label="System Step" />
            <DisplayDataField label="Display Data" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
