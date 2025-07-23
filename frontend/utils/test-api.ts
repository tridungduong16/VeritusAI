import { sendChatMessage } from './api';

/**
 * Simple test function to test the chat API
 */
export async function testChatAPI() {
  console.log('Starting API test...');
  
  try {
    console.log('Sending test message to API...');
    const response = await sendChatMessage('cho tui biết thông tin mới nhất về donald trump');
    
    console.log('API Response received:');
    console.log('Message:', response.message);
    console.log('Time taken:', response.time_taken, 'seconds');
    
    return {
      success: true,
      response
    };
  } catch (error) {
    console.error('API Test failed:', error.message);
    return {
      success: false,
      error
    };
  }
}

// Uncomment to run test directly
// testChatAPI().then(result => {
//   console.log('Test completed:', result.success ? 'SUCCESS' : 'FAILED');
// }); 