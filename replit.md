# Overview

Sandwich Asere is a Cuban restaurant web application that allows customers to browse authentic Cuban food menu items, add products to a shopping cart, and contact the restaurant. The application features a complete catalog of Cuban dishes including sandwiches, main plates, beverages, and desserts, with an interactive shopping cart system and contact form functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: Vanilla HTML, CSS, and JavaScript without any frameworks
- **Modular JavaScript**: Organized into separate modules for different concerns:
  - `main.js`: Application entry point and initialization
  - `products.js`: Product catalog management and filtering
  - `cart.js`: Shopping cart functionality with localStorage persistence
  - `ui.js`: UI components and interactions management
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox layouts
- **Color System**: Consistent design using CSS custom properties with Cuban-inspired palette (green #46C47B, orange #FF914C, cream #FDFFD0)

## Backend Architecture
- **Framework**: FastAPI for Python-based REST API
- **Data Models**: Pydantic models for type validation and serialization
- **In-Memory Storage**: Product catalog stored as static data arrays (no database currently)
- **API Design**: RESTful endpoints for products, categories, contact messages, and health checks
- **CORS Configuration**: Configured to allow frontend-backend communication

## Key Features
- **Product Catalog**: Filterable by category (sandwiches, main dishes, beverages, desserts) with search functionality
- **Shopping Cart**: Persistent cart using localStorage with add/remove items and quantity management
- **Contact System**: Form submission with email validation
- **Responsive UI**: Mobile-friendly design with smooth animations and transitions

## Data Flow
- Frontend fetches product data from FastAPI backend
- Cart state is managed client-side with localStorage persistence
- Contact form submissions are processed through the backend API
- All API communications use modern fetch API with error handling

# External Dependencies

## Frontend Dependencies
- **Google Fonts**: Poppins and Inter font families for typography
- **Browser APIs**: localStorage for cart persistence, fetch API for HTTP requests

## Backend Dependencies
- **FastAPI**: Web framework for API development
- **Pydantic**: Data validation and serialization
- **CORS Middleware**: Cross-origin resource sharing support

## Development Dependencies
- **Python 3.7+**: Required for FastAPI and Pydantic
- **Static File Serving**: FastAPI's StaticFiles for serving frontend assets

## Missing Integrations
- **Database**: Currently uses in-memory data storage (could be enhanced with Postgres/Drizzle)
- **Payment Processing**: No payment gateway integration implemented
- **Email Service**: Contact form submissions not connected to email service
- **Image Storage**: Product images referenced by path but not stored in repository