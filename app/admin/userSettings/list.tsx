import { DataTable, List, ReferenceField, TextField, BooleanField } from 'react-admin';

export const UserSettingsList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId" label="User">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="lessonClock" label="Lesson Clock">
                <BooleanField source="lessonClock" />
            </DataTable.Col>
            <DataTable.Col source="quizClock" label="Quiz Clock">
                <BooleanField source="quizClock" />
            </DataTable.Col>
            <DataTable.Col source="immediateResult" label="Immediate Result">
                <BooleanField source="immediateResult" />
            </DataTable.Col>
            <DataTable.Col source="grade_class" label="Grade/Class" />
            <DataTable.Col source="gender" />
            <DataTable.Col source="avatar" />
        </DataTable>
    </List>
);
