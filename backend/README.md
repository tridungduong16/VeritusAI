# Digital Co-worker Agent

A FastAPI-based AI agent platform for document processing, PDF parsing, and intelligent chat functionality using LangChain, OpenAI, and Qdrant vector database.

## Features

- **PDF Document Processing**: Parse PDFs and extract tables using advanced document processing
- **AI-Powered Chat**: Interactive chat functionality with OpenAI integration
- **Vector Database**: Qdrant integration for semantic search and document retrieval
- **Document Upload**: File upload capabilities with support for various formats
- **FastAPI Integration**: Modern async API with automatic documentation
- **Production Ready**: Containerized deployment with Fly.io support

## Prerequisites

- Python 3.13+
- uv package manager
- Docker (for containerized deployment)
- Fly.io CLI (for production deployment)

## Local Development Setup

### 1. Install uv Package Manager

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Clone and Setup Project

```bash
git clone <your-repo-url>
cd digital-co-worker
```

### 3. Install Dependencies

```bash
uv sync
```

### 4. Environment Configuration

Create a `.env` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL_NAME=gpt-4o-2024-11-20

# Claude Configuration (Optional)
CLAUDE_KEY=your_claude_api_key

# Qdrant Vector Database
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_URL=your_qdrant_url
QDRANT_COLLECTION_NAME=brochure

# AWS Configuration (for S3 integration)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

### 5. Run Locally

```bash
uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8010 --reload
```

### 6. Access the Application

- **API Documentation**: http://localhost:8010/docs
- **ReDoc Documentation**: http://localhost:8010/redoc
- **Health Check**: http://localhost:8010/

## Live Production Application

The application is currently deployed and running at:
- **Main App**: https://digital-co-worker.fly.dev/
- **API Documentation**: https://digital-co-worker.fly.dev/docs
- **ReDoc Documentation**: https://digital-co-worker.fly.dev/redoc

## Running Instructions

### Local Development

#### Quick Start (Recommended)
```bash
# 1. Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Navigate to project directory
cd digital-co-worker

# 3. Install dependencies
uv sync

# 4. Create .env file with your API keys (see Environment Configuration section)

# 5. Run the application
uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8010 --reload
```

#### Step-by-Step Local Setup

1. **Install Dependencies**
   ```bash
   # Install uv package manager
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Install project dependencies
   uv sync
   ```

2. **Configure Environment**
   ```bash
   # Create .env file
   cp .env.example .env  # if available, or create manually
   
   # Edit .env file with your API keys
   nano .env  # or use your preferred editor
   ```

3. **Start the Application**
   ```bash
   # Development mode with auto-reload
   uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8010 --reload
   
   # Production mode (no auto-reload)
   uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8010
   ```

4. **Verify Installation**
   ```bash
   # Check if app is running
   curl http://localhost:8010/
   
   # Should return: {"message": "AI Agent platform is running v1!", "datetime": "..."}
   ```

5. **Access the Application**
   - **Main App**: http://localhost:8010/
   - **Interactive API Docs**: http://localhost:8010/docs
   - **Alternative API Docs**: http://localhost:8010/redoc

### Docker Development (Alternative)

```bash
# Build the Docker image
docker build -t digital-co-worker .

# Run with environment file
docker run --env-file .env -p 8010:8080 digital-co-worker

# Or run with individual environment variables
docker run -e OPENAI_API_KEY="your_key" -p 8010:8080 digital-co-worker
```

## Production Deployment with Fly.io

### Prerequisites for Deployment
- Fly.io account (sign up at https://fly.io)
- All required API keys and credentials
- Docker installed (for local testing)

### Automated Deployment (Recommended)

Use the provided deployment script for easy deployment:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the automated deployment
./deploy.sh
```

The script will:
- Check if Fly.io CLI is installed
- Verify authentication
- Set environment variables from .env file
- Deploy the application
- Show deployment status

### Manual Deployment Steps

#### Step 1: Install Fly.io CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Verify Installation:**
```bash
flyctl version
```

#### Step 2: Authenticate with Fly.io

```bash
fly auth login
```
This will open a browser window for authentication.

#### Step 3: Initialize Fly.io App (First Time Only)

```bash
cd digital-co-worker
fly launch --no-deploy
```

This creates the `fly.toml` configuration file.

#### Step 4: Set Environment Variables as Secrets

**Option A: Import from .env file (Recommended)**
```bash
fly secrets import < .env
```

**Option B: Set individual secrets**
```bash
# OpenAI Configuration
fly secrets set OPENAI_API_KEY="your_openai_api_key"
fly secrets set OPENAI_MODEL_NAME="gpt-4o-2024-11-20"

# Claude Configuration (Optional)
fly secrets set CLAUDE_KEY="your_claude_api_key"

# Qdrant Vector Database
fly secrets set QDRANT_API_KEY="your_qdrant_api_key"
fly secrets set QDRANT_URL="your_qdrant_url"
fly secrets set QDRANT_COLLECTION_NAME="brochure"

# AWS Configuration
fly secrets set AWS_ACCESS_KEY_ID="your_aws_access_key"
fly secrets set AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
fly secrets set AWS_REGION="your_aws_region"
fly secrets set AWS_BUCKET_NAME="your_bucket_name"
```

**Verify Secrets:**
```bash
fly secrets list
```

#### Step 5: Deploy to Production

```bash
# Deploy with cache
fly deploy

# Deploy without cache (if issues occur)
fly deploy --no-cache

# Deploy with verbose output
fly deploy --verbose
```

#### Step 6: Monitor and Verify Deployment

```bash
# Check deployment status
fly status

# View real-time logs
fly logs

# Check if app is responding
curl https://your-app-name.fly.dev/

# Open the deployed app in browser
fly apps open
```

### Post-Deployment Verification

1. **Test Health Endpoint**
   ```bash
   curl https://digital-co-worker.fly.dev/
   ```

2. **Test API Documentation**
   - Visit: https://digital-co-worker.fly.dev/docs

3. **Check Application Logs**
   ```bash
   fly logs --app digital-co-worker
   ```

4. **Verify All Services**
   - FastAPI server running
   - Qdrant database connected
   - AI models loaded
   - All endpoints responding

### Deployment Configuration

The application is configured with:
- **Region**: Sydney (syd) - closest to Australia
- **Memory**: 4GB RAM
- **CPU**: 4 shared cores
- **Auto-scaling**: Enabled (0 minimum, auto-start on requests)
- **HTTPS**: Automatically enabled
- **Port**: 8080 (internal), 443/80 (external)

### Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI functionality | Yes |
| `OPENAI_MODEL_NAME` | OpenAI model to use | Yes |
| `QDRANT_API_KEY` | Qdrant vector database API key | Yes |
| `QDRANT_URL` | Qdrant database URL | Yes |
| `QDRANT_COLLECTION_NAME` | Collection name in Qdrant | Yes |
| `CLAUDE_KEY` | Claude API key (optional) | No |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `AWS_BUCKET_NAME` | S3 bucket name | Yes |

## Fly.io Management Commands

### Application Management

```bash
# List all your apps
fly apps list

# Show app status
fly status

# Show app information
fly info

# Restart the app
fly restart

# Scale the app
fly scale count 2

# Scale memory
fly scale memory 2048

# Scale CPU
fly scale vm shared-cpu-2x
```

### Deployment Commands

```bash
# Deploy the app
fly deploy

# Deploy with specific Dockerfile
fly deploy --dockerfile Dockerfile

# Deploy without cache
fly deploy --no-cache

# Deploy and watch logs
fly deploy --verbose
```

### Secrets Management

```bash
# List all secrets
fly secrets list

# Set a secret
fly secrets set SECRET_NAME="secret_value"

# Remove a secret
fly secrets unset SECRET_NAME

# Import secrets from .env file
fly secrets import < .env
```

### Monitoring and Debugging

```bash
# View real-time logs
fly logs

# View logs with filtering
fly logs --app digital-co-worker

# SSH into the running machine
fly ssh console

# Execute commands in the running app
fly ssh console --command "ls -la"

# Check machine status
fly machine list

# Restart a specific machine
fly machine restart <machine-id>
```

### Configuration Management

```bash
# Validate fly.toml configuration
fly config validate

# Show current configuration
fly config show

# Save current configuration
fly config save
```

### Volume Management (if needed)

```bash
# List volumes
fly volumes list

# Create a volume
fly volumes create data --size 10

# Destroy a volume
fly volumes destroy <volume-id>
```

### Database and Add-ons

```bash
# List available add-ons
fly extensions list

# Create a PostgreSQL database
fly postgres create

# Connect to PostgreSQL
fly postgres connect
```

## API Endpoints

### Health Check
- **GET** `/` - Returns platform status and current datetime

### Document Processing
- **POST** `/pdf_parser` - Parse PDF documents and extract tables
- **POST** `/upload` - Upload PDF files for processing

### AI Chat
- **POST** `/chat` - Interactive chat with the AI agent

## Project Structure

```
digital-co-worker/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── agent.py             # AI agent implementation
│   ├── app_config.py        # Application configuration
│   ├── orchestrator.py      # Business logic orchestration
│   ├── prompts.py           # AI prompts and templates
│   ├── schema.py            # Pydantic models and schemas
│   └── database_handler/    # Database and document processing
│       ├── __init__.py
│       ├── chunk_document.py
│       ├── docling_handler.py
│       ├── document_parser.py
│       ├── embedding_handler.py
│       ├── image_processor.py
│       ├── qdrant_connector.py
│       └── search_handler.py
├── .env                     # Environment variables (local)
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── Dockerfile              # Container configuration
├── fly.toml                # Fly.io deployment configuration
├── pyproject.toml          # Python project configuration
├── uv.lock                 # Dependency lock file
├── config.yaml             # Application configuration
└── README.md               # This file
```

## Security Considerations

- All sensitive data is stored as Fly.io secrets
- HTTPS is enforced in production
- CORS is configured for secure cross-origin requests
- Environment variables are never committed to version control

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   fly logs
   fly status
   ```

2. **Environment Variables Not Set**
   ```bash
   fly secrets list
   fly secrets set VARIABLE_NAME="value"
   ```

3. **Memory Issues**
   ```bash
   fly scale memory 4096
   ```

4. **Connection Issues**
   ```bash
   fly status
   fly restart
   ```

### Debug Commands

```bash
# Check app health
fly checks list

# View machine metrics
fly machine list

# SSH into the app for debugging
fly ssh console

# Check resource usage
fly status --all
```

## Development Workflow

1. **Local Development**
   ```bash
   uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8010 --reload
   ```

2. **Testing**
   - Access http://localhost:8010/docs for API testing
   - Use the interactive Swagger UI to test endpoints

3. **Deployment**
   ```bash
   fly deploy
   fly logs
   fly open
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Deploy to a staging environment
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [Fly.io documentation](https://fly.io/docs/)
- Review the application logs: `fly logs`
- Open an issue in the repository

---

**Note**: Make sure to replace placeholder values in the `.env` file and Fly.io secrets with your actual API keys and configuration values.
