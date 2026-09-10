# Airco stack: MySQL + Nest API + Nginx/React

Geen source-code mounts, geen hot-reload. Dagelijks ontwikkelen blijft `pnpm dev` / `pnpm start:dev` op Windows. Deze Compose-stack is de productie-replica.

## Lokaal (Docker Desktop)

1. Kopieer env-bestand:

```bash
cd airco-api-nestjs/deploy
cp .env.example .env
```

2. Controleer `FRONTEND_CONTEXT`. Vanaf `deploy/` is dat lokaal:

```
../../../ReactProjects/airco_app_reactjs
```

3. Start:

```bash
docker compose --env-file .env up --build
```

4. Open http://localhost:8080 (frontend) en http://localhost:8080/api/docs (Swagger, via proxy).

MySQL Workbench (lokaal): host `127.0.0.1`, poort `3307`, user `airco`, database `aircoenwarmte`. Poort 3307 laat een eventuele lokale MySQL op 3306 vrij. Op de VPS MySQL **niet** naar buiten openzetten.

Stoppen: `docker compose --env-file .env down`. Data blijft in volume `mysql_data`. Volume weg: `docker compose --env-file .env down -v`.

## VPS (Ubuntu 24.04)

Zelfde bestanden, andere paden en wachtwoorden.

```
/opt/airco/
  airco-api-nestjs/
  airco_app_reactjs/
```

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
# opnieuw inloggen

sudo mkdir -p /opt/airco
cd /opt/airco
git clone <api-repo> airco-api-nestjs
git clone <frontend-repo> airco_app_reactjs

cd airco-api-nestjs/deploy
cp .env.example .env
# FRONTEND_CONTEXT=../../airco_app_reactjs
# HTTP_PORT=80
# sterke JWT_SECRET, DB_PASSWORD, DB_ROOT_PASSWORD

docker compose --env-file .env up -d --build
```

Daarna: http://<vps-ip>. HTTPS (Caddy of Certbot) later, niet nodig voor de lokale replica.

## Als Docker Desktop tegenwerkt

Native Ubuntu (WSL of VPS): MySQL 8, Node 22, pnpm, `pnpm build` + `pnpm start:prod`, Nginx met dezelfde `nginx.conf` (vervang `api:3000` door `127.0.0.1:3000`), process manager zoals systemd of PM2.

## Let op

TypeORM `synchronize: true` maakt tabellen vanzelf. Voor echte productie later uitzetten en migraties gebruiken.
