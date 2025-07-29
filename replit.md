# Advanced AI Chat Application with Authentication

## Overview

This is a comprehensive full-stack TypeScript application featuring an advanced chat interface with user authentication, personal API key management, message editing, and modern UI. Users can have personalized conversations with AI assistants powered by Google's free Gemini API.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 29, 2025)

✓ Implemented Google OAuth authentication replacing Replit Auth
✓ Added PostgreSQL database with user profiles and message persistence  
✓ Created responsive navigation sidebar with settings and Profile Menu
✓ Added personal API key management with AES-256 encryption for security
✓ Implemented message copy and edit functionality with dropdown menus
✓ Fixed text wrapping issues for long messages and code blocks
✓ Added modern landing page with Google Login button
✓ Enhanced chat UI with subtle, less flashy colors and better styling
✓ Implemented character-by-character typing animation for AI responses
✓ Created dedicated Profile Menu with user avatar and settings access

## Latest Major Features (January 29, 2025)

✓ **Multiple Chat Management** - Create, manage, and switch between separate chat conversations
✓ **Advanced File Upload System** - Upload and attach images, PDFs, documents, and other files to messages
✓ **Complete Profile Management** - Edit name, upload profile photos from device gallery or URL
✓ **Dynamic Color Themes** - Choose between blue, green, and red color schemes that transform the entire UI
✓ **Professional Animations** - Smooth transitions, hover effects, typing indicators, and mobile-optimized interactions
✓ **Fully Responsive Design** - Optimized for Mobile, PC, Mac, Laptop with touch-friendly targets and mobile backdrop
✓ **Auto-Chat Creation** - Automatically creates new chats when starting conversations
✓ **Enhanced User Experience** - Mobile sidebar with backdrop, improved touch targets, and device-specific optimizations
✓ **Complete Admin Panel** - Comprehensive admin dashboard for managing users, global settings, and activity logs

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, served from the `client` directory
- **Backend**: Express.js server with TypeScript, located in the `server` directory
- **Shared**: Common types and schemas in the `shared` directory
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Directory Structure

```
├── client/          # React frontend application
├── server/          # Express.js backend server
├── shared/          # Shared types and database schemas
├── migrations/      # Database migration files
└── dist/           # Built application files
```

## Key Components

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **API Style**: RESTful endpoints under `/api` prefix
- **Data Storage**: PostgreSQL database with Drizzle ORM
- **AI Integration**: Google Gemini API for generating intelligent chat responses
- **Authentication**: Google OAuth 2.0 with secure session management
- **Security**: AES-256 encryption for API key storage
- **Middleware**: Request logging, authentication, and error handling

### Database Schema

The application uses Drizzle ORM with a PostgreSQL dialect. The main entities are:

- **Users Table**: Stores user profiles with Google OAuth data, encrypted API keys, theme preferences, admin status, and profile images
- **Chats Table**: Manages multiple conversation threads with titles and timestamps
- **Messages Table**: Stores chat messages linked to specific chats with content, role (user/assistant), and timestamps
- **Sessions Table**: Handles secure authentication sessions
- **Global Settings Table**: Stores application-wide configuration settings for admin management
- **Admin Logs Table**: Tracks all admin actions and system events for security and auditing
- **Schema Validation**: Zod schemas for runtime type checking and validation

## Data Flow

1. User submits a message through the React frontend
2. Frontend sends POST request to `/api/messages` endpoint
3. Backend validates the message using Zod schema
4. User message is stored in the database
5. Backend calls OpenAI API to generate AI response
6. AI response is stored as a separate message
7. Frontend refetches messages to display the conversation
8. Real-time updates handled through TanStack Query invalidation

## External Dependencies

### Core Technologies
- **React**: Frontend framework
- **Express**: Backend server framework
- **Drizzle ORM**: Database toolkit and ORM
- **Neon Database**: Serverless PostgreSQL provider
- **OpenAI**: AI chat completion API

### UI/UX Libraries
- **shadcn/ui**: Component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development
- Frontend served by Vite development server
- Backend runs with tsx for TypeScript execution
- Hot module replacement and real-time error overlays

### Production Build
- Frontend built to `dist/public` using Vite
- Backend bundled to `dist/index.js` using ESBuild
- Static files served by Express in production
- Environment-based configuration for database and API keys

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Environment mode (development/production)

### Key Architectural Decisions

1. **Monorepo Structure**: Chosen for code sharing between client and server, especially for TypeScript types and validation schemas

2. **In-Memory Storage**: Currently implemented for simplicity, but infrastructure is in place for PostgreSQL migration via Drizzle ORM

3. **shadcn/ui Component System**: Provides consistent, accessible UI components with full customization control

4. **TanStack Query**: Handles server state, caching, and optimistic updates for better user experience

5. **Zod Validation**: Ensures type safety and data validation across the entire stack

6. **OpenAI Integration**: Uses GPT-4o model for high-quality AI responses with configurable parameters