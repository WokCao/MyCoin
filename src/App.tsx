import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import CreateWalletPage from './pages/CreateWalletPage'
import CreateOverviewPage from './pages/CreateOverviewPage';
import KeyStorePage from './pages/KeyStorePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/wallet/create' element={<CreateWalletPage />} />
        <Route path='/wallet/create/overview' element={<CreateOverviewPage />} />
        <Route path='/wallet/create/keystore' element={<KeyStorePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;