FROM node:20

WORKDIR /app

COPY package*.json ./

# The lockfile was generated on Windows and can omit Linux-only
# optional native dependencies. Regenerate dependencies inside Linux.
RUN rm -f package-lock.json \
    && npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]