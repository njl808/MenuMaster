import { 
  type Restaurant, 
  type InsertRestaurant,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type ModifierGroup,
  type InsertModifierGroup,
  type Modifier,
  type InsertModifier,
  type Location,
  type InsertLocation,
  type LocationMenuOverride,
  type InsertLocationMenuOverride,
  type Customer,
  type InsertCustomer,
  type CustomerFavorite,
  type InsertCustomerFavorite,
  type Order,
  type InsertOrder,
} from "@shared/schema";
import { db } from "./db";
import { restaurants, categories, menuItems, modifierGroups, modifiers, locations, locationMenuOverrides, customers, customerFavorites, orders } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Restaurants
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getAllRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: string): Promise<void>;
  
  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  getCategoriesByRestaurant(restaurantId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  
  // Menu Items
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
  getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Modifier Groups
  getModifierGroupsByMenuItem(menuItemId: string): Promise<ModifierGroup[]>;
  createModifierGroup(group: InsertModifierGroup): Promise<ModifierGroup>;
  updateModifierGroup(id: string, data: Partial<InsertModifierGroup>): Promise<ModifierGroup | undefined>;
  deleteModifierGroup(id: string): Promise<void>;
  
  // Modifiers
  getModifiersByGroup(groupId: string): Promise<Modifier[]>;
  createModifier(modifier: InsertModifier): Promise<Modifier>;
  updateModifier(id: string, data: Partial<InsertModifier>): Promise<Modifier | undefined>;
  deleteModifier(id: string): Promise<void>;
  
  // Locations
  getLocation(id: string): Promise<Location | undefined>;
  getLocationsByRestaurant(restaurantId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, data: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<void>;
  
  // Location Menu Overrides
  getLocationOverrides(locationId: string): Promise<LocationMenuOverride[]>;
  createLocationOverride(override: InsertLocationMenuOverride): Promise<LocationMenuOverride>;
  deleteLocationOverride(id: string): Promise<void>;
  
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Customer Favorites
  getFavoritesByCustomer(customerId: string): Promise<CustomerFavorite[]>;
  createFavorite(favorite: InsertCustomerFavorite): Promise<CustomerFavorite>;
  deleteFavorite(id: string): Promise<void>;
  
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Restaurants
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result[0];
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(restaurant).returning();
    return result[0];
  }

  async updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const result = await db.update(restaurants).set(data).where(eq(restaurants.id, id)).returning();
    return result[0];
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getCategoriesByRestaurant(restaurantId: string): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(categories.displayOrder);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Menu Items
  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result[0];
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems)
      .where(eq(menuItems.categoryId, categoryId))
      .orderBy(menuItems.displayOrder);
  }

  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems)
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(menuItems.displayOrder)
      .then(results => results.map(r => r.menu_items));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const result = await db.insert(menuItems).values(item).returning();
    return result[0];
  }

  async updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const result = await db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
    return result[0];
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Modifier Groups
  async getModifierGroupsByMenuItem(menuItemId: string): Promise<ModifierGroup[]> {
    return await db.select().from(modifierGroups)
      .where(eq(modifierGroups.menuItemId, menuItemId))
      .orderBy(modifierGroups.displayOrder);
  }

  async createModifierGroup(group: InsertModifierGroup): Promise<ModifierGroup> {
    const result = await db.insert(modifierGroups).values(group).returning();
    return result[0];
  }

  async updateModifierGroup(id: string, data: Partial<InsertModifierGroup>): Promise<ModifierGroup | undefined> {
    const result = await db.update(modifierGroups).set(data).where(eq(modifierGroups.id, id)).returning();
    return result[0];
  }

  async deleteModifierGroup(id: string): Promise<void> {
    await db.delete(modifierGroups).where(eq(modifierGroups.id, id));
  }

  // Modifiers
  async getModifiersByGroup(groupId: string): Promise<Modifier[]> {
    return await db.select().from(modifiers)
      .where(eq(modifiers.modifierGroupId, groupId))
      .orderBy(modifiers.displayOrder);
  }

  async createModifier(modifier: InsertModifier): Promise<Modifier> {
    const result = await db.insert(modifiers).values(modifier).returning();
    return result[0];
  }

  async updateModifier(id: string, data: Partial<InsertModifier>): Promise<Modifier | undefined> {
    const result = await db.update(modifiers).set(data).where(eq(modifiers.id, id)).returning();
    return result[0];
  }

  async deleteModifier(id: string): Promise<void> {
    await db.delete(modifiers).where(eq(modifiers.id, id));
  }

  // Locations
  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async getLocationsByRestaurant(restaurantId: string): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.restaurantId, restaurantId));
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async updateLocation(id: string, data: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations).set(data).where(eq(locations.id, id)).returning();
    return result[0];
  }

  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Location Menu Overrides
  async getLocationOverrides(locationId: string): Promise<LocationMenuOverride[]> {
    return await db.select().from(locationMenuOverrides).where(eq(locationMenuOverrides.locationId, locationId));
  }

  async createLocationOverride(override: InsertLocationMenuOverride): Promise<LocationMenuOverride> {
    const result = await db.insert(locationMenuOverrides).values(override).returning();
    return result[0];
  }

  async deleteLocationOverride(id: string): Promise<void> {
    await db.delete(locationMenuOverrides).where(eq(locationMenuOverrides.id, id));
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email));
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
    return result[0];
  }

  // Customer Favorites
  async getFavoritesByCustomer(customerId: string): Promise<CustomerFavorite[]> {
    return await db.select().from(customerFavorites).where(eq(customerFavorites.customerId, customerId));
  }

  async createFavorite(favorite: InsertCustomerFavorite): Promise<CustomerFavorite> {
    const result = await db.insert(customerFavorites).values(favorite).returning();
    return result[0];
  }

  async deleteFavorite(id: string): Promise<void> {
    await db.delete(customerFavorites).where(eq(customerFavorites.id, id));
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
