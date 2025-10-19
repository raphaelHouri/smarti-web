import { DataTable, DateField, List } from 'react-admin';

export const OrganizationInfoList = () => (
    <List>
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
