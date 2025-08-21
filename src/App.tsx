import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import CreateWalletPage from './pages/CreateWalletPage'
import CreateOverviewPage from './pages/CreateOverviewPage';
import KeyStorePage from './pages/KeyStorePage';
import MnemonicPage from './pages/MnemonicPage';
import AccessWalletPage from './pages/AccessWalletPage';
import AccessSoftwarePage from './pages/AccessSoftwarePage';
import { WalletProvider } from './context/WalletContext';
import HomePage from './pages/HomePage';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/wallet/create' element={<CreateWalletPage />} />
          <Route path='/wallet/create/overview' element={<CreateOverviewPage />} />
          <Route path='/wallet/create/keystore' element={<KeyStorePage />} />
          <Route path='/wallet/create/mnemonic' element={<MnemonicPage />} />
          <Route path='/wallet/access' element={<AccessWalletPage />} />
          <Route path='/wallet/access/software' element={<AccessSoftwarePage />} />
          <Route path='/wallet/dashboard' element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}


export default App;