import React from 'react';
import { createRoot } from 'react-dom/client';  // createRoot をインポート
import App from './App';
import './index.css'; 


const container = document.getElementById('root');  // rootコンテナを取得
const root = createRoot(container);  // createRootでルートを作成
root.render(
  <App />
);