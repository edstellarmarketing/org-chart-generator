import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';
import SettingsForm from './SettingsForm';

interface LandingPageProps {
  onNext: () => void;
}

export default function LandingPage({ onNext }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="/edstellar-logo.png"
              alt="Edstellar Logo"
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Organization Chart Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional organizational charts in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Configure Settings</h3>
                  <p className="text-gray-600 text-sm">
                    Enter your company name, add a logo URL, and define organizational levels with custom colors.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Import Employee Data</h3>
                  <p className="text-gray-600 text-sm">
                    Upload a CSV file with employee information including names, positions, departments, and reporting relationships.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Review & Edit Employees</h3>
                  <p className="text-gray-600 text-sm">
                    Review imported data and individually edit employee details such as names, positions, departments, and manager assignments directly in the application.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Generate & Export</h3>
                  <p className="text-gray-600 text-sm">
                    View your organizational chart and copy it to clipboard or export as PDF for presentations and documents.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Multiple canvas size options for PowerPoint and Word
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Customizable level colors and hierarchies
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Easy CSV import for bulk employee data
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Individual employee editing capabilities after import
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  One-click copy to clipboard and PDF export
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Our Tool</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">No Signup Required</h4>
                    <p className="text-xs text-gray-600">
                      Start creating immediately without creating an account or sharing personal information. Your privacy matters.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">Completely Free</h4>
                    <p className="text-xs text-gray-600">
                      No hidden costs, no credit requirements, no premium tiers. Full access to all features at no charge.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">Simple & Intuitive</h4>
                    <p className="text-xs text-gray-600">
                      No design expertise needed. Clean interface focused on getting results quickly without complex features or steep learning curves.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <SettingsForm onNext={onNext} />
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <img
              src="/Edstellar logo_Primary-01 2 (1).png"
              alt="Edstellar Logo"
              className="h-12 object-contain brightness-0 invert"
            />
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-3">About Edstellar</h3>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Edstellar is a leading provider of corporate training and organizational development solutions.
              We empower organizations to build high-performing teams through customized learning programs,
              leadership development, and strategic HR consulting services. Our expertise helps companies
              transform their workforce and achieve sustainable growth.
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              For enquiries regarding corporate training and organizational development consultation
            </p>
            <a
              href="mailto:contact@edstellar.com"
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 transition"
            >
              contact@edstellar.com
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Edstellar. All rights reserved.</p>
            <p className="mt-1">Organization Chart Generator Tool</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
