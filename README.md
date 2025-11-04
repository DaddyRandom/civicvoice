# Civic Voice Platform

> Empowering citizens to engage with their elected officials through secure, verified correspondence and community collaboration.

## Overview

Civic Voice is a comprehensive civic engagement platform that enables registered voters to create, send, and share formal correspondence with elected officials at all levels of government. The platform features voter verification, an official directory, letter creation with PDF generation, petition capabilities, and community collaboration features.

## Features

### Core Features (MVP - Phase 1)

- **User Authentication & Security**
  - User registration with email and phone
  - Two-Factor Authentication (2FA) with TOTP
  - JWT-based authentication with refresh tokens
  - Secure password hashing with bcrypt
  - Rate limiting and security headers

- **Voter Verification**
  - Multi-state voter registration verification
  - Address validation using USPS API
  - State-specific API integration support
  - Manual verification workflow for admin review
  - Confidence scoring system

- **Official Directory**
  - Federal officials (Congress) via ProPublica API
  - State and local officials via Google Civic Information API
  - Search by address to find representatives
  - Detailed official profiles with contact information
  - Photo, bio, and social media integration

- **Letter Creation & Management**
  - Professional letter templates (formal letter, memo)
  - Rich text editor for letter composition
  - Auto-population of official and sender information
  - PDF generation with proper formatting
  - Draft, send, and tracking workflow
  - Community letter sharing

### Database Schema

The platform uses PostgreSQL with the following core tables:

- `users` - User accounts with authentication
- `user_profiles` - Extended user information and addresses
- `voter_verification` - Voter registration verification records
- `officials` - Directory of elected officials
- `letters` - User correspondence to officials
- `petitions` - Community petitions
- `signatures` - Petition signatures
- `communities` - Regional and issue-based communities
- `community_members` - Community membership

## Technology Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Knex.js with migrations
- **Authentication:** JWT with 2FA (TOTP)
- **PDF Generation:** PDFKit
- **Validation:** Joi
- **Logging:** Winston

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **Development:** Hot-reload with nodemon and ts-node
- **Production:** Multi-stage Docker builds

### External APIs

- **Google Civic Information API** - Local and state officials
- **ProPublica Congress API** - Federal legislators
- **USPS Address Validation API** - Address standardization
- **Twilio** - SMS for 2FA (optional)
- **SendGrid** - Email delivery (optional)

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (recommended)
- **PostgreSQL** 15+ (if running without Docker)
- **Redis** 7+ (if running without Docker)

### Installation

#### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DaddyRandom/civicvoice.git
   cd civicvoice
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` and add your API keys and configuration.

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run migrate
   ```

5. **Access the API:**
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/api/health

#### Option 2: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DaddyRandom/civicvoice.git
   cd civicvoice
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up PostgreSQL:**
   ```bash
   createdb civicvoice_dev
   ```

4. **Start Redis:**
   ```bash
   redis-server
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials and API keys.

6. **Run migrations:**
   ```bash
   npm run migrate
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

### Configuration

#### Required Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicvoice_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

#### Optional API Keys

```env
# Google Civic Information API
GOOGLE_CIVIC_API_KEY=your-key-here

# ProPublica Congress API
PROPUBLICA_API_KEY=your-key-here

# USPS Address Validation
USPS_API_KEY=your-key-here

# Twilio (for SMS 2FA)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-number

# SendGrid (for email)
SENDGRID_API_KEY=your-key-here
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "phone": "+12125551234",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Setup 2FA
```http
POST /api/v1/auth/setup-2fa
Authorization: Bearer <access_token>
```

#### Enable 2FA
```http
POST /api/v1/auth/enable-2fa
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

### Voter Verification Endpoints

#### Submit Verification
```http
POST /api/v1/voter-verification
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "addressLine1": "123 Main St",
  "city": "Washington",
  "state": "DC",
  "zipCode": "20001"
}
```

#### Get Verification Status
```http
GET /api/v1/voter-verification/status
Authorization: Bearer <access_token>
```

### Officials Endpoints

#### Search by Address
```http
GET /api/v1/officials/search?address=1600+Pennsylvania+Ave+NW,+Washington,+DC+20500
```

#### Get My Officials
```http
GET /api/v1/officials/my/officials
Authorization: Bearer <access_token>
```

#### List Officials
```http
GET /api/v1/officials/list?level=federal&state=CA&limit=50&offset=0
```

#### Get Official by ID
```http
GET /api/v1/officials/:id
```

### Letter Endpoints

#### Create Letter
```http
POST /api/v1/letters
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "officialId": "uuid-here",
  "subject": "Support for Clean Energy Initiative",
  "body": "Dear Senator...",
  "letterType": "letter",
  "issueCategory": "environment",
  "visibility": "public"
}
```

#### Send Letter
```http
POST /api/v1/letters/:id/send
Authorization: Bearer <access_token>
```

#### Generate PDF
```http
POST /api/v1/letters/:id/pdf
Authorization: Bearer <access_token>
```

#### Get My Letters
```http
GET /api/v1/letters?status=sent&limit=20&offset=0
Authorization: Bearer <access_token>
```

#### Get Community Letters
```http
GET /api/v1/letters/community?issueCategory=healthcare&limit=20
```

## Project Structure

```
civicvoice/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── migrations/      # Database migrations
│   │   ├── models/          # (Future: Database models)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Helper functions
│   │   ├── validators/      # Request validation schemas
│   │   └── index.ts         # Application entry point
│   ├── uploads/             # Generated PDFs and uploads
│   ├── logs/                # Application logs
│   ├── .env.example         # Environment template
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Dependencies
│   ├── knexfile.ts          # Database configuration
│   ├── Dockerfile           # Production container
│   └── Dockerfile.dev       # Development container
├── frontend/                # (Future: React frontend)
├── mobile/                  # (Future: React Native app)
├── shared/                  # (Future: Shared types and utilities)
├── docs/                    # Documentation
├── docker/                  # Docker configurations
├── docker-compose.yml       # Development environment
├── .gitignore
└── README.md
```

## Development

### Database Migrations

Create a new migration:
```bash
npx knex migrate:make migration_name
```

Run migrations:
```bash
npm run migrate
```

Rollback last migration:
```bash
npm run migrate:rollback
```

### Seeding Data

Create seed files in `backend/src/seeds/` and run:
```bash
npm run seed
```

### Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Security Features

- **Password Security:** Bcrypt hashing with configurable salt rounds
- **JWT Authentication:** Short-lived access tokens with refresh token rotation
- **Two-Factor Authentication:** TOTP-based 2FA with QR code setup
- **Rate Limiting:** Protects against brute force and DDoS attacks
- **Input Validation:** Joi schemas validate all user input
- **SQL Injection Protection:** Parameterized queries via Knex
- **XSS Protection:** Helmet.js security headers
- **CORS:** Configurable cross-origin resource sharing
- **Session Management:** Redis-based session storage

## Deployment

### Production Build

1. **Build Docker image:**
   ```bash
   docker build -t civicvoice-backend:latest ./backend
   ```

2. **Run production container:**
   ```bash
   docker run -d \
     -p 5000:5000 \
     --env-file backend/.env.production \
     civicvoice-backend:latest
   ```

### Environment Considerations

- Use strong, randomly generated secrets for JWT
- Enable HTTPS/TLS in production
- Configure proper CORS origins
- Set up log aggregation (e.g., ELK stack)
- Enable automated backups for PostgreSQL
- Use managed Redis for high availability
- Configure AWS S3 or equivalent for file storage
- Set up monitoring and alerting

## Roadmap

### Phase 1: MVP (Current)
- ✅ Authentication with 2FA
- ✅ Voter verification system
- ✅ Official directory with API integrations
- ✅ Letter creation and PDF generation
- ⏳ Basic petition system

### Phase 2: Enhancement (Q2 2024)
- React frontend application
- React Native mobile apps
- Email delivery integration
- Fax delivery for offices without email
- Community features and forums
- Letter templates library
- Response tracking

### Phase 3: Advanced Features (Q3 2024)
- All 50 states voter verification
- Comprehensive local official coverage
- Advanced analytics dashboard
- Translation services
- Bill tracking integration
- Town hall calendar
- Voting record analysis

### Phase 4: Scale & Optimize (Q4 2024)
- White-label versions for organizations
- Public API for third-party developers
- Real-time collaboration features
- Mobile push notifications
- Advanced search and filtering
- Machine learning for letter suggestions

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure code passes linting

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues:** https://github.com/DaddyRandom/civicvoice/issues
- **Discussions:** https://github.com/DaddyRandom/civicvoice/discussions
- **Email:** support@civicvoice.org (TBD)

## Acknowledgments

- **Google Civic Information API** for official data
- **ProPublica** for Congress data
- **Open States** for state legislature data
- All contributors and civic tech organizations

## Disclaimer

Civic Voice is a citizen engagement platform and is not affiliated with any government entity. Letters generated through this platform are citizen correspondence and not official government documents.

---

**Built with ❤️ for democracy and civic engagement**
