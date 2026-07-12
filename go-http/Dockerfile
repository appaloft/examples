# Multi-stage static Go binary on port 8080 (non-3000).
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server .

FROM alpine:3.20
RUN adduser -D -H -u 10001 app
WORKDIR /app
COPY --from=build /out/server /app/server
ENV PORT=8080
EXPOSE 8080
USER app
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 \
  CMD wget -qO- http://127.0.0.1:8080/health >/dev/null || exit 1
CMD ["/app/server"]
