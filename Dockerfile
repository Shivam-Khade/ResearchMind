# Use official Debian-based Python 3.12 image
FROM python:3.12-slim-bookworm

# Install system dependencies & Node.js 20
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Create a non-root user (Hugging Face Spaces runs as user with UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user
ENV PATH="/home/user/.local/bin:${PATH}"

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js production bundle
RUN npm run build

# Adjust permissions for non-root user
RUN chown -R user:user /app
USER user

# Set Hugging Face Spaces environment variables
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV PYTHON_PATH=python3

EXPOSE 7860

# Start Next.js server on port 7860
CMD ["npm", "run", "start", "--", "-p", "7860", "-H", "0.0.0.0"]
