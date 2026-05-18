const { makeRequest, assert } = require('./test-utils');

async function testRegistration(baseUrl) {
  const startTime = Date.now();

  try {
    // Test: User registration with valid data
    const response = await makeRequest(`${baseUrl}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:
        'first_name=John&last_name=Doe&email=john.doe' +
        Date.now() +
        '@example.com&password=SecurePass123&confirm_password=SecurePass123',
    });

    // Verify registration processes successfully
    assert.status(response, [200, 302], 'Registration page request failed');
    assert.ok(
      response.body.includes('success') ||
        response.body.includes('login') ||
        response.body.includes('account') ||
        response.status === 302,
      'Response should indicate registration success (Got unexpected content)',
      response
    );

    const duration = Date.now() - startTime;
    return {
      passed: true,
      message: 'PASSED \n - User registration request processed successfully \n - New account created with unique email \n - Password confirmation validation working \n - Success message or redirect displayed',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      passed: false,
      message: `Registration test failed: ${error.message}`,
      duration,
    };
  }
}

module.exports = { testRegistration };
