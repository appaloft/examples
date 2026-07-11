# Minimal public example for Appaloft git-public / GitHub App deploy smokes.
# Keep the image small and dependency-free so pull + start stay reliable on smoke hosts.
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY package.json ./
COPY server.js ./

EXPOSE 3000

# Lightweight healthcheck used by Docker and optional runtime probes.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node

CMD ["node", "server.js"]
