FROM node:lts as builder

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_ANALYTICS_CF_TOKEN
ENV VITE_ANALYTICS_CF_TOKEN=${VITE_ANALYTICS_CF_TOKEN}

WORKDIR /usr/src/app

# Install project dependencies
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile

# Copy and build code
COPY . /usr/src/app/
RUN yarn build

FROM nginx

COPY --from=builder /usr/src/app/dist /var/www/html
