import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UsersEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="email" />
            <ReferenceInput source="lessonCategoryId" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <NumberInput source="experience" />
            <NumberInput source="geniusScore" label="Genius Score" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
