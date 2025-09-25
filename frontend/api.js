// Use Vite environment variable for the backend URL. Vite requires variables to be prefixed with VITE_.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://virtual-assistant-backend-ittz.onrender.com' || 'http://localhost:8000';

export async function fetchCurrentUser() {
  const res = await fetch(`${BACKEND_URL}/api/user/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!res.ok) {
    let errorMsg = 'Network response was not ok ' + res.statusText;
    try {
      const errData = await res.json();
      errorMsg += ': ' + (errData.message || JSON.stringify(errData));
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export default BACKEND_URL;