import { Edit, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput } from 'react-admin';

export const OnlineLessonEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput source="categoryId" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <TextInput source="topicType" />
            <TextInput source="title" />
            <TextInput source="description" />
            <TextInput source="link" />
            <NumberInput source="order" />
        </SimpleForm>
    </Edit>
);


