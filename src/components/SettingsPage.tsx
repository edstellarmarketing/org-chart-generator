import { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, Save, Monitor, Presentation, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Level {
  id: string;
  level_name: string;
  level_order: number;
  color: string;
}

interface SettingsPageProps {
  userId: string;
  onNext: () => void;
}

type CanvasSize = 'auto' | 'ppt-standard' | 'ppt-widescreen' | 'word-portrait' | 'word-landscape';

const canvasSizeOptions = [
  { value: 'auto', label: 'Auto (Full Size)', icon: Monitor, description: 'No size constraints' },
  { value: 'ppt-standard', label: 'PowerPoint 4:3', icon: Presentation, description: '960 × 720px' },
  { value: 'ppt-widescreen', label: 'PowerPoint 16:9', icon: Presentation, description: '1280 × 720px' },
  { value: 'word-portrait', label: 'Word Portrait', icon: FileText, description: '816 × 1056px' },
  { value: 'word-landscape', label: 'Word Landscape', icon: FileText, description: '1056 × 816px' },
];

export default function SettingsPage({ userId, onNext }: SettingsPageProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>('auto');
  const [showLogo, setShowLogo] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('org_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settings) {
        setCompanyName(settings.company_name);
        setCompanyLogoUrl(settings.company_logo_url || '');
        setCanvasSize(settings.canvas_size || 'auto');
        setShowLogo(settings.show_logo !== false);
      }

      const { data: levelsData } = await supabase
        .from('org_levels')
        .select('*')
        .eq('user_id', userId)
        .order('level_order');

      if (levelsData) {
        setLevels(levelsData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLevel = () => {
    const newLevel: Level = {
      id: `temp-${Date.now()}`,
      level_name: '',
      level_order: levels.length + 1,
      color: '#3b82f6',
    };
    setLevels([...levels, newLevel]);
  };

  const updateLevel = (id: string, field: keyof Level, value: string | number) => {
    setLevels(levels.map(level =>
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  const deleteLevel = (id: string) => {
    setLevels(levels.filter(level => level.id !== id));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: existingSettings } = await supabase
        .from('org_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSettings) {
        await supabase
          .from('org_settings')
          .update({
            company_name: companyName,
            company_logo_url: companyLogoUrl,
            canvas_size: canvasSize,
            show_logo: showLogo,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('org_settings')
          .insert({
            user_id: userId,
            company_name: companyName,
            company_logo_url: companyLogoUrl,
            canvas_size: canvasSize,
            show_logo: showLogo,
          });
      }

      await supabase
        .from('org_levels')
        .delete()
        .eq('user_id', userId);

      const levelsToInsert = levels.map((level, index) => ({
        user_id: userId,
        level_name: level.level_name,
        level_order: index + 1,
        color: level.color,
      }));

      await supabase
        .from('org_levels')
        .insert(levelsToInsert);

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
            </div>
            <p className="text-blue-100 mt-2">Configure your company details and organizational levels</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Company Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  value={companyLogoUrl}
                  onChange={(e) => setCompanyLogoUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="https://example.com/logo.png"
                />
                {companyLogoUrl && (
                  <div className="mt-3">
                    <img
                      src={companyLogoUrl}
                      alt="Company Logo Preview"
                      className="h-16 object-contain border border-gray-200 rounded-lg p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Logo in Org Chart
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Control whether the company logo appears in the org chart when copying or exporting
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="showLogo"
                      checked={showLogo === true}
                      onChange={() => setShowLogo(true)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show Logo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="showLogo"
                      checked={showLogo === false}
                      onChange={() => setShowLogo(false)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Hide Logo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Org Chart Canvas Size
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  This controls how the org chart is displayed and exported. Portrait sizes are ideal for vertical hierarchies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {canvasSizeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCanvasSize(option.value as CanvasSize)}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition text-left ${
                          canvasSize === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 ${canvasSize === option.value ? 'text-blue-600' : 'text-gray-600'}`} />
                        <div className="flex-1">
                          <div className={`font-medium ${canvasSize === option.value ? 'text-blue-900' : 'text-gray-900'}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                        </div>
                        {canvasSize === option.value && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">Organizational Levels</h2>
                <button
                  onClick={addLevel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Level
                </button>
              </div>

              <div className="space-y-3">
                {levels.map((level, index) => (
                  <div key={level.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-12 text-center font-semibold text-gray-600">
                      #{index + 1}
                    </div>
                    <input
                      type="text"
                      value={level.level_name}
                      onChange={(e) => updateLevel(level.id, 'level_name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Level name (e.g., Executive, Manager)"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Color:</label>
                      <input
                        type="color"
                        value={level.color}
                        onChange={(e) => updateLevel(level.id, 'color', e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                    </div>
                    <button
                      onClick={() => deleteLevel(level.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {levels.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No levels added yet. Click "Add Level" to get started.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={saveSettings}
                disabled={saving || !companyName || levels.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={onNext}
                disabled={!companyName || levels.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                Next: Import Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
