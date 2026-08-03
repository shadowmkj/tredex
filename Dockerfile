FROM node:24-alpine AS builder
RUN corepack enable


WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

RUN pnpm approve-builds --all
RUN pnpm install --frozen-lockfile
# ENV MONGODB_URI mongodb://localhost:27017/tredexdb
# ENV BETTER_AUTH_SECRET "secret135"
# ENV BETTER_AUTH_URL http://localhost:3000
# ENV NEXT_PUBLIC_APP_URL http://localhost:3000

COPY . .
RUN pnpm dlx @better-auth/cli@latest migrate -y
RUN pnpm build

FROM node:24-alpine AS prod
WORKDIR /app
COPY --from=builder /app/.next/standalone/ .
COPY --from=builder /app/sqlite.db .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static .next/static

EXPOSE 3000

CMD ["node", "server.js"]


