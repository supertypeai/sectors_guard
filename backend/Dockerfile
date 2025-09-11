FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Prevent Python from writing .pyc and enable stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

# System deps - Add more dependencies for pandas/numpy compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    gcc \
    g++ \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (leverage layer cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (documentation only; Fly sets up networking)
EXPOSE 8080

# Start the application with simpler command
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
