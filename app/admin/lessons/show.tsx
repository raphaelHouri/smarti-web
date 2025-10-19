import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const LessonShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="lessonCategoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" /> 
            </ReferenceField>
            <NumberField source="lessonOrder" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);