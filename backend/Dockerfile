FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-eng \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    poppler-utils \
    fonts-noto \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /workspace/requirements.txt
RUN pip install --no-cache-dir -r /workspace/requirements.txt

# Copy backend/ into /workspace/backend/ so 'from backend.X import Y' resolves correctly
COPY . /workspace/backend/

ENV PYTHONPATH=/workspace

EXPOSE 8000

RUN chmod +x /workspace/backend/start.sh

ENTRYPOINT ["/workspace/backend/start.sh"]
