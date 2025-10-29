import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField, BooleanField } from 'react-admin';

export const LessonShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="lessonCategoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" />
            </ReferenceField>
            <NumberField source="lessonOrder" />
            <BooleanField source="isPremium" label="Premium" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);