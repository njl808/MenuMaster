# Food Menu System

## Overview

A full-stack restaurant menu management and ordering system that enables restaurants to create, customize, and embed interactive menus with integrated checkout functionality. The system provides a dual-interface approach: a professional admin dashboard for restaurant owners to manage menus, and a customer-facing menu interface for browsing and ordering with payment processing.

## Recent Changes (October 2025)

**Multi-Location Support:**
- Added `locations` table for restaurant chains with multiple physical locations
- Implemented `location_menu_overrides` for location-specific pricing and availability
- Orders now track which location they're associated with

**Menu Scheduling:**
- Categories and menu items now support time-based availability (hours, days of week)
- Seasonal item support with start/end dates
- Availability fields: `availableDays`, `availableFrom`, `availableTo`, `seasonalStart`, `seasonalEnd`

**Customer Authentication:**
- Secure customer accounts with scrypt password hashing and salt
- Customer registration and login endpoints with full validation
- Password sanitization in API responses (never exposed to clients)
- Customer favorites system for saved menu items

**Image Upload:**
- Integrated Uppy file uploader with Replit Object Storage
- Drag-and-drop image upload for menu items
- 5MB size limit with image MIME type validation
- Public URL generation for uploaded images

**Theme Customization:**
- Dynamic theme application to customer-facing menus
- Hex to HSL color conversion for CSS variable compatibility
- Per-restaurant theme configuration (primary/accent colors)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript using Vite as the build tool and development server
- Client-side routing via Wouter (lightweight alternative to React Router)
- Component library based on Radix UI primitives with custom shadcn/ui styling
- Tailwind CSS for styling with custom design system tokens

**State Management:**
- TanStack React Query for server state management and API caching
- Local React state for UI interactions
- Session storage for shopping cart persistence during checkout flow

**Design System:**
- Hybrid theming approach: Dark mode for admin dashboard, light mode for customer menus
- Custom color palette with forest green primary (#16a34a) and warm orange accent (#f97316)
- Inter font family for UI text, JetBrains Mono for code snippets
- Responsive layout system using Tailwind's utility classes

**Key UI Patterns:**
- Sidebar navigation for admin interface with collapsible mobile view
- Dialog/modal components for CRUD operations
- Sheet components for mobile shopping cart
- Dynamic theme injection for customer menus (supports per-restaurant customization)

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express server
- TypeScript throughout with ESM module system
- Development uses tsx for hot-reloading, production builds with esbuild

**API Design:**
- RESTful API endpoints organized by resource type
- JSON request/response format
- Middleware for request logging and error handling
- Route separation in dedicated routes.ts file

**Business Logic Layer:**
- Storage abstraction interface (IStorage) for database operations
- Separated authentication logic for customer accounts (scrypt-based password hashing)
- Stripe payment integration with webhook support
- Image upload handling with file size/type validation

**Security Patterns:**
- Password hashing using Node.js native scrypt with salt
- Timing-safe comparison for password verification
- Sanitization of sensitive data (Stripe secret keys, passwords) before client responses
- CORS and credential handling for cross-origin requests

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries and migrations
- WebSocket connection pooling for serverless compatibility

**Schema Design:**
- Multi-tenant architecture supporting multiple restaurants per instance
- Hierarchical menu structure: Restaurant → Category → MenuItem → Modifiers
- Location-based menu overrides for restaurant chains
- Customer accounts with favorites and order history
- Order management with status tracking workflow

**Key Tables:**
- `restaurants`: Core tenant table with Stripe keys and theme configuration (JSONB)
- `categories`: Menu organization with display ordering and scheduling (availability hours, days, seasonal dates)
- `menu_items`: Products with pricing, dietary tags, availability flags, and scheduling fields
- `modifiers`: Item customizations (sizes, add-ons, etc.)
- `locations`: Physical restaurant locations for multi-location chains
- `location_menu_overrides`: Location-specific pricing and availability overrides
- `customers`: User accounts with scrypt-hashed passwords and addresses (JSONB)
- `customer_favorites`: Customer saved items for quick reordering
- `orders`: Transaction records with Stripe payment details, fulfillment status, and customer/location linking

### External Dependencies

**Payment Processing:**
- Stripe for payment processing and checkout
- Per-restaurant Stripe account support (publishable/secret key pairs stored in DB)
- Stripe Elements for PCI-compliant card collection
- Payment Intent flow for deferred capture

**File Storage:**
- Replit Object Storage for image uploads
- Multer middleware for multipart form handling
- Public URL generation for uploaded images
- 5MB file size limit with image MIME type validation

**Third-Party UI Libraries:**
- Radix UI for accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- Lucide React for iconography
- React Hook Form with Zod resolvers for form validation
- date-fns for date formatting

**Development Tools:**
- Replit-specific Vite plugins for error overlays and dev tooling
- Drizzle Kit for database migrations
- TypeScript for type safety across frontend and backend

**APIs & Services:**
- Google Fonts API for Inter and JetBrains Mono font families
- Stripe API for payment processing
- Neon Database serverless PostgreSQL endpoint