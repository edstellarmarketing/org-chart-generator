import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Monitor, Presentation, FileText, Upload } from 'lucide-react';

interface Level {
  id: string;
  level_name: string;
  level_order: number;
  color: string;
}

interface SettingsFormProps {
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

export default function SettingsForm({ onNext }: SettingsFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>('auto');
  const [showLogo, setShowLogo] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('orgChartSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCompanyName(settings.companyName || '');
      setCompanyLogoUrl(settings.companyLogoUrl || '');
      setCanvasSize(settings.canvasSize || 'auto');
      setShowLogo(settings.showLogo !== false);
    }

    const savedLevels = localStorage.getItem('orgChartLevels');
    if (savedLevels) {
      setLevels(JSON.parse(savedLevels));
    }
  }, []);

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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCompanyLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveAndContinue = () => {
    const settings = {
      companyName,
      companyLogoUrl,
      canvasSize,
      showLogo,
    };
    localStorage.setItem('orgChartSettings', JSON.stringify(settings));
    localStorage.setItem('orgChartLevels', JSON.stringify(levels));
    onNext();
  };

  const isValid = companyName.trim() !== '' && levels.length > 0 && levels.every(l => l.level_name.trim() !== '');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Logo
        </label>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="url"
              value={companyLogoUrl}
              onChange={(e) => setCompanyLogoUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="https://example.com/logo.png"
            />
            <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">Enter a URL or upload an image file</p>
          {companyLogoUrl && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <img
                src={companyLogoUrl}
                alt="Company Logo Preview"
                className="h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 text-sm text-gray-600">Logo preview</div>
              <button
                onClick={() => setCompanyLogoUrl('')}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Show Logo in Org Chart
        </label>
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
          Canvas Size
        </label>
        <div className="grid grid-cols-1 gap-2">
          {canvasSizeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCanvasSize(option.value as CanvasSize)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
                  canvasSize === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${canvasSize === option.value ? 'text-blue-600' : 'text-gray-600'}`} />
                <div className="flex-1">
                  <div className={`font-medium text-sm ${canvasSize === option.value ? 'text-blue-900' : 'text-gray-900'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">{option.description}</div>
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Organizational Levels
          </label>
          <button
            onClick={addLevel}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Level
          </button>
        </div>

        <div className="space-y-2">
          {levels.map((level, index) => (
            <div key={level.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-shrink-0 w-8 text-center text-sm font-semibold text-gray-600">
                #{index + 1}
              </div>
              <input
                type="text"
                value={level.level_name}
                onChange={(e) => updateLevel(level.id, 'level_name', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Level name"
              />
              <input
                type="color"
                value={level.color}
                onChange={(e) => updateLevel(level.id, 'color', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-gray-300"
              />
              <button
                onClick={() => deleteLevel(level.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {levels.length === 0 && (
            <div className="text-center py-6 text-sm text-gray-500">
              No levels added yet
            </div>
          )}
        </div>
      </div>

      <button
        onClick={saveAndContinue}
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
      >
        <Save className="w-5 h-5" />
        Save & Continue
      </button>
    </div>
  );
}
