import { relations } from "drizzle-orm/relations";
import { bots, botConsumption, accounts, calendars, emailLogs, emailPreferences, events, botParams, scheduledBots, sessions, providerAccounts, userTokens, words, transcripts, subscriptions } from "./schema";

export const botConsumptionRelations = relations(botConsumption, ({one}) => ({
	bot_botId: one(bots, {
		fields: [botConsumption.botId],
		references: [bots.id],
		relationName: "botConsumption_botId_bots_id"
	})
}));

export const botsRelations = relations(bots, ({one, many}) => ({
	botConsumptions_botId: many(botConsumption, {
		relationName: "botConsumption_botId_bots_id"
	}),
	account: one(accounts, {
		fields: [bots.accountId],
		references: [accounts.id]
	}),
	botParam: one(botParams, {
		fields: [bots.botParamId],
		references: [botParams.id]
	}),
	event: one(events, {
		fields: [bots.eventId],
		references: [events.id]
	}),
	scheduledBot: one(scheduledBots, {
		fields: [bots.scheduledBotId],
		references: [scheduledBots.id]
	}),
	words: many(words),
	transcripts: many(transcripts),
}));

export const calendarsRelations = relations(calendars, ({one, many}) => ({
	account: one(accounts, {
		fields: [calendars.accountId],
		references: [accounts.id]
	}),
	events: many(events),
}));

export const accountsRelations = relations(accounts, ({many}) => ({
	calendars: many(calendars),
	emailLogs: many(emailLogs),
	emailPreferences: many(emailPreferences),
	events: many(events),
	scheduledBots: many(scheduledBots),
	sessions: many(sessions),
	providerAccounts: many(providerAccounts),
	bots: many(bots),
	userTokens: many(userTokens),
	subscriptions: many(subscriptions),
}));

export const emailLogsRelations = relations(emailLogs, ({one}) => ({
	account: one(accounts, {
		fields: [emailLogs.accountId],
		references: [accounts.id]
	}),
}));

export const emailPreferencesRelations = relations(emailPreferences, ({one}) => ({
	account: one(accounts, {
		fields: [emailPreferences.accountId],
		references: [accounts.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	account: one(accounts, {
		fields: [events.accountId],
		references: [accounts.id]
	}),
	calendar: one(calendars, {
		fields: [events.calendarId],
		references: [calendars.id]
	}),
	bots: many(bots),
}));

export const scheduledBotsRelations = relations(scheduledBots, ({one, many}) => ({
	botParam: one(botParams, {
		fields: [scheduledBots.botParamId],
		references: [botParams.id]
	}),
	account: one(accounts, {
		fields: [scheduledBots.accountId],
		references: [accounts.id]
	}),
	bots: many(bots),
}));

export const botParamsRelations = relations(botParams, ({many}) => ({
	scheduledBots: many(scheduledBots),
	bots: many(bots),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	account: one(accounts, {
		fields: [sessions.userId],
		references: [accounts.id]
	}),
}));

export const providerAccountsRelations = relations(providerAccounts, ({one}) => ({
	account: one(accounts, {
		fields: [providerAccounts.userId],
		references: [accounts.id]
	}),
}));

export const userTokensRelations = relations(userTokens, ({one}) => ({
	account: one(accounts, {
		fields: [userTokens.accountId],
		references: [accounts.id]
	}),
}));

export const wordsRelations = relations(words, ({one}) => ({
	bot: one(bots, {
		fields: [words.botId],
		references: [bots.id]
	}),
}));

export const transcriptsRelations = relations(transcripts, ({one}) => ({
	bot: one(bots, {
		fields: [transcripts.botId],
		references: [bots.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	account: one(accounts, {
		fields: [subscriptions.accountId],
		references: [accounts.id]
	}),
}));