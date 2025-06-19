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
- **Authentication**: Custom session-based auth as well as API key-based authentication for backend services
- **Package Manager**: pnpm
- **Code Quality**: Biome for linting and formatting
- **Templating Engine**: Handlebars for email templating

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database
- pnpm package manager
- Resend API key
- Stripe API key (`STRIPE_API_KEY`) for payment-related emails

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

Fill in the required environment variables in `.env`. Details about the expected values for each key is documented in `.env.example`.

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `RESEND_API_KEY`: Resend API key for email delivery
- `RESEND_EMAIL_FROM`: Sender email address
- `EMAIL_SERVICE_API_KEY`: API key for backend service authentication
- `CRON_SECRET`: Secret for cron job authentication
- `STRIPE_API_KEY`: Stripe API key for payment-related emails
- `NEXT_PUBLIC_BASE_DOMAIN`: Base domain for external URLs
- `NEXT_PUBLIC_SUPPORT_EMAIL`: Support email address

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

### Account Management

- `POST /account/verification-email` - Send verification link email
- `POST /account/password-reset-email` - Send password reset email
- `POST /account/insufficient-tokens` - Send insufficient tokens notification
- `POST /account/payment-activation` - Send payment activation email
- `POST /account/default-preferences` - Save default email preferences

### Email Types

- `GET /types` - List available email types
- `POST /types` - Create new email type

### Email Preferences

- `GET /preferences` - Get user email preferences
- `POST /preferences` - Update user email preferences
- `GET /default-preferences` - Get default email preferences

### Email Sending

- `POST /resend` - Resend the last sent email

### Cron Jobs

- `GET /cron/usage-reports` - Trigger usage reports cron job (protected by CRON_SECRET). It is expected in the Authorization Header as "Bearer CRON_SECRET"

### Admin
- `GET /admin/*` - Admin interface endpoints

### Error Reporting
- `POST /error-report` - Submit error reports

## Cron Jobs Schedule

The service includes automated cron jobs for usage reports:

- **Daily Reports**: Runs at 10:00 AM daily
- **Weekly Reports**: Runs at 10:00 AM every Monday
- **Monthly Reports**: Runs at 10:00 AM on the 1st of each month

Cron jobs are configured in `vercel.json` and require the `CRON_SECRET` environment variable for authentication. The time denotes UTC time

## Email Types

The service supports various email types organized by domain:

### Reports Domain
- `usage-reports` - Automated usage statistics
- `activity-updates` - User activity notifications

### Announcements Domain
- `product-updates` - Product feature updates
- `maintenance` - System maintenance notifications
- `company-news` - Company announcements

### Developers Domain
- `api-changes` - API change notifications
- `developer-resources` - Developer-focused content
- `security` - Security-related announcements

### Account Domain
- `billing` - Billing and payment notifications
- `insufficient_tokens_recording` - Token balance alerts
- `payment_activation` - Payment method activation

## Security

- **API Key Authentication**: Backend routes protected with `EMAIL_SERVICE_API_KEY`
- **Cron Secret**: Cron endpoints protected with `CRON_SECRET`
- **Security Headers**: Implements comprehensive security headers middleware
- **Request Logging**: Detailed request and error logging
- **Input Validation**: Zod-based request validation
- **Rate Limiting**: Configurable cooldown periods for email resending

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

The service is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration including cron job schedules.

### Environment Configuration

For production deployment, ensure all required environment variables are set in your Vercel project settings.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License