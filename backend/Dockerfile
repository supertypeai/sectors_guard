FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Prevent Python from writing .pyc and enable stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

# System deps (only if wheels unavailable; kept minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    pkg-config \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (leverage layer cache)
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port (documentation only; Fly sets up networking)
EXPOSE 8080

# Healthcheck (simple TCP check handled by Fly, optional extra endpoint)

# Start the application
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8080", "--timeout", "120"]
