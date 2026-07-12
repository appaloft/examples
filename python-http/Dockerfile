FROM python:3.12-alpine

WORKDIR /app
ENV PORT=8000 \
    PYTHONUNBUFFERED=1

COPY server.py ./
EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/health' % (__import__('os').environ.get('PORT','8000'))).read()"

USER nobody
CMD ["python", "server.py"]
