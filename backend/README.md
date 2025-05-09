# SemaChain Backend

This is the backend service for the SemaChain application, built with FastAPI.

## Features

- User authentication and authorization
- Organization management
- Knowledge base management
- Document management with tagging
- RESTful API endpoints
- SQLite database (can be configured to use other databases)

## Requirements

- Python 3.8+
- FastAPI
- SQLAlchemy
- Pydantic
- Python-Jose
- Passlib
- Uvicorn

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=sqlite:///./semachain.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000"]
API_V1_PREFIX=/api/v1
```

## Running the Application

Start the server with:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation at `/docs`
- ReDoc documentation at `/redoc`

## API Endpoints

### Authentication
- POST `/api/v1/login/access-token` - Get access token

### Users
- GET `/api/v1/users/` - List users
- POST `/api/v1/users/` - Create user
- GET `/api/v1/users/me` - Get current user
- PUT `/api/v1/users/me` - Update current user

### Organizations
- GET `/api/v1/organizations/` - List organizations
- POST `/api/v1/organizations/` - Create organization
- GET `/api/v1/organizations/{id}` - Get organization
- PUT `/api/v1/organizations/{id}` - Update organization

### Knowledge Bases
- GET `/api/v1/knowledge-bases/` - List knowledge bases
- POST `/api/v1/knowledge-bases/` - Create knowledge base
- GET `/api/v1/knowledge-bases/{id}` - Get knowledge base
- PUT `/api/v1/knowledge-bases/{id}` - Update knowledge base

### Documents
- GET `/api/v1/documents/` - List documents
- POST `/api/v1/documents/` - Create document
- GET `/api/v1/documents/{id}` - Get document
- PUT `/api/v1/documents/{id}` - Update document

## Development

### Project Structure

```
semachain-backend/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       └── endpoints/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   └── main.py
├── requirements.txt
└── .env
```

### Adding New Features

1. Create new models in `app/models/`
2. Create corresponding schemas in `app/schemas/`
3. Add new endpoints in `app/api/api_v1/endpoints/`
4. Update the API router in `app/api/api_v1/api.py`

## Testing

To run tests:

```bash
pytest
```

## License

This project is licensed under the MIT License. 