import React, { useState, useEffect } from 'react';
import { Search, Send, Loader2, Lock, AlertCircle, Building2 } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password.length > 0) {
      localStorage.setItem('app_password', password);
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem('app_password');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setError(null);
    setResults('');

    try {
      const response = await fetch(import.meta.env.VITE_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Password': password,
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        // エラーオブジェクトを解析して分かりやすく表示
        const errorMsg = data.error?.message || data.error || JSON.stringify(data);
        throw new Error(errorMsg);
      }

      setResults(data.content[0].text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">自治体リサーチ</h1>
          <p className="text-center text-slate-500 mb-8 text-sm">アクセスパスワードを入力してください</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">自治体マーケティング・リサーチ</h1>
            <p className="text-slate-500 text-sm font-medium">Digital Marketing Analysis Tool</p>
          </div>
        </header>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="例：所沢市のふるさと納税の返礼品について、ターゲット層と強みを分析して"
              className="flex-1 p-4 bg-transparent outline-none text-slate-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2 transition-all active:scale-[0.95]"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search size={20} />}
              <span>分析実行</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">通信エラー</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center gap-2 mb-6 pb-6 border-bottom border-slate-100 border-b">
                <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold text-slate-800 m-0">分析結果</h2>
              </div>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {results}
              </div>
            </div>
          </div>
        )}
        
        {loading && !results && (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">AIが自治体情報を収集・分析中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
