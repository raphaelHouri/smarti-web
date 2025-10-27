import { DataTable, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const UsersList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="email" />
            <DataTable.Col source="lessonCategoryId" label="Category">
                <ReferenceField source="lessonCategoryId" reference="lessonCategory">
                    <TextField source="categoryType" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="organizationYearId" label="Organization Year">
                <ReferenceField source="organizationYearId" reference="organizationYears" label="">
                    <ReferenceField source="organizationId" reference="organizationInfo" link={false}>
                        <TextField source="name" />
                    </ReferenceField>
                    <span> - </span>
                    <TextField source="year" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.NumberCol source="experience" />
            <DataTable.NumberCol source="geniusScore" label="Genius Score" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
