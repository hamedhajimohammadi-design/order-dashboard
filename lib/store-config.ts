export interface StoreConfig {
  id: string;
  name: string;
  url: string;
  consumerKey: string;
  consumerSecret: string;
  color: string;
}

export const STORES: StoreConfig[] = [
  {
    id: 'pgem',
    name: 'PGem Shop',
    url: process.env.WC_SITE_URL || 'https://pgemshop.com',
    consumerKey: process.env.WC_CONSUMER_KEY || '',
    consumerSecret: process.env.WC_CONSUMER_SECRET || '',
    color: 'purple'
  },
  {
    id: 'arzan',
    name: 'Arzan Game',
    url: process.env.WC_SITE_URL_ARZAN || 'https://arzangame.com', 
    consumerKey: process.env.WC_CONSUMER_KEY_ARZAN || '',
    consumerSecret: process.env.WC_CONSUMER_SECRET_ARZAN || '',
    color: 'orange'
  }
];

export function getStoreConfig(source: string) {
    return STORES.find(s => s.id === source) || STORES[0];
}
