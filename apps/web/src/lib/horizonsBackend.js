// Single PocketBase client — re-exports pocketbaseClient to avoid duplicate instances
import pocketbaseClient from './pocketbaseClient.js';

export default pocketbaseClient;
export { pocketbaseClient as horizonsBackend };
