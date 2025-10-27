import { DataTable, DateField, List, ReferenceField, BooleanField, NumberField, TextField } from 'react-admin';

export const CouponList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="code" />
            <DataTable.Col source="couponType" label="Type" />
            <DataTable.NumberCol source="value" />
            <DataTable.Col source="validFrom">
                <DateField source="validFrom" />
            </DataTable.Col>
            <DataTable.Col source="validUntil">
                <DateField source="validUntil" />
            </DataTable.Col>
            <DataTable.Col source="isActive">
                <BooleanField source="isActive" />
            </DataTable.Col>
            <DataTable.NumberCol source="maxUses" label="Max Uses" />
            <DataTable.Col source="planId" label="Plan">
                <ReferenceField source="planId" reference="plans">
                    <TextField source="name" />
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
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
