import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import CreateWalletPage from './pages/CreateWalletPage'
import CreateOverviewPage from './pages/CreateOverviewPage';
import KeyStorePage from './pages/KeyStorePage';
import MnemonicPage from './pages/MnemonicPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/wallet/create' element={<CreateWalletPage />} />
        <Route path='/wallet/create/overview' element={<CreateOverviewPage />} />
        <Route path='/wallet/create/keystore' element={<KeyStorePage />} />
        <Route path='/wallet/create/mnemonic' element={<MnemonicPage />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App;