FROM python:3.10-alpine

WORKDIR /app

RUN pip3 install requests

COPY mappings.json .
COPY proxy.py .

CMD ["python3", "proxy.py"]
