import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

const horizonsBackend = new Pocketbase(POCKETBASE_API_URL);

export default horizonsBackend;
export { horizonsBackend };
