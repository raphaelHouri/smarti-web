import { relations } from "drizzle-orm";
import { uuid, text, timestamp, integer, boolean, jsonb, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    managedOrganization: uuid("managed_organization").array(),
    createdAt: timestamp("created_at").notNull(),
    organizationYearId: uuid("organization_year_id"),
    userSettingsId: uuid("user_settings_id"),
    experience: integer("experience"),
    geniuesScore: integer("geniues_score"),
});

export const userSettings = pgTable("user_settings", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lessonClock: integer("lesson_clock"),
    quizClock: integer("quiz_clock"),
    grade: text("grade"),
    gender: text("gender"),
    avatar: text("avatar"),
});

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    systemUntil: timestamp("system_until"),
    price: integer("price"),
    recipientId: text("recepent_id"),
    couponId: uuid("coupon_id"),
    createdAt: timestamp("created_at"),
    planId: uuid("plan_id"),
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
    planId: uuid("plan_id").notNull(),
    organizationYearId: uuid("organization_year_id").notNull(),
    createdAt: timestamp("created_at").notNull(),
});

export const plans = pgTable("plans", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    days: integer("days").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").notNull(),
});

export const lessonCategory = pgTable("lesson_category", {
    id: uuid("id").primaryKey(),
    categoryType: text("category_type").notNull(),
    createdAt: timestamp("created_at").notNull(),
});

export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey(),
    lessonCategoryId: uuid("lesson_category_id").notNull(),
    lessonOrder: integer("lesson_order"),
    createdAt: timestamp("created_at").notNull(),
});

export const lessonQuestionGroups = pgTable("lesson_question_groups", {
    id: uuid("id").primaryKey(),
    lessonId: uuid("lesson_id").notNull(),
    category: text("category"),
    questionList: uuid("question_list").array(),
    time: integer("time"),
    createdAt: timestamp("created_at").notNull(),
});

export const questions = pgTable("questions", {
    id: uuid("id").primaryKey(),
    content: text("content"),
    question: text("question").notNull(),
    format: text("format"),
    options: jsonb("options"),
    topicType: text("topic_type"),
    explanation: text("explanation"),
    createdAt: timestamp("created_at").notNull(),
});

export const userLessonResults = pgTable("user_lesson_results", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lessonId: uuid("lesson_id").notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    answers: jsonb("answers"),
    totalScore: integer("total_score"),
    createdAt: timestamp("created_at").notNull(),
});

export const organizationInfo = pgTable("organization_info", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    contactEmail: text("contact_email"),
    address: text("address"),
    city: text("city"),
    phone: text("phone"),
    createdAt: timestamp("created_at").notNull(),
});

export const organizationYears = pgTable("organization_years", {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    year: integer("year").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull(),
});

export const userWrongQuestions = pgTable("user_wrong_questions", {
    id: uuid("id").primaryKey(),
    questionId: uuid("question_id").notNull(),
    userId: uuid("user_id").notNull(),
});

// === RELATIONS ===

export const userRelations = relations(users, ({ one, many }) => ({
    settings: one(userSettings, {
        fields: [users.userSettingsId],
        references: [userSettings.id],
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
}));

export const questionRelations = relations(questions, ({ many }) => ({
    wrongQuestions: many(userWrongQuestions),
    lessonResults: many(userLessonResults),
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
