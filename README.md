# MenuMaster

MenuMaster is a comprehensive, full-stack solution for restaurant menu management. It provides a powerful admin interface for menu creation and a seamless, interactive menu for customers, complete with real-time ordering capabilities.

## Features

-   **Dynamic Menu Builder:** Admins can create and manage categories, menu items, and complex item modifications (e.g., sizes, toppings) with a user-friendly interface.
-   **Interactive Customer Menu:** A clean, responsive, and interactive menu for customers to browse items, customize their orders, and add them to a cart.
-   **Real-time Price Updates:** The total price in the customization dialog and cart updates in real-time as options are selected.
-   **Object Storage for Images:** Uses MinIO for robust and scalable storage of menu item images.
-   **Dockerized Environment:** The entire application stack (app, database, object storage) is containerized with Docker for easy setup and consistent development/production environments.
-   **Modern Tech Stack:** Built with TypeScript, React, Node.js, and other modern libraries for a robust and maintainable codebase.

## Tech Stack

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Query
-   **Backend:** Node.js, Express, TypeScript
-   **Database:** PostgreSQL with Drizzle ORM
-   **Object Storage:** MinIO (S3-compatible)
-   **Deployment:** Docker

## Getting Started

Follow these instructions to get a local development environment up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [Docker](https://www.docker.com/get-started) and Docker Compose

### 1. Clone the Repository

```bash
git clone <repository-url>
cd menumaster
```

### 2. Set Up Environment Variables

The application uses Docker Compose to manage services and environment variables. The necessary variables are already defined in the `docker-compose.yml` file for development. No `.env` file is required to get started locally.

The key services are:
-   **`app`**: The main Node.js application, accessible on `http://localhost:1234`.
-   **`postgres`**: The PostgreSQL database, accessible on port `5433`.
-   **`minio`**: The MinIO object storage, with its UI accessible at `http://localhost:9003`.

### 3. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 4. Launch the Application

Start all services using Docker Compose:

```bash
docker-compose up --build
```

This command will:
1.  Build the Docker image for the application.
2.  Start the application, database, and object storage containers.
3.  Automatically apply any database migrations via `npm run db:push`.
4.  Start the development server via `npm run start`.

The application will be available at `http://localhost:1234`.

### 5. Accessing Services

-   **Application:** `http://localhost:1234`
-   **MinIO Console (Object Storage):** `http://localhost:9003`
    -   **User:** `minioadmin`
    -   **Password:** `minioadmin`
-   **PostgreSQL Database:** Connect on port `5433`
    -   **User:** `postgres`
    -   **Password:** `postgres`
    -   **Database:** `menumaster`

## Project Scripts

-   `npm run dev`: Starts the application in development mode with hot-reloading.
-   `npm run build`: Builds the frontend and backend for production.
-   `npm run start`: Starts the production server (expects a build to be present).
-   `npm run db:push`: Pushes schema changes to the database using Drizzle Kit.
-   `npm run check`: Runs the TypeScript compiler to check for type errors.

## Project Structure

```
.
├── client/         # Frontend React application (Vite)
│   ├── src/
│   └── ...
├── server/         # Backend Node.js application (Express)
│   ├── index.ts    # Main server entry point
│   ├── routes.ts   # API route definitions
│   ├── storage.ts  # Database interaction logic (Drizzle ORM)
│   └── ...
├── shared/         # TypeScript types and schemas shared between client and server
│   └── schema.ts   # Drizzle ORM schema definitions
├── docker-compose.yml # Defines and configures all application services
└── package.json    # Project dependencies and scripts
```
