const { testInputValidation } = require('./test-input-validation');
const { printResult, printSummary } = require('./test-utils');

async function runTest() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  console.log(`\n========== TEST SUITE 5: INPUT VALIDATION ==========`);
  console.log(`Testing URL: ${baseUrl}\n`);

  try {
    const result = await testInputValidation(baseUrl);
    printResult(result);
    const summary = printSummary([result]);
    process.exit(summary.failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
