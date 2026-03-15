import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schemaSmarti";
import { sql } from "drizzle-orm";

// Validate environment variables
const sourceDatabaseUrl = process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL;
const targetDatabaseUrl = process.env.DATABASE_URL;

if (!sourceDatabaseUrl) {
    throw new Error("SOURCE_DATABASE_URL or DATABASE_URL environment variable is required");
}

if (!targetDatabaseUrl) {
    throw new Error("TARGET_DATABASE_URL environment variable is required");
}

// Create database connections
const sourceSql = neon(sourceDatabaseUrl);
const sourceDb = drizzle(sourceSql, { schema });

const targetSql = neon(targetDatabaseUrl);
const targetDb = drizzle(targetSql, { schema });

// Type for database instance
type DatabaseInstance = typeof sourceDb;

// Define table order based on foreign key dependencies
// Tables with no dependencies come first
const tableOrder: Array<keyof typeof schema> = [
    "organizationInfo",
    "systemConfig",
    "products",
    "lessonCategory",
    "organizationYears",
    "plans",
    "lessons",
    "questions",
    "users",
    "userSystemStats",
    "pushNotificationTokens",
    "appRatingLogs",
    "coupons",
    "paymentTransactions",
    "subscriptions",
    "bookPurchases",
    "userSettings",
    "lessonQuestionGroups",
    "userLessonResults",
    "userWrongQuestions",
    "feedbacks",
    "onlineLessons",
];

interface CloneStats {
    tableName: string;
    rowsCopied: number;
    success: boolean;
    error?: string;
}


function getTableName(tableName: keyof typeof schema): string {
    // Map schema export names to PostgreSQL table names
    const tableNameMap: Record<string, string> = {
        organizationInfo: "organization_info",
        organizationYears: "organization_years",
        systemConfig: "system_config",
        products: "products",
        plans: "plans",
        subscriptions: "subscriptions",
        coupons: "coupons",
        lessonCategory: "lesson_category",
        lessons: "lessons",
        questions: "questions",
        users: "users",
        userSystemStats: "user_system_stats",
        pushNotificationTokens: "push_notification_tokens",
        appRatingLogs: "app_rating_logs",
        bookPurchases: "book_purchases",
        paymentTransactions: "payment_transactions",
        userSettings: "user_settings",
        lessonQuestionGroups: "lesson_question_groups",
        userLessonResults: "user_lesson_results",
        userWrongQuestions: "user_wrong_questions",
        feedbacks: "feedbacks",
        onlineLessons: "online_lessons",
    };

    return tableNameMap[tableName] || tableName;
}

async function truncateTable(db: DatabaseInstance, pgTableName: string): Promise<void> {
    try {
        // Use TRUNCATE CASCADE to handle foreign key constraints
        await db.execute(sql.raw(`TRUNCATE TABLE "${pgTableName}" CASCADE`));
        console.log(`  ✓ Truncated ${pgTableName}`);
    } catch (error) {
        console.warn(`  ⚠️  Could not truncate ${pgTableName}: ${error}`);
        // Try DELETE as fallback
        try {
            await db.execute(sql.raw(`DELETE FROM "${pgTableName}"`));
            console.log(`  ✓ Deleted all rows from ${pgTableName}`);
        } catch (deleteError) {
            console.error(`  ✗ Failed to clear ${pgTableName}: ${deleteError}`);
            throw deleteError;
        }
    }
}

async function copyTableData(
    sourceDbInstance: DatabaseInstance,
    targetDbInstance: DatabaseInstance,
    tableName: keyof typeof schema
): Promise<number> {
    const table = schema[tableName];

    if (!table) {
        throw new Error(`Table ${String(tableName)} not found in schema`);
    }

    // Fetch all data from source
    const sourceData = await sourceDbInstance.select().from(table as any);

    if (sourceData.length === 0) {
        console.log(`  ℹ️  No data to copy from ${String(tableName)}`);
        return 0;
    }

    // Insert data into target
    // For a full clone, we truncate first, so duplicates shouldn't occur
    await targetDbInstance.insert(table as any).values(sourceData as any);

    return sourceData.length;
}

async function cloneDatabase(dryRun: boolean = false): Promise<CloneStats[]> {
    const stats: CloneStats[] = [];

    console.log("🚀 Starting database clone operation");
    console.log(`📊 Source: ${sourceDatabaseUrl!.substring(0, 40)}...`);
    console.log(`📊 Target: ${targetDatabaseUrl!.substring(0, 40)}...`);
    console.log(`🔍 Mode: ${dryRun ? "DRY RUN (no changes will be made)" : "LIVE"}\n`);

    if (dryRun) {
        console.log("ℹ️  DRY RUN mode - no data will be copied\n");
    }

    try {
        // Verify connections
        console.log("🔌 Verifying database connections...");
        await sourceDb.execute(sql`SELECT 1`);
        await targetDb.execute(sql`SELECT 1`);
        console.log("✓ Both database connections verified\n");

        // Process each table in dependency order
        for (const tableName of tableOrder) {
            const pgTableName = getTableName(tableName);
            const statsEntry: CloneStats = {
                tableName: String(tableName),
                rowsCopied: 0,
                success: false,
            };

            try {
                console.log(`📋 Processing table: ${tableName} (${pgTableName})`);

                if (!dryRun) {
                    // Truncate target table first
                    await truncateTable(targetDb, pgTableName);
                }

                // Copy data
                const rowCount = await copyTableData(sourceDb, targetDb, tableName);

                statsEntry.rowsCopied = rowCount;
                statsEntry.success = true;

                console.log(`  ✓ Copied ${rowCount} rows from ${tableName}\n`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                statsEntry.error = errorMessage;
                console.error(`  ✗ Error copying ${tableName}: ${errorMessage}\n`);
            }

            stats.push(statsEntry);
        }

        // Print summary
        console.log("\n" + "=".repeat(60));
        console.log("📊 CLONE SUMMARY");
        console.log("=".repeat(60));

        const successful = stats.filter(s => s.success);
        const failed = stats.filter(s => !s.success);
        const totalRows = stats.reduce((sum, s) => sum + s.rowsCopied, 0);

        console.log(`✅ Successful: ${successful.length}/${stats.length} tables`);
        console.log(`❌ Failed: ${failed.length}/${stats.length} tables`);
        console.log(`📦 Total rows copied: ${totalRows.toLocaleString()}`);

        if (failed.length > 0) {
            console.log("\n❌ Failed tables:");
            failed.forEach(s => {
                console.log(`  - ${s.tableName}: ${s.error}`);
            });
        }

        console.log("\n" + "=".repeat(60));

        return stats;
    } catch (error) {
        console.error("\n💥 Fatal error during clone operation:");
        console.error(error);
        throw error;
    }
}

// Main execution
const main = async () => {
    try {
        const dryRun = process.argv.includes("--dry-run");
        await cloneDatabase(dryRun);
        console.log("\n✅ Clone operation completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Clone operation failed:");
        console.error(error);
        process.exit(1);
    }
};

main();

