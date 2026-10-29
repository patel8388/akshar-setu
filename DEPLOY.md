# Static deployment notes

Akshar Setu is a static site; it needs no database, server-side text processing, or build step.

## Generic Nginx setup

1. Pick a new, empty document root (for example `/var/www/akshar-setu`). Do not copy over an existing site directory.
2. Upload the contents of this folder to that root.
3. Add a new Nginx `server` block or a new `location` on a domain you control, with that directory as its `root` and `index.html` as its index.
4. Run `nginx -t`, then reload Nginx only after the configuration test succeeds.
5. Serve it over HTTPS before sharing publicly.

Example block (replace the hostname and certificate paths with your own):

```nginx
server {
    listen 80;
    server_name converter.example.com;
    root /var/www/akshar-setu;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

The example is not preconfigured for any existing VPS/domain. Confirm the active server and target hostname before applying it. A free static host can also serve the same folder; this project has no host-specific dependency.
