import { BooleanInput, DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const LessonEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="lessonCategoryId" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <NumberInput source="lessonOrder" />
            <BooleanInput source="isPremium" label="Premium" />
            <DateInput source="createdAt" />
        </SimpleForm>
    </Edit>
);