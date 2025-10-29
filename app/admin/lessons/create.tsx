import { BooleanInput, Create, NumberInput, ReferenceInput, SelectInput, SimpleForm } from 'react-admin';

export const LessonCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="lessonCategoryId" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <NumberInput source="lessonOrder" />
            <BooleanInput source="isPremium" label="Premium" defaultValue={true} />
        </SimpleForm>
    </Create>
);

