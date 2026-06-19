FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM dependencies AS build

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/main.js"]
