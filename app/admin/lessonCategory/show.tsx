import { DateInput, Edit, SimpleForm, TextInput } from 'react-admin';

export const LessonCategoryShow = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="categoryType" />
            <TextInput source="title" />
            <TextInput source="description" />
            <DateInput source="createdAt" />
            <TextInput source="imageSrc" />
        </SimpleForm>
    </Edit>
);