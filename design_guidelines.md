# Food Menu System Design Guidelines

## Design Approach

**Hybrid Strategy:** Combining utility-focused admin dashboard with experience-driven customer menus

**References:**
- Admin Panel: Linear (clean dashboards), Notion (rich editors), Shopify Admin (e-commerce management)
- Customer Menus: Toast POS (restaurant UI), UberEats (food presentation), Square Online (modern ordering)

**Core Principle:** Professional admin efficiency meets delightful customer ordering experience

## Color Palette

**Admin Dashboard (Dark Mode Primary):**
- Background: 222 15% 10% (deep neutral)
- Surface: 222 15% 15% (elevated cards)
- Primary: 142 76% 36% (forest green - food-friendly)
- Accent: 25 95% 53% (warm orange for CTAs)
- Text: 0 0% 98% (high contrast)
- Muted: 215 16% 47% (secondary text)

**Customer Menu (Light Mode Primary):**
- Background: 0 0% 100% (clean white)
- Surface: 0 0% 98% (subtle cards)
- Primary: 142 76% 36% (matching green)
- Accent: 25 95% 53% (appetite-stimulating orange)
- Text: 222 47% 11% (dark slate)
- Borders: 214 32% 91% (soft dividers)

## Typography

**Font Stack:**
- Headings: 'Inter' (Google Fonts) - Bold 700, Semibold 600
- Body: 'Inter' Regular 400, Medium 500
- Code/Technical: 'JetBrains Mono' (for embed codes)

**Scale:**
- Hero/Display: text-5xl (48px)
- H1 Admin: text-3xl (30px)
- H2 Sections: text-2xl (24px)
- H3 Cards: text-xl (20px)
- Body: text-base (16px)
- Small/Meta: text-sm (14px)

## Layout System

**Tailwind Spacing Primitives:** 2, 4, 6, 8, 12, 16, 24 (p-2, m-4, gap-6, space-y-8, etc.)

**Grid Patterns:**
- Admin Dashboard: Sidebar (280px) + Main Content (flex-1) with max-w-7xl
- Menu Items Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Order Cards: grid-cols-1 lg:grid-cols-2 gap-4
- Form Layouts: Single column max-w-2xl for focus

**Responsive Breakpoints:**
- Mobile: base (< 640px) - stacked single column
- Tablet: md (768px) - 2 columns where appropriate
- Desktop: lg (1024px+) - full multi-column layouts

## Component Library

### Admin Panel Components

**Navigation:**
- Left sidebar with collapsible menu groups
- Icon + label navigation items (Heroicons via CDN)
- Active state: bg-primary/10 with left border accent
- Top bar: breadcrumbs, search, user profile dropdown

**Data Tables:**
- Striped rows with hover states (hover:bg-surface)
- Sticky headers for long lists
- Action columns with icon buttons
- Pagination controls at bottom
- Empty states with illustrations

**Forms & Editors:**
- Rich text editor for item descriptions (Tiptap or similar)
- Image upload zones with drag-drop (dotted borders, p-12)
- Color pickers for theme customization
- Tag inputs for dietary restrictions
- Price inputs with currency symbol prefix

**Drag & Drop Builder:**
- Visual category reordering with handle icons
- Drop zones with dashed borders (border-dashed border-2)
- Preview pane alongside editor (60/40 split)
- Save/Publish action bar (sticky bottom)

### Customer Menu Components

**Menu Display:**
- Hero section with restaurant image and branding (h-96)
- Category tabs or pills navigation (sticky top-20)
- Food item cards: Image (aspect-video) + Details + Add button
- Prominent pricing with dietary icons (vegetarian, gluten-free, etc.)
- Modal or slide-out for item customization

**Shopping Cart:**
- Floating cart badge with item count
- Slide-out panel from right (w-96)
- Line items with thumbnail, quantity controls, remove
- Subtotal/tax/total breakdown
- Checkout button (accent color, full width)

**Checkout Flow:**
- Step indicator (1. Cart → 2. Details → 3. Payment)
- Stripe embedded payment elements
- Order summary sidebar (desktop) or accordion (mobile)
- Success confirmation with order number

## Images

**Admin Dashboard:**
- No hero images - focus on data density
- Empty state illustrations for zero data scenarios
- Food item placeholders (300x200 aspect ratio)

**Customer Menu:**
- Restaurant hero banner: 1920x600 (hero with overlay text)
- Menu item images: 800x600 (4:3 aspect ratio)
- Category headers: optional 1200x300 banners
- Checkout success: celebratory illustration

**Image Treatment:**
- Rounded corners: rounded-lg (8px) for cards
- Hover zoom effect on menu items: scale-105 transition
- Image overlays for text: gradient from transparent to black 50%

## Unique Features

**Theme Customization Panel:**
- Live preview split screen
- Color picker with preset palettes
- Font pairing suggestions
- Layout density options (compact/comfortable/spacious)

**Embed Code Generator:**
- Code block with syntax highlighting
- One-click copy button
- iframe and script tag options
- Configuration parameters (theme, categories to show)

**Order Management Dashboard:**
- Kanban-style columns: New → Preparing → Ready → Completed
- Real-time status updates (WebSocket or polling)
- Sound/notification for new orders
- Print receipt button per order

## Interaction Patterns

**Animations:** Minimal and purposeful
- Page transitions: fade-in (200ms)
- Modal entrances: slide-up with fade (300ms)
- Success states: checkmark animation (500ms)
- Loading states: skeleton screens, not spinners

**Feedback:**
- Toast notifications top-right for actions
- Inline validation on form fields (real-time)
- Disabled states with opacity-50 and cursor-not-allowed
- Loading buttons with spinner replacement

**Accessibility:**
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements
- Focus rings visible: ring-2 ring-primary ring-offset-2
- Color contrast ratios: 4.5:1 minimum for text

This dual-mode design ensures admin users have a powerful, efficient workspace while customers enjoy a modern, appetizing ordering experience.