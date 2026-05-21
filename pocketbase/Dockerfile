FROM alpine:3.19

RUN apk add --no-cache unzip curl

WORKDIR /pb

COPY . .

RUN chmod +x ./pocketbase

EXPOSE 8090

CMD ./pocketbase serve --http=0.0.0.0:${PORT:-8090}
Commit changes
Then go to Railway → Redeploy → tell me what the Deploy Logs show! 🏠



