import { DataTable, DateField, List, ReferenceField } from 'react-admin';

export const FeedbackList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId">
                <ReferenceField source="userId" reference="users" />
            </DataTable.Col>
            <DataTable.Col source="screenName" />
            <DataTable.Col source="identifier" />
            <DataTable.Col source="rate" />
            <DataTable.Col source="title" />
            <DataTable.Col source="description" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);