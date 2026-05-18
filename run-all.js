const { testLoginFunctionality } = require('./test-login-functionality');
const { testRegistration } = require('./test-registration');
const { testCRUDTransactions } = require('./test-crud-transactions');
const { testErrorHandling } = require('./test-error-handling');
const { testInputValidation } = require('./test-input-validation');
const { printResult, printSummary, makeRequest } = require('./test-utils');

async function checkServer(baseUrl) {
  try {
    await makeRequest(baseUrl);
    return true;
  } catch (error) {
    return false;
  }
}

async function runAllTests() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  
  console.log('\n==========================================================');
  console.log('       RIGCHECK AUTOMATED TEST SUITE RUNNER');
  console.log('==========================================================');
  console.log(`Target URL: ${baseUrl}`);
  
  const isUp = await checkServer(baseUrl);
  if (!isUp) {
    console.log('\n\x1b[31m❌ ERROR: PHP Server is not responding at ' + baseUrl + '\x1b[0m');
    console.log('\nPlease start your server using:');
    console.log('\x1b[33mphp -d auto_prepend_file=none -S localhost:8000\x1b[0m');
    console.log('\n(Note: The "-d auto_prepend_file=none" flag fixes the Laravel Herd crash)\n');
    process.exit(1);
  }

  // Check if index.php exists to diagnose 404s
  try {
    const diag = await makeRequest(`${baseUrl}/diag.php`);
    if (diag.status === 404) {
      console.log('\n\x1b[33m⚠️ WARNING: Server is UP but returning 404 for project files.\x1b[0m');
      console.log('This usually means the PHP server was started in the wrong directory.');
      console.log('\n\x1b[1mPlease RESTART your server exactly like this:\x1b[0m');
      console.log(`1. Open a new terminal.`);
      console.log(`2. Run: \x1b[32mcd "/Users/mverick/Downloads/htdocs 4"\x1b[0m`);
      console.log(`3. Run: \x1b[32mphp -d auto_prepend_file=none -S localhost:8000\x1b[0m`);
      console.log('\nThen try running the tests again.\n');
      process.exit(1);
    }
  } catch (e) {
    // Ignore diag errors
  }

  const suites = [
    { name: 'LOGIN FUNCTIONALITY', fn: testLoginFunctionality },
    { name: 'REGISTRATION', fn: testRegistration },
    { name: 'CRUD TRANSACTIONS', fn: testCRUDTransactions },
    { name: 'ERROR HANDLING', fn: testErrorHandling },
    { name: 'INPUT VALIDATION', fn: testInputValidation }
  ];

  const allResults = [];

  for (const suite of suites) {
    console.log(`\n========== TEST SUITE: ${suite.name} ==========`);
    try {
      const result = await suite.fn(baseUrl);
      printResult(result);
      allResults.push(result);
    } catch (error) {
      const failure = { passed: false, message: error.message, duration: 0 };
      printResult(failure);
      allResults.push(failure);
    }
  }

  console.log('\n==========================================================');
  console.log('                   FINAL TEST SUMMARY');
  console.log('==========================================================');
  printSummary(allResults);
  console.log('==========================================================\n');
}

runAllTests();
