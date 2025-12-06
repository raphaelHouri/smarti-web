import { DateInput, Edit, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const LessonCategoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="categoryType" />
            <TextInput source="title" />
            <TextInput source="description" />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <DateInput source="createdAt" />
            <TextInput source="imageSrc" />
        </SimpleForm>
    </Edit>
);