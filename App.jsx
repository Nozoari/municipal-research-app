import React, { useState, useEffect } from 'react';
import { Search, Send, Loader2, Lock } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  // ログイン処理
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

  // 検索処理
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      if (data.error) {
        setResults('エラー: ' + data.error);
      } else {
        setResults(data.content[0].text);
      }
    } catch (err) {
      setResults('通信エラーが発生しました。WorkerのURL設定を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">自治体リサーチツール</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="アクセスパスワードを入力"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">自治体リサーチツール</h1>
          <p className="text-slate-600">自治体サイトから情報を抽出します</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="例：所沢市のふるさと納税の返礼品についてまとめて"
              className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              実行
            </button>
          </form>
        </div>

        {results && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border leading-relaxed text-slate-800 whitespace-pre-wrap">
            {results}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
