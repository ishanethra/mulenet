FROM node:22-alpine AS web
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=web /app/.next ./.next
COPY --from=web /app/public ./public
COPY --from=web /app/package*.json ./
COPY --from=web /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
