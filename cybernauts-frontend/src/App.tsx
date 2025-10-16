// src/App.tsx
import NetworkGraph from './components/NetworkGraph';
import Sidebar from './components/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <NetworkGraph />
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;