apt update && apt upgrade -y
timedatectl set-timezone Europe/Berlin
timedatectl
apt install -y curl git unzip htop ca-certificates gnupg lsb-release
apt remove -y docker docker-engine docker.io containerd runc || true
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
docker --version
apt install -y docker-compose-plugin
docker compose version
mkdir -p /opt/pgem-oms
cd /opt/pgem-oms
mkdir -p data/postgres data/redis backend frontend nginx
cat > .env << 'EOF'
POSTGRES_DB=pgem_oms
POSTGRES_USER=pgem
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
REDIS_PASSWORD=
EOF

cat > docker-compose.yml << 'EOF'
services:
  postgres:
    image: postgres:16
    container_name: pgem_oms_postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  redis:
    image: redis:7-alpine
    container_name: pgem_oms_redis
    restart: always
    command: ["redis-server"]
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
EOF

docker compose up -d
docker ps
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms
\q
nano /opt/pgem-oms/.env
cd /opt/pgem-oms
docker compose up -d
docker compose restart postgres
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms
cd /opt/pgem-oms
docker compose up -d
docker compose restart postgres
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms
cd /opt/pgem-oms/backend
npx prisma migrate dev --name init
cd /opt/pgem-oms
mkdir -p backend
cd backend
npm init -y
npm i fastify @fastify/jwt @fastify/cors @fastify/rate-limit @fastify/helmet @fastify/static bcrypt zod prisma @prisma/client
npm i -D nodemon
npx prisma init
cd /opt/pgem-oms/backend
cat > .env << 'EOF'
DATABASE_URL="postgresql://pgem:jBph3reUzd80krYa@127.0.0.1:5432/pgem_oms?schema=public"
JWT_SECRET="PUT_A_VERY_LONG_RANDOM_SECRET_HERE"
NODE_ENV="production"
PORT=3000
EOF

nano .env
cat .env
cd /opt/pgem-oms/backend
npx prisma -v
apt update
apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
npx -v
cd /opt/pgem-oms/backend
npm install
cd /opt/pgem-oms
ls -la
ls -la backend
cd /opt/pgem-oms/backend
npm init -y
ls -la
cd /opt/pgem-oms/backend
npm i fastify @fastify/jwt @fastify/cors @fastify/rate-limit @fastify/helmet @fastify/static bcrypt zod prisma @prisma/client
npm i -D nodemon
npx prisma init
cd /opt/pgem-oms
ls -la backend
cd /opt/pgem-oms/backend
ls -la
cd /opt/pgem-oms/backend
npm init -y
ls -la
cd /opt/pgem-oms/backend
npm install
cd /opt/pgem-oms/backend
ls -la
npm install
cd /opt/pgem-oms/backend
nano prisma/schema.prisma
cd /opt/pgem-oms/backend
npx prisma migrate dev --name init_oms
npx prisma studio
cd /opt/pgem-oms/backend
# اگر prisma.config.ts داری فعلاً حذفش نکن، ولی Prisma 6 بهش کاری نداره
npm remove prisma @prisma/client
npm i -E prisma@6.*/ @prisma/client@6.*/
npx prisma -v
npx prisma migrate dev --name init_oms
cd /opt/pgem-oms/backend
npx prisma migrate dev --name init_oms
npx prisma studio
node
cd /opt/pgem-oms/backend
pwd
ls -la
mv prisma.config.ts prisma.config.ts.bak
cd /opt/pgem-oms/backend
npm remove prisma @prisma/client
npm i -E prisma@6 @prisma/client@6
npm i
./node_modules/.bin/prisma -v
./node_modules/.bin/prisma migrate dev --name init_oms
./node_modules/.bin/prisma generate
cd /opt/pgem-oms/backend
mv prisma.config.ts prisma.config.ts.bak
npm remove prisma @prisma/client
npm i -E prisma@6 @prisma/client@6 && npm i
./node_modules/.bin/prisma migrate dev --name init_oms
nano /opt/pgem-oms/backend/prisma/schema.prisma
cd /opt/pgem-oms/backend
./node_modules/.bin/prisma format
./node_modules/.bin/prisma migrate dev --name init_oms
cd /opt/pgem-oms/backend
mkdir -p scripts
nano scripts/seed-superadmin.js
nano /opt/pgem-oms/backend/.env
cd /opt/pgem-oms/backend
node scripts/seed-superadmin.js
cd /opt/pgem-oms
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms -c "select id,username,role,\"isActive\",\"createdAt\" from \"Admin\";"
cd /opt/pgem-oms/backend
mkdir -p src/plugins src/routes src/lib
nano /opt/pgem-oms/backend/.env
nano /opt/pgem-oms/backend/src/lib/prisma.js
nano /opt/pgem-oms/backend/src/plugins/auth.js
nano /opt/pgem-oms/backend/src/routes/auth.js
nano /opt/pgem-oms/backend/src/routes/admins.js
nano /opt/pgem-oms/backend/src/routes/orders.js
nano /opt/pgem-oms/backend/src/server.js
nano /opt/pgem-oms/backend/package.json
cd /opt/pgem-oms/backend
node src/server.js
curl -s http://127.0.0.1:3000/health
curl -s -X POST http://127.0.0.1:3000/auth/login   -H "Content-Type: application/json"   -d '{"username":"superadmin","password":"9126882366Ff"}'
curl -s http://127.0.0.1:3000/health
curl -s -X POST http://127.0.0.1:3000/auth/login   -H "Content-Type: application/json"   -d '{"username":"superadmin","password":"9126882366Ff"}'
nano /opt/pgem-oms/backend/package.json
cd /opt/pgem-oms/backend
npm install
node src/server.js
curl http://127.0.0.1:3000/health
ss -lntp | grep :3000 || echo "NOT LISTENING"
cd /opt/pgem-oms/backend
node src/server.js
cd /opt/pgem-oms/backend
nohup node src/server.js > /opt/pgem-oms/backend/server.log 2>&1 &
echo $! > /opt/pgem-oms/backend/server.pid
ss -lntp | grep :3000
curl -s http://127.0.0.1:3000/health
curl -m 3 -v http://127.0.0.1:3000/health
tail -n 200 /opt/pgem-oms/backend/server.log
ss -lntp | grep :3000
ps -p 30415 -o pid,stat,cmd
kill -CONT 30415
curl -v --max-time 3 http://127.0.0.1:3000/health ; echo
kill 30415
# اگر بسته نشد:
kill -9 30415
cd /opt/pgem-oms/backend
nohup node src/server.js > /opt/pgem-oms/backend/server.log 2>&1 & echo $! > /opt/pgem-oms/backend/server.pid
curl -v --max-time 3 http://127.0.0.1:3000/health ; echo
curl -s http://127.0.0.1:3000/health ; echo
cd /opt/pgem-oms/backend
pwd
ls -la
cat > /opt/pgem-oms/backend/stop.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
PIDFILE="/opt/pgem-oms/backend/server.pid"
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE" || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Stopping PID=$PID"
    kill "$PID" || true
    sleep 1
    if kill -0 "$PID" 2>/dev/null; then
      echo "Force killing PID=$PID"
      kill -9 "$PID" || true
    fi
  fi
  rm -f "$PIDFILE"
fi
echo "Stopped."
EOF

chmod +x /opt/pgem-oms/backend/stop.sh
ls -la /opt/pgem-oms/backend/stop.sh
head -n 5 /opt/pgem-oms/backend/stop.sh
cat > /opt/pgem-oms/backend/start.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd /opt/pgem-oms/backend
./stop.sh || true

nohup node src/server.js > /opt/pgem-oms/backend/server.log 2>&1 &
echo $! > /opt/pgem-oms/backend/server.pid
sleep 1

echo "Started PID=$(cat server.pid)"
ss -lntp | grep :3000 || true
EOF

chmod +x /opt/pgem-oms/backend/start.sh
ls -la /opt/pgem-oms/backend/start.sh
head -n 6 /opt/pgem-oms/backend/start.sh
cat > /opt/pgem-oms/backend/status.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
PIDFILE="/opt/pgem-oms/backend/server.pid"
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE" || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "RUNNING PID=$PID"
    exit 0
  fi
fi
echo "NOT RUNNING"
exit 1
EOF

chmod +x /opt/pgem-oms/backend/status.sh
ls -la /opt/pgem-oms/backend/status.sh
head -n 6 /opt/pgem-oms/backend/status.sh
cd /opt/pgem-oms/backend
./status.sh
./start.sh
curl -s http://127.0.0.1:3000/health ; echo
./stop.sh
./status.sh
ss -lntp | grep :3000 || echo "PORT 3000 FREE"
Started PID=30533
LISTEN ... :3000
node src/server.js
nohup node src/server.js &
ls -la /opt/pgem-oms/backend/start.sh /opt/pgem-oms/backend/stop.sh /opt/pgem-oms/backend/status.sh
cat > /etc/systemd/system/pgem-oms.service << 'EOF'
[Unit]
Description=PGEM OMS Backend (Fastify)
After=network.target

[Service]
Type=forking
WorkingDirectory=/opt/pgem-oms/backend

# env (اختیاری ولی خوبه)
EnvironmentFile=/opt/pgem-oms/backend/.env

# start/stop استاندارد خودت
ExecStart=/opt/pgem-oms/backend/start.sh
ExecStop=/opt/pgem-oms/backend/stop.sh

# pidfile که الان داری
PIDFile=/opt/pgem-oms/backend/server.pid

# اگر کرش کرد یا kill شد، خودکار برگرده
Restart=always
RestartSec=2

# لاگ‌ها توی journald + فایل server.log خودت
StandardOutput=journal
StandardError=journal

# امنیت پایه
KillMode=process
TimeoutStartSec=30
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pgem-oms
systemctl start pgem-oms
systemctl stop pgem-oms || true
cat > /etc/systemd/system/pgem-oms.service << 'EOF'
[Unit]
Description=PGEM OMS Backend (Fastify)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/pgem-oms/backend
EnvironmentFile=/opt/pgem-oms/backend/.env

# اجرای مستقیم (بدون nohup و pidfile)
ExecStart=/usr/bin/node /opt/pgem-oms/backend/src/server.js

Restart=always
RestartSec=2

StandardOutput=journal
StandardError=journal

TimeoutStartSec=30
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl restart pgem-oms
systemctl status pgem-oms --no-pager
curl -s http://127.0.0.1:3000/health ; echo
journalctl -u pgem-oms -n 200 --no-pager
systemctl stop pgem-oms
systemctl reset-failed pgem-oms
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
kill 30579
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
ps aux | grep node
systemctl start pgem-oms
systemctl status pgem-oms --no-pager
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
systemctl status pgem-oms --no-pager
systemctl stop pgem-oms || true
pkill -f "node src/server.js" || true
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
systemctl reset-failed pgem-oms || true
systemctl start pgem-oms
systemctl status pgem-oms --no-pager
curl -s http://127.0.0.1:3000/health ; echo
systemctl stop pgem-oms || true
systemctl reset-failed pgem-oms || true
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
kill -9 30579
ss -lntp | grep ':3000' || echo "PORT 3000 FREE"
systemctl start pgem-oms
systemctl status pgem-oms --no-pager
curl -v --max-time 3 http://127.0.0.1:3000/health ; echo
chmod -x /opt/pgem-oms/backend/src/server.js
curl -s -X POST http://127.0.0.1:3000/auth/login   -H "Content-Type: application/json"   -d '{"username":"superadmin","password":"9126882366ff"}'
docker exec -it pgem-oms_postgres psql -U pgem -d pgem_oms -c "SELECT id, username, role, \"isActive\" FROM \"Admin\";"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms -c 'select id, username, role, "isActive", "createdAt" from "Admin" order by id asc;'
docker exec -it pgem_oms_postgres psql -U pgem -d pgem_oms -c 'select id, username, length(password) as pass_len, left(password, 7) as pass_prefix from "Admin" where username = '\''superadmin'\'';'
cd /opt/pgem-oms/backend
node -e "try{require('bcrypt');console.log('bcrypt OK')}catch(e){console.log('NO bcrypt')}"
cat > /opt/pgem-oms/backend/scripts/reset-superadmin-pass.js << 'EOF'
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "superadmin";
  const newPass = "Pgem@2025!";

  const hash = await bcrypt.hash(newPass, 10);

  const updated = await prisma.admin.update({
    where: { username },
    data: { password: hash, isActive: true },
    select: { id: true, username: true, role: true, isActive: true },
  });

  console.log("UPDATED:", updated);
  console.log("NEW_PASSWORD:", newPass);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
EOF

cd /opt/pgem-oms/backend
node scripts/reset-superadmin-pass.js
curl -s -X POST http://127.0.0.1:3000/auth/login   -H "Content-Type: application/json"   -d '{"username":"superadmin","password":"Pgem@2025!"}' ; echo
cat > /opt/pgem-oms/backend/scripts/reset-superadmin-pass.js << 'EOF'
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const username = "superadmin";
  const newPass = "Pgem@2025!";

  const hash = await bcrypt.hash(newPass, 10);

  const updated = await prisma.admin.update({
    where: { username },
    data: { password: hash, isActive: true },
    select: { id: true, username: true, role: true, isActive: true },
  });

  console.log("UPDATED:", updated);
  console.log("NEW_PASSWORD:", newPass);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

cd /opt/pgem-oms/backend
node scripts/reset-superadmin-pass.js
curl -s -X POST http://127.0.0.1:3000/auth/login   -H "Content-Type: application/json"   -d '{"username":"superadmin","password":"Pgem@2025!"}' ; echo
TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpYXQiOjE3NjY0Mzk3MTMsImV4cCI6MTc2NjQ4MjkxM30.H948hDG0k_USVlpKzaovKboIrD-JJkEdifk5vMJhk4E'
curl -s http://127.0.0.1:3000/admins   -H "Authorization: Bearer $TOKEN" ; echo
curl -s http://127.0.0.1:3000/orders   -H "Authorization: Bearer $TOKEN" ; echo
sed -n '1,200p' /opt/pgem-oms/backend/src/server.js
sed -n '1,200p' /opt/pgem-oms/backend/src/routes/auth.js
curl -s http://127.0.0.1:3000/orders   -H "Authorization: Bearer $TOKEN" ; echo
curl -s "http://127.0.0.1:3000/orders?page=1&limit=20"   -H "Authorization: Bearer $TOKEN" ; echo
curl -s "http://127.0.0.1:3000/orders?status=pending"   -H "Authorization: Bearer $TOKEN" ; echo
nano /opt/pgem-oms/backend/src/routes/auth.js
systemctl restart pgem-oms
systemctl status pgem-oms --no-pager
sed -n '1,260p' /opt/pgem-oms/backend/src/routes/orders.js
cat /opt/pgem-oms/backend/.env | sed -n '1,120p'
curl -v --max-time 3 http://127.0.0.1:3000/health ; echo
sed -n '1,260p' /opt/pgem-oms/backend/src/routes/orders.js
ls -la /opt/pgem-oms/backend/src/routes
grep -R "webhook" -n /opt/pgem-oms/backend/src | head -n 80
grep -R "woocommerce\|wc\|orderNumber\|orders" -n /opt/pgem-oms/backend/src | head -n 80
openssl rand -hex 24
nano /opt/pgem-oms/backend/.env
ss -lntp | egrep ':80|:443|:3000'
curl -sS -m 3 http://185.110.188.77:3000/health ; echo
ss -lntp | egrep ':80|:443|:3000'
curl -sS -m 3 http://185.110.188.77:3000/health ; echo
cd /opt/pgem-oms/backend
openssl rand -hex 32
nano /opt/pgem-oms/backend/.env
cd /opt/pgem-oms/backend
npm i @fastify/raw-body
cd /opt/pgem-oms/backend
npm i @fastify/raw-body
cd /opt/pgem-oms/backend
npm i @fastify/raw-body
systemctl stop pgem-oms || true
mv /root/.npmrc /root/.npmrc.bak 2>/dev/null || true
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm config get registry
cd /opt/pgem-oms/backend
npm install fastify-raw-body
ls node_modules/fastify-raw-body
systemctl stop pgem-oms || true
// Raw body for WooCommerce webhooks (needed for signature verification)
fastify.register(require("fastify-raw-body"), {
});
nano /opt/pgem-oms/backend/src/server.js
nano /opt/pgem-oms/backend/src/routes/woocommerce.js
nano /opt/pgem-oms/backend/src/server.js
nano /opt/pgem-oms/backend/.env
systemctl daemon-reload
systemctl start pgem-oms
systemctl status pgem-oms --no-pager
curl -s http://127.0.0.1:3000/health ; echo
curl -s -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}' ; echo
journalctl -u pgem-oms -n 50 --no-pager
/opt/pgem-oms/backend/src/routes/woocommerce.js
nano /opt/pgem-oms/backend/src/routes/woocommerce.js
nano /opt/pgem-oms/backend/.env
systemctl restart pgem-oms
journalctl -u pgem-oms -f
curl -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}'
systemctl restart pgem-oms
journalctl -u pgem-oms -f
nano /opt/pgem-oms/backend/.env
systemctl restart pgem-oms
curl -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}'
✅ باید {"ok":true} بگیری.
curl -i http://185.110.188.77:3000/health
curl -X POST http://127.0.0.1:3000/woocommerce/webhook  -H "Content-Type: application/json"  -d '{"id":123,"number":"1234567","status":"processing"}'
const crypto = require("crypto");
module.exports = async function (fastify) {
};
journalctl -u pgem-oms -f
ls -la /opt/pgem-oms/backend/src/routes/
cat > /opt/pgem-oms/backend/src/routes/woocommerce.js <<'EOF'
const crypto = require("crypto");

module.exports = async function (fastify) {
  // فقط برای این روت rawBody لازم داریم
  fastify.post(
    "/woocommerce/webhook",
    { config: { rawBody: true } },
    async (req, reply) => {
      const secret = process.env.WC_WEBHOOK_SECRET || "";
      const sigHeader =
        req.headers["x-wc-webhook-signature"] ||
        req.headers["X-WC-WEBHOOK-SIGNATURE"];

      // اگر secret ست باشد، امضای ووکامرس را چک می‌کنیم
      if (secret) {
        const raw = req.rawBody || "";
        const expected = crypto
          .createHmac("sha256", secret)
          .update(raw, "utf8")
          .digest("base64");

        if (!sigHeader || sigHeader !== expected) {
          fastify.log.warn({ expected }, "Woo webhook bad signature");
          return reply.code(401).send({ ok: false, error: "Bad signature" });
        }
      }

      const payload = req.body || {};
      const wcOrderId = payload.id;
      const orderNumber = String(payload.number || "");
      const status = payload.status;

      if (!wcOrderId || !orderNumber || !status) {
        fastify.log.warn({ payload }, "Invalid WC payload");
        return reply.code(400).send({ ok: false });
      }

      // فعلاً فقط لاگ
      fastify.log.info({
        event: "wc_webhook",
        wcOrderId,
        orderNumber,
        status,
      });

      return reply.send({ ok: true });
    }
  );
};
EOF

grep -n "woocommerce" -n /opt/pgem-oms/backend/src/server.js
systemctl daemon-reload
systemctl restart pgem-oms
systemctl status pgem-oms --no-pager
nano /opt/pgem-oms/backend/.env
systemctl restart pgem-oms
curl -s -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}' ; echo
curl -s -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}'
curl -s -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}' ; echo
journalctl -u pgem-oms -f
curl -s -X POST http://127.0.0.1:3000/woocommerce/webhook   -H "Content-Type: application/json"   -d '{"id":123,"number":"1234567","status":"processing"}' ; echo
journalctl -u pgem-oms -f
cd /opt/pgem-oms/backend
mkdir -p /opt/pgem-oms/frontend
cd /opt/pgem-oms/frontend
npx create-next-app@latest pgem-oms-panel --ts --eslint --app --no-tailwind
cd pgem-oms-panel
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss@3 init -p
nano tailwind.config.js
nano app/globals.css
cd /opt/pgem-oms/frontend/pgem-oms-panel
pwd
ls -la
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app
nano src/app/globals.css
npm run dev
<div className="p-6 rounded-xl bg-white shadow">تست Tailwind</div>
cd /opt/pgem-oms/frontend/pgem-oms-panel
NEXT_DISABLE_TURBOPACK=1 npm run dev -- -H 0.0.0.0 -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- --no-turbo -H 0.0.0.0 -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- --turbo=false -H 0.0.0.0 -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano package.json
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano tailwind.config.js
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- --turbo=false -H 0.0.0.0 -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
npm install
npm run dev
nano tailwind.config.js
nano src/app/layout.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat package.json
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm install
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev
nano next.config.ts
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/layout.tsx
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
pwd
nano package.json
npm run dev
nano src/app/page.tsx
nano src/app/globals.css
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
ls -la
ls -la src/app
nano src/app/page.tsx
nano src/app/dashboard/page.tsx
mkdir -p src/app/orders-ready src/app/orders src/app/orders/[id] src/app/dashboard
nano src/app/dashboard/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat src/app/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat src/app/page.tsx
find src/app -maxdepth 2 -type f
rm -f src/app/page.module.css
mkdir -p src/app/dashboard src/app/orders-ready src/app/orders src/app/orders/[id]
mkdir -p src/components src/lib src/app/api/_mock
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat src/app/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat src/app/page.tsx
nano src/app/page.tsx
nano src/app/layout.tsx
// src/components/app-shell.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const NAV = [
}
export default function AppShell({ children }: { children: React.ReactNode }) {
}
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/components
nano src/components/app-shell.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/lib
nano src/lib/types.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/_mock
nano src/app/api/_mock/actions.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/components
nano src/components/ui.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/dashboard
nano src/app/dashboard/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/orders-ready
nano src/app/orders-ready/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/orders
nano src/app/orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/orders/[id]
nano src/app/orders/[id]/page.tsx
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/api/_mock/store.ts
npm run dev
nano src/app/page.tsx
nano src/app/layout.tsx
nano src/app/globals.css
nano src/lib/types.ts
nano src/lib/mock.ts
nano src/lib/policy.ts
nano src/lib/store.ts
nano src/components/ui.tsx
nano src/components/Shell.tsx
nano src/app/dashboard/page.tsx
src/app/orders/page.tsx
nano src/app/orders/page.tsx
nano src/app/orders-ready/page.tsx
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/my-orders
nano src/app/my-orders/page.tsx
nano src/app/orders/[id]/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- --hostname 0.0.0.0 --port 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/lib
nano src/lib/mock-db.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/me
nano src/app/api/me/route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders
nano src/app/api/orders/route.ts
mkdir -p src/app/api/me
nano src/app/api/me/route.ts
mkdir -p "src/app/api/orders/[id]/claim"
nano src/app/api/orders/[id]/claim/route.ts
mkdir -p "src/app/api/orders/[id]/status"
nano src/app/api/orders/[id]/status
mkdir -p "src/app/api/orders/[id]/status"
nano src/app/api/orders/[id]/status
cat > "src/app/api/orders/[id]/status/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import { dbSetStatus } from "@/lib/mock-db";
import type { OrderStatus } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const status = body?.status as OrderStatus;

  if (!status)
    return NextResponse.json(
      { error: "BAD_REQUEST" },
      { status: 400 }
    );

  const order = dbSetStatus(id, status);
  if (!order)
    return NextResponse.json(
      { error: "NOT_FOUND" },
      { status: 404 }
    );

  return NextResponse.json({ ok: true, order });
}
EOF

ls -la "src/app/api/orders/[id]/status"
cat "src/app/api/orders/[id]/status/route.ts"
mkdir -p "src/app/api/orders/[id]/note"
nano src/app/api/orders/[id]/note/route.ts
mkdir -p src/app/api/reset
cat > src/app/api/reset/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbReset } from "@/lib/mock-db";

export async function POST() {
  dbReset();
  return NextResponse.json({ ok: true });
}
EOF

ls -la src/app/api/reset
cat src/app/api/reset/route.ts
nano src/lib/store.ts
nano src/components/Shell.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- --hostname 0.0.0.0 --port 3001
nano src/components/Shell.tsx
npm run dev -- --hostname 0.0.0.0 --port 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
nl -ba src/components/Shell.tsx | sed -n '70,95p'
nano src/components/Shell.tsx
npm run dev -- --hostname 0.0.0.0 --port 3001
ls src/app/api
nano src/app/api/me/route.ts
npm run dev -- --hostname 0.0.0.0 --port 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/_mock
cd src/app/api/_mock
nano db.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/me
cd src/app/api/me
nano route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders
cd src/app/api/orders
nano route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders/[id]/claim
nano src/app/api/orders/[id]/claim/route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders/[id]/release
nano src/app/api/orders/[id]/release/route.ts
```bash
cd /opt/pgem-oms/frontend/pgem-oms-panel

mkdir -p src/app/api/orders/[id]

nano src/app/api/orders/[id]/route.ts
```
nano src/app/api/orders/[id]/route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders/[id]
nano src/app/api/orders/[id]/route.ts
ls
cd /var/www/PROJECT
find / -name package.json 2>/dev/null | head -n 20
cd /opt/pgem-oms/backend
pwd
ls
ls -la
find . -maxdepth 4 -type d -name "app" -o -name "src" -o -name "pages"
find . -maxdepth 6 -type f -name "route.ts" | head -n 50
tar -czf pgem-oms-api.tgz app/api
tar -czf pgem-oms-api.tgz src/app/api
scp root@185.110.188.77:/opt/pgem-oms/backend/pgem-oms-api.tgz .
ls -lh pgem-oms-api.tgz
file pgem-oms-api.tgz
cat pgem-oms-api.tgz
file pgem-oms-api.tgz
cat pgem-oms-api.tgz
cd /opt/pgem-oms/frontend
# یک اسم با تاریخ می‌سازیم
TS=$(date +%Y%m%d-%H%M)
# آرشیو کردن پروژه (بدون چیزهای سنگین)
tar -czf pgem-oms-panel-$TS.tar.gz   --exclude=pgem-oms-panel/node_modules   --exclude=pgem-oms-panel/.next   --exclude=pgem-oms-panel/.turbo   --exclude=pgem-oms-panel/.git   pgem-oms-panel
ls -lh pgem-oms-panel-$TS.tar.gz
scp root@185.110.188.77:/opt/pgem-oms/frontend/pgem-oms-panel-*.tar.gz ~/Downloads/
cd ~/Downloads
tar -xzf pgem-oms-panel-*.tar.gz
cd /opt/pgem-oms/backend
nano src/app/api/orders/[id]/route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/orders/[id]
nano src/app/api/orders/[id]/route.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
curl http://localhost:3001/api/me
cd /opt/pgem-oms/frontend/pgem-oms-panel
curl -X POST http://localhost:3001/api/orders/5051486/claim
curl -X POST http://127.0.0.1:3001/api/orders/5051486/claim
ss -lntp | grep 3001 || echo "NO LISTENER ON 3001"
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/_mock
nano src/app/api/_mock/db.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/lib
mkdir -p src/app/api/orders/[id]/claim
mkdir -p src/app/api/orders/[id]/status
mkdir -p src/app/api/orders/[id]
mkdir -p src/app/api/me
mkdir -p src/app/api/orders
nano src/lib/mockDb.ts
nano src/app/api/me/route.ts
nano src/app/api/orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/api/orders/[id]/claim/route.ts
nano src/app/api/orders/[id]/status/route.ts
npm run dev -- --hostname 0.0.0.0 --port 3001
# ساده‌ترین راه (نصب pnpm با corepack)
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
root@srv1067482498:/opt/pgem-oms/frontend/pgem-oms-panel# curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
{"items":[],"serverTime":"2025-12-23T22:18:10.993Z"}
{"items":[],"serverTime":"2025-12-23T22:18:11.031Z"}
root@srv1067482498:/opt/pgem-oms/frontend/pgem-oms-panel# 
tar -czf pgem-oms-panel-review.tar.gz   src/app   src/lib   src/components   src/store   package.json   tsconfig.json   next.config.*
ls -lh pgem-oms-panel-review.tar.gz
curl -s http://127.0.0.1:3001/api/me ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=all" ; echo
curl -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim" ; echo
cd /opt/pgem-oms/frontend/pgem-oms-panel
find src/app/api/orders -maxdepth 5 -type f
nano src/app/api/orders/[id]/claim/route.ts
npm run dev -- --hostname 0.0.0.0 --port 3001
curl -i -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim"
{"ok":true,"orderId":5051486,"ownerId":"u-operator-1","status":"IN_PROGRESS"}root@srv1067482498:/opt/pgem-oms/frontend/pgem-oms-panel# 
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/dashboard
mkdir -p src/app/orders/ready
mkdir -p src/app/orders/all
mkdir -p src/app/orders/[id]
mkdir -p src/components
mkdir -p src/lib
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/dashboard
mkdir -p src/app/orders/ready
mkdir -p src/app/orders/all
mkdir -p src/app/orders/[id]
mkdir -p src/components
mkdir -p src/lib
nano src/lib/api.ts
nano src/components/Shell.tsx
nano src/components/OrderCard.tsx
nano src/app/dashboard/page.tsx
nano src/app/orders/ready/page.tsx
nano src/app/orders/all/page.tsx
nano src/app/orders/[id]/page.tsx
nano src/app/page.tsx
npm run dev -- --hostname 0.0.0.0 --port 3001
nano src/app/api/orders/route.ts
nano src/app/my-orders/page.tsx
nano src/app/layout.tsx
npm run dev -- --hostname 0.0.0.0 --port 3001
curl -s "http://127.0.0.1:3001/api/orders?scope=mine" ; echo
nano // app/api/orders/route.ts
nano app/api/orders/route.ts
nano src/app/api/orders/route.ts
mkdir -p /opt/pgem-oms
cd /opt/pgem-oms
curl -X GET "https://pgemshop.com/wp-json/pgem-oms/v1/me"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpYXQiOjE3NjY0Mzk3MTMsImV4cCI6MTc2NjQ4MjkxM30.H948hDG0k_USVlpKzaovKboIrD-JJkEdifk5vMJhk4E"
POST https://pgemshop.com/wp-json/jwt-auth/v1/token
curl -X POST https://pgemshop.com/wp-json/jwt-auth/v1/token   -H "Content-Type: application/json"   -d '{
    "username": "USERNAME",
    "password": "PASSWORD"
  }'
curl -X POST https://pgemshop.com/wp-json/jwt-auth/v1/token   -H "Content-Type: application/json"   -d '{
    "username": "Hamedhajimohammadi",
    "password": "(aS*MN^nI944T@$XZoZ6uSc0"
  }'
curl -X GET "https://pgemshop.com/wp-json/pgem-oms/v1/me"   -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BnZW1zaG9wLmNvbSIsImlhdCI6MTc2NjUyNTIwNywibmJmIjoxNzY2NTI1MjA3LCJleHAiOjE3NjcxMzAwMDcsImRhdGEiOnsidXNlciI6eyJpZCI6IjIifX19.qb3lofd9cop1ok1hgPWCsiqZIlYsmjAHVqs6297oN3Q"
curl -X GET "https://pgemshop.com/wp-json/pgem-oms/v1/orders?scope=ready"   -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BnZW1zaG9wLmNvbSIsImlhdCI6MTc2NjUyNTIwNywibmJmIjoxNzY2NTI1MjA3LCJleHAiOjE3NjcxMzAwMDcsImRhdGEiOnsidXNlciI6eyJpZCI6IjIifX19.qb3lofd9cop1ok1hgPWCsiqZIlYsmjAHVqs6297oN3Q" 
.env.local
OMS_SOURCE=wp
WP_OMS_BASE_URL=https://pgemshop.com/wp-json/pgem-oms/v1
src/lib/wpOms.ts
mkdir -p src/lib
nano src/lib/wpOms.ts
OMS_JWT_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BnZW1zaG9wLmNvbSIsImlhdCI6MTc2NjUyNTIwNywibmJmIjoxNzY2NTI1MjA3LCJleHAiOjE3NjcxMzAwMDcsImRhdGEiOnsidXNlciI6eyJpZCI6IjIifX19.qb3lofd9cop1ok1hgPWCsiqZIlYsmjAHVqs6297oN3Q
nano src/lib/wpOms.ts
grep -R "/api/orders" -n .
src/app/api/my-orders/route.ts
cd src/app/api/my-orders/route.ts
cd /opt/pgem-oms
mkdir -p src/app/api/my-orders
nano src/app/api/my-orders/route.ts
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
cd /opt/pgem-oms/frontend/pgem-oms-panel
# 1) فایل route رو دقیقاً پیدا کن
find src -path "*app/api/my-orders/route.ts" -o -path "*app/api/my-orders/route.js"
# 2) همه route های api موجود رو لیست کن (ببین my-orders هست یا نه)
find src/app/api -maxdepth 3 -type f -name "route.ts" -o -name "route.js"
# 3) مطمئن شو dev server همون پروژه‌ایه که داری curl می‌زنی
lsof -i :3001 | head
curl -s -H "Accept: application/json" -i "http://127.0.0.1:3001/api/my-orders"
find src/app/api -maxdepth 2 -type d -print
ls -la src/app/api
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/my-orders
cat > src/app/api/my-orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbListOrders } from "@/lib/db";

// اگر بعداً auth واقعی اضافه کردی، این تابع رو با user واقعی replace کن
async function getCurrentUser() {
  // موقت: از mock /api/me استفاده می‌کنیم (یا مستقیم ثابت)
  return { id: "u-operator-1", role: "OPERATOR" as const };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;

  const me = await getCurrentUser();

  // my-orders یعنی فقط سفارش‌هایی که ownerId == me.id
  const data = await dbListOrders({
    scope: "mine",
    ownerId: me.id,
    status,
  });

  return NextResponse.json(data);
}
EOF

grep -R "function dbListOrders" -n src | head -n 20
cd /opt/pgem-oms/frontend/pgem-oms-panel
mkdir -p src/app/api/my-orders
cat > src/app/api/my-orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbListOrders, dbGetMe } from "@/lib/mockDb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "ALL";

  // کاربر فعلی (فعلاً mock)
  const me = dbGetMe();

  // لیست سفارش‌ها (فعلاً از mockDb)
  // dbListOrders الان فقط scope و since می‌گیره، پس scope رو "all" می‌گیریم و بعد فیلتر می‌کنیم
  const items = dbListOrders("all");

  const mine = items.filter((o: any) => o.ownerId === me.id);
  const filtered = status === "ALL" ? mine : mine.filter((o: any) => o.status === status);

  return NextResponse.json({
    items: filtered,
    serverTime: new Date().toISOString(),
  });
}
EOF

sed -n '1,140p' src/lib/mockDb.ts
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat > src/app/api/my-orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbListOrders } from "@/lib/mockDb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "ALL").toUpperCase();

  // خروجی استاندارد mockDb (Sanitized)
  const { items, serverTime } = dbListOrders("my");

  // فیلتر وضعیت (اختیاری)
  const filtered = status === "ALL" ? items : items.filter((o: any) => o.status === status);

  return NextResponse.json({ items: filtered, serverTime });
}
EOF

ls -la src/app/api/my-orders
sed -n '1,120p' src/app/api/my-orders/route.ts
npm run dev -- -H 0.0.0.0 -p 3001
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
find src/app/api -maxdepth 3 -type f -name "route.ts" | sort
curl -s http://127.0.0.1:3001/api/me ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=ready" ; echo
curl -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=all" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
cd /opt/pgem-oms/frontend/pgem-oms-panel
# 1) مسیر دقیق route ای که claim رو هندل می‌کنه پیدا کن
grep -R "claim" -n src/app/api/orders | head -n 50
# 2) هر جایی که /claim توی route ها استفاده شده رو پیدا کن
grep -R "/claim" -n src/app/api | head -n 50
# 3) ببین کدوم فایل import از mock-db یا mockDb داره
grep -R "mock-db" -n src/app/api | head -n 50
grep -R "mockDb" -n src/app/api | head -n 50
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat > src/app/api/orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbListOrders } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = (url.searchParams.get("scope") || "all").toLowerCase(); // all | ready | my | inprogress
  const q = (url.searchParams.get("q") || "").trim();

  const data = dbListOrders(scope);

  let items = data.items;

  if (q) {
    const qLower = q.toLowerCase();
    items = items.filter((o) => {
      const hay = `${o.id} ${o.brand} ${o.title} ${o.status} ${o.ownerName || ""}`.toLowerCase();
      return hay.includes(qLower);
    });
  }

  const body = {
    ok: true,
    requestId: crypto.randomUUID(),
    items,
    total: items.length,
    meta: { scope, q },
    serverTime: data.serverTime,
  };

  return NextResponse.json(body, { status: 200 });
}
EOF

curl -s "http://127.0.0.1:3001/api/orders?scope=all" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=ready" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=all" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=ready" ; echo
cd /opt/pgem-oms/frontend/pgem-oms-panel
cat > src/app/api/my-orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { dbListOrders, type OrderStatus } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

function isOrderStatus(x: string): x is OrderStatus {
  return ["READY", "IN_PROGRESS", "NEED_INFO", "DONE", "CANCELED"].includes(x);
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const statusParam = (url.searchParams.get("status") || "").trim().toUpperCase();

  // "سفارش‌های من" = فقط سفارش‌هایی که ownerId == me.id
  const { items, serverTime } = dbListOrders("my");

  // اگر status داده شد، فقط همون status رو برگردون
  const filtered = statusParam && isOrderStatus(statusParam)
    ? items.filter((o) => o.status === statusParam)
    : items;

  return NextResponse.json({ items: filtered, serverTime });
}
EOF

# اگر با pnpm اجرا می‌کنی
pnpm -C /opt/pgem-oms/frontend/pgem-oms-panel dev -- --port 3001
# یا اگر قبلاً با systemd/pm2 داری، همون سرویس رو restart کن
# اگر با pnpm اجرا می‌کنی
pnpm -C /opt/pgem-oms/frontend/pgem-oms-panel dev -- --port 3001
# یا اگر قبلاً با systemd/pm2 داری، همون سرویس رو restart کن
pnpm -C /opt/pgem-oms/frontend/pgem-oms-panel dev -- --port 3001
bash
nano src/lib/mockDb.ts
cd /opt/pgem-oms/frontend
nano src/lib/mockDb.ts
sed -n '1,140p' src/lib/mockDb.ts
/opt/pgem-oms/frontend/pgem-oms-panel/src/lib/mockDb.ts
nano /opt/pgem-oms/frontend/pgem-oms-panel/src/lib/mockDb.ts
nano src/app/api/reset/route.ts
reset/route.ts
nano reset/route.ts
/opt/pgem-oms/frontend/pgem-oms-panel
cd pgem-oms-panel
pwd
nano src/app/api/reset/route.ts
# ری‌استارت dev
# (پروژه خودت)
npm run dev
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/lib/mockDb.ts
nano src/app/api/reset/route.ts
# ری‌استارت dev
# (پروژه خودت)
npm run dev
curl -s http://127.0.0.1:3001/api/orders?scope=ready ; echo
curl -s -X POST http://127.0.0.1:3001/api/orders/5051486/claim ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
nano src/components/app-shell.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/components/app-shell.tsx
src/app/my-orders/page.tsx
nano src/app/my-orders/page.tsx
nano -m src/app/my-orders/page.tsx
cat src/app/my-orders/page.tsx
cat src/app/my-orders/page.tsx | pbcopy
nano src/app/my-orders/page.tsx
cp src/app/my-orders/page.tsx /tmp/page.txt
less /tmp/page.txt
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
type Status =
type Order = {
};
type TabKey = "ALL" | Status;
const TABS: { key: TabKey; label: string }[] = [
}
function StatusPill({ s }: { s: Status }) {
}
export default function MyOrdersPage() {
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/my-orders/page.tsx
# داخل همون پروژه
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
curl -s "http://127.0.0.1:3001/api/orders?scope=my" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=my" | grep -o '"status":"IN_PROGRESS"' | wc -l
cd /opt/pgem-oms/frontend/pgem-oms-panel
grep -R "سفارشات آماده انجام" -n src | head -n 20
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/components/app-shell.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
grep -R 'href="/orders-ready"' -n src | head -n 30
grep -R 'href="/orders"' -n src | head -n 30
grep -R 'همه سفارش‌ها' -n src | head -n 30
grep -R 'Mock Operator' -n src | head -n 30
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
grep -R "خروج" -n src/app | head -n 50
grep -R "داشبورد" -n src/app/dashboard | head -n 80
grep -R 'href="/dashboard"' -n src/app/dashboard src/components | head -n 80
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/dashboard/page.tsx
nano src/components/Shell.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/components/app-shell.tsx
nano src/app/my-orders/page.tsx
ls -la src/app/api/my-orders
sed -n '1,200p' src/app/api/my-orders/route.ts
grep -n 'new URL' -n src/app/my-orders/page.tsx | head -n 30
grep -n '/api/' src/app/my-orders/page.tsx | head -n 30
nano src/app/api/my-orders/route.ts
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/my-orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
nano src/components/OrderCard.tsx
nano export type OrderStatus = "READY" | "NEED_INFO" | "IN_PROGRESS" | "DONE" | "CANCELED";
export type OrderPublic = {
};
export type OrderSensitive = {
};
export type OrderFull = OrderPublic & OrderSensitive;
export const sanitizeOrder = (o: OrderFull): OrderPublic => ({
});
export const withSensitiveIfAllowed = (
): OrderPublic & OrderSensitive => {
};
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
curl -s "http://localhost:3001/api/orders?scope=all" | jq '.items[0]'
curl -s "http://localhost:3001/api/orders?scope=ready" | jq '.items[0]'
curl -s "http://localhost:3001/api/me" | jq
curl -s "http://localhost:3001/api/orders/5051639" | jq '.item'
curl -s "http://localhost:3001/api/orders?scope=all" | jq '.items[0]'
curl -s "http://localhost:3001/api/orders/5051639" | jq '.item'
jq --version
curl -s "http://localhost:3001/api/orders?scope=all" | jq '.items[0]'
curl -s "http://localhost:3001/api/orders?scope=ready" | jq '.items[0]'
curl -s "http://localhost:3001/api/me" | jq
curl -s "http://localhost:3001/api/orders/5051639" | jq '.item'
curl -s "http://localhost:3001/api/orders?scope=all" | head -c 2000
curl -s "http://localhost:3001/api/orders/5051639" | head -c 2000
curl -i "http://127.0.0.1:3001/api/me" | head -n 30
curl -i "http://[::1]:3001/api/me" | head -n 30
curl -i "http://localhost:3001/api/me" | head -n 30
ss -lntp | grep 3001 || true
ss -lntp | grep -E ':(3000|3001|3002|5678|80|443)\b' || true
curl -s "http://127.0.0.1:3000/api/me" | jq
curl -s "http://127.0.0.1:3000/api/orders?scope=all" | jq '.items[0]'
curl -s "http://127.0.0.1:3000/api/orders?scope=ready" | jq '.items[0]'
curl -s "http://127.0.0.1:3000/api/orders/5051639" | jq '.item'
ps -p 34140 -o pid,cmd
readlink -f /proc/34140/cwd
ls -l /proc/34140/fd | head -n 30
pnpm -v || true
npm -v
node -v
npm run dev -- --port 3001 --hostname 0.0.0.0
cd /opt/pgem-oms/frontend/pgem-oms-panel
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?q=505" ; echo
nano src/app/api/my-orders/route.ts
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1&status=IN_PROGRESS" ; echo
curl -s "http://127.0.0.1:3001/api/orders?scope=all" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1" ; echo
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
nano src/app/orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
nano src/app/orders/page.tsx
nano src/app/orders-ready/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
nano src/app/my-orders/page.tsx
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1" ; echo
nano src/app/my-orders/page.tsx
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1" ; echo
nano my-orders/page.tsx
nano src/app/my-orders/page.tsx
curl -s "http://127.0.0.1:3001/api/my-orders?ownerId=u-operator-1" ; echo
grep -n "useOMSStore" -n src/app/my-orders/page.tsx | head
grep -n "currentUser" -n src/app/my-orders/page.tsx | head -n 30
nano src/app/my-orders/page.tsx
curl -s "http://127.0.0.1:3001/api/me" ; echo
nano src/app/my-orders/page.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
npm run dev -- -p 3001
cd /opt/pgem-oms/frontend/pgem-oms-panel
curl -s "http://127.0.0.1:3001/api/orders?scope=ready" ; echo
curl -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders" ; echo
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" ; echo
ss -lntp | grep 3001 || true
curl -i "http://127.0.0.1:3001/api/me" | head -n 30
ls -R src/app/api | head -n 200
pnpm -v || true
ss -lntp | grep 3001 || true
nano 
nano src/components/OrderCard.tsx
sed -i '1s/^.*"use client";/"use client";/' src/components/OrderCard.tsx
head -n 3 src/components/OrderCard.tsx
nano src/app/api/my-orders/route.ts
sed -i '1s/^.*"use client";/"use client";/' src/components/OrderCard.tsx
head -n 3 src/components/OrderCard.tsx
npm run dev -- --port 3001 --hostname 0.0.0.0
curl -s "http://127.0.0.1:3001/api/me" | jq
curl -s "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0]'
curl -s "http://127.0.0.1:3001/api/orders/5051639" | jq '.item'
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq '.items[0]'
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/my-orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
curl -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim" | jq
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq
curl -s "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0]'
curl -s "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq '.items[0]'
curl -s "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
curl -s "http://127.0.0.1:3001/api/orders?scope=ready" | jq '.items[0]'
curl -s -X POST "http://127.0.0.1:3001/api/orders/5051486/claim" | jq
curl -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
curl -s "http://127.0.0.1:3001/api/orders/5051486" | head -c 1200
nano src/app/api/orders/[id]/route.ts
curl -s "http://127.0.0.1:3001/api/me" | jq
curl -s "http://127.0.0.1:3001/api/orders/5051486" | jq
curl -s "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
ls -l src/app/api/orders/[id]/route.ts
sed -n '1,120p' src/app/api/orders/[id]/route.ts
curl -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
command -v curl
type curl
command curl -sS -i "http://127.0.0.1:3001/api/orders/5051486"
command curl -sS "http://127.0.0.1:3001/api/orders/5051486"
nano src/app/api/orders/[id]/route.ts
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
grep -R --line-number "api/orders" -n src/app/api | head -n 80
grep -R --line-number "export async function GET" src/app/api/orders -n
nano src/app/api/order/route.ts
mkdir -p src/app/api/order && nano src/app/api/order/route.ts
nano src/app/orders/[id]/page.tsx
command curl -sS "http://127.0.0.1:3001/api/order?id=5051486" | jq
command curl -sS "http://127.0.0.1:3001/api/order?id=5051486" | jq '.item'
sed -n '1,160p' src/app/api/orders/[id]/claim/route.ts
sed -n '1,220p' src/app/api/_mock/db.ts
nano src/app/api/orders/[id]/claim/route.ts
nano src/app/api/_mock/db.ts
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
nano src/components/OrderCard.tsx
"use client";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/api";
export type OrderListItem = {
};
function statusBadge(status: string) {
}
export default function OrderCard({
}: {
}) {
}
command curl -sS "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0]'
command curl -sS "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq '.items[0]'
command curl -sS "http://127.0.0.1:3001/api/me" | jq
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq
command curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
command curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 40
command curl -sS -i "http://127.0.0.1:3001/api/orders?scope=all" | head -n 40
command curl -sS -i "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | head -n 40
command curl -sS -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 60
sed -n '1,120p' src/app/api/my-orders/route.ts
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 20
curl -sS "http://127.0.0.1:3001/api/me" | jq
curl -sS "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0] | keys'
curl -sS "http://127.0.0.1:3001/api/my-orders?status=IN_PROGRESS" | jq '.items[0] | keys'
curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq
curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item | keys'
http://SERVER_IP:3001/orders
sed -n '1,5p' src/components/OrderCard.tsx | cat -A
cd /opt/pgem-oms/frontend/pgem-oms-panel
rm -rf .next
pnpm dev -- --port 3001 --hostname 0.0.0.0
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders?scope=all" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders?scope=all" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders?scope=all" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders?scope=all" | head -n 25
curl -sS -i "http://127.0.0.1:3001/api/orders/5051486" | head -n 40
sed -n '1,160p' src/app/api/orders/[id]/route.ts | nl -ba
nano src/lib/orderSanitizer.ts
nano src/app/api/orders/route.ts
nano src/app/api/orders/[id]/route.ts
nano src/app/orders/[id]/page.tsx
nano src/components/OrderCard.tsx
cd /opt/pgem-oms/frontend/pgem-oms-panel
rm -rf .next
pnpm dev -- --port 3001 --hostname 0.0.0.0
curl -sS "http://127.0.0.1:3001/api/me" | jq
curl -sS "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0]'
curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
curl -sS "http://127.0.0.1:3001/api/me" | jq
curl -sS "http://127.0.0.1:3001/api/orders?scope=all" | jq '.items[0]'
curl -sS "http://127.0.0.1:3001/api/orders/5051486" | jq '.item'
curl -sS "http://127.0.0.1:3001/api/orders?scope=all" | jq '.. | objects | has("accountPassword")' | head
curl -sS -i "http://127.0.0.1:3001/api/me" | head -n 60
nano setup.sh
apt install unzip
mkdir -p /var/www/dashboard
mv deploy.zip /var/www/dashboard/
cd /var/www/dashboard
unzip deploy.zip
rm deploy.zip
npm install --production
sudo -u postgres psql
CREATE USER hamed WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE pgem_oms OWNER hamed;
\q
CREATE USER hamed WITH PASSWORD '77644351';
CREATE DATABASE pgem_oms OWNER hamed;
\q
nano .env
npm run build
npx prisma migrate deploy
pm2 start npm --name "dashboard" -- start
nano /etc/nginx/sites-available/dashboard
apt update
apt install -y nginx
nano /etc/nginx/sites-available/dashboard
ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
systemctl restart nginx
pm2 delete dashboard
# پیدا کردن PID پروسه مزاحم
lsof -i :3000
# یا اگر دستور بالا کار نکرد:
netstat -nlp | grep :3000
fuser -k 3000/tcp
cd /var/www/dashboard
npm run build
pm2 start npm --name "dashboard" -- start
python3 -c "import bcrypt; print(bcrypt.hashpw(b'123456', bcrypt.gensalt()).decode('utf-8'))"
pm2 logs dashboard
cd /var/www/dashboard
npm install --production
npm run build
npx prisma migrate deploy
pm2 start npm --name "dashboard" -- start
pm2 logs dashboard
npm install
npm install -g pm2
npm run build
nano .env
npx prisma migrate deploy
sudo -u postgres psql
ALTER USER hamed WITH PASSWORD '77644351';
\q
nano .env
npx prisma migrate deploy
PGPASSWORD='77644351' psql -h 127.0.0.1 -U hamed -d pgem_oms -c "SELECT 1"
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-client
PGPASSWORD='77644351' psql -h 127.0.0.1 -U hamed -d pgem_oms -c "SELECT 1"
sudo -u postgres psql
PGPASSWORD='77644351' psql -h 127.0.0.1 -U hamed -d pgem_oms -c "SELECT 1"
PGPASSWORD='77644351' psql -h 127.0.0.1 -U hamed -d pgem_oms < /root/backup.sql
pg_lsclusters
PGPASSWORD='77644351' psql -h 127.0.0.1 -p 5433 -U hamed -d pgem_oms < /root/backup.sql
nano .env
npx prisma migrate deploy
pm2 restart dashboard
sudo apt autoremove -y
sudo apt clean
pg_lsclusters
pm2 status
systemctl status nginx
nano .env
npx prisma migrate deploy
pm2 start npm --name "dashboard" -- start
pm2 save
pm2 startup
pm2 logs dashboard
pm2 delete dashboard
fuser -k 3000/tcp
pm2 start npm --name "dashboard" -- start
pm2 logs dashboardpm2 logs dashboard
apt install -y psmisc
pm2 delete all
fuser -k 3000/tcp
pm2 start npm --name "dashboard" -- start
pm2 save
pm2 delete dashboard
pm2 start npm --name "dashboard" -- start -- -p 3010
nano /etc/nginx/sites-available/dashboard
systemctl restart nginx
pm2 delete dashboard
PORT=3010 pm2 start npm --name "dashboard" -- start
pm2 logs dashboard --lines 20
pm2 stop dashboard
npm run build
PORT=3010 pm2 restart dashboard
pm2 logs dashboard --lines 20
pm2 stop dashboard
npm run build
nano app/api/admin/edit-order/route.ts
npm run build
PORT=3010 pm2 restart dashboard
nano app/api/admin/edit-order/route.ts
npm run build
nano tsconfig.json
npm run build
PORT=3010 pm2 restart dashboard
pm2 logs dashboard
cat .env
npx prisma generate
pm2 restart dashboard
cat .env
npx prisma generate
pm2 reload dashboard --update-env
pm2 logs dashboard --lines 50
pm2 delete dashboard
rm -rf .next
npx prisma generate
npm run build
PORT=3010 pm2 start npm --name "dashboard" -- start
pm2 logs dashboard --lines 50
cat /var/www/dashboard/.env
psql -h 127.0.0.1 -p 5433 -U hamed -d order_dashboard
psql -h 127.0.0.1 -p 5433 -U hamed -d pgem_oms
sudo -u postgres psql -p 5433
cd /var/www/dashboard
npx prisma migrate deploy
pm2 restart dashboard --update-env
npx prisma db push
npx prisma generate
pm2 restart dashboard
sudo -u postgres psql -p 5433
pm2 logs dashboard --lines 5pm2 logs dashboard --lines 5
psql -h 127.0.0.1 -p 5433 -U hamed -d pgem_oms
pm2 logs dashboard --err --lines 5pm2 logs dashboard --err --lines 50
DATABASE_URL="postgresql://hamed:77644351@127.0.0.1:5433/pgem_oms?schema=public" node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => console.log('CONNECTION OK')).catch(e => console.error('CONNECTION FAILED', e))"
DATABASE_URL="postgresql://hamed:77644351@127.0.0.1:5433/pgem_oms?schema=public" node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('CONNECTION OK')).catch(e => console.error('CONNECTION FAILED', e))"
pm2 delete dashboard
pm2 start npm --name "dashboard" -- start
pm2pm2
pm2 delete dashboard
pm2 start npm --name "dashboard"pm2 delete dashboard
pm2 start npm --name "dashboard"
pm2 delete all
pm2 start npm --name "dashboardpm2 start npm --name "dashboard" -- start
pm2 save
pm2 save
pm2 delete all
pm2 start npm --name "dashboardpm2 start npm --name "dashboard" -- start
pm2 start npm --name "dashboard" -- start
pm2 save
pm2 logs dashboard --lines 20
pm2 delete dashboard
pm2 start npm --name "dashboard" -- start -- -p 3010
pm2 save
pm2 logs dashboard --err --lines 50
pm2 delete dashboard && DATABASE_URL="postgresql://hamed:77644351@127.0.0.1:5433/pgem_oms?schema=public" pm2 start npm --name "dashboard" -- start -- -p 3010 && pm2 save
cd /var/www/dashboard
npm run build
pm2 restart dashboard
certbot --nginx -d dashboard.pgemshop.com
apt update
apt install certbot python3-certbot-nginx -y
certbot --nginx -d dashboard.pgemshop.com
cd /var/www/dashboard
npm run build
pm2 restart dashboard
pm2 logs dashboard --lines 100 | grep "webhook" -A 10 -B 5
cd /var/www/dashboard
npm run build
pm2 restart dashboard
cd /var/www/dashboard
npm run build
pm2 restart dashboard
npx prisma db push
npm run build
*/5 * * * * curl -s http://localhost:3000/api/cron/sync-recent > /dev/null
./deploy_ui_update.sh
/deploy_ui_update.sh
npx tsx scripts/check-verification-logic.ts
\q
npx tsx scripts/inspect-order.ts
\q
npx tsx scripts/inspect-order.ts
\q
exit
./deploy_server.sh
\q
exit
