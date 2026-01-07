import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { syncOrderWithWooCommerce } from '../lib/sync-helper';
import { getStoreConfig } from '../lib/store-config';

const prisma = new PrismaClient();

const SOURCE = 'arzan'; // The source ID to import from

async function importArzanHistory() {
  console.log('=============================================');
  console.log('🚀 Starting Historical Import for: ' + SOURCE);
  
  const store = getStoreConfig(SOURCE);
  if (!store || !store.url || !store.consumerKey) {
      console.error('❌ Config missing for store: ' + SOURCE + '. Check .env and store-config.ts');
      process.exit(1);
  }

  const { url: siteUrl, consumerKey: key, consumerSecret: secret } = store;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  
  let page = 1;
  const PER_PAGE = 20;
  let hasNextPage = true;
  let totalImported = 0;

  console.log('📡 Connecting to ' + siteUrl + '...');

  while (hasNextPage) {
      console.log('\n📄 Fetching Page ' + page + '...');
      
      try {
          const res = await fetch(`${siteUrl}/wp-json/wc/v3/orders?per_page=${PER_PAGE}&page=${page}`, {
              headers: {
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/json'
              },
              cache: 'no-store'
          });

          if (!res.ok) {
              const text = await res.text();
              console.error('❌ API Error (Page ' + page + '): ' + res.status + ' - ' + text.substring(0, 100));
              
              if (res.status === 400 || res.status === 404) {
                  hasNextPage = false; 
                  break;
              }
              console.log("⏳ Retrying in 5 seconds...");
              await new Promise(r => setTimeout(r, 5000));
              continue;
          }

          const orders = await res.json();
          if (!Array.isArray(orders) || orders.length === 0) {
              console.log('✅ No more orders found. Finished.');
              hasNextPage = false;
              break;
          }

          console.log('📦 Page ' + page + ': Received ' + orders.length + ' orders. Syncing...');

          for (const order of orders) {
              try {
                  const result = await syncOrderWithWooCommerce(order, SOURCE);
                  process.stdout.write('✅ #' + order.id + ' ');
                  totalImported++;
              } catch (e: any) {
                  process.stdout.write('❌ #' + order.id + ' ');
                  console.error('\nError syncing ' + order.id + ':', e.message);
              }
          }
          console.log('\n'); 

          page++;

      } catch (e: any) {
          console.error('❌ Network/Script Error on Page ' + page + ':', e.message);
          await new Promise(r => setTimeout(r, 5000));
      }
  }

  console.log('=============================================');
  console.log('🎉 Import Complete! Total Orders: ' + totalImported);
  process.exit(0);
}

importArzanHistory();
