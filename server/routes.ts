import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertRestaurantSchema, insertCategorySchema, insertMenuItemSchema, insertModifierSchema, insertLocationSchema, insertLocationMenuOverrideSchema, insertCustomerSchema, insertCustomerFavoriteSchema, insertOrderSchema } from "@shared/schema";
import { hashPassword, comparePasswords, sanitizeCustomer } from "./customer-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to sanitize restaurant data (remove secret keys)
  const sanitizeRestaurant = (restaurant: any) => {
    const { stripeSecretKey, ...sanitized } = restaurant;
    return sanitized;
  };

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      // Never expose secret keys to clients
      const sanitized = restaurants.map(sanitizeRestaurant);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      // Never expose secret keys to clients
      res.json(sanitizeRestaurant(restaurant));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const data = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(data);
      // Never expose secret keys to clients
      res.json(sanitizeRestaurant(restaurant));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.updateRestaurant(req.params.id, req.body);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      // Never expose secret keys to clients
      res.json(sanitizeRestaurant(restaurant));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Category routes
  app.get("/api/categories/:restaurantId", async (req, res) => {
    try {
      const categories = await storage.getCategoriesByRestaurant(req.params.restaurantId);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menu Item routes
  app.get("/api/menu-items/:categoryId", async (req, res) => {
    try {
      const items = await storage.getMenuItemsByCategory(req.params.categoryId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/menu-items/all/:restaurantId", async (req, res) => {
    try {
      const items = await storage.getMenuItemsByRestaurant(req.params.restaurantId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const data = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/menu-items/:id", async (req, res) => {
    try {
      const item = await storage.updateMenuItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Modifier routes
  app.get("/api/modifiers/:menuItemId", async (req, res) => {
    try {
      const modifiers = await storage.getModifiersByMenuItem(req.params.menuItemId);
      res.json(modifiers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/modifiers", async (req, res) => {
    try {
      const data = insertModifierSchema.parse(req.body);
      const modifier = await storage.createModifier(data);
      res.json(modifier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/modifiers/:id", async (req, res) => {
    try {
      await storage.deleteModifier(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Location routes
  app.get("/api/locations/:restaurantId", async (req, res) => {
    try {
      const locations = await storage.getLocationsByRestaurant(req.params.restaurantId);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const data = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(data);
      res.json(location);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.updateLocation(req.params.id, req.body);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      await storage.deleteLocation(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Location override routes
  app.get("/api/location-overrides/:locationId", async (req, res) => {
    try {
      const overrides = await storage.getLocationOverrides(req.params.locationId);
      res.json(overrides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/location-overrides", async (req, res) => {
    try {
      const data = insertLocationMenuOverrideSchema.parse(req.body);
      const override = await storage.createLocationOverride(data);
      res.json(override);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/location-overrides/:id", async (req, res) => {
    try {
      await storage.deleteLocationOverride(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer auth routes
  app.post("/api/customers/register", async (req, res) => {
    try {
      // Validate request body with schema
      const validatedData = insertCustomerSchema.parse(req.body);
      const { email, password, ...rest } = validatedData;
      
      // Check if customer already exists
      const existing = await storage.getCustomerByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password and create customer
      const hashedPassword = await hashPassword(password);
      const customer = await storage.createCustomer({
        email,
        password: hashedPassword,
        ...rest,
      });

      res.json(sanitizeCustomer(customer));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/customers/login", async (req, res) => {
    try {
      // Validate login credentials with schema subset
      const loginSchema = insertCustomerSchema.pick({ email: true, password: true });
      const { email, password } = loginSchema.parse(req.body);
      
      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePasswords(password, customer.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json(sanitizeCustomer(customer));
    } catch (error: any) {
      // Validation errors should return 400, other errors 500
      if (error.name === 'ZodError' || error.message?.includes('validation')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Customer favorites routes
  app.get("/api/customers/:customerId/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByCustomer(req.params.customerId);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers/favorites", async (req, res) => {
    try {
      const data = insertCustomerFavoriteSchema.parse(req.body);
      const favorite = await storage.createFavorite(data);
      res.json(favorite);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/customers/favorites/:id", async (req, res) => {
    try {
      await storage.deleteFavorite(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment intent route (uses restaurant-specific keys)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { restaurantId, amount } = req.body;
      
      // Get restaurant to check for Stripe keys
      const restaurant = await storage.getRestaurant(restaurantId);
      
      if (!restaurant || !restaurant.stripeSecretKey) {
        return res.status(400).json({ 
          error: "Restaurant does not have Stripe configured. Using demo mode." 
        });
      }

      // Initialize Stripe with restaurant-specific key
      const stripe = new Stripe(restaurant.stripeSecretKey, {
        apiVersion: "2023-10-16",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
