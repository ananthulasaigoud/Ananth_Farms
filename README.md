# 🌾 Ananthula Profit Tracker

A comprehensive Progressive Web App (PWA) for farmers to track crops, expenses, income, and analyze profits with AI-powered insights.

## ✨ Features

### 📊 **Core Functionality**
- **Crop Management**: Add, edit, and track multiple crops with detailed information
- **Expense Tracking**: Record and categorize farm expenses (seeds, labor, fertilizer, etc.)
- **Income Tracking**: Log crop sales and other income sources
- **Land Expenses**: Track general farm expenses not tied to specific crops
- **Profit Analysis**: Real-time profit calculations and financial insights

### 🤖 **AI-Powered Features**
- **Smart Category Suggestions**: AI automatically suggests expense categories based on descriptions
- **Intelligent Recommendations**: Personalized tips for improving farm profitability
- **AI Chatbot**: Free farm management advice and guidance
- **Profit Predictions**: Predict potential profits based on historical data

### 📱 **Progressive Web App (PWA)**
- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen like a native app
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Sync**: Automatic data synchronization

### 🎨 **User Experience**
- **Multi-language Support**: English and Tamil interface
- **Theme Customization**: Light/dark modes with color schemes
- **Image Upload**: Upload bill images for expense records
- **Data Export/Import**: Backup and restore farm data
- **Real-time Updates**: Live data synchronization

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI/OCR**: Tesseract.js for text extraction
- **State Management**: Zustand
- **Routing**: React Router
- **Notifications**: Sonner toast notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd farmlog-profit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in `supabase/migrations/`
   - Create a storage bucket named `farm-bills`
   - Set up Row Level Security (RLS) policies

4. **Configure environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Database Schema

### Tables
- **crops**: Crop information (name, type, land area, etc.)
- **expenses**: Crop-specific expenses with categories
- **income**: Crop income records
- **land_expenses**: General farm expenses
- **users**: User authentication and profiles

### Key Features
- **Bill Images**: Support for multiple bill images per expense/income
- **Real-time Sync**: Automatic data synchronization
- **Soft Deletes**: Data preservation with deletion tracking

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Login**: Create an account or sign in
2. **Add Your First Crop**: Enter crop details and land area
3. **Record Expenses**: Add expenses with categories and bill images
4. **Log Income**: Record crop sales and other income
5. **Analyze Profits**: View detailed profit analysis and insights

### Key Features

#### 📱 **Dashboard**
- Overview of all crops and financial summary
- Quick actions for adding expenses/income
- AI-powered smart recommendations
- Install PWA prompt

#### 🌱 **Crop Management**
- Add new crops with detailed information
- View individual crop details with income/expense breakdown
- Edit crop information and delete crops
- Track profit margins per crop

#### 💰 **Financial Tracking**
- **Expenses**: Categorize expenses (seeds, labor, fertilizer, etc.)
- **Income**: Record sales and other income sources
- **Land Expenses**: Track general farm costs
- **Bill Images**: Upload and view expense receipts

#### 🤖 **AI Features**
- **Smart Suggestions**: AI suggests expense categories
- **Recommendations**: Personalized farm management tips
- **Chatbot**: Get free farm advice and guidance
- **Profit Predictions**: Estimate future crop profits

#### ⚙️ **Settings & Profile**
- **Theme Customization**: Light/dark modes with color schemes
- **Language Settings**: English and Tamil support
- **Data Management**: Export/import farm data
- **Security**: Password management and account settings

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # State management (Zustand)
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

### Key Components
- **DynamicDashboard**: Main dashboard with overview and quick actions
- **CropCard**: Individual crop display cards
- **AddExpenseModal**: Expense entry with AI suggestions
- **AddIncomeModal**: Income recording interface
- **CropDetail**: Detailed crop view with tabs
- **PWAInstallPrompt**: Progressive Web App installation
- **FloatingAIChatbot**: AI assistant interface

### State Management
- **useCropStore**: Centralized crop and expense data management
- **useAuth**: Authentication and user management
- **useRealTimeData**: Real-time data synchronization
- **ThemeContext**: Theme and color scheme management
- **LanguageContext**: Multi-language support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔒 Security

- **Row Level Security (RLS)**: Database-level security policies
- **Authentication**: Supabase Auth with email/password
- **Data Isolation**: Users can only access their own data
- **Secure Storage**: Encrypted file storage for bill images

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen on mobile/desktop
- **App-like Experience**: Full-screen mode and native feel
- **Background Sync**: Automatic data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Email**: support@ananthfarms.com
- **Documentation**: Check the in-app help section
- **Issues**: Report bugs via GitHub issues

## 🎉 Acknowledgments

- Built with modern web technologies
- Powered by Supabase for backend services
- Enhanced with AI features for better farm management
- Designed for Indian farmers' specific needs

---

**🌾 Happy Farming with FarmLog!** 🚜
