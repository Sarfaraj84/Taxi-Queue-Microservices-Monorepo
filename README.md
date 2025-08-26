# Taxi Queue Microservices Monorepo

A microservices-based taxi queue management system built with Node.js and Docker.

## Architecture

This monorepo contains the following microservices:

- **API Gateway**: Central entry point for all requests
- **Auth Service**: Authentication and authorization
- **User Service**: User management and profiles
- **Queue Service**: Taxi queue management
- **Geo Service**: Location and geofencing services
- **Payment Service**: Payment processing with Stripe
- **Vehicle Service**: Vehicle management
- **Config Service**: System configuration

## Development

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taxi-queue-microservices.git
cd taxi-queue-microservices

# Install root dependencies
npm install

# Install all service dependencies (using workspaces)
npm run install:all
```
