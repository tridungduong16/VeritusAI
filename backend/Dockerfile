FROM ghcr.io/astral-sh/uv:python3.13-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        gnupg \
        gcc \
        g++ \
        python3-dev \
        git \
        libfreetype6-dev \
        libpng-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies during build time (not runtime)
RUN uv sync --frozen

# Copy application code
COPY . .

# Ensure logs directory exists and is writable
RUN mkdir -p logs && chmod 777 logs

# Set environment variables
ENV PYTHONPATH=.
ENV UV_SYSTEM_PYTHON=1

# Expose port
EXPOSE 8080

# Run the app without --reload for production
CMD ["uv", "run", "python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
