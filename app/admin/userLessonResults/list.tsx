import { DataTable, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const UserLessonResultsList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId" label="User">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="lessonId" label="Lesson">
                <ReferenceField source="lessonId" reference="lessons">
                    <TextField source="lessonOrder" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.NumberCol source="rightQuestions" label="Right Questions" />
            <DataTable.NumberCol source="totalQuestions" label="Total Questions" />
            <DataTable.Col source="startedAt">
                <DateField source="startedAt" />
            </DataTable.Col>
            <DataTable.Col source="completedAt">
                <DateField source="completedAt" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
