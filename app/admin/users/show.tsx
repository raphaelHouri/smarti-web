import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UsersShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="email" />
            <ReferenceField source="lessonCategoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" />
            </ReferenceField>
            <NumberField source="experience" />
            <NumberField source="geniusScore" label="Genius Score" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
