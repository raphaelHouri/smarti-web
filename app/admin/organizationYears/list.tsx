import { DataTable, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const OrganizationYearsList = () => (
    <List>
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
