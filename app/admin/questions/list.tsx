import { DataTable, DateField, FunctionField, List, ReferenceField, TextField } from 'react-admin';

export const QuestionList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="content" />
            <DataTable.Col source="question" />
            <DataTable.Col source="format" />
            <DataTable.Col source="options.a" label="Option A" />
            <DataTable.Col source="options.b" label="Option B" />
            <DataTable.Col source="options.c" label="Option C" />
            <DataTable.Col source="options.d" label="Option D" />
            <DataTable.Col source="categoryId" label="Category">
                <ReferenceField source="categoryId" reference="lessonCategory">
                    <TextField source="categoryType" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="topicType" />
            <DataTable.Col source="explanation" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);