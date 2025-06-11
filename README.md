<p align="center"><a href="https://discord.com/invite/dsvFgDTr6c"><img height="60px" src="https://user-images.githubusercontent.com/31022056/158916278-4504b838-7ecb-4ab9-a900-7dc002aade78.png" alt="Join our Discord!"></a></p>

# Meeting BaaS Email Service

A robust email service built with Hono, TypeScript, and PostgreSQL, designed to handle various types of email communications with customizable preferences and templates.

## Features

- Email type management with customizable templates
- User preferences for email frequency and types
- Email logging and tracking
- Error reporting system
- Admin interface for managing email settings
- Integration with Resend for email delivery
- Secure authentication and session management
- Database-driven configuration

## Tech Stack

- **Framework**: Hono (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Email Provider**: Resend
- **Authentication**: Custom session-based auth
- **Package Manager**: pnpm
- **Code Quality**: Biome for linting and formatting

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database
- pnpm package manager
- Resend API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Meeting-BaaS/emails email-service
cd email-service
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:

```bash
cp .env.example .env
```

Fill in the required environment variables in `.env`. Details about the expected values for each key is documented in .env.example

4. Set up the database:

```bash
pnpm db:generate  # Generate database migrations
pnpm db:push     # Apply migrations to the database
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the project
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push database changes
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:introspect` - Introspect database schema

## API Endpoints

### Email Types
- `GET /types` - List available email types
- `POST /types` - Create new email type

### Email Preferences
- `GET /preferences` - Get user email preferences
- `POST /preferences` - Update user email preferences
- `GET /default-preferences` - Get default email preferences

### Email Sending
- `POST /resend` - Resend the last sent email

### Admin
- `GET /admin/*` - Admin interface endpoints

### Error Reporting
- `POST /error-report` - Submit error reports

## Database Schema

The service uses several key tables:
- `email_logs` - Tracks all sent emails
- `email_preferences` - User preferences for email types
- `email_content` - Email templates and content
- `accounts` - User account information
- `sessions` - User session management

## Security

- Implements security headers middleware
- Session-based authentication
- Request logging
- Error handling middleware
- Input validation using Zod

## Development

1. Start the development server:

```bash
pnpm dev
```

2. The server will be available at `http://localhost:3010`

3. For database management, use Drizzle Studio:

```bash
pnpm db:studio
```

## Deployment

The service is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License