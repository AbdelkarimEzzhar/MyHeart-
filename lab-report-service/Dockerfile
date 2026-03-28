FROM python:3.11-slim

WORKDIR /app

# Install build dependencies needed for some Python packages and allow pip to upgrade
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc libssl-dev libffi-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip first (helps avoid many wheel/build issues), then install requirements
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8084

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8084"]
