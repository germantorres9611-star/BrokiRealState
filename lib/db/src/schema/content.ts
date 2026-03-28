import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentTable = pgTable("site_content", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title").notNull().default("BROKI INMOBILIARIA"),
  heroSubtitle: text("hero_subtitle").notNull().default("Espacios que definen tu estilo de vida."),
  heroCta: text("hero_cta").notNull().default("Ver Apartamentos"),
  heroCtaSecondary: text("hero_cta_secondary").notNull().default("Contáctanos"),
  contactPhone: text("contact_phone").notNull().default("3041363265"),
  contactEmail: text("contact_email").notNull().default("broki.inmobiliaria@gmail.com"),
  contactWhatsapp: text("contact_whatsapp").notNull().default("573041363265"),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({ id: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
