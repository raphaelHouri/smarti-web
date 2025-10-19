import { DataTable, DateField, List, ReferenceField } from 'react-admin';

export const LessonList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="lessonCategoryId" label="Category" />
            <DataTable.NumberCol source="lessonOrder" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);