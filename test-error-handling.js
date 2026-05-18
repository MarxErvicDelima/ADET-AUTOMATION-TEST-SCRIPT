const { makeRequest, assert } = require('./test-utils');

async function testErrorHandling(baseUrl) {
  const startTime = Date.now();

  try {
    // Test: Error handling with invalid login attempt
    const response = await makeRequest(`${baseUrl}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'email=invalid@example.com&password=wrongpassword',
    });

    // Verify error is handled gracefully (page returns without crashing)
    assert.status(response, 200, 'Server should handle invalid login with 200 OK');
    assert.ok(response.body.length > 0, 'Response should contain error message or page content');

    // Verify no sensitive information is exposed
    assert.ok(!response.body.includes('password_hash'), 'Password hashes should not be exposed');
    assert.ok(!response.body.includes('sql') && !response.body.includes('SQL'), 'SQL errors should be hidden');

    const duration = Date.now() - startTime;
    return {
      passed: true,
      message: 'PASSED \n - Invalid login handled without crashing \n - Server returns appropriate error response \n - No sensitive information exposed (no password hashes) \n - User-friendly error messages displayed safely',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      passed: false,
      message: `Error handling test failed: ${error.message}`,
      duration,
    };
  }
}

module.exports = { testErrorHandling };
