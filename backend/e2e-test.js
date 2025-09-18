(async () => {
  const base = 'http://localhost:8000';
  const email = `testuser${Date.now()}@example.com`;
  const password = 'Test@1234';
  const name = 'Test User';

  function extractCookies(setCookieHeader) {
    if (!setCookieHeader) return [];
    // setCookieHeader can be a single string or an array
    const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    return arr.map(s => s.split(';')[0]).filter(Boolean);
  }

  try {
    console.log('Signing up with', email);
    const signupRes = await fetch(base + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const signupBody = await signupRes.text();
    console.log('Signup status', signupRes.status);
    console.log('Signup body', signupBody);
    const signupCookies = extractCookies(signupRes.headers.get('set-cookie'));
    console.log('Signup set-cookie:', signupCookies);

    console.log('\nLogging in');
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginBody = await loginRes.text();
    console.log('Login status', loginRes.status);
    console.log('Login body', loginBody);
    const loginCookies = extractCookies(loginRes.headers.get('set-cookie'));
    console.log('Login set-cookie:', loginCookies);

    const cookies = [...signupCookies, ...loginCookies].join('; ');
    console.log('\nUsing cookies for /api/user/current:', cookies);

    const currentRes = await fetch(base + '/api/user/current', {
      method: 'GET',
      headers: { Cookie: cookies },
    });
    const currentBody = await currentRes.text();
    console.log('Current status', currentRes.status);
    console.log('Current body', currentBody);

  } catch (err) {
    console.error('Error running e2e test', err);
    process.exit(1);
  }
})();
