
import { DataTable, DateField, List } from 'react-admin';

export const LessonCategoryList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="categoryType" />
            <DataTable.Col source="title" />
            <DataTable.Col source="description" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
            <DataTable.Col source="imageSrc" />
        </DataTable>
    </List>
);