import { DataTable, List, ReferenceField, TextField, BooleanField } from 'react-admin';

export const UserWrongQuestionsList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId" label="User">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="questionId" label="Question">
                <ReferenceField source="questionId" reference="questions">
                    <TextField source="question" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="isNull" label="Is Null">
                <BooleanField source="isNull" />
            </DataTable.Col>
        </DataTable>
    </List>
);
