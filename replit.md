# Overview

This is a SWMM5 (Storm Water Management Model) educational web application built as a comprehensive learning platform for stormwater modeling concepts. The application provides interactive content about SWMM5's features, history, and implementation, designed to help users understand and learn stormwater management modeling principles.

The project uses a full-stack TypeScript architecture with React frontend and Express backend, featuring educational content management, progress tracking, and an integrated glossary system for technical terms.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming, including University of Florida brand colors (orange and blue)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Built-in session handling with PostgreSQL session store (connect-pg-simple)
- **API Design**: RESTful API endpoints for sections, glossary terms, and user progress
- **Development**: Hot reloading with Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL as the primary database
- **Schema**: Well-defined tables for users, SWMM sections, glossary terms, and user progress tracking
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Validation**: Zod schemas for runtime type validation integrated with Drizzle

## Authentication & Authorization
- **Session-based Authentication**: Traditional session management for user state
- **User Management**: User registration and login functionality with password storage
- **Progress Tracking**: Individual user progress tracking across educational sections

## Content Management
- **Educational Sections**: Structured content system for SWMM5 learning materials
- **Glossary System**: Interactive terminology definitions with hover tooltips
- **Progress Tracking**: Visual progress indicators and completion status
- **Search Functionality**: Content search capabilities across sections and glossary

## Development Environment
- **Hot Reloading**: Vite development server with HMR support
- **Error Handling**: Runtime error overlay for development debugging
- **Build Process**: Optimized production builds with code splitting
- **Type Safety**: Full TypeScript coverage across frontend and backend

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection**: Environment-based DATABASE_URL configuration

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible component primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **Drizzle Kit**: Database schema management and migration tool
- **ESBuild**: Fast bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Query and Form Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation and schema definition

## Styling and Design
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Component variant management
- **clsx**: Conditional className utility
- **date-fns**: Date manipulation and formatting

## Development Environment
- **TSX**: TypeScript execution for development
- **Replit Integration**: Platform-specific development tools and error handling