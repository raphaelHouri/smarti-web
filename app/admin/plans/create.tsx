import {
    Create,
    NumberInput,
    SimpleForm,
    TextInput,
    BooleanInput,
    SelectInput,
    ReferenceArrayInput,
    SelectArrayInput,
} from 'react-admin';

export const PlanCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" required />
            <TextInput source="description" multiline rows={3} />
            <TextInput source="internalDescription" label="Internal Description" required multiline rows={3} />
            <SelectInput
                source="packageType"
                choices={[
                    { id: 'system', name: 'System' },
                    { id: 'book', name: 'Book' },
                ]}
                defaultValue="system"
                required
            />
            <ReferenceArrayInput source="productsIds" reference="products" label="Products">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <NumberInput source="days" required />
            <NumberInput source="price" required />
            <NumberInput source="order" defaultValue={0} />
            <BooleanInput source="isActive" defaultValue={true} />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                defaultValue={1}
                required
            />
            <TextInput
                source="displayData"
                label="Display Data (JSON)"
                multiline
                rows={5}
                helperText="Enter JSON object with icon, color, features, badge, badgeColor, addBookOption"
            />
        </SimpleForm>
    </Create>
);

