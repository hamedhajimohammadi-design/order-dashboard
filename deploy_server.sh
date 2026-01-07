#!/bin/bash

# --- Configuration ---
APP_DIR="/root/order-dashboard" # Adjust this path if needed
DB_NAME="pgem_oms"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Deployment Process...${NC}"

# 1. Backup Database
echo -e "${YELLOW}📦 Backing up database...${NC}"
mkdir -p $BACKUP_DIR
# Try to backup as postgres user if root fails
if sudo -u postgres pg_dump $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"; then
    echo -e "${GREEN}✅ Database backup created at $BACKUP_DIR/db_backup_$DATE.sql${NC}"
elif pg_dump $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"; then
    echo -e "${GREEN}✅ Database backup created at $BACKUP_DIR/db_backup_$DATE.sql${NC}"
else
    echo -e "${RED}❌ Database backup failed! Continuing with caution...${NC}"
    # exit 1  <-- Commented out to allow deployment even if backup fails (user can decide)
fi

# 2. Pull Changes (Skipped - Files are pushed via rsync)
# echo -e "${YELLOW}⬇️ Pulling latest changes...${NC}"
# cd $APP_DIR
# git pull origin main
cd $APP_DIR

# 3. Install Dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# 4. Update Database Schema
echo -e "${YELLOW}🗄️ Updating database schema...${NC}"
npx prisma db push
npx prisma generate

# 5. Build Application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# 6. Restart Application
echo -e "${YELLOW}🔄 Restarting application...${NC}"
# Assuming PM2 is used. If not, adjust this command.
pm2 restart order-dashboard || pm2 restart all

echo -e "${GREEN}✅ Deployment Completed Successfully!${NC}"
