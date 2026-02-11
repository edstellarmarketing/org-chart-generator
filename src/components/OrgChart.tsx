import { useState, useEffect, useRef } from 'react';
import { Download, Settings, Users, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Employee {
  id: string;
  employee_name: string;
  position: string;
  picture_url: string | null;
  email: string | null;
  department: string | null;
  level_id: string;
  manager_id: string | null;
  level_color: string;
  level_order: number;
}

interface OrgSettings {
  company_name: string;
  company_logo_url: string | null;
  canvas_size: string;
  show_logo: boolean;
}

interface OrgChartProps {
  userId: string;
  onBack: () => void;
}

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

type CanvasSize = 'auto' | 'ppt-standard' | 'ppt-widescreen' | 'word-portrait' | 'word-landscape';

const canvasSizes: Record<CanvasSize, { width: number; height: number }> = {
  'auto': { width: 0, height: 0 },
  'ppt-standard': { width: 960, height: 720 },
  'ppt-widescreen': { width: 1280, height: 720 },
  'word-portrait': { width: 816, height: 1056 },
  'word-landscape': { width: 1056, height: 816 },
};

export default function OrgChart({ userId, onBack }: OrgChartProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const canvasSize: CanvasSize = (settings?.canvas_size as CanvasSize) || 'auto';

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (canvasSize !== 'auto' && contentRef.current && employees.length > 0) {
      const calculateAutoScale = () => {
        requestAnimationFrame(() => {
          if (!contentRef.current) return;

          const content = contentRef.current;
          const canvas = canvasSizes[canvasSize];

          const contentWidth = content.scrollWidth;
          const contentHeight = content.scrollHeight;

          const padding = 32;
          const availableWidth = canvas.width - (padding * 2);
          const availableHeight = canvas.height - (padding * 2);

          const scaleX = availableWidth / contentWidth;
          const scaleY = availableHeight / contentHeight;

          const newScale = Math.min(scaleX, scaleY, 1) * 0.98;

          setScale(newScale);
        });
      };

      calculateAutoScale();
    } else {
      setScale(1);
    }
  }, [canvasSize, employees]);

  const loadData = async () => {
    try {
      const { data: settingsData } = await supabase
        .from('org_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsData) {
        setSettings(settingsData);
      }

      const { data: employeesData } = await supabase
        .from('employees')
        .select(`
          *,
          org_levels (
            color,
            level_order
          )
        `)
        .eq('user_id', userId);

      if (employeesData) {
        const formatted = employeesData.map(emp => ({
          ...emp,
          level_color: (emp.org_levels as any)?.color || '#3b82f6',
          level_order: (emp.org_levels as any)?.level_order || 0,
        }));
        setEmployees(formatted);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (): TreeNode[] => {
    const employeeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    employees.forEach(emp => {
      employeeMap.set(emp.id, { employee: emp, children: [] });
    });

    employees.forEach(emp => {
      const node = employeeMap.get(emp.id)!;
      if (emp.manager_id) {
        const parent = employeeMap.get(emp.manager_id);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const sortByLevel = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.employee.level_order - b.employee.level_order);
      nodes.forEach(node => sortByLevel(node.children));
    };

    sortByLevel(roots);
    return roots;
  };

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!chartRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
      });

      const link = document.createElement('a');
      link.download = `org-chart.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error exporting chart. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!chartRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to create image. Please try again.');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('Unable to copy to clipboard. Please use the export options instead.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error copying chart:', error);
      alert('Error copying chart. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfWidth = imgWidth > imgHeight ? 11 : 8.5;
      const pdfHeight = imgWidth > imgHeight ? 8.5 : 11;
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'in',
        format: 'letter',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pageWidth / (imgWidth / 96), pageHeight / (imgHeight / 96));
      const finalWidth = (imgWidth / 96) * ratio;
      const finalHeight = (imgHeight / 96) * ratio;

      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save('org-chart.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const renderNode = (node: TreeNode, isRoot: boolean = false) => {
    const { employee } = node;

    return (
      <div key={employee.id} className="flex flex-col items-center">
        <div
          className="relative bg-white rounded-lg border-2 p-6 m-4 transition-transform hover:scale-105"
          style={{
            borderTopColor: employee.level_color,
            borderTopWidth: '5px',
            borderLeftColor: '#e5e7eb',
            borderRightColor: '#e5e7eb',
            borderBottomColor: '#e5e7eb',
            minWidth: '300px',
            maxWidth: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-start gap-4">
            {employee.picture_url ? (
              <img
                src={employee.picture_url}
                alt={employee.employee_name}
                crossOrigin="anonymous"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: employee.level_color }}
              >
                {employee.employee_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                {employee.employee_name}
              </h3>
              <p className="text-sm text-gray-600 font-medium mb-1">{employee.position}</p>
              {employee.department && (
                <p className="text-xs text-gray-500">{employee.department}</p>
              )}
              {employee.email && (
                <p className="text-xs text-blue-600 mt-2 break-all">{employee.email}</p>
              )}
            </div>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="relative">
            <div className="absolute left-1/2 top-0 w-1 h-12 bg-gray-400 -translate-x-1/2" />
            <div className="flex justify-center gap-12 relative pt-12">
              {node.children.length > 1 && (
                <div className="absolute top-12 left-0 right-0 h-1 bg-gray-400" style={{ width: `calc(100% - ${node.children.length * 60}px)`, margin: '0 auto' }} />
              )}
              {node.children.map((child, index) => (
                <div key={child.employee.id} className="relative">
                  {node.children.length > 1 && (
                    <div className="absolute top-0 left-1/2 w-1 h-12 bg-gray-400 -translate-x-1/2" />
                  )}
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading org chart...</div>
      </div>
    );
  }

  const tree = buildTree();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings?.company_logo_url ? (
                <img
                  src={settings.company_logo_url}
                  alt={settings.company_name}
                  crossOrigin="anonymous"
                  className="h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Users className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {settings?.company_name || 'Organization Chart'}
                </h1>
                <p className="text-sm text-gray-600">{employees.length} employees</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={copyToClipboard}
                disabled={exporting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                } disabled:bg-gray-300 disabled:text-gray-500`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Chart
                  </>
                )}
              </button>

              <div className="relative group">
                <button
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export'}
                </button>
                {!exporting && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={() => exportAsImage('png')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg transition"
                    >
                      Export as PNG
                    </button>
                    <button
                      onClick={() => exportAsImage('jpeg')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition"
                    >
                      Export as JPEG
                    </button>
                    <button
                      onClick={exportAsPDF}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg transition"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 overflow-auto flex justify-center items-start min-h-screen">
        <div
          ref={chartRef}
          className={`bg-white ${canvasSize !== 'auto' ? 'shadow-2xl border-2 border-gray-300' : ''}`}
          style={canvasSize !== 'auto' ? {
            width: `${canvasSizes[canvasSize].width}px`,
            height: `${canvasSizes[canvasSize].height}px`,
            overflow: 'hidden',
          } : {}}
        >
          {tree.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center" style={{ padding: canvasSize !== 'auto' ? '16px' : '0' }}>
              <div
                ref={contentRef}
                className="flex flex-col"
                style={canvasSize !== 'auto' ? {
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                } : { padding: '48px' }}
              >
                {settings?.show_logo !== false && (
                  <div className="text-center pb-4 border-b-2 border-gray-200" style={{ flexShrink: 0 }}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {settings?.company_logo_url ? (
                        <img
                          src={settings.company_logo_url}
                          alt={settings.company_name}
                          crossOrigin="anonymous"
                          className="h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Users className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {settings?.company_name || 'Organization Chart'}
                    </h1>
                    <p className="text-sm text-gray-600">Organizational Structure</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                <div className="flex justify-center items-center py-8">
                  <div className="flex justify-center gap-12">
                    {tree.map(node => renderNode(node, true))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No employees found</h3>
              <p className="text-gray-500">Import employees to generate your org chart</p>
              <button
                onClick={onBack}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Import Employees
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
