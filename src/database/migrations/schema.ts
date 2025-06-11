import { pgTable, varchar, timestamp, index, foreignKey, integer, numeric, serial, text, jsonb, boolean, uuid, unique, json, doublePrecision, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const audioFrequency = pgEnum("audio_frequency", ['f16khz', 'f24khz'])
export const emailType = pgEnum("email_type", ['insufficient_tokens_recording', 'payment_activation', 'usage_report', 'welcome', 'usage-reports','error-report', 'product-updates', 'maintenance', 'company-news', 'api-changes', 'developer-resources', 'security', 'billing', 'activity-updates', 'custom'])
export const meetingToJoin = pgEnum("meeting_to_join", ['all', 'owned', 'internal', 'external'])
export const provider = pgEnum("provider", ['google', 'microsoft', 'apple'])
export const recordingMode = pgEnum("recording_mode", ['audio_only', 'speaker_view', 'gallery_view'])
export const speechToTextProvider = pgEnum("speech_to_text_provider", ['gladia', 'runpod', 'default'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid'])


export const dieselSchemaMigrations = pgTable("__diesel_schema_migrations", {
	version: varchar({ length: 50 }).primaryKey().notNull(),
	runOn: timestamp("run_on", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const botConsumption = pgTable("bot_consumption", {
	botId: integer("bot_id").notNull(),
	recordingTokens: numeric("recording_tokens").default('0').notNull(),
	transcriptionTokens: numeric("transcription_tokens").default('0').notNull(),
	transcriptionByokTokens: numeric("transcription_byok_tokens").default('0').notNull(),
	streamingOutputTokens: numeric("streaming_output_tokens").default('0').notNull(),
	streamingInputTokens: numeric("streaming_input_tokens").default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	billedAt: timestamp("billed_at", { mode: 'string' }),
	id: serial().primaryKey().notNull(),
}, (table) => [
	index("idx_bot_consumption_bot_id").using("btree", table.botId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.botId],
			foreignColumns: [bots.id],
			name: "bot_consumption_bot_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.botId],
			foreignColumns: [bots.id],
			name: "bot_consumption_bot_id_fkey"
		}).onDelete("cascade"),
]);

export const botParams = pgTable("bot_params", {
	id: serial().primaryKey().notNull(),
	botName: text("bot_name").notNull(),
	botImage: text("bot_image"),
	speechToTextProvider: speechToTextProvider("speech_to_text_provider"),
	enterMessage: text("enter_message"),
	recordingMode: recordingMode("recording_mode"),
	speechToTextApiKey: varchar("speech_to_text_api_key"),
	streamingInput: varchar("streaming_input"),
	streamingOutput: varchar("streaming_output"),
	waitingRoomTimeout: integer("waiting_room_timeout"),
	nooneJoinedTimeout: integer("noone_joined_timeout"),
	deduplicationKey: varchar("deduplication_key"),
	extra: jsonb().default(null),
	webhookUrl: varchar("webhook_url").notNull(),
	streamingAudioFrequency: audioFrequency("streaming_audio_frequency"),
	zoomSdkId: varchar("zoom_sdk_id"),
	zoomSdkPwd: varchar("zoom_sdk_pwd"),
	transcriptionCustomParameters: jsonb("transcription_custom_parameters"),
}, (table) => [
	index("idx_bot_params_stt_provider").using("btree", table.speechToTextProvider.asc().nullsLast().op("enum_ops")),
]);

export const botStats = pgTable("bot_stats", {
	id: serial().primaryKey().notNull(),
	sessionId: varchar("session_id").notNull(),
	reserved: boolean().notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }).notNull(),
	receivedAt: timestamp("received_at", { mode: 'string' }),
});

export const calendars = pgTable("calendars", {
	id: serial().primaryKey().notNull(),
	googleId: varchar("google_id").notNull(),
	name: varchar().notNull(),
	accountId: integer("account_id").notNull(),
	syncToken: varchar("sync_token").notNull(),
	email: varchar().notNull(),
	resourceId: varchar("resource_id"),
	channelExpiration: timestamp("channel_expiration", { mode: 'string' }).notNull(),
	uuid: uuid().defaultRandom().notNull(),
	calendarAccessToken: varchar("calendar_access_token").notNull(),
	calendarRefreshToken: varchar("calendar_refresh_token").notNull(),
	provider: provider().notNull(),
	encryptedCalendarClientId: varchar("encrypted_calendar_client_id").notNull(),
	encryptedCalendarClientSecret: varchar("encrypted_calendar_client_secret").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "calendars_account_id_fkey"
		}).onDelete("cascade"),
]);

export const emailLogs = pgTable("email_logs", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	emailType: emailType("email_type").notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	subject: varchar("subject"),
	triggeredBy: varchar("triggered_by").default('system'),
	messageIds: varchar("message_ids"),
	metadata: jsonb(),
	success: boolean().default(true).notNull(),
	errorMessage: text("error_message"),
}, (table) => [
	index("idx_email_logs_account_type_date").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.emailType.asc().nullsLast().op("int4_ops"), table.sentAt.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "email_logs_account_id_fkey"
		}).onDelete("cascade"),
]);

export const emailPreferences = pgTable("email_preferences", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	emailType: emailType("email_type").notNull(),
	frequency: varchar().default('never').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("email_preferences_account_id_email_type_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.emailType.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "email_preferences_account_id_fkey"
		}),
	unique("email_preferences_account_id_email_type_key").on(table.accountId, table.emailType),
]);

export const emailContent = pgTable("email_content", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	emailType: emailType("email_type").notNull(),
	content: varchar().notNull(),
	contentText: varchar("content_text").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("email_content_account_id_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "email_content_account_id_fkey"
		}).onDelete("cascade")
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	googleId: varchar("google_id").notNull(),
	name: varchar().notNull(),
	accountId: integer("account_id").notNull(),
	meetingUrl: varchar("meeting_url").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	calendarId: integer("calendar_id").notNull(),
	attendees: json().notNull(),
	isOrganizer: boolean("is_organizer").notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	error: varchar(),
	sessionId: varchar("session_id"),
	recurringEventId: varchar("recurring_event_id"),
	isRecurring: boolean("is_recurring").notNull(),
	agendaId: integer("agenda_id"),
	uuid: uuid().defaultRandom().notNull(),
	botParamId: integer("bot_param_id"),
	raw: jsonb().notNull(),
	lastUpdatedAt: timestamp("last_updated_at", { mode: 'string' }).notNull(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "events_account_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.calendarId],
			foreignColumns: [calendars.id],
			name: "events_calendar_id_fkey"
		}).onDelete("cascade"),
]);

export const scheduledBots = pgTable("scheduled_bots", {
	id: serial().primaryKey().notNull(),
	startTime: timestamp("start_time", { mode: 'string' }),
	botParamId: integer("bot_param_id").notNull(),
	uuid: uuid().defaultRandom().notNull(),
	accountId: integer("account_id").notNull(),
	meetingUrl: varchar("meeting_url").notNull(),
}, (table) => [
	index("idx_scheduled_bots_start_time").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.botParamId],
			foreignColumns: [botParams.id],
			name: "fk_scheduled_bot_params"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "fk_scheduled_bots_account"
		}),
]);

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: integer("user_id").notNull(),
}, (table) => [
	index("sessions_userid_token_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.token.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [accounts.id],
			name: "sessions_user_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const providerAccounts = pgTable("provider_accounts", {
	id: serial().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("accounts_userid_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [accounts.id],
			name: "provider_accounts_user_id_accounts_id_fk"
		}).onDelete("cascade"),
]);

export const bots = pgTable("bots", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	meetingUrl: text("meeting_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	sessionId: text("session_id"),
	reserved: boolean().notNull(),
	errors: text(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	mp4S3Path: varchar("mp4_s3_path").default('').notNull(),
	uuid: uuid().defaultRandom().notNull(),
	botParamId: integer("bot_param_id").notNull(),
	eventId: integer("event_id"),
	scheduledBotId: integer("scheduled_bot_id"),
	diarizationV2: boolean("diarization_v2").default(false).notNull(),
	transcriptionFails: integer("transcription_fails"),
	diarizationFails: integer("diarization_fails"),
	userReportedError: jsonb("user_reported_error"),
	transcriptionPayloads: jsonb("transcription_payloads"),
}, (table) => [
	index("idx_bots_account_date").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.endedAt.asc().nullsLast().op("int4_ops")),
	index("idx_bots_bot_param_id").using("btree", table.botParamId.asc().nullsLast().op("int4_ops")),
	index("idx_bots_ended_at").using("btree", table.endedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "bots_account_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.botParamId],
			foreignColumns: [botParams.id],
			name: "fk_bot_param_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "fk_bots_event"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.scheduledBotId],
			foreignColumns: [scheduledBots.id],
			name: "fk_bots_scheduled_bot"
		}),
]);

export const userTokens = pgTable("user_tokens", {
	accountId: integer("account_id").primaryKey().notNull(),
	availableTokens: numeric("available_tokens").default('0').notNull(),
	totalTokensPurchased: numeric("total_tokens_purchased").default('0').notNull(),
	lastPurchaseDate: timestamp("last_purchase_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "user_tokens_account_id_fkey"
		}),
]);

export const words = pgTable("words", {
	id: serial().primaryKey().notNull(),
	text: varchar().notNull(),
	startTime: doublePrecision("start_time").notNull(),
	endTime: doublePrecision("end_time").notNull(),
	botId: integer("bot_id").notNull(),
	userId: integer("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.botId],
			foreignColumns: [bots.id],
			name: "words_bot_id_fkey"
		}).onDelete("cascade"),
]);

export const verifications = pgTable("verifications", {
	id: serial().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("verifications_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const transcripts = pgTable("transcripts", {
	id: serial().primaryKey().notNull(),
	speaker: varchar().notNull(),
	botId: integer("bot_id").notNull(),
	startTime: doublePrecision("start_time").notNull(),
	lang: varchar(),
	endTime: doublePrecision("end_time"),
	userId: integer("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.botId],
			foreignColumns: [bots.id],
			name: "transcripts_bot_id_fkey"
		}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	email: varchar().notNull(),
	password: varchar().notNull(),
	status: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	firstname: varchar(),
	lastname: varchar(),
	phone: varchar(),
	companyName: varchar("company_name"),
	companySize: varchar("company_size"),
	usagePlanned: varchar("usage_planned"),
	botsApiKey: text("bots_api_key").notNull(),
	botsWebhookUrl: text("bots_webhook_url"),
	secret: varchar().default(sql`gen_random_uuid()`).notNull(),
	fullName: text("full_name"),
	emailVerified: boolean("email_verified"),
	image: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("accounts_email_unique").on(table.email),
]);

export const subscriptions = pgTable("subscriptions", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	subscriptionId: varchar("subscription_id"),
	customerId: varchar("customer_id"),
	productId: varchar("product_id"),
	subscriptionStatus: subscriptionStatus("subscription_status"),
	planId: varchar("plan_id"),
	subscriptionItemId: varchar("subscription_item_id"),
	trialEnd: timestamp("trial_end", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "subscriptions_account_id_fkey"
		}).onDelete("cascade"),
]);
