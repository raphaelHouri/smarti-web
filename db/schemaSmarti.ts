import { uuid, text, timestamp, integer, boolean, jsonb, pgTable, pgEnum } from "drizzle-orm/pg-core";
import { desc, relations, sql } from "drizzle-orm";

// Declare tables used in references FIRST
export const organizationInfo = pgTable("organization_info", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    contactEmail: text("contact_email"),
    address: text("address"),
    city: text("city"),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const organizationYears = pgTable("organization_years", {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizationInfo.id, { onDelete: "cascade" }).notNull(),
    year: integer("year").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});


const productTypeValues = ["all", "system1", "bookStep1", "bookStep2", "bookStep3"] as const
export type ProductType = typeof productTypeValues[number]
export const productTypeEnum = pgEnum("productType", productTypeValues)

export const packageTypeEnum = pgEnum("packageType", ["system", "book"])
export const couponTypeEnum = pgEnum("couponType", ["percentage", "fixed"])

export const products = pgTable("products", {
    id: uuid("id").primaryKey(),
    packageType: packageTypeEnum("packageType").default("system").notNull(),
    productType: productTypeEnum("productType").default("system1").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    displayData: jsonb("display_data"),
});

export const plans = pgTable("plans", {
    id: uuid("id").primaryKey(),
    packageType: packageTypeEnum("packageType").default("system").notNull(),
    productsIds: uuid("products_ids").array().default([]),
    name: text("name").notNull(),
    description: text("description"),
    days: integer("days").notNull(),
    price: integer("price").notNull(),
    displayData: jsonb("display_data"),
    internalDescription: text("internal_description").notNull(),
    order: integer("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    // icon: text("icon"), // Store icon name/key
    // color: text("color"),
    // badge: text("badge"),
    // badgeColor: text("badge_color"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "cascade" }),
    paymentTransactionId: uuid("payment_transaction_id").references(() => paymentTransactions.id, { onDelete: "cascade" }),
    systemUntil: timestamp("system_until"),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at"),
});

export const coupons = pgTable("coupons", {
    id: uuid("id").primaryKey(),
    code: text("code").notNull(),
    type: couponTypeEnum("type").default("percentage").notNull(),
    value: integer("value").notNull(),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    isActive: boolean("is_active").notNull(),
    maxUses: integer("max_uses").notNull(),
    uses: integer("uses").default(0).notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "cascade" }).notNull(),
    organizationYearId: uuid("organization_year_id").references(() => organizationYears.id, { onDelete: "set null" }),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const lessonCategory = pgTable("lesson_category", {
    id: uuid("id").primaryKey(),
    categoryType: text("category_type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    imageSrc: text("image_src").notNull(),
});

export const lessons = pgTable("lessons", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    lessonCategoryId: uuid("lesson_category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    lessonOrder: integer("lesson_order").notNull(),
    isPremium: boolean("is_premium").default(true).notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    uniqueCategoryOrder: {
        columns: [table.lessonCategoryId, table.lessonOrder],
        unique: true,
    }
}));
export const formatEnum = pgEnum("format", ["REGULAR", "SHAPES", "COMPREHENSION", "MATH"])

// Avatar enum options
export const avatarEnum = pgEnum("avatar", [
    "/smarti_avatar.png",
    "/boy_avatar.png",
    "/girl_avatar.png",
    "/dragon_avatar.png",
])

export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content"),
    question: text("question").notNull(),
    format: formatEnum("format").notNull(),
    options: jsonb("options"),
    categoryId: uuid("category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    topicType: text("topic_type"),
    explanation: text("explanation"),
    managerId: text("manager_id").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    // Arrays cannot have FK constraints in Postgres; enforce in application code
    managedOrganization: uuid("managed_organization").array(), // You can manually reference in relations if needed
    createdAt: timestamp("created_at").defaultNow(),
    organizationYearId: uuid("organization_year_id").references(() => organizationYears.id, { onDelete: "cascade" }),
    // userSettingsId: uuid("user_settings_id"),
    lessonCategoryId: uuid("lesson_category_id").references(() => lessonCategory.id, { onDelete: "cascade" }),
    experience: integer("experience").default(0).notNull(),
    geniusScore: integer("genius_score").default(0).notNull(),
    savedCouponId: uuid("saved_coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    systemStep: integer("system_step").default(1).notNull(),
});

export const userSystemStats = pgTable("user_system_stats", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    systemStep: integer("system_step").notNull(),
    experience: integer("experience").default(0).notNull(),
    geniusScore: integer("genius_score").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userStepUnique: {
        columns: [table.userId, table.systemStep],
        unique: true,
    },
}));

export const bookPurchases = pgTable("book_purchases", {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentTransactionId: uuid("paymentTransactionsId").references(() => paymentTransactions.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    studentName: text("student_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    filename: text("filename").notNull(),
    gcsBucket: text("gcs_bucket").notNull(),
    generated: boolean("generated").default(false).notNull(),
    vatId: text("vat_id").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});


export const paymentStatusEnum = pgEnum("payment_status", [
    "created",
    "paid",
    "bookCreated",
    "icount",
    "fulfilled",
    "failed",
    "cancelled",
]);
export type PaymentStatus = typeof paymentStatusEnum.enumValues[number];

export const paymentTransactions = pgTable("payment_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }).notNull(),
    status: paymentStatusEnum("status").default("created").notNull(),
    studentName: text("studentName"),
    email: text("email"),
    phone: text("phone"),
    vatId: text("vat_id"),
    receiptId: text("receipt_id"),
    totalPrice: integer("total_price").notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    bookIncluded: boolean("book_included").default(false).notNull(),
    systemStep: integer("system_step").default(1).notNull(),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});


export const paymentTransactionRelations = relations(paymentTransactions, ({ one, many }) => ({
    user: one(users, {
        fields: [paymentTransactions.userId],
        references: [users.id],
    }),
    plan: one(plans, {
        fields: [paymentTransactions.planId],
        references: [plans.id],
    }),
    coupon: one(coupons, {
        fields: [paymentTransactions.couponId],
        references: [coupons.id],
    }),
    bookPurchases: many(bookPurchases),
}));


export const userSettings = pgTable("user_settings", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    lessonClock: boolean("lesson_clock").default(true),
    quizClock: boolean("quiz_clock").default(true),
    immediateResult: boolean("immediate_result").default(false),
    grade_class: text("grade_class"),
    gender: text("gender"),
    avatar: avatarEnum("avatar").default("/smarti_avatar.png"),
    systemStep: integer("system_step").default(1).notNull(),
});



export const lessonQuestionGroups = pgTable("lesson_question_groups", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    // Arrays cannot have FK constraints in Postgres; enforce in application code
    questionList: uuid("question_list").array().notNull(), // No array foreign key support
    time: integer("time").notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userLessonResults = pgTable("user_lesson_results", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at").defaultNow(),
    answers: jsonb("answers").notNull(), // Store answers as JSONB
    rightQuestions: integer("right_questions").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const userWrongQuestions = pgTable("user_wrong_questions", {
    id: uuid("id").primaryKey(),
    isNull: boolean("is_null").default(false),
    questionId: uuid("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    systemStep: integer("system_step").default(1).notNull(),
});

export const feedbacks = pgTable("feedbacks", {
    id: uuid("id").primaryKey(), // Auto-incrementing integer primary key
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    screenName: text("screen_name"), // e.g., "HomePage", "LessonScreen"
    identifier: text("identifier"), // e.g., "lesson_id_xyz", "feature_abc"
    rate: text("rate"),                              // Rating (e.g., 0-4 or 1-5)
    title: text("title"),           // Subject or title of the feedback
    description: text("description"),                   // Detailed feedback text
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(), // When the feedback was submitted

});

// Online lessons
export const onlineLessons = pgTable("online_lessons", {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    topicType: text("topic_type"), // group name
    title: text("title").notNull(),
    description: text("description"),
    link: text("link").notNull(),
    order: integer("order").default(0).notNull(),
    systemStep: integer("system_step").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});



// === RELATIONS ===

export const userRelations = relations(users, ({ one, many }) => ({
    settings: one(userSettings, {
        fields: [users.id],
        references: [userSettings.userId],
    }),
    lessonCategory: one(lessonCategory, {
        fields: [users.lessonCategoryId],
        references: [lessonCategory.id],
    }),
    subscriptions: many(subscriptions),
    lessonResults: many(userLessonResults),
    wrongQuestions: many(userWrongQuestions),
    systemStats: many(userSystemStats),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id],
    })
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    coupon: one(coupons, {
        fields: [subscriptions.couponId],
        references: [coupons.id],
    }),
    product: one(products, {
        fields: [subscriptions.productId],
        references: [products.id],
    }),
}));

export const couponRelations = relations(coupons, ({ one }) => ({
    plan: one(plans, {
        fields: [coupons.planId],
        references: [plans.id],
    }),
    organizationYear: one(organizationYears, {
        fields: [coupons.organizationYearId],
        references: [organizationYears.id],
    })
}));

export const planRelations = relations(plans, ({ many }) => ({
    subscriptions: many(subscriptions),
    coupons: many(coupons),
}));

export const lessonCategoryRelations = relations(lessonCategory, ({ many }) => ({
    lessons: many(lessons),
    onlineLessons: many(onlineLessons),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
    category: one(lessonCategory, {
        fields: [lessons.lessonCategoryId],
        references: [lessonCategory.id],
    }),
    questionGroups: many(lessonQuestionGroups),
    lessonResults: many(userLessonResults),
}));

export const lessonQuestionGroupRelations = relations(lessonQuestionGroups, ({ one }) => ({
    lesson: one(lessons, {
        fields: [lessonQuestionGroups.lessonId],
        references: [lessons.id],
    }),
    category: one(lessonCategory, {
        fields: [lessonQuestionGroups.categoryId],
        references: [lessonCategory.id],
    }),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
    wrongQuestions: many(userWrongQuestions),
    category: one(lessonCategory, { // 👈 added
        fields: [questions.categoryId],
        references: [lessonCategory.id],
    }),
}));

export const onlineLessonRelations = relations(onlineLessons, ({ one }) => ({
    category: one(lessonCategory, {
        fields: [onlineLessons.categoryId],
        references: [lessonCategory.id],
    }),
}));

export const userLessonResultRelations = relations(userLessonResults, ({ one }) => ({
    user: one(users, {
        fields: [userLessonResults.userId],
        references: [users.id],
    }),
    lesson: one(lessons, {
        fields: [userLessonResults.lessonId],
        references: [lessons.id],
    })
}));

export const organizationYearRelations = relations(organizationYears, ({ one, many }) => ({
    organization: one(organizationInfo, {
        fields: [organizationYears.organizationId],
        references: [organizationInfo.id],
    }),
    coupons: many(coupons),
}));

export const organizationInfoRelations = relations(organizationInfo, ({ many }) => ({
    organizationYears: many(organizationYears),
}));

export const userWrongQuestionRelations = relations(userWrongQuestions, ({ one }) => ({
    question: one(questions, {
        fields: [userWrongQuestions.questionId],
        references: [questions.id],
    }),
    user: one(users, {
        fields: [userWrongQuestions.userId],
        references: [users.id],
    })
}));

export const userSystemStatsRelations = relations(userSystemStats, ({ one }) => ({
    user: one(users, {
        fields: [userSystemStats.userId],
        references: [users.id],
    }),
}));


