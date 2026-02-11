import { useState } from 'react';
import LandingPage from './LandingPage';
import EmployeeImportLocal from './EmployeeImportLocal';
import OrgChartLocal from './OrgChartLocal';

type Page = 'landing' | 'import' | 'chart';

function OrgChartTool() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  return (
    <div className="relative">import { useState } from 'react';
    import LandingPage from './LandingPage';
    import EmployeeImportLocal from './EmployeeImportLocal';
    import OrgChartLocal from './OrgChartLocal';
    
    type Page = 'landing' | 'import' | 'chart';
    
    function OrgChartTool() {
      const [currentPage, setCurrentPage] = useState<Page>('landing');
    
      return (
        <div className="relative">
          {currentPage === 'landing' && (
            <LandingPage onNext={() => setCurrentPage('import')} />
          )}
    
          {currentPage === 'import' && (
            <EmployeeImportLocal
              onNext={() => setCurrentPage('chart')}
              onBack={() => setCurrentPage('landing')}
            />
          )}
    
          {currentPage === 'chart' && (
            <OrgChartLocal onBack={() => setCurrentPage('import')} />
          )}
        </div>
      );
    }
    
    export default OrgChartTool;
    
      {currentPage === 'landing' && (
        <LandingPage onNext={() => setCurrentPage('import')} />
      )}

      {currentPage === 'import' && (
        <EmployeeImportLocal
          onNext={() => setCurrentPage('chart')}
          onBack={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'chart' && (
        <OrgChartLocal onBack={() => setCurrentPage('import')} />
      )}
    </div>
  );
}

export default OrgChartTool;
