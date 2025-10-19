import { DataTable, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const SubscriptionsList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="userId" label="User">
                <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="couponId" label="Coupon">
                <ReferenceField source="couponId" reference="coupons">
                    <TextField source="code" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.Col source="planId" label="Plan">
                <ReferenceField source="planId" reference="plans">
                    <TextField source="name" />
                </ReferenceField>
            </DataTable.Col>
            <DataTable.NumberCol source="price" />
            <DataTable.Col source="receiptId" label="Receipt ID" />
            <DataTable.Col source="systemUntil">
                <DateField source="systemUntil" />
            </DataTable.Col>
            <DataTable.Col source="createdAt">
                <DateField source="createdAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);
