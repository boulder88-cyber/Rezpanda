import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

// Persist auth token across sessions using localStorage
pocketbaseClient.authStore.onChange(() => {
  localStorage.setItem('pb_auth', JSON.stringify({
    token: pocketbaseClient.authStore.token,
    model: pocketbaseClient.authStore.model,
  }));
});

// Restore auth on page load
try {
  const stored = localStorage.getItem('pb_auth');
  if (stored) {
    const { token, model } = JSON.parse(stored);
    pocketbaseClient.authStore.save(token, model);
  }
} catch (e) {
  localStorage.removeItem('pb_auth');
}

export default pocketbaseClient;
export { pocketbaseClient };
