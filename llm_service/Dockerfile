# Use vLLM's OpenAI-compatible API image
FROM vllm/vllm-openai:latest

# Set the working directory
WORKDIR /app

# Copy requirements (for any additional dependencies)
COPY requirements.txt .

# Install additional Python dependencies if needed
RUN pip install --no-cache-dir -r requirements.txt || true

# Copy application code (optional, for logging/monitoring)
COPY . .

# Set environment variables
ENV MODEL_NAME=${MODEL_NAME:-mistralai/Mistral-7B-Instruct-v0.1}
ENV CUDA_VISIBLE_DEVICES=0
ENV VLLM_LOGGING_LEVEL=info

# Expose the port vLLM API runs on
EXPOSE 8000

# Start vLLM OpenAI API server
CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \
     "--model", "$MODEL_NAME", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--dtype", "float16", \
     "--max-model-len", "2048"]