#!/bin/bash

# Server Details
SERVER_USER="root"
SERVER_IP="185.110.188.77"
REMOTE_DIR="/var/www/dashboard"

echo "🚀 Starting Deployment of UI & Verification Updates..."

# 1. Upload Files
echo "📤 Uploading files..."

# Prisma Schema
scp prisma/schema.prisma $SERVER_USER@$SERVER_IP:$REMOTE_DIR/prisma/

# Libs
scp lib/sync-helper.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/

# API Routes
scp app/api/webhook/woocommerce/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/webhook/woocommerce/

# Components
scp components/OrdersTable.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/OrderCard.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/ActiveSlot.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/dashboard/ActiveSlot.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/dashboard/
scp components/FocusModal.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/

# Scripts
scp scripts/update-verification-status.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/
scp scripts/sync-users-verification.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/

# Webhooks
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/webhook/customer"
scp app/api/webhook/customer/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/webhook/customer/

echo "✅ Files uploaded."

# 2. Run Commands on Server
echo "🔧 Running server commands..."
ssh $SERVER_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    echo "🔄 Syncing Database..."
    # We use db push because we are in dev/prototype mode. 
    # In production with sensitive data, migrate deploy is better, but here we follow the user's workflow.
    npx prisma db push
    npx prisma generate

    echo "🏗 Building Application..."
    npm run build
    
    echo "🔄 Updating Verification Status for Active Orders..."
    npx tsx scripts/update-verification-status.ts
    
    echo "🔄 Full User Verification Sync (Background)..."
    # Run in background
    nohup npx tsx scripts/sync-users-verification.ts > sync_log.txt 2>&1 &

    echo "♻️ Restarting PM2..."
    pm2 restart all

    echo "✅ Deployment Complete!"
EOF
