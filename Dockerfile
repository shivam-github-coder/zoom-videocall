FROM nginx:latest

LABEL maintainer="Oodles Technologies"


#HEALTHCHECK --interval=50s --timeout=30s --retries=3 \
# CMD curl --silent --fail localhost:80 || exit 1

RUN  mkdir /opt/test 
RUN  rm /etc/nginx/conf.d/*

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/
#COPY dist/ /usr/share/nginx/html/
COPY build/ /usr/share/nginx/html/
