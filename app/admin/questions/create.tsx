import * as React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    NumberInput,
    useDataProvider,
    useNotify,
    useRedirect,
    Button,
    CreateProps,
    RaRecord,
    Identifier,
} from 'react-admin';
import { FieldValues } from 'react-hook-form';

// Define the shape of a single Question RaRecord 
interface Question extends RaRecord {
    id: Identifier;
    content?: string;
    question: string;
    format?: 'text' | 'number' | 'image' | 'boolean';
    options?: {
        a?: string;
        b?: string;
        c?: string;
        d?: string;
    };
    categoryId: string;
    topicType?: string;
    explanation?: string;
    managerId: string;
    createdAt?: string;
}

// Define the shape of LessonCategory for ReferenceInput
interface LessonCategory extends RaRecord {
    id: string;
    categoryType: string;
    title: string;
    description: string;
    imageSrc: string;
    createdAt?: string;
}

// Define a custom DataProvider interface.
// For this scenario, we primarily care about `create` for the single form submission.
// `createMany` is now handled by the backend API.
interface IMyDataProvider {
    getList<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T[]; total: number; }>;
    getOne<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T; }>;
    getMany<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T[]; }>;
    getManyReference<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T[]; total: number; }>;
    update<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T; }>;
    updateMany<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T[]; }>;
    create<T extends RaRecord = RaRecord>(resource: string, params: { data: Partial<T>; }): Promise<{ data: T; }>;
    delete<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T; }>;
    deleteMany<T extends RaRecord = RaRecord>(resource: string, params: any): Promise<{ data: T[]; }>;
    // createMany is no longer directly used by the client for file import
}

export const QuestionCreate = (props: CreateProps) => {
    const dataProvider = useDataProvider() as IMyDataProvider;
    const notify = useNotify();
    const redirect = useRedirect();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            notify('No file selected.', { type: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Assuming your Next.js API route for import is at /api/questions/import
            const response = await fetch('/api/questions/import', {
                method: 'POST',
                body: formData,
                // No 'Content-Type' header needed for FormData; fetch sets it automatically
            });

            const result = await response.json();

            if (response.ok) {
                notify(result.message || 'File imported successfully!', { type: 'success' });
                redirect('list', 'questions');
            } else {
                notify(`Error importing file: ${result.message || 'An unknown error occurred'}`, { type: 'error' });
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            notify(`Network or server error: ${error.message || 'Could not connect to the server.'}`, { type: 'error' });
        } finally {
            // Clear the file input after upload attempt
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/questions_template.xlsx'; // Replace with the actual path to your template file
        link.download = 'questions_template.xlsx';
        link.click();
    };

    const handleSubmit = async (values: FieldValues) => {
        try {
            await dataProvider.create<Question>('questions', { data: values as Question });
            notify('Question created successfully!', { type: 'success' });
            redirect('list', 'questions');
        } catch (error: unknown) {
            notify(`Error creating question: ${(error as Error).message}`, { type: 'error' });
        }
    };

    return (
        <Create {...props}>
            <SimpleForm onSubmit={handleSubmit}>
                <TextInput source="content" />
                <TextInput source="question" required />
                <SelectInput
                    source="format"
                    choices={[
                        { id: 'text', name: 'Text' },
                        { id: 'number', name: 'Number' },
                    ]}
                />
                <TextInput source="options.a" label="Option A" />
                <TextInput source="options.b" label="Option B" />
                <TextInput source="options.c" label="Option C" />
                <TextInput source="options.d" label="Option D" />
                <ReferenceInput source="categoryId" reference="lessonCategory" label="Category">
                    <SelectInput optionText="categoryType" />
                </ReferenceInput>
                <TextInput source="topicType" />
                <TextInput source="explanation" />
                <TextInput source="managerId" required label="Manager ID" />
                <NumberInput
                    source="systemStep"
                    label="System Step"
                    min={1}
                    max={3}
                    required
                />

                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p>Or import multiple questions from an Excel file:</p>
                    <Button
                        onClick={handleButtonClick}
                        label="Import Questions from Excel"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".xlsx" // Restrict to Excel files only
                    />
                    <Button
                        onClick={handleDownloadTemplate}
                        label="Download Template"
                        style={{ marginLeft: '10px' }}
                    />
                </div>
            </SimpleForm>
        </Create>
    );
};