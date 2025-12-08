import { DateField, NumberField, Show, SimpleShowLayout, TextField, BooleanField, FunctionField } from 'react-admin';

export const PlanShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="internalDescription" label="Internal Description" />
            <TextField source="packageType" label="Package Type" />
            <FunctionField
                label="Products IDs"
                render={(record: any) => {
                    if (!record?.productsIds) return '-';
                    const ids = Array.isArray(record.productsIds) ? record.productsIds : [];
                    return ids.length > 0 ? ids.join(', ') : '-';
                }}
            />
            <NumberField source="days" />
            <NumberField source="price" />
            <NumberField source="order" />
            <BooleanField source="isActive" />
            <NumberField source="systemStep" label="System Step" />
            <FunctionField
                label="Display Data"
                render={(record: any) => {
                    if (!record?.displayData) return '-';
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
                }}
            />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
