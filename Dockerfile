FROM php:8.3-fpm-alpine

COPY --from=ghcr.io/mlocati/php-extension-installer:latest /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql redis pcntl bcmath zip intl gd

# Autorise l'envoi de fichiers jusqu'à 10 Mo (valeurs par défaut de PHP : 2 Mo)
RUN printf "upload_max_filesize=10M\npost_max_size=12M\n" > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apk add --no-cache git unzip

WORKDIR /var/www/html