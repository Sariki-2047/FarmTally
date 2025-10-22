FROM nginx:alpine

# Copy the HTML file to nginx
COPY services/web-interface/index.html /usr/share/nginx/html/

# Copy nginx configuration
COPY services/web-interface/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]