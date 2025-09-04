import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, TestTube, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { sendToN8N, checkWebhookAccessibility, testResponseExtraction, testJSONParsing, testN8NStreamingResponses, testYourN8NResponse, testLongerN8NResponse, N8N_WEBHOOK_URL } from '@/utils/n8n';
import { toast } from 'sonner';

export default function WebhookTest() {
  const [testMessage, setTestMessage] = useState('Hello, this is a test message');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    accessibility: { accessible: boolean; error?: string } | null;
    webhook: { success: boolean; response?: any; error?: string } | null;
  }>({ accessibility: null, webhook: null });

  const testAccessibility = async () => {
    setIsLoading(true);
    try {
      const result = await checkWebhookAccessibility();
      setTestResults(prev => ({ ...prev, accessibility: result }));
      if (result.accessible) {
        toast.success('Webhook is accessible!');
      } else {
        toast.error(`Webhook not accessible: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to test accessibility');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await sendToN8N({
        message: testMessage,
        timestamp: new Date().toISOString(),
        userId: 'test-user'
      });
      
      setTestResults(prev => ({ 
        ...prev, 
        webhook: { 
          success: !result.error, 
          response: result,
          error: result.error 
        } 
      }));
      
      if (result.error === 'webhook_unavailable') {
        toast.info('Using fallback response - webhook unavailable');
      } else if (result.success !== false) {
        toast.success('Webhook test successful!');
      } else {
        toast.error('Webhook test failed');
      }
    } catch (error) {
      toast.error('Webhook test failed');
      setTestResults(prev => ({ 
        ...prev, 
        webhook: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          n8n Webhook Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Webhook URL Display */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Label className="text-sm font-medium">Webhook URL:</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all mt-1">
            {N8N_WEBHOOK_URL}
          </p>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button
            onClick={testAccessibility}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Test Accessibility
          </Button>
          
          <Button
            onClick={testResponseExtraction}
            variant="outline"
            size="sm"
          >
            Test Response Extraction
          </Button>
          
          <Button
            onClick={testJSONParsing}
            variant="outline"
            size="sm"
          >
            Test JSON Parsing
          </Button>
          
          <Button
            onClick={testN8NStreamingResponses}
            variant="outline"
            size="sm"
          >
            Test n8n Streaming
          </Button>
          
          <Button
            onClick={testYourN8NResponse}
            variant="outline"
            size="sm"
          >
            Test Your Response
          </Button>
          
          <Button
            onClick={testLongerN8NResponse}
            variant="outline"
            size="sm"
          >
            Test Long Response
          </Button>
        </div>

        {/* Test Message Input */}
        <div className="space-y-2">
          <Label htmlFor="testMessage">Test Message:</Label>
          <div className="flex gap-2">
            <Input
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message..."
            />
            <Button
              onClick={testWebhook}
              disabled={isLoading || !testMessage.trim()}
              size="sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Test Webhook
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Accessibility Test Results */}
          {testResults.accessibility && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Accessibility Test:</h4>
                {testResults.accessibility.accessible ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Accessible
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Accessible
                  </Badge>
                )}
              </div>
              {testResults.accessibility.error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {testResults.accessibility.error}
                </p>
              )}
            </div>
          )}

          {/* Webhook Test Results */}
          {testResults.webhook && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Webhook Test:</h4>
                {testResults.webhook.success ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                )}
              </div>
              
                             {testResults.webhook.response && (
                 <div className="space-y-2">
                   <Label className="text-sm font-medium">Raw Response:</Label>
                   <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                     {JSON.stringify(testResults.webhook.response, null, 2)}
                   </pre>
                   
                   {/* Show raw response if there was a parsing issue */}
                   {testResults.webhook.response.rawResponse && (
                     <div className="space-y-2">
                       <Label className="text-sm font-medium text-orange-600">Raw Webhook Response (Unparsed):</Label>
                       <pre className="text-xs bg-orange-50 dark:bg-orange-950 p-2 rounded overflow-auto max-h-32 border border-orange-200 dark:border-orange-800">
                         {testResults.webhook.response.rawResponse}
                       </pre>
                     </div>
                   )}
                   
                                       <Label className="text-sm font-medium">Extracted Response:</Label>
                    <div className="text-sm bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
                      {testResults.webhook.response.response || 
                       testResults.webhook.response.message || 
                       testResults.webhook.response.answer || 
                       testResults.webhook.response.text || 
                       testResults.webhook.response.content || 
                       testResults.webhook.response.reply || 
                       testResults.webhook.response.output || 
                       testResults.webhook.response.result || 
                       'No response text found'}
                    </div>
                    
                    {/* Show content parts info if available */}
                    {testResults.webhook.response.contentParts && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📊 Found {testResults.webhook.response.contentParts} content part(s) and combined them
                      </div>
                    )}
                   
                   <Label className="text-sm font-medium">Response Fields:</Label>
                   <div className="text-xs space-y-1">
                     {Object.entries(testResults.webhook.response).map(([key, value]) => (
                       <div key={key} className="flex justify-between">
                         <span className="font-mono">{key}:</span>
                         <span className="text-gray-600 dark:text-gray-400">
                           {typeof value === 'string' ? value : JSON.stringify(value)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
              
              {testResults.webhook.error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {testResults.webhook.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Troubleshooting Tips:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Check if your n8n workflow is active and running</li>
            <li>• Verify the webhook URL is correct</li>
            <li>• Ensure CORS is enabled in your n8n workflow</li>
            <li>• Check if the webhook accepts POST requests</li>
            <li>• Verify your n8n instance is accessible from the internet</li>
            <li>• <strong>JSON Issue:</strong> Your webhook is returning malformed JSON</li>
            <li>• <strong>Fix:</strong> Ensure your n8n workflow returns only valid JSON</li>
            <li>• <strong>Check:</strong> No extra text, line breaks, or multiple JSON objects</li>
            <li>• <strong>n8n Streaming:</strong> Your workflow is using streaming responses</li>
            <li>• <strong>Streaming Fix:</strong> Configure webhook to return single JSON object</li>
            <li>• <strong>Alternative:</strong> Use "Respond to Webhook" node instead of streaming</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
