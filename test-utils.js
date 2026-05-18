const http = require('http');
const https = require('https');
const { URL } = require('url');

function makeRequest(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 5000,
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const request = client.request(url, requestOptions, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: body,
          cookies: extractCookies(response.headers['set-cookie']),
        });
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

function extractCookies(setCookieHeaders) {
  if (!setCookieHeaders) return {};
  if (!Array.isArray(setCookieHeaders)) setCookieHeaders = [setCookieHeaders];

  const cookies = {};
  setCookieHeaders.forEach((header) => {
    const parts = header.split(';');
    const [name, value] = parts[0].split('=');
    if (name && value) {
      cookies[name.trim()] = value.trim();
    }
  });
  return cookies;
}

function printResult(result) {
  const icon = result.passed ? '✅' : '❌';
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  if (result.passed && typeof result.message === 'string' && result.message.startsWith('PASSED')) {
    console.log(` \x1b[32m✅  ${result.message} \x1b[0m (${result.duration}ms)`);
  } else {
    const simpleIcon = result.passed ? '✓' : '✗';
    console.log(`${color}${simpleIcon} ${result.message} (${result.duration}ms)${reset}`);
  }
}

function printSummary(results) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const total = results.length;

  console.log(`\nTests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  return { total, passed, failed, failCount: failed };
}

const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  },

  status(response, expectedCodes, message) {
    const codes = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];
    if (!codes.includes(response.status)) {
      throw new Error(`${message} (Got status: ${response.status})`);
    }
  },

  ok(value, message, response = null) {
    if (!value) {
      let fullMessage = message;
      if (response && response.body) {
        const bodySnippet = response.body.substring(0, 200).replace(/\n/g, ' ');
        fullMessage += `\n    [DEBUG] Response Body Start: ${bodySnippet}...`;
      }
      throw new Error(fullMessage);
    }
  },

  exists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
  },
};

module.exports = {
  makeRequest,
  extractCookies,
  printResult,
  printSummary,
  assert,
};
