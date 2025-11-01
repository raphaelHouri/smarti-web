import { Show, SimpleShowLayout, TextField, ReferenceField, NumberField, DateField } from 'react-admin';

export const OnlineLessonShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="categoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" />
            </ReferenceField>
            <TextField source="topicType" />
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="link" />
            <NumberField source="order" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);


