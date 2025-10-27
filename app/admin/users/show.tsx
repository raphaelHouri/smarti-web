import { DateField, NumberField, ReferenceArrayField, ReferenceField, Show, SingleFieldList, SimpleShowLayout, TextField } from 'react-admin';

export const UsersShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="email" />
            <ReferenceField source="lessonCategoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" />
            </ReferenceField>
            <ReferenceField source="organizationYearId" reference="organizationYears" label="Organization Year">
                <TextField source="year" />
            </ReferenceField>
            <ReferenceArrayField source="managedOrganization" reference="organizationInfo" label="Managed Organizations">
                <SingleFieldList>
                    <TextField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
            <NumberField source="experience" />
            <NumberField source="geniusScore" label="Genius Score" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
