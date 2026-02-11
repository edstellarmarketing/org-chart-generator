import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import OrgChartTool from './components/OrgChartTool';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tool/organization-chart-generator" element={<OrgChartTool />} />
    </Routes>
  );
}

export default App;
