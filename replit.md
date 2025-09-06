# Overview

ReportFlow is an intelligent project management reporting automation platform that connects to various project management tools (Trello, GitHub, Asana) and automatically generates comprehensive reports. The system features smart automation rules, user behavior learning, and adaptive reporting based on team patterns and preferences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing with pages for Dashboard, Reports, Integrations, and Automation
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui styling system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Development**: Hot module replacement with Vite middleware in development mode

## Data Storage Architecture
- **Database**: PostgreSQL with Neon serverless hosting for scalable data persistence
- **Schema Design**: 
  - Projects table for storing connected project management data
  - Reports table for generated report metadata and file paths
  - Integrations table for third-party API configurations
  - Team members table for user management and project assignments
  - Automation rules table for learned behavior patterns
  - User behaviors table for machine learning data collection
- **Storage Pattern**: Repository pattern with interface abstraction for easy testing and potential storage backend changes

## Business Logic Services
- **Report Generator**: Handles asynchronous report generation with status tracking (pending, generating, completed, failed)
- **Learning Engine**: Analyzes user behavior patterns to automatically create and adjust automation rules
- **Scheduler**: Manages automated report generation on configurable schedules (weekly, monthly, sprint-based)
- **Behavior Tracking**: Collects user interaction data for machine learning insights

## Authentication & Security
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- Environment variable configuration for sensitive data like database URLs and API keys
- Input validation at both client and server levels using shared Zod schemas

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration management and schema synchronization

## Project Management Integrations
- **Trello API**: Card and board data synchronization
- **GitHub API**: Repository, issues, and pull request tracking  
- **Asana API**: Task and project progress monitoring

## Development Tools
- **Replit**: Cloud development environment with live preview and collaborative features
- **Vite**: Build tool with HMR and optimized production builds
- **ESBuild**: Fast TypeScript compilation for server-side code

## UI & Styling
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Font Awesome**: Icon library for consistent visual elements
- **Google Fonts**: Inter font family for modern typography

## State Management & API
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form state management with minimal re-renders
- **Zod**: Runtime type validation and schema definition