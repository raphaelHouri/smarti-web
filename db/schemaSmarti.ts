import { uuid, text, timestamp, integer, boolean, jsonb, pgTable, pgEnum } from "drizzle-orm/pg-core";
import { desc, relations } from "drizzle-orm";

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

export const plans = pgTable("plans", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    days: integer("days").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
    id: uuid("id").primaryKey(),
    code: text("code").notNull(),
    couponType: text("coupon_type").notNull(),
    value: integer("value").notNull(),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    isActive: boolean("is_active").notNull(),
    maxUses: integer("max_uses").notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "cascade" }).notNull(),
    organizationYearId: uuid("organization_year_id").references(() => organizationYears.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const lessonCategory = pgTable("lesson_category", {
    id: uuid("id").primaryKey(),
    categoryType: text("category_type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    imageSrc: text("image_src").notNull(),
});

export const lessons = pgTable("lessons", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    lessonCategoryId: uuid("lesson_category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    lessonOrder: integer("lesson_order").notNull(),
    isPremium: boolean("is_premium").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    uniqueCategoryOrder: {
        columns: [table.lessonCategoryId, table.lessonOrder],
        unique: true,
    }
}));
export const formatEnum = pgEnum("format", ["REGULAR", "SHAPES", "COMPREHENSION"])

export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content"),
    question: text("question").notNull(),
    format: formatEnum("format").notNull(),
    options: jsonb("options"),
    categoryId: uuid("category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    topicType: text("topic_type"),
    explanation: text("explanation"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    managedOrganization: uuid("managed_organization").array(), // You can manually reference in relations if needed
    createdAt: timestamp("created_at").defaultNow(),
    organizationYearId: uuid("organization_year_id").references(() => organizationYears.id, { onDelete: "cascade" }),
    // userSettingsId: uuid("user_settings_id"),
    lessonCategoryId: uuid("lesson_category_id").references(() => lessonCategory.id, { onDelete: "cascade" }),
    experience: integer("experience").default(0).notNull(),
    geniusScore: integer("genius_score").default(0).notNull(),
});

export const userSettings = pgTable("user_settings", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    lessonClock: boolean("lesson_clock").default(true),
    quizClock: boolean("quiz_clock").default(true),
    immediateResult: boolean("immediate_result").default(false),
    grade_class: text("grade_class"),
    gender: text("gender"),
    avatar: text("avatar").default("/zombie.svg"),
});

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    systemUntil: timestamp("system_until"),
    price: integer("price"),
    receiptId: text("receipt_id"),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at"),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "cascade" }).notNull(),
});

export const lessonQuestionGroups = pgTable("lesson_question_groups", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => lessonCategory.id, { onDelete: "cascade" }).notNull(),
    questionList: uuid("question_list").array().notNull(), // No array foreign key support
    time: integer("time").notNull(),
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
    createdAt: timestamp("created_at").defaultNow(),
});

export const userWrongQuestions = pgTable("user_wrong_questions", {
    id: uuid("id").primaryKey(),
    isNull: boolean("is_null").default(false),
    questionId: uuid("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

export const feedbacks = pgTable("feedbacks", {
    id: uuid("id").primaryKey(), // Auto-incrementing integer primary key
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    screenName: text("screen_name"), // e.g., "HomePage", "LessonScreen"
    identifier: text("identifier"), // e.g., "lesson_id_xyz", "feature_abc"
    rate: text("rate"),                              // Rating (e.g., 0-4 or 1-5)
    title: text("title"),           // Subject or title of the feedback
    description: text("description"),                   // Detailed feedback text
    createdAt: timestamp("created_at").defaultNow(), // When the feedback was submitted

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
    plan: one(plans, {
        fields: [subscriptions.planId],
        references: [plans.id],
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

export const lessonCategoryRelations = relations(lessonCategory, ({ many }) => ({
    lessons: many(lessons),
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


