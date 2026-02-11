import { useState, useEffect } from 'react';
import { Upload, Users, Download, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Level {
  id: string;
  level_name: string;
  color: string;
}

interface Employee {
  employee_name: string;
  position: string;
  level_name: string;
  manager_name?: string;
  picture_url?: string;
  email?: string;
  department?: string;
}

interface EmployeeImportProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function EmployeeImport({ userId, onNext, onBack }: EmployeeImportProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadLevels();
    loadEmployees();
  }, [userId]);

  const loadLevels = async () => {
    try {
      const { data } = await supabase
        .from('org_levels')
        .select('*')
        .eq('user_id', userId)
        .order('level_order');

      if (data) {
        setLevels(data);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data: employeesData } = await supabase
        .from('employees')
        .select(`
          employee_name,
          position,
          picture_url,
          email,
          department,
          level_id,
          manager_id
        `)
        .eq('user_id', userId);

      if (employeesData && employeesData.length > 0) {
        const { data: levelsData } = await supabase
          .from('org_levels')
          .select('*')
          .eq('user_id', userId);

        const { data: allEmployees } = await supabase
          .from('employees')
          .select('id, employee_name')
          .eq('user_id', userId);

        const levelMap = new Map(levelsData?.map(l => [l.id, l.level_name]));
        const employeeMap = new Map(allEmployees?.map(e => [e.id, e.employee_name]));

        const formattedEmployees = employeesData.map(emp => ({
          employee_name: emp.employee_name,
          position: emp.position,
          level_name: levelMap.get(emp.level_id) || '',
          manager_name: emp.manager_id ? employeeMap.get(emp.manager_id) : undefined,
          picture_url: emp.picture_url || undefined,
          email: emp.email || undefined,
          department: emp.department || undefined,
        }));

        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('CSV file must contain headers and at least one employee');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedEmployees: Employee[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const employee: Employee = {
          employee_name: '',
          position: '',
          level_name: '',
        };

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'name':
            case 'employee_name':
              employee.employee_name = value;
              break;
            case 'position':
            case 'title':
              employee.position = value;
              break;
            case 'level':
            case 'level_name':
              employee.level_name = value;
              break;
            case 'manager':
            case 'manager_name':
              employee.manager_name = value || undefined;
              break;
            case 'picture':
            case 'picture_url':
            case 'photo':
              employee.picture_url = value || undefined;
              break;
            case 'email':
              employee.email = value || undefined;
              break;
            case 'department':
              employee.department = value || undefined;
              break;
          }
        });

        if (employee.employee_name && employee.position && employee.level_name) {
          parsedEmployees.push(employee);
        }
      }

      setEmployees(parsedEmployees);
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'name,position,level,manager,picture_url,email,department\nJohn Doe,CEO,Executive,,https://example.com/photo.jpg,john@company.com,Executive\nJane Smith,VP Engineering,Executive,John Doe,https://example.com/jane.jpg,jane@company.com,Engineering';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importEmployees = async () => {
    if (employees.length === 0) {
      alert('No employees to import');
      return;
    }

    setImporting(true);
    try {
      await supabase
        .from('employees')
        .delete()
        .eq('user_id', userId);

      const levelMap = new Map(levels.map(l => [l.level_name.toLowerCase(), l.id]));
      const employeeNameToId = new Map<string, string>();

      const employeesToInsert = employees.map(emp => {
        const id = crypto.randomUUID();
        employeeNameToId.set(emp.employee_name.toLowerCase(), id);
        return {
          id,
          user_id: userId,
          employee_name: emp.employee_name,
          position: emp.position,
          level_id: levelMap.get(emp.level_name.toLowerCase()) || levels[0]?.id,
          picture_url: emp.picture_url,
          email: emp.email,
          department: emp.department,
          manager_id: null,
        };
      });

      await supabase
        .from('employees')
        .insert(employeesToInsert);

      for (const emp of employees) {
        if (emp.manager_name) {
          const employeeId = employeeNameToId.get(emp.employee_name.toLowerCase());
          const managerId = employeeNameToId.get(emp.manager_name.toLowerCase());

          if (employeeId && managerId) {
            await supabase
              .from('employees')
              .update({ manager_id: managerId })
              .eq('id', employeeId);
          }
        }
      }

      alert('Employees imported successfully!');
    } catch (error) {
      console.error('Error importing employees:', error);
      alert('Error importing employees. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const clearEmployees = () => {
    if (confirm('Are you sure you want to clear all employees?')) {
      setEmployees([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Import Employees</h1>
            </div>
            <p className="text-green-100 mt-2">Upload your employee data in CSV format</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                  <Upload className="w-6 h-6 text-gray-600" />
                  <span className="font-medium text-gray-700">Upload CSV File</span>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>

              {employees.length > 0 && (
                <button
                  onClick={clearEmployees}
                  className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">CSV Format Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Required columns: name, position, level</li>
                <li>Optional columns: manager, picture_url, email, department</li>
                <li>Level names must match the levels you configured in settings</li>
                <li>Manager names should match employee names exactly</li>
                <li>Picture URLs should be direct links to images</li>
              </ul>
            </div>

            {employees.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">
                    Preview: {employees.length} employee{employees.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Level</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Manager</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employees.slice(0, 10).map((emp, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{emp.employee_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {emp.level_name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.manager_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.department || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {employees.length > 10 && (
                    <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                      Showing 10 of {employees.length} employees
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back to Settings
              </button>
              <button
                onClick={importEmployees}
                disabled={importing || employees.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {importing ? 'Importing...' : 'Import & Continue'}
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Skip to Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
