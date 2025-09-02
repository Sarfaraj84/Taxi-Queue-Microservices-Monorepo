FROM node:24-alpine

WORKDIR /app

# Install grpc-tools and python for proto compilation
RUN apk add --no-cache python3 make g++ && \
    npm install -g grpc-tools

COPY package*.json ./
RUN npm install --only=production

COPY src/ ./src/
COPY .env ./

# Compile proto files
RUN npm run compile-proto

EXPOSE ${PORT}

CMD ["npm", "start"]