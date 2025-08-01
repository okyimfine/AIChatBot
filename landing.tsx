import { Button } from "@/components/ui/button";
import { Bot, MessageCircle, Sparkles, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Bot className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of conversation with our advanced AI assistant. 
              Get instant answers, creative help, and intelligent insights.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/auth/google'}
              size="lg"
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <MessageCircle className="text-blue-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Smart Conversations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Engage in natural, intelligent conversations with our advanced AI
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <Sparkles className="text-purple-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Creative & Helpful</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get creative ideas, solve problems, and learn new things
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <Shield className="text-green-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your conversations are protected with enterprise-grade security
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Ready to start your AI conversation?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of users already chatting with our AI assistant
            </p>
            <Button 
              onClick={() => window.location.href = '/api/auth/google'}
              size="lg"
              className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}