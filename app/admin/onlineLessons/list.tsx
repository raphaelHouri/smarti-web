import { DataTable, DateField, List, ReferenceField, TextField, Exporter, ExportButton, TopToolbar, CreateButton, NumberField } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const onlineLessonsExporter: Exporter = (records) => {
    const rows = records.map((r: any) => ({
        id: r.id,
        categoryId: r.categoryId,
        topicType: r.topicType,
        title: r.title,
        description: r.description,
        link: r.link,
        order: r.order,
        createdAt: r.createdAt,
    }));
    exportToXlsx('online_lessons', rows, {
        sheetName: 'online_lessons',
        headersOrder: ['id', 'categoryId', 'topicType', 'title', 'description', 'link', 'order', 'createdAt'],
        headersLabel: {
            id: 'id',
            categoryId: 'categoryId',
            topicType: 'topicType',
            title: 'title',
            description: 'description',
            link: 'link',
            order: 'order',
            createdAt: 'createdAt',
        },
    });
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton exporter={onlineLessonsExporter} label="Export XLSX" />
    </TopToolbar>
);

export const OnlineLessonList = () => (
    <List exporter={false} actions={<ListActions />} sort={{ field: 'order', order: 'ASC' }}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="categoryId" label="Category">
                <ReferenceField source="categoryId" reference="lessonCategory">
                    <TextField source="categoryType" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="topicType" />
            <DataTable.Col source="title" />
            <DataTable.Col source="description" />
            <DataTable.Col source="link" />
            <DataTable.Col source="order">
                <NumberField source="order" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);


