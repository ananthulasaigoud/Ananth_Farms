# n8n Webhook Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. "Failed to fetch" Error

**Problem**: You're getting a "Failed to fetch" error when trying to use the chatbot.

**Causes**:
- CORS (Cross-Origin Resource Sharing) issues
- Webhook URL is incorrect or inaccessible
- n8n workflow is not running
- Network connectivity issues

**Solutions**:

#### A. Check Webhook URL
1. Verify the webhook URL in your n8n workflow
2. Make sure the URL is exactly: `https://sai1709.app.n8n.cloud/webhook-test/ddfd47d5-5c94-4184-a4df-8e212b667a19`
3. Test the URL in a browser or Postman

#### B. Enable CORS in n8n
1. In your n8n workflow, add a "Respond to Webhook" node
2. Set the following headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Accept
   ```
3. Handle OPTIONS requests (preflight) in your workflow

#### C. Check n8n Workflow Status
1. Ensure your n8n workflow is active and running
2. Check if the webhook node is properly configured
3. Verify the workflow is published

### 2. Webhook Not Responding

**Problem**: The webhook is accessible but not responding to requests.

**Solutions**:
1. Check n8n workflow logs for errors
2. Ensure the webhook node is properly connected
3. Test with a simple workflow first
4. Add error handling in your n8n workflow

### 3. CORS Issues

**Problem**: Browser blocks requests due to CORS policy.

**Solutions**:
1. **In n8n workflow**: Add proper CORS headers
2. **Use a CORS proxy** (temporary solution):
   ```javascript
   // Update the webhook URL to use a CORS proxy
   const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
   const WEBHOOK_URL = CORS_PROXY + 'https://sai1709.app.n8n.cloud/webhook-test/ddfd47d5-5c94-4184-a4df-8e212b667a19';
   ```

## 🔧 Testing and Debugging

### 1. Use the Webhook Test Component

The app now includes a `WebhookTest` component that helps debug issues:

1. **Test Accessibility**: Checks if the webhook URL is reachable
2. **Test Webhook**: Sends a test message and shows the response
3. **View Results**: See detailed error messages and responses

### 2. Browser Developer Tools

1. Open Developer Tools (F12)
2. Go to Network tab
3. Try sending a message in the chatbot
4. Look for the failed request and check:
   - Request URL
   - Request headers
   - Response status
   - Error details

### 3. Test with External Tools

#### Using cURL:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","timestamp":"2024-01-01T00:00:00.000Z","userId":"test"}' \
  https://sai1709.app.n8n.cloud/webhook-test/ddfd47d5-5c94-4184-a4df-8e212b667a19
```

#### Using Postman:
1. Create a new POST request
2. Set URL to your webhook
3. Add header: `Content-Type: application/json`
4. Add body: `{"message":"test","timestamp":"2024-01-01T00:00:00.000Z","userId":"test"}`
5. Send and check response

## 🛠️ Configuration Options

### Environment Variables

Create a `.env.local` file in your project root:

```env
# Your n8n webhook URL
VITE_N8N_WEBHOOK_URL=https://sai1709.app.n8n.cloud/webhook-test/ddfd47d5-5c94-4184-a4df-8e212b667a19

# Enable/disable fallback responses
VITE_ENABLE_FALLBACKS=true

# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Fallback Responses

When the webhook is unavailable, the chatbot uses intelligent fallback responses for common farming questions:

- How to maximize farm profits
- Best time to plant crops
- How to reduce farming expenses
- Crop rotation advice
- Weather impact on farming
- Soil management tips

## 📱 n8n Workflow Setup

### Basic Webhook Workflow

1. **Webhook Node**:
   - Method: POST
   - Path: `/webhook-test/ddfd47d5-5c94-4184-a4df-8e212b667a19`
   - Response Mode: "Respond to Webhook"

2. **Process Message Node** (optional):
   - Add your AI logic here
   - Process the incoming message
   - Generate a response

3. **Respond to Webhook Node**:
   - Set response body:
   ```json
   {
     "response": "Your AI response here",
     "success": true
   }
   ```
   - Add CORS headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Accept
   ```

### CORS Configuration

Add this to your webhook response headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

## 🚀 Quick Fixes

### Immediate Solutions

1. **Check if webhook is running**: Visit the webhook URL in browser
2. **Verify workflow status**: Ensure n8n workflow is active
3. **Test with simple message**: Use the WebhookTest component
4. **Check browser console**: Look for detailed error messages
5. **Use fallback mode**: The chatbot will work with local responses

### Long-term Solutions

1. **Fix CORS in n8n**: Add proper headers to your workflow
2. **Improve error handling**: Add better error responses in n8n
3. **Monitor webhook health**: Set up monitoring for your webhook
4. **Use HTTPS**: Ensure your webhook uses secure connections

## 📞 Getting Help

If you're still having issues:

1. **Check the WebhookTest component** for detailed error information
2. **Look at browser console** for network errors
3. **Verify your n8n workflow** is properly configured
4. **Test the webhook URL** with external tools like Postman
5. **Check n8n logs** for server-side errors

## 🔄 Fallback Mode

The chatbot automatically falls back to local responses when the webhook is unavailable. This ensures users can still get helpful farming advice even when there are connectivity issues.

To disable fallbacks, set `VITE_ENABLE_FALLBACKS=false` in your environment variables.

---

**Remember**: The fallback responses are designed to be helpful and relevant to farming questions, so your users will still have a good experience even when the n8n webhook is down.
