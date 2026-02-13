import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { SuccessPage } from './pages/SuccessPage';
import { AdminPage } from './pages/AdminPage';
import { DonatePage } from './pages/DonatePage';
import { ReimbursePage } from './pages/ReimbursePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register/:teamId" element={<RegistrationPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/reimburse" element={<ReimbursePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
