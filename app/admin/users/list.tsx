import { ChipField, DataTable, DateField, List, NumberField, ReferenceArrayField, ReferenceField, SingleFieldList, TextField, Exporter, ExportButton, TopToolbar } from 'react-admin';
import { exportToXlsx } from '@/lib/xlsxExport';

const usersExporter: Exporter = (records) => {
    exportToXlsx('users', records, { sheetName: 'users' });
};

const ListActions = () => (
    <TopToolbar>
        <ExportButton exporter={usersExporter} label="Export XLSX" />
    </TopToolbar>
);

export const UsersList = () => (
    <List exporter={false} actions={<ListActions />}>
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
            <DataTable.Col source="managedOrganization" label="Managed Organizations">
                <ReferenceArrayField source="managedOrganization" reference="organizationInfo">
                    <SingleFieldList>
                        <ChipField source="name" size="small" />
                    </SingleFieldList>
                </ReferenceArrayField>
            </DataTable.Col>
            <DataTable.NumberCol source="experience" />
            <DataTable.NumberCol source="geniusScore" label="Genius Score" />
            <DataTable.NumberCol source="systemStep" label="System Step" />
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
