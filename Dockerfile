FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm i --force
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3010

CMD ["npm", "run", "start"]

# FROM nginx:stable-alpine
# RUN apk update
# RUN apk upgrade
# RUN apk add --no-cache tzdata nano curl
# ENV TZ=Europe/Warsaw