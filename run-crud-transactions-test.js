const { testCRUDTransactions } = require('./test-crud-transactions');
const { printResult, printSummary } = require('./test-utils');

async function runTest() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  console.log(`\n========== TEST SUITE 3: CRUD TRANSACTIONS ==========`);
  console.log(`Testing URL: ${baseUrl}\n`);

  try {
    const result = await testCRUDTransactions(baseUrl);
    printResult(result);
    const summary = printSummary([result]);
    process.exit(summary.failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
