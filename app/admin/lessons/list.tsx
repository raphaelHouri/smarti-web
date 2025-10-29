import { DataTable, DateField, List, ReferenceField, BooleanField } from 'react-admin';

export const LessonList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="lessonCategoryId" label="Category" />
            <DataTable.NumberCol source="lessonOrder" />
            <DataTable.Col source="isPremium" label="Premium">
                <BooleanField source="isPremium" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);