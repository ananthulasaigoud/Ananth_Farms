// n8n webhook integration utilities
import { getWebhookUrl, WEBHOOK_CONFIG, shouldUseFallback } from '@/config/webhook';

export const N8N_WEBHOOK_URL = getWebhookUrl();

export interface N8NWebhookPayload {
  message: string;
  timestamp: string;
  userId: string;
  context?: {
    crops?: any[];
    landExpenses?: any[];
    [key: string]: any;
  };
}

export interface N8NWebhookResponse {
  response?: string;
  message?: string;
  answer?: string;
  text?: string;
  content?: string;
  reply?: string;
  output?: string;
  result?: string;
  success?: boolean;
  error?: string;
  rawResponse?: string; // For debugging malformed responses
  [key: string]: any; // Allow any additional fields
}

// Fallback responses when n8n is unavailable
const FALLBACK_RESPONSES = {
  "how to maximize farm profits": "To maximize farm profits, focus on: 1) Track all expenses carefully, 2) Choose high-value crops, 3) Optimize input costs, 4) Monitor market prices, 5) Implement crop rotation for soil health.",
  "best time to plant crops": "The best planting time depends on your region and crop type. Generally: Rice - June-July, Wheat - November-December, Cotton - April-May, Vegetables - varies by type. Check local agricultural extension for specific timing.",
  "how to reduce farming expenses": "Reduce farming expenses by: 1) Buy inputs in bulk during off-season, 2) Use organic alternatives to chemical fertilizers, 3) Implement efficient irrigation, 4) Share equipment with neighboring farmers, 5) Plan crop rotation to reduce pest control costs.",
  "crop rotation advice": "Crop rotation helps maintain soil health and reduce pests. Good rotation: Legumes (fix nitrogen) → Grains → Vegetables → Fallow. Avoid planting the same crop family in the same area for 3-4 years.",
  "weather impact on farming": "Weather significantly affects farming: 1) Monitor forecasts regularly, 2) Plan irrigation based on rainfall predictions, 3) Consider crop insurance for weather risks, 4) Adjust planting schedules based on weather patterns, 5) Use weather-resistant crop varieties.",
  "soil management tips": "Maintain healthy soil by: 1) Test soil regularly for nutrients, 2) Add organic matter (compost, manure), 3) Practice no-till farming where possible, 4) Use cover crops, 5) Maintain proper pH levels for your crops."
};

/**
 * Format bot text into a neat, readable structure
 */
export function formatBotText(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // Normalize line breaks after long intro sentence
  text = text.replace(/(:)\s*\*/g, '$1\n*');

  // Ensure each Expense header starts on a new line and becomes a top-level bullet
  text = text.replace(/\*\s+\*\*Expense\s+(\d+)\s*:\s*\*/gi, '\n- Expense $1');

  // Convert label bullets like '* **Category:** Value' into indented bullets '  - Category: Value'
  text = text.replace(/\*\s+\*\*([^:*]+)\s*:\s*\*\*\s*/g, '  - $1: ');

  // Convert any remaining asterisk bullets to standard '- '
  text = text.replace(/^\s*\*\s+/gm, '- ');

  // Fix dates with spaces around dashes: 2025 -05-22 -> 2025-05-22
  text = text.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');

  // Collapse extra spaces
  text = text.replace(/[\t ]{2,}/g, ' ');

  // Add a newline after "Here are the ..." line if not present
  text = text.replace(/^(Here are[^\n]+?):\s*(?!\n)/i, '$1:\n');

  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/** Additional options for sendToN8N */
export interface SendToN8NOptions {
  signal?: AbortSignal;
}

/**
 * Send a message to the n8n webhook and get AI response
 */
export async function sendToN8N(payload: N8NWebhookPayload, options?: SendToN8NOptions): Promise<N8NWebhookResponse> {
  try {
    console.log('🚀 Sending request to n8n webhook:', {
      url: N8N_WEBHOOK_URL,
      payload,
      timestamp: new Date().toISOString()
    });

    // Add CORS headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.TIMEOUT_MS);

    // If caller provided an external signal, mirror it into our controller
    if (options?.signal) {
      if (options.signal.aborted) controller.abort();
      else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: WEBHOOK_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: WEBHOOK_CONFIG.CORS_MODE,
    });

    clearTimeout(timeoutId);

    console.log('📡 Received response from n8n:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('📄 Raw webhook response:', responseText);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response:', data);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response, attempting to clean and reparse:', parseError);
      
      // Try to extract JSON from the response if it contains extra text
      try {
        // Handle n8n streaming responses with multiple JSON objects
        const lines = responseText.trim().split('\n');
        let allContent: string[] = [];
        
        console.log(`📝 Processing ${lines.length} response lines:`, lines);
        
        // Look for ALL lines with "content" field and combine them
        for (const line of lines) {
          if (line.includes('"content"')) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.content && typeof parsed.content === 'string') {
                allContent.push(parsed.content);
                console.log('🎯 Found content line:', parsed.content);
              }
            } catch (e) {
              console.warn('❌ Failed to parse content line:', e);
              continue;
            }
          }
        }
        
        if (allContent.length > 0) {
          // Combine all content parts into one complete response
          const completeContent = allContent.join(' ').trim();
          console.log('🔗 Combined all content parts:', completeContent);
          
          // Return clean response with complete content
          data = { 
            response: completeContent, 
            success: true,
            source: 'n8n_streaming',
            contentParts: allContent.length
          };
          console.log('✅ Successfully extracted complete content from n8n streaming response:', data);
        } else {
          // Fallback: try to extract any valid JSON
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from response:', data);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (cleanupError) {
        console.error('❌ Failed to clean and parse response:', cleanupError);
        
        // Return a fallback response with the raw text
        return {
          response: `Received response but couldn't parse it properly. Raw response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`,
          success: false,
          error: 'malformed_response',
          rawResponse: responseText
        };
      }
    }
    
    console.log('🎉 Final processed data:', data);
    return data;
  } catch (error) {
    console.error('💥 Error calling n8n webhook:', error);
    
    // Check if it's a CORS or network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('🌐 CORS or network error detected. Using fallback responses.');
      
      // Only use fallbacks if enabled
      if (shouldUseFallback()) {
        return {
          response: getFallbackResponse(payload.message),
          success: false,
          error: 'webhook_unavailable'
        };
      }
    }
    
    // If aborted, surface a standard shape
    if ((error as any)?.name === 'AbortError') {
      return {
        response: 'Request cancelled',
        success: false,
        error: 'aborted'
      };
    }

    throw error;
  }
}

/**
 * Get a fallback response when n8n webhook is unavailable
 */
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for exact matches first
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Check for partial matches
  if (lowerMessage.includes('profit') || lowerMessage.includes('earn') || lowerMessage.includes('money')) {
    return FALLBACK_RESPONSES["how to maximize farm profits"];
  }
  
  if (lowerMessage.includes('plant') || lowerMessage.includes('sow') || lowerMessage.includes('timing')) {
    return FALLBACK_RESPONSES["best time to plant crops"];
  }
  
  if (lowerMessage.includes('expense') || lowerMessage.includes('cost') || lowerMessage.includes('save')) {
    return FALLBACK_RESPONSES["how to reduce farming expenses"];
  }
  
  if (lowerMessage.includes('rotation') || lowerMessage.includes('soil health')) {
    return FALLBACK_RESPONSES["crop rotation advice"];
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('climate')) {
    return FALLBACK_RESPONSES["weather impact on farming"];
  }
  
  if (lowerMessage.includes('soil') || lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
    return FALLBACK_RESPONSES["soil management tips"];
  }
  
  // Default helpful response
  return "I'm here to help with your farming questions! I can provide advice on crop management, expense reduction, soil health, weather planning, and profit optimization. What specific farming topic would you like to know more about?";
}

/**
 * Extract the AI response from n8n webhook response
 */
export function extractAIResponse(data: N8NWebhookResponse): string {
  console.log('Extracting response from webhook data:', data);
  
  // Try multiple possible response fields
  const possibleResponseFields = [
    'content', // n8n streaming responses often use 'content'
    'response',
    'message', 
    'answer',
    'text',
    'reply',
    'output',
    'result'
  ];
  
  for (const field of possibleResponseFields) {
    if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
      console.log(`Found response in field '${field}':`, data[field]);
      return data[field].trim();
    }
  }
  
  // If no string response found, try to extract from any field
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.trim() && key !== 'timestamp' && key !== 'userId') {
      console.log(`Using response from field '${key}':`, value);
      return value.trim();
    }
  }
  
  console.warn('No valid response found in webhook data, using fallback message');
  return "I received your message but couldn't process it properly. Please try again.";
}

/**
 * Test the n8n webhook connection
 */
export async function testN8NConnection(): Promise<boolean> {
  try {
    const response = await sendToN8N({
      message: "Hello, this is a test message",
      timestamp: new Date().toISOString(),
      userId: 'test-user'
    });
    
    console.log('Test connection response:', response);
    return response.success !== false && !response.error;
  } catch (error) {
    console.error('n8n connection test failed:', error);
    return false;
  }
}

/**
 * Test response extraction with different response formats
 */
export function testResponseExtraction(): void {
  const testResponses = [
    { response: "This is a test response" },
    { message: "This is a test message" },
    { answer: "This is a test answer" },
    { text: "This is a test text" },
    { content: "This is a test content" },
    { reply: "This is a test reply" },
    { output: "This is a test output" },
    { result: "This is a test result" },
    { customField: "This is a custom field" },
    { data: { response: "Nested response" } }
  ];
  
  console.log('Testing response extraction:');
  testResponses.forEach((testData, index) => {
    const extracted = extractAIResponse(testData);
    console.log(`Test ${index + 1}:`, { input: testData, extracted });
  });
}

/**
 * Test JSON parsing with problematic responses
 */
export function testJSONParsing(): void {
  const problematicResponses = [
    '{"response": "Hello"}',
    '{"response": "Hello"}\n{"extra": "data"}', // Multiple JSON objects
    'Some text before {"response": "Hello"} more text', // Text around JSON
    '{"response": "Hello"}\r\n\r\nExtra content', // Line breaks and extra content
    '{"response": "Hello"}\n\n\n', // Multiple line breaks
    '{"response": "Hello"} {"another": "object"}', // Multiple objects without separator
    // n8n streaming response format
    '{"type":"begin","metadata":{"nodeId":"123","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1234567890}}\n{"type":"item","content":"You are farming Cotton. Here is your response..."}',
    // Multiple content objects
    '{"type":"item","content":"First part"}\n{"type":"item","content":"Second part"}\n{"type":"end"}'
  ];
  
  console.log('Testing JSON parsing with problematic responses:');
  problematicResponses.forEach((response, index) => {
    try {
      const parsed = JSON.parse(response);
      console.log(`Test ${index + 1} (Success):`, parsed);
    } catch (error) {
      console.log(`Test ${index + 1} (Failed):`, error.message);
      
      // Try to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          console.log(`  Extracted JSON:`, extracted);
        } catch (extractError) {
          console.log(`  Failed to extract:`, extractError.message);
        }
      }
    }
  });
}

/**
 * Test n8n streaming response parsing specifically
 */
export function testN8NStreamingResponses(): void {
  const streamingResponses = [
    // Your actual response format
    '{"type":"begin","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433173602}}\n{"type":"item","content":"You are farming Cotton.","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433352701}}\n{"type":"end","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433352709}}',
    // Multiple content parts
    '{"type":"begin","metadata":{"nodeId":"123","nodeName":"AI Agent"}}\n{"type":"item","content":"First part of response"}\n{"type":"item","content":"Second part of response"}\n{"type":"end"}',
    // Single content object
    '{"type":"item","content":"Simple response without begin/end"}',
    // Mixed format
    '{"type":"begin"}\n{"type":"item","content":"Main response"}\n{"type":"metadata","info":"extra data"}'
  ];
  
  console.log('Testing n8n streaming response parsing:');
  streamingResponses.forEach((response, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log('Raw response:', response);
    
    // Test the new parsing logic
    const lines = response.trim().split('\n');
    let allContent: string[] = [];
    
    console.log(`Response has ${lines.length} lines:`);
    lines.forEach((line, lineIndex) => {
      console.log(`  Line ${lineIndex + 1}:`, line);
      
      if (line.includes('"content"')) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.content && typeof parsed.content === 'string') {
            allContent.push(parsed.content);
            console.log(`  ✓ Found content: "${parsed.content}"`);
          }
        } catch (e) {
          console.log(`  ✗ Failed to parse line ${lineIndex + 1}:`, e.message);
        }
      }
    });
    
    if (allContent.length > 0) {
      const completeContent = allContent.join(' ').trim();
      console.log(`  🎯 Combined content (${allContent.length} parts): "${completeContent}"`);
    } else {
      console.log(`  ❌ No content found in response`);
    }
  });
}

/**
 * Test your specific n8n response format
 */
export function testYourN8NResponse(): void {
  const yourResponse = '{"type":"begin","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433350373}}\n{"type":"item","content":"You are farming Cotton.","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433352701}}\n{"type":"end","metadata":{"nodeId":"8a447d16-0d07-4cae-9e5d-0ba3339f33e2","nodeName":"AI Agent","itemIndex":0,"runIndex":0,"timestamp":1756433352709}}';
  
  console.log('Testing YOUR specific n8n response format:');
  console.log('Raw response:', yourResponse);
  
  // Test the new parsing logic
  const lines = yourResponse.trim().split('\n');
  let allContent: string[] = [];
  
  console.log(`Response has ${lines.length} lines:`);
  lines.forEach((line, lineIndex) => {
    console.log(`  Line ${lineIndex + 1}:`, line);
    
    if (line.includes('"content"')) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.content && typeof parsed.content === 'string') {
          allContent.push(parsed.content);
          console.log(`  ✓ Found content: "${parsed.content}"`);
        }
      } catch (e) {
        console.log(`  ✗ Failed to parse line ${lineIndex + 1}:`, e.message);
      }
    }
  });
  
  if (allContent.length > 0) {
    const completeContent = allContent.join(' ').trim();
    console.log(`  🎯 Combined content (${allContent.length} parts): "${completeContent}"`);
    console.log(`  ✅ This should now work in your chatbot!`);
  } else {
    console.log(`  ❌ No content found in response`);
  }
}

/**
 * Test longer n8n responses with multiple content parts
 */
export function testLongerN8NResponse(): void {
  const longResponse = '{"type":"begin","metadata":{"nodeId":"123","nodeName":"AI Agent"}}\n{"type":"item","content":"You are farming Cotton.","metadata":{"nodeId":"123"}}\n{"type":"item","content":"Here are some tips for cotton farming:","metadata":{"nodeId":"123"}}\n{"type":"item","content":"1. Plant in April-May when soil temperature is above 60°F","metadata":{"nodeId":"123"}}\n{"type":"item","content":"2. Use well-drained soil with pH 5.5-8.5","metadata":{"nodeId":"123"}}\n{"type":"item","content":"3. Maintain proper spacing of 2-3 feet between plants","metadata":{"nodeId":"123"}}\n{"type":"item","content":"4. Water regularly but avoid overwatering","metadata":{"nodeId":"123"}}\n{"type":"end","metadata":{"nodeId":"123"}}';
  
  console.log('Testing LONGER n8n response with multiple content parts:');
  console.log('Raw response:', longResponse);
  
  // Test the new parsing logic
  const lines = longResponse.trim().split('\n');
  let allContent: string[] = [];
  
  console.log(`Response has ${lines.length} lines:`);
  lines.forEach((line, lineIndex) => {
    console.log(`  Line ${lineIndex + 1}:`, line);
    
    if (line.includes('"content"')) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.content && typeof parsed.content === 'string') {
          allContent.push(parsed.content);
          console.log(`  ✓ Found content part ${allContent.length}: "${parsed.content}"`);
        }
      } catch (e) {
        console.log(`  ✗ Failed to parse line ${lineIndex + 1}:`, e.message);
      }
    }
  });
  
  if (allContent.length > 0) {
    const completeContent = allContent.join(' ').trim();
    console.log(`\n  🎯 FINAL COMBINED CONTENT (${allContent.length} parts):`);
    console.log(`  "${completeContent}"`);
    console.log(`  ✅ This should now extract the complete response!`);
  } else {
    console.log(`  ❌ No content found in response`);
  }
}

/**
 * Check if the webhook is accessible (for debugging)
 */
export async function checkWebhookAccessibility(): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'OPTIONS', // Preflight request
      mode: 'cors',
    });
    
    return { accessible: true };
  } catch (error) {
    return { 
      accessible: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
