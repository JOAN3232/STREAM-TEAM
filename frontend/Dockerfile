FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=optional

RUN npm install --no-save --force --ignore-scripts \
    @rolldown/binding-linux-x64-gnu@1.2.4 \
    lightningcss-linux-x64-gnu@1.32.0 \
    @tailwindcss/oxide-linux-x64-gnu

RUN node -e "console.log('Rolldown:', require.resolve('@rolldown/binding-linux-x64-gnu'))"
RUN node -e "console.log('LightningCSS:', require.resolve('lightningcss-linux-x64-gnu'))"
RUN node -e "console.log('Tailwind Oxide:', require.resolve('@tailwindcss/oxide-linux-x64-gnu'))"

COPY . .

ARG VITE_API_GATEWAY_URL=
ENV VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
