import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

const horizonsBackend = new Pocketbase(POCKETBASE_API_URL);

// Persist auth token across sessions using localStorage
horizonsBackend.authStore.onChange(() => {
  localStorage.setItem('pb_auth', JSON.stringify({
    token: horizonsBackend.authStore.token,
    model: horizonsBackend.authStore.model,
  }));
});

// Restore auth on page load
try {
  const stored = localStorage.getItem('pb_auth');
  if (stored) {
    const { token, model } = JSON.parse(stored);
    horizonsBackend.authStore.save(token, model);
  }
} catch (e) {
  localStorage.removeItem('pb_auth');
}

export default horizonsBackend;
export { horizonsBackend };
