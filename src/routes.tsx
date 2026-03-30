import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/shared/Layout';
import HomePage from './pages/HomePage';
import RankingsPage from './pages/RankingsPage';
import CommunityPage from './pages/CommunityPage';
import GasPricesPage from './pages/GasPricesPage';
import DashboardPage from './pages/DashboardPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ProPage from './pages/ProPage';
import BenchmarksPage from './pages/BenchmarksPage';
import ForumPage from './pages/ForumPage';
import AdvocacyPage from './pages/AdvocacyPage';
import RiderPage from './pages/RiderPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'rankings', element: <RankingsPage /> },
      { path: 'vehicles/:id', element: <VehicleDetailPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'gas-prices', element: <GasPricesPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'benchmarks', element: <BenchmarksPage /> },
      { path: 'forum', element: <ForumPage /> },
      { path: 'advocacy', element: <AdvocacyPage /> },
      { path: 'riders', element: <RiderPage /> },
      { path: 'pro', element: <ProPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'cookies', element: <CookiePolicyPage /> },
    ],
  },
]);
