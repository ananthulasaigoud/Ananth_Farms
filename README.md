# Farm Finance Tracker

A comprehensive farm management application built with React, TypeScript, and Supabase, featuring AI-powered insights and expense tracking.

## 🌟 Features

### Core Functionality
- **Crop Management**: Track crops, expenses, and income
- **Expense Tracking**: Categorize and monitor farm expenses
- **Income Management**: Record and track crop income
- **Land Expenses**: Track land-related costs
- **Payment Tracking**: Monitor payment status and methods
- **Bill Image OCR**: Extract text from bill images using Tesseract.js

### AI-Powered Features
- **n8n Workflow Integration**: Modern floating chatbot powered by your n8n workflow (test and production webhooks)
- **Smart Recommendations**: Local farming tips shown on dashboard
- **Voice Recognition**: Voice input (Web Speech API)
- **Expense Category Suggestions**: Lightweight keyword-based helper

### User Experience
- **Progressive Web App (PWA)**: Installable app with offline support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Customizable color schemes
- **Multi-language Support**: English, Hindi, Tamil, and Telugu
- **Real-time Updates**: Live data synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FarmFinanceTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # n8n (use PRODUCTION webhook when workflow is activated)
   VITE_N8N_WEBHOOK_URL=https://<your-subdomain>.app.n8n.cloud/webhook/<your-prod-webhook-id>
   VITE_ENABLE_FALLBACKS=false
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🤖 AI Chatbot System (Floating UI)

The application includes a modern ChatGPT-style floating chatbot powered by n8n workflows.

### Features
- **Floating Chat Interface**: Bottom-right launcher; full-screen on mobile, panel on desktop
- **Stop / Regenerate**: Cancel a running reply and regenerate the last answer
- **Copy-on-hover**: Quickly copy bot messages
- **n8n Integration**: Sends user messages to your n8n webhook; supports streaming multi-JSON responses
- **Voice Input**: Speech-to-text (Web Speech API)
- **Quick Questions**: Pre-defined farming prompts
- **Modern UI**: Beautiful, responsive chat interface

### n8n Webhook Configuration
- Use your PRODUCTION webhook URL when the workflow is active:
  `https://<your-subdomain>.app.n8n.cloud/webhook/<your-prod-webhook-id>`
- Manual tests in n8n use TEST URLs: `.../webhook-test/...` — activated workflows require `.../webhook/...`.
- Set `VITE_N8N_WEBHOOK_URL` to the production URL if you want to test the activated flow end-to-end.

### Webhook Payload Format
```json
{
  "message": "User's question",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "farm-user",
  "context": {
    "model": "default | agent"
  }
}
```

### Expected Response Format
```json
{
  "response": "AI response text",
  "success": true
}
```

### Mounting the Floating Chatbot
Placed once at the root of the main page:

```tsx
// src/pages/Index.tsx
import FloatingAIChatbot from "@/components/FloatingAIChatbot";

export default function Index() {
  return (
    <>
      {/* ...page content... */}
      <FloatingAIChatbot />
    </>
  );
}
```

To render globally across routes, mount it in your top-level layout (e.g., `App.tsx`).

### Formatting and Streaming Handling
- Client handles n8n streaming responses with multiple JSON objects (e.g., `{"type":"item","content":"..."}` lines) and combines all `content` parts.
- Responses are formatted for neat bullets and cleaned dates before display.

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Real-time subscriptions** for live updates

### AI & Integrations
- **n8n Workflows** for AI chatbot responses
- **Web Speech API** for voice recognition


## 🌐 Internationalization

Supported languages:
- English (en)


## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### Code Structure
```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # State management
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── locales/         # Internationalization files
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The built files in the `dist/` directory can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Farm Finance Tracker** - Making farm management smarter and more efficient! 🌾✨
