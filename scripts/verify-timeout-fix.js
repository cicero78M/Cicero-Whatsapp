#!/usr/bin/env node
/**
 * Verification script for WhatsApp timeout configuration fix
 * Run with: node scripts/verify-timeout-fix.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('='.repeat(60));
console.log('WhatsApp Timeout Configuration Verification');
console.log('='.repeat(60));
console.log('');

// Test 1: Check env.js default
console.log('Test 1: Checking env.js default timeout...');
try {
  const envPath = join(__dirname, '../src/config/env.js');
  const { readFile } = await import('fs/promises');
  const envContent = await readFile(envPath, 'utf8');
  
  // Look for the default value
  const match = envContent.match(/WA_WWEBJS_PROTOCOL_TIMEOUT_MS:\s*num\(\{\s*default:\s*(\d+)/);
  if (match) {
    const defaultValue = parseInt(match[1], 10);
    const expected = 180000;
    
    if (defaultValue === expected) {
      console.log(`  ✓ PASS: Default is ${defaultValue}ms (3 minutes)`);
    } else {
      console.log(`  ✗ FAIL: Default is ${defaultValue}ms, expected ${expected}ms`);
    }
  } else {
    console.log('  ✗ FAIL: Could not find default value in env.js');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading env.js: ${error.message}`);
}
console.log('');

// Test 2: Check WhatsAppService.js waitForReady timeout
console.log('Test 2: Checking WhatsAppService.js waitForReady timeout...');
try {
  const servicePath = join(__dirname, '../src/whatsapp/WhatsAppService.js');
  const { readFile } = await import('fs/promises');
  const serviceContent = await readFile(servicePath, 'utf8');
  
  // Look for waitForReady calls with 200000
  const matches = serviceContent.match(/waitForReady\((\d+)\)/g);
  if (matches && matches.length >= 2) {
    const allCorrect = matches.every(m => m.includes('200000'));
    if (allCorrect) {
      console.log(`  ✓ PASS: Both waitForReady calls use 200000ms (3m 20s)`);
    } else {
      console.log(`  ✗ FAIL: waitForReady calls don't use 200000ms`);
      console.log(`  Found: ${matches.join(', ')}`);
    }
  } else {
    console.log('  ✗ FAIL: Could not find waitForReady calls');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading WhatsAppService.js: ${error.message}`);
}
console.log('');

// Test 3: Check WhatsAppClient.js error message
console.log('Test 3: Checking WhatsAppClient.js enhanced error message...');
try {
  const clientPath = join(__dirname, '../src/whatsapp/client/WhatsAppClient.js');
  const { readFile } = await import('fs/promises');
  const clientContent = await readFile(clientPath, 'utf8');
  
  // Check for improved error message
  const hasEnhancedError = clientContent.includes('Troubleshooting steps:') &&
                           clientContent.includes('WA_WWEBJS_PROTOCOL_TIMEOUT_MS env var');
  
  if (hasEnhancedError) {
    console.log('  ✓ PASS: Enhanced error message with troubleshooting steps found');
  } else {
    console.log('  ✗ FAIL: Enhanced error message not found');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading WhatsAppClient.js: ${error.message}`);
}
console.log('');

// Test 4: Check WhatsAppClient.js load time tracking
console.log('Test 4: Checking WhatsAppClient.js load time tracking...');
try {
  const clientPath = join(__dirname, '../src/whatsapp/client/WhatsAppClient.js');
  const { readFile } = await import('fs/promises');
  const clientContent = await readFile(clientPath, 'utf8');
  
  // Check for authTimestamp and loadDuration
  const hasAuthTimestamp = clientContent.includes('this.authTimestamp = null');
  const hasLoadDuration = clientContent.includes('loadDuration') && 
                         clientContent.includes('Date.now() - this.authTimestamp');
  
  if (hasAuthTimestamp && hasLoadDuration) {
    console.log('  ✓ PASS: Load time tracking implemented');
  } else {
    console.log('  ✗ FAIL: Load time tracking not found');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading WhatsAppClient.js: ${error.message}`);
}
console.log('');

// Test 5: Check .env.example
console.log('Test 5: Checking .env.example recommended values...');
try {
  const envExamplePath = join(__dirname, '../.env.example');
  const { readFile } = await import('fs/promises');
  const envExampleContent = await readFile(envExamplePath, 'utf8');
  
  // Check for updated values
  const has180k = envExampleContent.includes('WA_WWEBJS_PROTOCOL_TIMEOUT_MS=180000');
  const has240k = envExampleContent.includes('WA_WWEBJS_PROTOCOL_TIMEOUT_MS_GATEWAY=240000');
  
  if (has180k && has240k) {
    console.log('  ✓ PASS: .env.example has updated timeout values');
  } else {
    console.log('  ✗ FAIL: .env.example timeout values not updated');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading .env.example: ${error.message}`);
}
console.log('');

// Test 6: Check documentation
console.log('Test 6: Checking timeout troubleshooting documentation...');
try {
  const docPath = join(__dirname, '../docs/wa_timeout_troubleshooting.md');
  const { readFile } = await import('fs/promises');
  const { access } = await import('fs/promises');
  
  await access(docPath);
  const docContent = await readFile(docPath, 'utf8');
  
  const hasScenarios = docContent.includes('Common Scenarios and Solutions');
  const hasTroubleshooting = docContent.includes('Troubleshooting');
  
  if (hasScenarios && hasTroubleshooting) {
    console.log('  ✓ PASS: Comprehensive troubleshooting documentation exists');
  } else {
    console.log('  ✗ FAIL: Documentation incomplete');
  }
} catch (error) {
  console.log(`  ✗ FAIL: Error reading documentation: ${error.message}`);
}
console.log('');

console.log('='.repeat(60));
console.log('Verification Complete');
console.log('='.repeat(60));
console.log('');
console.log('Summary:');
console.log('- Default timeout increased from 120s to 180s (3 minutes)');
console.log('- waitForReady timeout increased to 200s (3m 20s)');
console.log('- Enhanced error messages with troubleshooting steps');
console.log('- Load time tracking for diagnostics');
console.log('- Comprehensive documentation added');
console.log('');
console.log('The fix addresses the "ready timeout after 120000ms" issue by:');
console.log('1. Providing more time for slow/high-latency connections');
console.log('2. Adding better error messages to guide troubleshooting');
console.log('3. Implementing load time tracking for monitoring');
console.log('4. Creating comprehensive troubleshooting documentation');
