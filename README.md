# Blog API - Full Stack Project

A comprehensive blog platform built with Django REST Framework and PostgreSQL. Includes a React frontend with Bootstrap 5.

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - REST API toolkit
- **PostgreSQL** - Database
- **Python 3.9+** - Programming language

### Frontend (Coming Soon)
- **React** - UI library
- **Bootstrap 5** - CSS framework
- **Axios** - HTTP client

## Features

### Core Features
- ✅ User authentication and registration
- ✅ Create, read, update, delete blog posts
- ✅ Categories and tags for post organization
- ✅ Comments with nested replies
- ✅ User profiles with social links
- ✅ Post publishing workflow (draft → published)
- ✅ Search and filtering capabilities
- ✅ Rate limiting and throttling
- ✅ CORS support for frontend integration

### Admin Features
- ✅ Django admin interface
- ✅ Comprehensive dashboard
- ✅ User management
- ✅ Comment moderation

## Project Structure

```
blog-api/
├── blog/                  # Project settings
│   ├── settings.py       # Django configuration
│   ├── urls.py          # URL routing
│   ├── wsgi.py          # WSGI configuration
│   └── __init__.py
├── api/                   # Main application
│   ├── models.py        # Database models
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views
│   ├── permissions.py   # Custom permissions
│   ├── admin.py         # Admin configuration
│   └── apps.py
├── frontend/             # React frontend (coming soon)
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Installation

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip and virtualenv
- Node.js 14+ (for frontend)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-api
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Create PostgreSQL database**
   ```bash
   createdb blog_db
   createuser blog_user
   # Set password and configure permissions in PostgreSQL
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

9. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/v1/`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user

### Posts
- `GET /api/v1/posts/` - List all posts
- `POST /api/v1/posts/` - Create new post (authenticated)
- `GET /api/v1/posts/{slug}/` - Get post details
- `PUT /api/v1/posts/{slug}/` - Update post (author only)
- `DELETE /api/v1/posts/{slug}/` - Delete post (author only)
- `POST /api/v1/posts/{slug}/publish/` - Publish draft post
- `POST /api/v1/posts/{slug}/increment_views/` - Increment view count
- `GET /api/v1/posts/{slug}/comments/` - Get post comments

### Categories
- `GET /api/v1/categories/` - List all categories
- `POST /api/v1/categories/` - Create category (authenticated)
- `GET /api/v1/categories/{slug}/` - Get category details
- `GET /api/v1/categories/{slug}/posts/` - Get category posts

### Comments
- `GET /api/v1/comments/` - List comments
- `POST /api/v1/comments/` - Create comment (authenticated)
- `PUT /api/v1/comments/{id}/` - Update comment
- `DELETE /api/v1/comments/{id}/` - Delete comment
- `POST /api/v1/comments/{id}/approve/` - Approve comment (post author only)

### Users
- `GET /api/v1/users/` - List users
- `GET /api/v1/users/{id}/` - Get user details
- `GET /api/v1/users/{id}/posts/` - Get user's posts

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_NAME=blog_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## Testing

Run the test suite:

```bash
python manage.py test
```

## Database Models

### User (Django built-in)
- Represents blog authors and commenters

### UserProfile
- Extended user information
- Bio, avatar, social links

### Category
- Post categories
- Slug for URL-friendly names

### Post
- Blog post content
- Status: draft, published, archived
- Featured image support
- View counter

### Comment
- Post comments
- Status: pending, approved, rejected
- Nested replies support

### Tag
- Post tags for categorization
- Many-to-many relationship with posts

## Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in `.env`
- [ ] Generate a strong `SECRET_KEY`
- [ ] Configure allowed hosts
- [ ] Set up HTTPS/SSL
- [ ] Configure email backend
- [ ] Set up logging
- [ ] Configure static files serving
- [ ] Set up database backups
- [ ] Configure monitoring

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please create a GitHub issue.
