import "dotenv/config";
import { createClerkClient } from "@clerk/backend";




// Create Clerk clients for both environments
const clerkDev = createClerkClient({ secretKey: "" });
const clerkProd = createClerkClient({ secretKey: "" });

interface CopyStats {
    usersCopied: number;
    usersSkipped: number;
    usersFailed: number;
    emailsCopied: number;
    emailsSkipped: number;
}

async function copyUsersFromClerkDevToProd(dryRun: boolean = false): Promise<CopyStats> {
    const stats: CopyStats = {
        usersCopied: 0,
        usersSkipped: 0,
        usersFailed: 0,
        emailsCopied: 0,
        emailsSkipped: 0,
    };

    try {
        console.log(`\n${dryRun ? "🔍 DRY RUN MODE - No changes will be made" : "🚀 PRODUCTION MODE - Changes will be applied"}\n`);

        // Fetch all users from Clerk development
        console.log("📥 Fetching users from Clerk development...");
        let allDevUsers: any[] = [];
        let offset = 0;
        const limit = 500; // Clerk's max limit per request

        // Paginate through all Clerk development users
        while (true) {
            const response = await clerkDev.users.getUserList({
                limit,
                offset,
            });

            allDevUsers = allDevUsers.concat(response.data);

            // Check if there are more users to fetch
            if (response.data.length < limit) {
                break;
            }

            offset += limit;
            console.log(`   Fetched ${allDevUsers.length} users so far...`);
        }

        console.log(`Found ${allDevUsers.length} users in Clerk development\n`);

        if (allDevUsers.length === 0) {
            console.log("No users to copy.");
            return stats;
        }

        // Get all production users to check for existing emails
        console.log("📥 Fetching existing users from Clerk production...");
        const prodUsersMap = new Map<string, any>();
        offset = 0;

        while (true) {
            const response = await clerkProd.users.getUserList({
                limit,
                offset,
            });

            for (const user of response.data) {
                // Map by email addresses for quick lookup
                user.emailAddresses?.forEach((email: any) => {
                    prodUsersMap.set(email.emailAddress.toLowerCase(), user);
                });
            }

            if (response.data.length < limit) {
                break;
            }

            offset += limit;
        }

        console.log(`Found ${prodUsersMap.size} unique emails in Clerk production\n`);

        // Process each development user
        for (const devUser of allDevUsers) {
            try {
                const primaryEmail = devUser.emailAddresses?.find(
                    (e: any) => e.id === devUser.primaryEmailAddressId
                )?.emailAddress;

                if (!primaryEmail) {
                    console.log(`⚠️  Skipping user ${devUser.id} - no primary email address found`);
                    stats.usersSkipped++;
                    continue;
                }

                // Check if user already exists in production by email
                const existingProdUser = prodUsersMap.get(primaryEmail.toLowerCase());

                if (existingProdUser) {
                    console.log(`⏭️  Skipping user ${devUser.id} (${primaryEmail}) - already exists in production as ${existingProdUser.id}`);
                    stats.usersSkipped++;
                    continue;
                }

                if (dryRun) {
                    console.log(`✅ [DRY RUN] Would copy user ${devUser.id} (${primaryEmail})`);
                    stats.usersCopied++;
                } else {
                    try {
                        // Create user in production - build payload with only defined values
                        const createUserData: any = {
                            emailAddress: [primaryEmail],
                            skipPasswordChecks: true,
                            skipPasswordRequirement: true,
                        };

                        // Add name fields only if they exist
                        if (devUser.firstName) {
                            createUserData.firstName = devUser.firstName;
                        }
                        if (devUser.lastName) {
                            createUserData.lastName = devUser.lastName;
                        }
                        if (devUser.username) {
                            createUserData.username = devUser.username;
                        }

                        // Add additional email addresses if they exist
                        const additionalEmails = devUser.emailAddresses
                            ?.filter((e: any) => e.id !== devUser.primaryEmailAddressId && e.emailAddress)
                            .map((e: any) => e.emailAddress);

                        if (additionalEmails && additionalEmails.length > 0) {
                            createUserData.emailAddress = [primaryEmail, ...additionalEmails];
                        }

                        // Add phone numbers if they exist
                        if (devUser.phoneNumbers && devUser.phoneNumbers.length > 0) {
                            const primaryPhone = devUser.phoneNumbers.find(
                                (p: any) => p.id === devUser.primaryPhoneNumberId
                            ) || devUser.phoneNumbers[0];

                            if (primaryPhone?.phoneNumber) {
                                createUserData.phoneNumber = primaryPhone.phoneNumber;
                            }
                        }

                        // Add metadata only if they exist and are not empty
                        if (devUser.publicMetadata && Object.keys(devUser.publicMetadata).length > 0) {
                            createUserData.publicMetadata = devUser.publicMetadata;
                        }
                        if (devUser.privateMetadata && Object.keys(devUser.privateMetadata).length > 0) {
                            createUserData.privateMetadata = devUser.privateMetadata;
                        }
                        if (devUser.unsafeMetadata && Object.keys(devUser.unsafeMetadata).length > 0) {
                            createUserData.unsafeMetadata = devUser.unsafeMetadata;
                        }

                        const prodUser = await clerkProd.users.createUser(createUserData);

                        console.log(`✅ Copied user ${devUser.id} (${primaryEmail}) -> ${prodUser.id}`);
                        stats.usersCopied++;

                        // Copy email addresses count
                        if (createUserData.emailAddress) {
                            stats.emailsCopied += createUserData.emailAddress.length;
                        }
                    } catch (error: any) {
                        // Log full error details for debugging
                        const errorDetails = error?.errors?.[0] || error?.message || JSON.stringify(error);
                        console.error(`❌ Failed to copy user ${devUser.id} (${primaryEmail}):`, errorDetails);

                        // Check if error is due to duplicate email
                        if (error?.errors?.[0]?.code === "form_identifier_exists" ||
                            error?.message?.includes("already exists") ||
                            error?.message?.includes("identifier")) {
                            stats.usersSkipped++;
                            stats.emailsSkipped++;
                        } else {
                            stats.usersFailed++;
                        }
                    }
                }
            } catch (error: any) {
                console.error(`❌ Failed to process user ${devUser.id}:`, error?.message || error);
                stats.usersFailed++;
            }
        }

        return stats;
    } catch (error: any) {
        console.error("Fatal error during copy operation:", error?.message || error);
        throw error;
    }
}

async function main() {
    try {
        // Check for dry-run flag
        const dryRun = process.argv.includes("--dry-run") || process.argv.includes("-d");

        console.log("=".repeat(60));
        console.log("Copy Users from Clerk Development to Production");
        console.log("=".repeat(60));

        if (!dryRun) {
            console.log("\n⚠️  WARNING: This will create users in PRODUCTION Clerk!");
            console.log("   Use --dry-run flag to preview changes without applying them.\n");
        }

        const stats = await copyUsersFromClerkDevToProd(dryRun);

        // Print summary
        console.log("\n" + "=".repeat(60));
        console.log("Copy Summary");
        console.log("=".repeat(60));
        console.log(`Users copied:   ${stats.usersCopied}`);
        console.log(`Users skipped:  ${stats.usersSkipped}`);
        console.log(`Users failed:   ${stats.usersFailed}`);
        console.log(`Emails copied:  ${stats.emailsCopied}`);
        console.log(`Emails skipped: ${stats.emailsSkipped}`);
        console.log("=".repeat(60));

        if (stats.usersFailed > 0) {
            console.log("\n⚠️  Some operations failed. Please review the errors above.");
            process.exit(1);
        } else {
            console.log("\n✅ Copy operation completed successfully!");
        }
    } catch (error: any) {
        console.error("\n❌ Fatal error:", error?.message || error);
        process.exit(1);
    }
}

main();

