# AI Chat Application

A modern, full-stack AI chat application with user authentication, multiple chat management, and personalized AI conversations powered by Google's Gemini API.

## Features

- **User Authentication**: Secure Google OAuth 2.0 login
- **Multiple Chats**: Create and manage separate conversation threads
- **File Uploads**: Attach images, PDFs, and documents to messages
- **Profile Management**: Customize profile with photos and themes
- **Dynamic Themes**: Choose between blue, green, and red color schemes
- **Message Editing**: Edit and copy messages with dropdown menus
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Admin Panel**: Comprehensive admin dashboard for user management
- **Real-time Typing**: Character-by-character AI response animation

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Google OAuth 2.0** authentication
- **AES-256** encryption for API keys
- **Google Gemini API** for AI responses

## Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- Gemini API key

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Installation
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Deployment

### Build Commands
```bash
npm install
npm run build
npm start
```

### Database Migration
The application automatically creates database tables on first run.

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and configurations
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and validation
└── dist/                # Built application
```

## API Endpoints

- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/logout` - User logout
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id` - Edit message
- `PUT /api/profile` - Update user profile

## Database Schema

- **users**: User profiles with OAuth data and preferences
- **chats**: Chat conversations with titles and metadata
- **messages**: Individual messages linked to chats
- **sessions**: Authentication session management
- **global_settings**: Application-wide configuration
- **admin_logs**: Admin action tracking

## Features in Detail

### Authentication System
- Secure Google OAuth 2.0 integration
- Session-based authentication with PostgreSQL storage
- Automatic user profile creation

### Chat Management
- Create multiple separate conversations
- Auto-generated chat titles
- Message history persistence
- Real-time message updates

### File Upload System
- Support for images, PDFs, and documents
- Secure file handling and storage
- File preview and management

### Admin Panel
- User management dashboard
- Global settings configuration
- Activity logging and monitoring
- Admin role assignment

### Theme System
- Dynamic color scheme switching
- Persistent theme preferences
- Mobile-optimized design

## License

This project is available for educational and personal use.

## Support

For deployment questions or technical support, refer to the deployment guides included in the project.