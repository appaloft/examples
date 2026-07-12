FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    APP_NAME=appaloft-example-env-service \
    GREETING="Hello from env-service" \
    FEATURE_FLAG=off

COPY package.json ./
COPY server.js ./

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node
CMD ["node", "server.js"]
