import React from 'react';
import { Artifact } from '../types';
import { ArrowUpIcon, MinusIcon, ShieldCheckIcon, ShareIcon, LinkIcon } from './icons/Icons';

const TrendIndicator: React.FC<{ trend?: 'rising' | 'stable' }> = ({ trend }) => {
    if (trend === 'rising') {
        return <span className="flex items-center text-xs text-green-400"><ArrowUpIcon className="mr-1 h-3 w-3" /> Alta</span>;
    }
    if (trend === 'stable') {
        return <span className="flex items-center text-xs text-yellow-400"><MinusIcon className="mr-1 h-3 w-3" /> Estável</span>;
    }
    return null;
};

interface ArtifactCardProps {
    artifact: Artifact;
    onShare?: (artifact: Artifact) => void;
    isShareable?: boolean;
    onSelect?: (hashId: string) => void;
    isSelected?: boolean;
    isSelectable?: boolean;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onShare, isShareable = false, onSelect, isSelected = false, isSelectable = false }) => (
    <div className={`relative group p-4 bg-base-dark rounded-lg border space-y-3 transition-all duration-300 hover:shadow-brand-primary/20 hover:-translate-y-1 flex flex-col justify-between ${isSelected ? 'border-brand-primary' : 'border-gray-700 hover:border-brand-primary/40'}`}>
        {isSelectable && onSelect && (
             <div className="absolute top-3 right-3 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(artifact.hashId)}
                    className="h-5 w-5 rounded bg-base-light border-gray-500 text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
            </div>
        )}
      <div>
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-brand-primary text-lg truncate pr-4">{artifact.name}</h4>
          <div className="flex items-center space-x-4 pl-8">
            {artifact.trend && <TrendIndicator trend={artifact.trend} />}
            {isShareable && onShare && (
              <button onClick={() => onShare(artifact)} title="Compartilhar Manifesto do Ativo" className="text-gray-400 hover:text-brand-primary transition-colors opacity-50 group-hover:opacity-100">
                <ShareIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {artifact.origin?.type === 'fusion' && (
            <div className="flex items-center text-xs text-brand-secondary mt-1">
                <LinkIcon className="h-3 w-3 mr-1.5" />
                <span>Artefato Composto</span>
            </div>
        )}
        <p className="text-xs text-gray-400 font-mono break-all mt-1">ID: {artifact.hashId}</p>
        
        {artifact.manifesto && (
             <p className="text-sm text-base-text mt-3 pt-3 border-t border-gray-700/50 italic">"{artifact.manifesto}"</p>
        )}
       
        <p className="text-sm text-base-text mt-2">{artifact.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {artifact.coreAttributes.map(attr => (
            <span key={attr} className="px-2 py-1 text-xs bg-brand-secondary/20 text-brand-secondary rounded-full">{attr}</span>
          ))}
        </div>

        {artifact.applications && artifact.applications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h5 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <ShieldCheckIcon className="h-4 w-4 mr-2 text-brand-secondary" />
              Aplicações Potenciais
            </h5>
            <div className="flex flex-wrap gap-2">
              {artifact.applications.map(app => (
                <span key={app} className="px-2 py-1 text-[11px] bg-gray-700 text-gray-300 rounded-md">{app}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 text-right">
        <p className="text-lg font-bold text-base-heading">
          {artifact.marketValue.toLocaleString()} <span className="text-sm font-normal text-brand-primary">{artifact.currency}</span>
        </p>
      </div>
    </div>
);

export default ArtifactCard;
