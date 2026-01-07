#!/bin/bash

# Server Details
SERVER_USER="root"
SERVER_IP="185.110.188.77"
REMOTE_DIR="/var/www/dashboard"

echo "🚀 Uploading modified files to ..."

# Create new directories if needed
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/supervisor/sync-completed"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/external/orders-status"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/external/receive-order"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/admin/analytics"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/admin/analytics"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/components/admin/analytics"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/cron/fix-sync"
# Finance Module Directories
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/admin/finance/expenses/add"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/finance"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/api/cron/reminders"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/components/admin/finance"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/app/actions"

# Config
scp .env $SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env

# Prisma
scp prisma/schema.prisma $SERVER_USER@$SERVER_IP:$REMOTE_DIR/prisma/

# Libs
scp lib/utils.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/
scp lib/woocommerce.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/
scp lib/sync-helper.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/
scp lib/finance-service.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/

# Actions
scp app/actions/finance.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/actions/

# Layouts
scp app/admin/layout.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/

# API Routes
scp app/api/my-history/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/my-history/
scp app/api/supervisor/live-status/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/live-status/
scp app/api/orders/waiting/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/orders/waiting/
scp app/api/my-active-orders/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/my-active-orders/
scp app/api/supervisor/orders/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/orders/
scp app/api/orders/assign/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/orders/assign/
scp app/api/admin/edit-order/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/edit-order/
scp app/api/admin/edit-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/edit-order/
scp app/api/update-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/update-order/
scp app/api/supervisor/sync-completed/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/sync-completed/
scp app/api/external/orders-status/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/external/orders-status/
scp app/api/external/receive-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/external/receive-order/
scp app/api/webhook/woocommerce/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/webhook/woocommerce/
scp app/api/admin/analytics/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/analytics/
scp app/api/cron/fix-sync/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/cron/fix-sync/
scp app/api/cron/reminders/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/cron/reminders/

# Pages
scp app/admin/analytics/page.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/analytics/
scp app/admin/finance/page.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/finance/
scp app/admin/finance/expenses/add/page.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/finance/expenses/add/

# Components
scp components/admin/finance/*.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/admin/finance/

# Scripts
scp scripts/seed-finance.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/

echo "✅ Upload complete. Updating DB and Restarting PM2..."
ssh $SERVER_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # Install new dependencies if any (recharts is new)
    npm install recharts react-multi-date-picker react-date-object

    # Update DB Schema (Accept data loss for Expenses table change)
    npx prisma db push --accept-data-loss
    
    # Generate Client (Explicitly)
    npx prisma generate
    
    # Seed Finance Categories
    npx tsx scripts/seed-finance.ts

    # Build
    npm run build
    
    # Restart
    pm2 restart dashboard
EOF


# Config
scp .env $SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env

# Libs
scp lib/utils.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/
scp lib/woocommerce.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/
scp lib/sync-helper.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/lib/

# Layouts
scp app/admin/layout.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/

# API Routes
scp app/api/my-history/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/my-history/
scp app/api/supervisor/live-status/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/live-status/
scp app/api/orders/waiting/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/orders/waiting/
scp app/api/my-active-orders/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/my-active-orders/
scp app/api/supervisor/orders/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/orders/
scp app/api/orders/assign/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/orders/assign/
scp app/api/admin/edit-order/route.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/edit-order/
scp app/api/admin/edit-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/edit-order/
scp app/api/update-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/update-order/
scp app/api/supervisor/sync-completed/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/supervisor/sync-completed/
scp app/api/external/orders-status/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/external/orders-status/
scp app/api/external/receive-order/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/external/receive-order/
scp app/api/webhook/woocommerce/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/webhook/woocommerce/
scp app/api/admin/analytics/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/admin/analytics/
scp app/api/cron/fix-sync/route.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/api/cron/fix-sync/

# Pages
scp app/admin/analytics/page.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/app/admin/analytics/

# Components
scp components/OrderTimer.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/ActiveSlot.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/OrdersTable.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/
scp components/supervisor/MasterQueueTable.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/supervisor/
scp components/supervisor/CommandCenter.js $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/supervisor/
scp components/admin/analytics/AnalyticsDashboard.tsx $SERVER_USER@$SERVER_IP:$REMOTE_DIR/components/admin/analytics/

# Scripts
scp scripts/remove-duplicates.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/
scp scripts/fix-waiting-orders.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/
scp scripts/test-wc-connection.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/
scp scripts/manual-sync-completed.ts $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts/

echo "✅ Upload complete. Restarting PM2..."
ssh $SERVER_USER@$SERVER_IP "cd $REMOTE_DIR && rm -rf .next && npm run build && pm2 restart all"
echo "🎉 Done!"
