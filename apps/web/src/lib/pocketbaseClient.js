import PocketBase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

const pb = new PocketBase(POCKETBASE_API_URL);

export default pb;
export { pb as pocketbaseClient };
