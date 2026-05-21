FROM alpine:3.19

RUN apk add --no-cache unzip curl

WORKDIR /pb

RUN curl -L "https://github.com/pocketbase/pocketbase/releases/download/v0.38.0/pocketbase_0.38.0_linux_amd64.zip" -o /tmp/pocketbase.zip \
    && unzip /tmp/pocketbase.zip -d /pb \
    && rm /tmp/pocketbase.zip \
    && chmod +x /pb/pocketbase

COPY pb_data ./pb_data
COPY pb_hooks ./pb_hooks
COPY pb_migrations ./pb_migrations

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--encryptionEnv=PB_ENCRYPTION_KEY"]
