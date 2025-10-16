import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Restaurants table - each restaurant can have multiple menus
export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  stripePublishableKey: text("stripe_publishable_key"), // Optional per-restaurant Stripe keys
  stripeSecretKey: text("stripe_secret_key"), // Encrypted in production
  themeConfig: jsonb("theme_config").$type<{
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }>().default({
    primaryColor: "#16a34a",
    accentColor: "#f97316"
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Menu categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Scheduling fields
  availableDays: text("available_days").array().$type<string[]>().default([]), // ["monday", "tuesday", ...]
  availableFrom: text("available_from"), // "08:00" time format
  availableTo: text("available_to"), // "22:00" time format
  seasonalStart: text("seasonal_start"), // "2024-12-01" date format
  seasonalEnd: text("seasonal_end"), // "2024-12-31" date format
});

// Menu items
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  dietaryTags: text("dietary_tags").array().$type<string[]>().default([]), // vegetarian, vegan, gluten-free, etc.
  isAvailable: boolean("is_available").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  // Scheduling fields
  availableDays: text("available_days").array().$type<string[]>().default([]), // ["monday", "tuesday", ...]
  availableFrom: text("available_from"), // "08:00" time format
  availableTo: text("available_to"), // "22:00" time format
  seasonalStart: text("seasonal_start"), // "2024-12-01" date format
  seasonalEnd: text("seasonal_end"), // "2024-12-31" date format
});

// Item modifiers (e.g., "Extra Cheese", "No Onions")
export const modifiers = pgTable("modifiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).notNull().default("0"),
  isRequired: boolean("is_required").notNull().default(false),
});

// Locations (for multi-location restaurant chains)
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Location-specific menu overrides
export const locationMenuOverrides = pgTable("location_menu_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  menuItemId: varchar("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  isAvailable: boolean("is_available").notNull().default(true),
  price: decimal("price", { precision: 10, scale: 2 }), // Override price for this location (null = use default)
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  locationId: varchar("location_id").references(() => locations.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  items: jsonb("items").notNull().$type<{
    itemId: string;
    name: string;
    price: string;
    quantity: number;
    modifiers: { id: string; name: string; priceAdjustment: string }[];
    specialInstructions?: string;
  }[]>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, preparing, ready, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, demo
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID (null for demo mode)
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertModifierSchema = createInsertSchema(modifiers).omit({ id: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertLocationMenuOverrideSchema = createInsertSchema(locationMenuOverrides).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });

// TypeScript types
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Modifier = typeof modifiers.$inferSelect;
export type InsertModifier = z.infer<typeof insertModifierSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type LocationMenuOverride = typeof locationMenuOverrides.$inferSelect;
export type InsertLocationMenuOverride = z.infer<typeof insertLocationMenuOverrideSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
