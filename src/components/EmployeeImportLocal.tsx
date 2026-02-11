import { useState, useEffect } from 'react';
import { Upload, Users, Download, Trash2, ArrowLeft, ArrowRight, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';

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

interface EmployeeImportLocalProps {
  onNext: () => void;
  onBack: () => void;
}

export default function EmployeeImportLocal({ onNext, onBack }: EmployeeImportLocalProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Employee | null>(null);

  useEffect(() => {
    const savedLevels = localStorage.getItem('orgChartLevels');
    if (savedLevels) {
      setLevels(JSON.parse(savedLevels));
    }

    const savedEmployees = localStorage.getItem('orgChartEmployees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

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
    const template = 'name,position,level,manager,picture_url,email,department\nJohn Doe,CEO,Executive,,https://example.com/photo.jpg,john@company.com,Executive\nJane Smith,VP Engineering,Manager,John Doe,https://example.com/jane.jpg,jane@company.com,Engineering';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...employees[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updatedEmployees = [...employees];
      updatedEmployees[editingIndex] = editForm;
      setEmployees(updatedEmployees);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const deleteEmployee = (index: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter((_, i) => i !== index);
      setEmployees(updatedEmployees);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editingIndex === index && editForm) {
        setEditForm({ ...editForm, picture_url: dataUrl });
      } else {
        const updatedEmployees = [...employees];
        updatedEmployees[index].picture_url = dataUrl;
        setEmployees(updatedEmployees);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAndContinue = () => {
    if (employees.length === 0) {
      alert('Please import at least one employee');
      return;
    }
    localStorage.setItem('orgChartEmployees', JSON.stringify(employees));
    onNext();
  };

  const clearEmployees = () => {
    if (confirm('Are you sure you want to clear all employees?')) {
      setEmployees([]);
      localStorage.removeItem('orgChartEmployees');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Import Employees</h1>
            </div>
            <p className="text-green-100 mt-2">Upload your employee data in CSV format</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-4">
              <label className="flex-1 min-w-[200px] cursor-pointer">
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
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
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Photo</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Name</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Position</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Level</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Manager</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Email</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">Department</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employees.map((emp, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {editingIndex === index && editForm ? (
                            <>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  {editForm.picture_url ? (
                                    <img
                                      src={editForm.picture_url}
                                      alt="Photo"
                                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <label className="cursor-pointer p-1 hover:bg-gray-200 rounded">
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handlePhotoUpload(e, index)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={editForm.employee_name}
                                  onChange={(e) => setEditForm({ ...editForm, employee_name: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={editForm.position}
                                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  value={editForm.level_name}
                                  onChange={(e) => setEditForm({ ...editForm, level_name: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                  {levels.map((level) => (
                                    <option key={level.id} value={level.level_name}>
                                      {level.level_name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={editForm.manager_name || ''}
                                  onChange={(e) => setEditForm({ ...editForm, manager_name: e.target.value || undefined })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="email"
                                  value={editForm.email || ''}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value || undefined })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={editForm.department || ''}
                                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value || undefined })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={saveEdit}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  {emp.picture_url ? (
                                    <img
                                      src={emp.picture_url}
                                      alt="Photo"
                                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <label className="cursor-pointer p-1 hover:bg-gray-200 rounded">
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handlePhotoUpload(e, index)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900">{emp.employee_name}</td>
                              <td className="px-3 py-3 text-sm text-gray-600">{emp.position}</td>
                              <td className="px-3 py-3 text-sm">
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {emp.level_name}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">{emp.manager_name || '-'}</td>
                              <td className="px-3 py-3 text-sm text-gray-600">{emp.email || '-'}</td>
                              <td className="px-3 py-3 text-sm text-gray-600">{emp.department || '-'}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => startEdit(index)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteEmployee(index)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
              </button>
              <button
                onClick={saveAndContinue}
                disabled={employees.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                Continue to Chart
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
