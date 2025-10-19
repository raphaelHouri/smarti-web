import { DataTable, DateField, List, NumberField } from 'react-admin';

export const PlanList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="description" />
            <DataTable.NumberCol source="days" />
            <DataTable.NumberCol source="price" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
