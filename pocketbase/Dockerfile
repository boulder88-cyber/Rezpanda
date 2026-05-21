FROM alpine:3.19

RUN apk add --no-cache unzip curl

WORKDIR /pb

# Download PocketBase directly during build - guarantees correct Linux binary
RUN curl -L "https://github.com/pocketbase/pocketbase/releases/download/v0.38.0/pocketbase_0.38.0_linux_amd64.zip" -o /tmp/pocketbase.zip \
    && unzip /tmp/pocketbase.zip -d /pb \
    && rm /tmp/pocketbase.zip \
    && chmod +x /pb/pocketbase

# Copy only the data folders and hooks - not the binary
COPY pb_data ./pb_data
COPY pb_hooks ./pb_hooks
COPY pb_migrations ./pb_migrations

EXPOSE 8090

CMD ./pocketbase serve --http=0.0.0.0:${PORT:-8090}
