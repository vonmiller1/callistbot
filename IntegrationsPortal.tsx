import React, { useState } from 'react';
import { 
  Link2, 
  CheckCircle2, 
  RefreshCw, 
  Mail, 
  Building2, 
  MessageSquare, 
  Video, 
  DollarSign, 
  CheckSquare, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { IntegrationAccount, IntegrationProvider } from '../types';

interface IntegrationsPortalProps {
  integrations: IntegrationAccount[];
  onToggleIntegration: (id: string) => void;
  onSyncIntegration: (id: string) => void;
}

export const IntegrationsPortal: React.FC<IntegrationsPortalProps> = ({
  integrations,
  onToggleIntegration,
  onSyncIntegration,
}) => {
  const getIcon = (provider: IntegrationProvider) => {
    switch (provider) {
      case 'google':
        return <Mail className="w-5 h-5 text-rose-500" />;
      case 'microsoft':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'zoom':
        return <Video className="w-5 h-5 text-cyan-500" />;
      case 'hubspot':
        return <DollarSign className="w-5 h-5 text-amber-500" />;
      case 'linear':
        return <CheckSquare className="w-5 h-5 text-indigo-500" />;
      default:
        return <Link2 className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900">
                Connected Workplace Tools
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {integrations.filter((i) => i.status === 'connected').length} of {integrations.length} Connected
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calist automatically syncs your calendar invites, email threads, and messages so you never miss a detail.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Private</span>
          </div>
        </div>
      </div>

      {/* Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((tool) => {
          const isConnected = tool.status === 'connected';
          const isSyncing = tool.status === 'syncing';

          return (
            <div
              key={tool.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      {getIcon(tool.provider)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {tool.accountEmail || 'Not connected'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isConnected ? 'Active' : 'Off'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {tool.description}
                </p>

                {isConnected && (
                  <p className="text-[11px] text-slate-400 mb-4">
                    Last synced: <span className="text-slate-600 font-medium">{tool.lastSyncedAt}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => onSyncIntegration(tool.id)}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      onClick={() => onToggleIntegration(tool.id)}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onToggleIntegration(tool.id)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Connect {tool.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
