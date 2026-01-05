#!/usr/bin/env tsx

/**
 * Test script for /api/book/convert endpoint
 * 
 * Usage:
 *   npm run test:book-convert
 *   or
 *   tsx ./scripts/test-book-convert.ts
 */

import 'dotenv/config';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ENDPOINT = `${APP_URL}/api/book/convert`;

// Fake test data
const testData = {
    vat_id: '123456789',
    email: 'test@example.com',
    StudentName: 'יוסי כהן',
    productType: 'bookStep2', // Optional: bookStep1, bookStep2, bookStep3
    userId: 'user_test123', // Optional
};

async function testBookConvert() {
    console.log('🧪 Testing /api/book/convert endpoint...\n');
    console.log('📝 Test data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n📤 Sending request to:', ENDPOINT);

    try {
        const formData = new URLSearchParams();
        formData.append('vat_id', testData.vat_id);
        formData.append('email', testData.email);
        formData.append('StudentName', testData.StudentName);

        if (testData.productType) {
            formData.append('productType', testData.productType);
        }

        if (testData.userId) {
            formData.append('userId', testData.userId);
        }

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const status = response.status;
        const result = await response.json();

        console.log('\n📥 Response Status:', status);
        console.log('📦 Response Body:');
        console.log(JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('\n✅ Request succeeded!');
        } else {
            console.log('\n❌ Request failed!');
            process.exit(1);
        }
    } catch (error: any) {
        console.error('\n💥 Error occurred:');
        console.error(error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
        process.exit(1);
    }
}

// Run the test
testBookConvert();

