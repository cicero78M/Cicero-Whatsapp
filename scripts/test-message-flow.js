#!/usr/bin/env node

/**
 * Test script to simulate WhatsApp message flow
 * This helps verify the message handling logic without needing actual WhatsApp connection
 */

import { EventEmitter } from 'events';

// Test timing constants
const MOCK_AUTH_DELAY_MS = 100;
const MOCK_READY_DELAY_MS = 200;
const MOCK_INIT_COMPLETE_MS = 250;
const READY_STATE_WAIT_MS = 100;
const MESSAGE_PROCESSING_WAIT_MS = 100;

// Mock WhatsApp message object
function createMockMessage(from, body, id = null) {
  return {
    from,
    body,
    id: id || {
      _serialized: `${from}-${Date.now()}-${Math.random()}`
    },
    timestamp: Date.now(),
    reply: async function(text) {
      console.log(`[Mock] Replying to ${this.from}: ${text}`);
      return { success: true };
    }
  };
}

// Mock WhatsApp Client
class MockWhatsAppClient extends EventEmitter {
  constructor(clientId) {
    super();
    this.clientId = clientId;
    this.isReady = false;
  }

  async initialize() {
    console.log(`[MockClient] Initializing ${this.clientId}...`);
    
    // Simulate authentication
    setTimeout(() => {
      console.log(`[MockClient] ${this.clientId} authenticated`);
      this.emit('authenticated');
    }, MOCK_AUTH_DELAY_MS);

    // Simulate ready event
    setTimeout(() => {
      console.log(`[MockClient] ${this.clientId} ready`);
      this.isReady = true;
      this.emit('ready');
    }, MOCK_READY_DELAY_MS);

    return new Promise(resolve => setTimeout(resolve, MOCK_INIT_COMPLETE_MS));
  }

  async sendMessage(chatId, message) {
    console.log(`[MockClient] Sending to ${chatId}: ${message}`);
    return { success: true };
  }

  // Simulate receiving a message
  simulateMessage(from, body) {
    console.log(`[MockClient] Simulating incoming message from ${from}: ${body}`);
    const message = createMockMessage(from, body);
    this.emit('message', message);
  }
}

// Test the event flow
async function testMessageFlow() {
  console.log('\n========== Testing WhatsApp Message Flow ==========\n');

  // Create mock clients
  const userClient = new MockWhatsAppClient('wa-user-test');
  const gatewayClient = new MockWhatsAppClient('wa-gateway-test');

  // Track events
  let userMessageReceived = false;
  let gatewayMessageReceived = false;

  // Attach message handlers (simulating WhatsAppService)
  userClient.on('message', (message) => {
    console.log(`[Test] User client received message event: from=${message.from}, body=${message.body}`);
    userMessageReceived = true;
  });

  gatewayClient.on('message', (message) => {
    console.log(`[Test] Gateway client received message event: from=${message.from}, body=${message.body}`);
    gatewayMessageReceived = true;
  });

  // Attach ready handlers
  userClient.on('ready', () => {
    console.log('[Test] ✅ User client is READY - can now receive messages');
  });

  gatewayClient.on('ready', () => {
    console.log('[Test] ✅ Gateway client is READY - can now receive messages');
  });

  // Initialize clients
  console.log('[Test] Initializing clients...');
  await Promise.all([
    userClient.initialize(),
    gatewayClient.initialize(),
  ]);
  console.log('[Test] Clients initialized\n');

  // Wait for ready state
  await new Promise(resolve => setTimeout(resolve, READY_STATE_WAIT_MS));

  // Simulate incoming messages
  console.log('[Test] Simulating incoming messages...\n');
  userClient.simulateMessage('1234567890@c.us', '!status');
  gatewayClient.simulateMessage('0987654321@c.us', 'Hello');

  // Wait for message processing
  await new Promise(resolve => setTimeout(resolve, MESSAGE_PROCESSING_WAIT_MS));

  // Verify results
  console.log('\n========== Test Results ==========');
  console.log(`User message received: ${userMessageReceived ? '✅' : '❌'}`);
  console.log(`Gateway message received: ${gatewayMessageReceived ? '✅' : '❌'}`);
  
  if (userMessageReceived && gatewayMessageReceived) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

// Run the test
testMessageFlow().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
