
import { DataTable, DateField, List, ReferenceField } from 'react-admin';

export const LessonQuestionGroupList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="lessonId" />
            <DataTable.Col source="categoryId" />
            <DataTable.Col source="questionList" />
            <DataTable.NumberCol source="time" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);