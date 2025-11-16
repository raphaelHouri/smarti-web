// app/api/book/convert/route.ts
// export const runtime = "nodejs";
import { NextResponse } from 'next/server';
import axios from 'axios';

import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import QRCode from "qrcode";
import { getFileName } from '@/lib/book_utils';
import { auth } from '@clerk/nextjs/server';

// Get template path based on productType, default to template.docx if productType is null/undefined
const getTemplatePath = (productType: string | null | undefined): string => {
    if (!productType) {
        return path.resolve(path.join(process.cwd(), "public", "template.docx"));
    }
    const validProductTypes = ["bookStep1", "bookStep2", "bookStep3"];
    if (validProductTypes.includes(productType)) {
        return path.resolve(path.join(process.cwd(), "public", `template_${productType}.docx`));
    }
    // Fallback to default template if productType is invalid
    return path.resolve(path.join(process.cwd(), "public", "template.docx"));
};

const getZipCachePath = (productType: string | null | undefined): string => {
    if (!productType) {
        return path.resolve(path.join(process.cwd(), "public", "template.zip"));
    }
    const validProductTypes = ["bookStep1", "bookStep2", "bookStep3"];
    if (validProductTypes.includes(productType)) {
        return path.resolve(path.join(process.cwd(), "public", `template_${productType}.zip`));
    }
    // Fallback to default template if productType is invalid
    return path.resolve(path.join(process.cwd(), "public", "template.zip"));
};

const readTemplate = async (templatePath: string, zipCachePath: string): Promise<Buffer> => {
    if (fs.existsSync(zipCachePath)) {
        console.log("Using cached ZIP file...");
        return fs.readFileSync(zipCachePath);
    }
    console.log("Reading and zipping the DOCX template...");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const buf = zip.generate({ type: "nodebuffer" });
    fs.writeFileSync(zipCachePath, buf);
    return buf;
};

const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
    console.log("Generating QR Code...");
    return QRCode.toBuffer(data);
};

async function generate(StudentName?: string, vat_id?: string, productType?: string | null): Promise<Buffer | void> {

    const imageModule = new ImageModule({
        centered: false,
        getImage: (tagValue: Buffer) => tagValue,
        getSize: () => [150, 150],
    });
    try {
        console.log("Starting document generation...");
        const templatePath = getTemplatePath(productType);
        const zipCachePath = getZipCachePath(productType);
        const zipContent = await readTemplate(templatePath, zipCachePath);
        const zip = new PizZip(zipContent);
        const qrCodeBuffer = await generateQRCodeBuffer(`https://chat.whatsapp.com/DysJXGAm6OJIBV1KvwVcDw?id=kdskl?vat_id=${vat_id}`);

        const doc = new Docxtemplater(zip, { modules: [imageModule] });

        const now = new Date();
        let yearString: string;
        if (now.getMonth() >= 0 && now.getMonth() < 5) {
            yearString = `${now.getFullYear() - 1} - ${now.getFullYear()}`;
        } else {
            yearString = `${now.getFullYear()} - ${now.getFullYear() + 1}`;
        }

        console.log("Rendering document with data...");
        await doc.renderAsync({
            UserFullNameXXXX: StudentName || "רפאל חורי",
            YEARXXXX: yearString,
            URLXXXX: "https://supergifted.co.il/book",
            image: qrCodeBuffer
        });

        console.log("Building DOCX buffer...");
        const docxBuf = doc.getZip().generate({ type: "nodebuffer" });
        console.log("Document generation completed.");
        return docxBuf;
    } catch (error: any) {
        console.error("❌ Error occurred while generating document:", error.message);
    }
}

// Helper to wait for a specific duration
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {


    // Read the request body as text
    const bodyText = await req.text();

    // Parse the URL-encoded string
    const params = new URLSearchParams(bodyText);

    // Get the individual data fields
    const vat_id = params.get("vat_id");
    const email = params.get("email");
    const StudentName = params.get("StudentName");
    const productType = params.get("productType");
    const userId = params.get("userId");
    if (!vat_id || !email || !StudentName) {
        console.warn("Missing required fields in the request.");
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    console.log("Validating server configuration...");
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    const gcsProjectId = process.env.GCS_PROJECT_ID;
    const gcsBucket = process.env.GCS_BUCKET_NAME;
    const gcsClientEmail = process.env.GCS_CLIENT_EMAIL;
    const gcsPrivateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!apiKey || !gcsProjectId || !gcsBucket || !gcsClientEmail || !gcsPrivateKey) {
        console.error("Server configuration error: One or more required environment variables are missing.");
        return NextResponse.json(
            { error: "Server configuration error. Please check environment variables." },
            { status: 500 }
        );
    }

    try {
        console.log("Generating document...");
        const generatedBuffer = await generate(StudentName, vat_id, productType);

        if (process.env.NEXT_ENV === "development") {
            console.log("Development mode: Skipping CloudConvert and saving file locally.");
            return NextResponse.json({
                message: 'File generated successfully in development mode',
            });
        }

        if (!generatedBuffer) {
            throw new Error("Failed to generate document buffer.");
        }

        console.log("Preparing CloudConvert job payload...");
        const jobPayload = {
            tasks: {
                'import-file': {
                    operation: 'import/upload',
                },
                'convert-to-pdf': {
                    operation: 'convert',
                    input: 'import-file',
                    output_format: 'pdf',
                    engine: 'office',
                },
                'encrypt-pdf': {
                    operation: 'pdf/encrypt',
                    input: 'convert-to-pdf',
                    set_password: vat_id || 'password123',
                    set_owner_password: 'super-secret-owner-password',
                    allow_print: 'full',
                    allow_modify: 'none',
                    allow_extract: false,
                    allow_accessibility: true,
                },
                'export-to-gcs': {
                    operation: 'export/google-cloud-storage',
                    input: 'encrypt-pdf',
                    project_id: gcsProjectId,
                    bucket: gcsBucket,
                    client_email: gcsClientEmail,
                    private_key: gcsPrivateKey,
                },
            },
            tag: 'pdf-encryption-gcs-job',
        };

        console.log("Creating CloudConvert job...");
        const jobResponse = await axios.post('https://api.cloudconvert.com/v2/jobs', jobPayload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const job = jobResponse.data.data;
        console.log("Job created successfully:", job.id);

        const uploadTask = job.tasks.find((task: any) => task.name === 'import-file');
        const uploadUrl = uploadTask.result.form.url;
        const formParams = uploadTask.result.form.parameters;

        console.log("Uploading file to CloudConvert...");
        const uploadFormData = new FormData();
        for (const key in formParams) {
            uploadFormData.append(key, formParams[key]);
        }

        const fileBlob = new Blob([generatedBuffer as BlobPart], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const fileName = getFileName(productType ? (userId || "") : vat_id, productType ?? "");
        uploadFormData.append('file', fileBlob, `${fileName}.docx`);

        await axios.post(uploadUrl, uploadFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Polling for job completion...");
        let currentJobStatus;
        const maxAttempts = 40;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await wait(1500);
            const statusResponse = await axios.get(`https://api.cloudconvert.com/v2/jobs/${job.id}`, {
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            currentJobStatus = statusResponse.data.data;
            console.log(`Job status: ${currentJobStatus.status}`);
            if (currentJobStatus.status === 'finished') break;
            if (currentJobStatus.status === 'error') {
                throw new Error(`Job failed with status: error. Reason: ${currentJobStatus.tasks.find((t: any) => t.status === 'error')?.message}`);
            }
        }

        if (currentJobStatus.status !== 'finished') {
            throw new Error(`Job failed or timed out. Final status: ${currentJobStatus.status}`);
        }

        console.log("Job completed successfully.");
        const exportTask = currentJobStatus.tasks.find((task: any) => task.name === 'export-to-gcs');
        const uploadedFile = exportTask?.result?.files[0];

        if (!uploadedFile) {
            throw new Error('Could not retrieve uploaded file details from the GCS export task.');
        }

        console.log("File successfully uploaded to Google Cloud Storage.");
        return NextResponse.json({
            message: 'File successfully converted, encrypted, and uploaded to Google Cloud Storage.',
            bucket: gcsBucket,
            filename: uploadedFile.filename,
            size: uploadedFile.size,
        });

    } catch (error: any) {
        console.error('Error during file processing:', error.response ? error.response.data : error.message);
        return NextResponse.json(
            { error: 'An error occurred during the file conversion process.' },
            { status: 500 }
        );
    }
}
