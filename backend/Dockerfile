
FROM node:18-bullseye-slim


WORKDIR /app
USER root


RUN apt-get update && \
    apt-get install -y \
      python3 \
      python3-pip \
      python3-dev \
      gcc \
      libjpeg-dev \
      zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*


COPY ./python/requirements.txt ./python/
RUN pip3 install --no-cache-dir -r python/requirements.txt


COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5005

CMD ["node", "server.js"]
