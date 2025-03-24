import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const languages = pgEnum('language', [
  'english', 'spanish', 'french', 'german', 'hindi', 'chinese'
]);

export const complaintTypeEnum = pgEnum('complaint_type', [
  'phishing_attack', 'ransomware', 'data_breach', 'identity_theft', 'unknown'
]);

export const complaintStatusEnum = pgEnum('complaint_status', [
  'received', 'under_review', 'under_investigation', 'resolved', 'closed'
]);

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  incidentType: complaintTypeEnum("incident_type").notNull(),
  incidentDate: text("incident_date"),
  incidentDescription: text("incident_description").notNull(),
  financialLoss: text("financial_loss"),
  partiesInvolved: text("parties_involved"),
  additionalNotes: text("additional_notes"),
  contactConsent: boolean("contact_consent").default(false),
  status: complaintStatusEnum("status").default('received'),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  language: languages("language").default('english'),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  status: true
});

export const trackingSchema = z.object({
  trackingCode: z.string().min(8)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type TrackingRequest = z.infer<typeof trackingSchema>;
export type ComplaintType = 'phishing_attack' | 'ransomware' | 'data_breach' | 'identity_theft' | 'unknown';
export type ComplaintStatus = 'received' | 'under_review' | 'under_investigation' | 'resolved' | 'closed';
export type Language = 'english' | 'spanish' | 'french' | 'german' | 'hindi' | 'chinese';
