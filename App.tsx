import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createArtifact, getSuggestionsForEssence, fuseArtifacts } from './services/geminiService';
import { Artifact, EssenceSuggestions, TacitValueAssessment } from './types';
import Card from './components/Card';
import Button from './components/Button';
import LoadingSpinner from './components/LoadingSpinner';
import { FingerPrintIcon, CpuChipIcon, ChartBarIcon, CurrencyDollarIcon, SearchIcon, SparklesIcon, UploadIcon, DocumentTextIcon, MicrophoneIcon, LinkIcon } from './components/icons/Icons';
import SimulationGuide from './components/SimulationGuide';
import ArtifactCard from './components/ArtifactCard';

const initialMarketplaceOpportunities: Artifact[] = [
    {
      hashId: 'mock03a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e',
      name: 'Cápsula de Legado Familiar',
      description: 'Um artefato que encapsula os valores e a história de uma linhagem. Seu valor se fortalece com o tempo, servindo como uma herança digital incorruptível.',
      manifesto: "Na trama do tempo, tecemos fios de memória. O que fomos, somos e seremos, guardado para a eternidade.",
      coreAttributes: ['Herança', 'Permanência', 'Valores', 'História'],
      marketValue: 75000,
      currency: 'Aura Credits (AC)',
      trend: 'rising',
      applications: ['Verificação de Herança', 'Governança Familiar', 'Arquivo Histórico Imutável']
    },
     {
      hashId: 'mock04f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f8g7h6',
      name: 'Token de Visão Empreendedora',
      description: 'Representa o potencial de um projeto ou indivíduo. Investidores podem adquirir frações para financiar a visão, participando do sucesso futuro.',
      manifesto: "O futuro não é encontrado, é construído. Cada faísca de visão ilumina o caminho para o que pode ser.",
      coreAttributes: ['Potencial', 'Inovação', 'Crowdfunding', 'Confiança'],
      marketValue: 42000,
      currency: 'Aura Credits (AC)',
      trend: 'rising',
      applications: ['Financiamento Descentralizado', 'Prova de Conceito', 'Participação em Governança']
    },
    {
      hashId: 'mock01a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e',
      name: 'Fragmento de Resiliência Coletiva',
      description: 'Um artefato que representa a força combinada de uma comunidade. Aumenta o valor com base na colaboração do grupo.',
      manifesto: "Sozinhos somos gotas, juntos somos o oceano. Nossa força não está no indivíduo, mas na maré que erguemos unidos.",
      coreAttributes: ['Comunidade', 'Sinergia', 'Crescimento'],
      marketValue: 12500,
      currency: 'Aura Credits (AC)',
      trend: 'rising',
      applications: ['Votação Comunitária', 'Acesso a Recursos Compartilhados']
    },
];

type SortOrder = 'default' | 'desc' | 'asc';
type InspirationType = 'image' | 'text' | 'audio';

interface FilterControlsProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sortOrder: SortOrder;
    onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ searchTerm, onSearchChange, sortOrder, onSortChange }) => (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
                type="text"
                placeholder="Buscar por nome, atributo..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full p-2 pl-10 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all duration-300"
            />
        </div>
        <select
            value={sortOrder}
            onChange={onSortChange}
            className="p-2 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all duration-300"
        >
            <option value="default">Ordenar por...</option>
            <option value="desc">Maior Valor</option>
            <option value="asc">Menor Valor</option>
        </select>
    </div>
);

const TacitValueDisplay: React.FC<{ assessment: TacitValueAssessment }> = ({ assessment }) => (
    <div className="mt-4 bg-base-dark/50 p-4 rounded-lg border border-brand-primary/20">
        <h4 className="font-semibold text-base-heading mb-3 text-center flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-brand-primary" />
            Análise de Potencial Estratégico
        </h4>
        <p className="text-center text-sm text-gray-400 italic mb-4">"{assessment.summary}"</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div>
                <div className="flex justify-between text-xs font-medium text-gray-300 mb-1" title="Avalia a aptidão da ideia para operar em ecossistemas descentralizados (Web3, DAOs).">
                    <span>Potencial de Descentralização</span>
                    <span>{assessment.decentralizationPotential}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${assessment.decentralizationPotential}%` }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs font-medium text-gray-300 mb-1" title="Mede o potencial de crescimento exponencial à medida que mais usuários aderem à plataforma.">
                    <span>Escalabilidade de Efeito de Rede</span>
                    <span>{assessment.networkEffectScalability}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${assessment.networkEffectScalability}%` }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs font-medium text-gray-300 mb-1" title="Indica o quanto a ideia capacita os usuários com o controle de seus próprios dados.">
                    <span>Alinhamento com Soberania de Dados</span>
                    <span>{assessment.dataSovereigntyAlignment}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${assessment.dataSovereigntyAlignment}%` }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs font-medium text-gray-300 mb-1" title="Estima o potencial da ideia para criar uma categoria de mercado inteiramente nova.">
                    <span>Índice de Criação de Mercado</span>
                    <span>{assessment.marketCreationIndex}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${assessment.marketCreationIndex}%` }}></div>
                </div>
            </div>
        </div>
    </div>
);

const InteroperabilityModal: React.FC<{ artifact: Artifact; onClose: () => void }> = ({ artifact, onClose }) => {
    const [copyState, setCopyState] = useState<'link' | 'json' | 'widget' | null>(null);

    const handleCopy = (type: 'link' | 'json' | 'widget', content: string) => {
        navigator.clipboard.writeText(content);
        setCopyState(type);
        setTimeout(() => setCopyState(null), 2000);
    };

    const directLink = `https://bio-locus.dev/artifacts/${artifact.hashId}`;
    const jsonManifesto = JSON.stringify(artifact, null, 2);
    const embedWidget = `<iframe src="${directLink}/embed" width="100%" height="400" frameborder="0"></iframe>`;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-base-light rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                <h3 className="text-xl font-bold text-base-heading mb-2 text-center">Central de Interoperabilidade</h3>
                <p className="text-center text-base-text mb-6">Exporte o Manifesto Digital do seu artefato.</p>

                <div className="space-y-4">
                    {/* Direct Link */}
                    <div>
                        <label className="block text-sm font-medium text-brand-primary/80 mb-1">Link Direto (URL Canônica)</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" readOnly value={directLink} className="w-full p-2 bg-[#070d1d] border border-gray-600 rounded-lg text-gray-400 font-mono text-sm" />
                            <Button onClick={() => handleCopy('link', directLink)} style={{padding: '0.5rem 1rem', minWidth: '80px'}}>
                                {copyState === 'link' ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </div>
                    </div>

                    {/* JSON Manifesto */}
                    <div>
                        <label className="block text-sm font-medium text-brand-primary/80 mb-1">Manifesto JSON (Dados Brutos)</label>
                        <div className="relative">
                            <textarea readOnly value={jsonManifesto} className="w-full p-2 bg-[#070d1d] border border-gray-600 rounded-lg text-gray-400 font-mono text-xs h-32 resize-none" />
                            <Button onClick={() => handleCopy('json', jsonManifesto)} className="absolute bottom-2 right-2" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem', minWidth: '80px'}}>
                               {copyState === 'json' ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </div>
                    </div>

                    {/* Embeddable Widget */}
                    <div>
                        <label className="block text-sm font-medium text-brand-primary/80 mb-1">Widget Embarcável (HTML)</label>
                        <div className="flex items-center space-x-2">
                            <textarea readOnly value={embedWidget} className="w-full p-2 bg-[#070d1d] border border-gray-600 rounded-lg text-gray-400 font-mono text-sm resize-none h-16" />
                            <Button onClick={() => handleCopy('widget', embedWidget)} style={{padding: '0.5rem 1rem', minWidth: '80px'}}>
                               {copyState === 'widget' ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [appMode, setAppMode] = useState<'simulation' | 'live'>('simulation');
  const [centralConcept, setCentralConcept] = useState('');
  const [coreValues, setCoreValues] = useState('');
  const [aspiration, setAspiration] = useState('');
  
  // Inspiration state
  const [inspirationType, setInspirationType] = useState<InspirationType>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInspiration, setTextInspiration] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<TacitValueAssessment | null>(null);

  const [portfolio, setPortfolio] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedArtifactForSharing, setSelectedArtifactForSharing] = useState<Artifact | null>(null);
  
  const [portfolioFilters, setPortfolioFilters] = useState({ searchTerm: '', sortOrder: 'default' as SortOrder });
  const [marketplaceOpportunities, setMarketplaceOpportunities] = useState<Artifact[]>(initialMarketplaceOpportunities);
  const [marketplaceFilters, setMarketplaceFilters] = useState({ searchTerm: '', sortOrder: 'default' as SortOrder });

  const [selectedForFusion, setSelectedForFusion] = useState<string[]>([]);
  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false);
  const [fusionGoal, setFusionGoal] = useState('');


  const applyFilters = useCallback((items: Artifact[], filters: { searchTerm: string; sortOrder: SortOrder }) => {
    let filtered = items;
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.coreAttributes.some(attr => attr.toLowerCase().includes(term))
        );
    }
    if (filters.sortOrder !== 'default') {
        filtered = [...filtered].sort((a, b) => {
            if (filters.sortOrder === 'asc') return a.marketValue - b.marketValue;
            return b.marketValue - a.marketValue;
        });
    }
    return filtered;
  }, []);

  const filteredPortfolio = useMemo(() => applyFilters(portfolio, portfolioFilters), [portfolio, portfolioFilters, applyFilters]);
  const filteredMarketplace = useMemo(() => applyFilters(marketplaceOpportunities, marketplaceFilters), [marketplaceOpportunities, marketplaceFilters, applyFilters]);

  const canForge = [centralConcept, coreValues, aspiration].every(field => field.trim() !== '');

  const resetInspiration = () => {
    setSelectedFile(null);
    setTextInspiration('');
    setAudioBlob(null);
    setIsRecording(false);
  }

  const handleAnalyzeInspiration = async () => {
    let inspirationPayload: any = null;
    if (inspirationType === 'image' && selectedFile) {
        inspirationPayload = { type: 'image' as 'image', file: selectedFile };
    } else if (inspirationType === 'text' && textInspiration.trim()) {
        inspirationPayload = { type: 'text' as 'text', text: textInspiration };
    } else if (inspirationType === 'audio' && audioBlob) {
        inspirationPayload = { type: 'audio' as 'audio', file: new File([audioBlob], "inspiration.webm", {type: audioBlob.type}) };
    }

    if (!inspirationPayload) {
        setError("Forneça uma fonte de inspiração para análise.");
        return;
    }
    
    setIsSuggesting(true);
    setError(null);
    setAssessment(null);

    try {
        const result: EssenceSuggestions = await getSuggestionsForEssence(inspirationPayload);
        setCentralConcept(result.centralConcept);
        setCoreValues(result.coreValues);
        setAspiration(result.aspiration);
        setAssessment(result.tacitValueAssessment);
    } catch (e) {
        console.error(e);
        setError("A IA não conseguiu interpretar a essência da inspiração. Tente uma fonte diferente ou preencha manualmente.");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        recorder.onstop = () => {
            const newAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(newAudioBlob);
            stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setIsRecording(true);
        setAudioBlob(null);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
    }
  };
  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleForgeArtifact = useCallback(async () => {
    if (!canForge) {
      setError("Por favor, preencha todos os campos para definir sua essência digital.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const combinedInput = `Conceito: "${centralConcept}". Valores: "${coreValues}". Aspiração: "${aspiration}".`;
    try {
      const newArtifact = await createArtifact(combinedInput);
      setPortfolio(prev => [newArtifact, ...prev]);
      setMarketplaceOpportunities(prev => [newArtifact, ...prev.slice(0, 4)]);
      setCentralConcept('');
      setCoreValues('');
      setAspiration('');
      resetInspiration();
      setAssessment(null);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao forjar o artefato. A rede quântica pode estar instável. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [centralConcept, coreValues, aspiration, canForge]);

    const handleFuseArtifacts = async () => {
        if (selectedForFusion.length !== 2 || !fusionGoal.trim()) {
            setError("Selecione exatamente 2 artefatos e defina um objetivo para a fusão.");
            return;
        }
        setIsLoading(true);
        setError(null);
        const [artifact1, artifact2] = selectedForFusion.map(id => portfolio.find(a => a.hashId === id)).filter(Boolean) as [Artifact, Artifact];
        
        try {
            const fusedArtifact = await fuseArtifacts(artifact1, artifact2, fusionGoal);
            setPortfolio(prev => [fusedArtifact, ...prev.filter(a => !selectedForFusion.includes(a.hashId))]);
            setMarketplaceOpportunities(prev => [fusedArtifact, ...prev.slice(0, 4)]);
            setSelectedForFusion([]);
            setFusionGoal('');
            setIsFusionModalOpen(false);
        } catch(e) {
            console.error("Error fusing artifacts:", e);
            setError("A fusão sinérgica falhou. As energias podem não estar alinhadas. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };


  const handleShareArtifact = (artifact: Artifact) => {
    setSelectedArtifactForSharing(artifact);
    setIsShareModalOpen(true);
  };

  const handleFusionSelection = (hashId: string) => {
    setSelectedForFusion(prev => {
        if (prev.includes(hashId)) {
            return prev.filter(id => id !== hashId);
        }
        if (prev.length < 2) {
            return [...prev, hashId];
        }
        return [prev[1], hashId]; // Keep last selected and add new one
    });
  };
  
  if (appMode === 'simulation') {
    return <SimulationGuide onComplete={() => setAppMode('live')} />;
  }

  return (
    <>
      {isShareModalOpen && selectedArtifactForSharing && (
        <InteroperabilityModal artifact={selectedArtifactForSharing} onClose={() => setIsShareModalOpen(false)} />
      )}
      {isFusionModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setIsFusionModalOpen(false)}>
            <div className="bg-base-light rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-base-heading mb-2 text-center">Altar de Fusão</h3>
                <p className="text-center text-base-text mb-6">Combine a essência de dois artefatos.</p>
                <div className="space-y-4">
                    <label htmlFor="fusion-goal" className="block text-sm font-medium text-brand-primary/80 mb-1">Objetivo da Sinergia</label>
                    <input
                        id="fusion-goal"
                        type="text"
                        className="w-full p-3 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
                        placeholder="Ex: Criar um ativo de governança"
                        value={fusionGoal}
                        onChange={(e) => setFusionGoal(e.target.value)}
                    />
                </div>
                 <div className="mt-6 text-center">
                    <Button onClick={handleFuseArtifacts} disabled={isLoading || !fusionGoal.trim()}>
                        {isLoading ? <LoadingSpinner /> : <><LinkIcon className="h-5 w-5 mr-2"/> Fundir Artefatos</>}
                    </Button>
                </div>
            </div>
        </div>
      )}

      <div className="min-h-screen bg-base-dark font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-base-light p-4 rounded-full mb-4 border-2 border-brand-primary/20">
              <CpuChipIcon className="h-10 w-10 text-brand-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-base-heading tracking-tight">
              Bio-Equity Protocol
            </h1>
            <p className="mt-4 text-lg text-base-text max-w-3xl mx-auto">
              Forje, funda e negocie artefatos digitais únicos derivados da sua identidade.
            </p>
          </header>

          <main>
            <div className="bg-base-light p-6 rounded-2xl shadow-2xl border border-white/10">
              <h3 className="text-xl font-bold text-base-heading mb-2 text-center">Altar de Forja</h3>
              <p className="text-center text-base-text mb-6 max-w-2xl mx-auto">Materialize um artefato a partir de sua essência. Escolha sua fonte de inspiração.</p>
              
              <div className="bg-base-dark/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-base-heading mb-3 text-center">Fonte de Inspiração</h4>
                  <div className="flex justify-center border-b border-gray-700 mb-4">
                     { (['image', 'text', 'audio'] as InspirationType[]).map(type => (
                        <button key={type} onClick={() => { setInspirationType(type); resetInspiration(); }} className={`px-4 py-2 text-sm font-medium transition-colors ${inspirationType === type ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}>
                           {type === 'image' && 'Imagem'}
                           {type === 'text' && 'Texto'}
                           {type === 'audio' && 'Áudio'}
                        </button>
                     ))}
                  </div>
                  <div className="text-center">
                    {inspirationType === 'image' && (
                        <label className="relative inline-flex items-center justify-center px-6 py-3 bg-brand-secondary text-white font-bold rounded-lg cursor-pointer hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg">
                          <UploadIcon className="h-5 w-5 mr-2"/>
                          <span>{selectedFile ? selectedFile.name : 'Selecionar Imagem'}</span>
                          <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} accept="image/*" />
                        </label>
                    )}
                    {inspirationType === 'text' && (
                        <textarea className="w-full max-w-lg mx-auto p-3 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary" rows={3} placeholder="Cole um poema, uma citação, um sonho..." value={textInspiration} onChange={e => setTextInspiration(e.target.value)} />
                    )}
                    {inspirationType === 'audio' && (
                         <div>
                            <Button onClick={isRecording ? handleStopRecording : handleStartRecording} style={{backgroundColor: isRecording ? '#E53E3E' : '#9B5DE5'}}>
                                <MicrophoneIcon className="h-5 w-5 mr-2" />
                                {isRecording ? 'Parar Gravação' : 'Gravar Áudio'}
                            </Button>
                            {audioBlob && <p className="text-sm mt-2 text-gray-300">Gravação pronta para análise.</p>}
                         </div>
                    )}
                    <div className="mt-4">
                        <Button onClick={handleAnalyzeInspiration} disabled={isSuggesting} style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                            {isSuggesting ? <LoadingSpinner /> : <><SparklesIcon className="h-5 w-5 mr-2"/>Analisar com IA</>}
                        </Button>
                    </div>
                  </div>
              </div>

              {isSuggesting && <div className="text-center mt-3 text-brand-primary animate-pulse">Analisando essência...</div>}
              {assessment && !isSuggesting && <TacitValueDisplay assessment={assessment} />}

              <div className="mt-4 pt-4 border-t border-brand-primary/10 space-y-4">
                <div>
                  <label htmlFor="central-concept" className="block text-sm font-medium text-brand-primary/80 mb-1">Conceito Central</label>
                  <input id="central-concept" type="text" className="w-full p-3 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all" placeholder={isSuggesting ? "IA está gerando..." : "Ex: Minha resiliência criativa"} value={centralConcept} onChange={(e) => setCentralConcept(e.target.value)} disabled={isSuggesting} />
                </div>
                <div>
                  <label htmlFor="core-values" className="block text-sm font-medium text-brand-primary/80 mb-1">Valores Fundamentais (separados por vírgula)</label>
                  <input id="core-values" type="text" className="w-full p-3 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all" placeholder={isSuggesting ? "IA está gerando..." : "Ex: Integridade, Curiosidade, Compaixão"} value={coreValues} onChange={(e) => setCoreValues(e.target.value)} disabled={isSuggesting}/>
                </div>
                <div>
                  <label htmlFor="aspiration" className="block text-sm font-medium text-brand-primary/80 mb-1">Aspiração ou Missão</label>
                  <input id="aspiration" type="text" className="w-full p-3 bg-[#070d1d] border border-gray-600 rounded-lg text-base-text focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all" placeholder={isSuggesting ? "IA está gerando..." : "Ex: Construir pontes entre tecnologia e arte"} value={aspiration} onChange={(e) => setAspiration(e.target.value)} disabled={isSuggesting}/>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={handleForgeArtifact} disabled={isLoading || isSuggesting || !canForge}>
                  {isLoading ? <LoadingSpinner /> : <><FingerPrintIcon className="h-5 w-5 mr-2"/> Materializar e Forjar</>}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-8 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
               <Card 
                  title="Meu Portfólio de Artefatos" 
                  icon={<CurrencyDollarIcon />}
                  counter={`${filteredPortfolio.length}/${portfolio.length}`}
                >
                  <FilterControls
                      searchTerm={portfolioFilters.searchTerm}
                      onSearchChange={e => setPortfolioFilters(f => ({ ...f, searchTerm: e.target.value }))}
                      sortOrder={portfolioFilters.sortOrder}
                      onSortChange={e => setPortfolioFilters(f => ({ ...f, sortOrder: e.target.value as SortOrder }))}
                  />
                  {selectedForFusion.length === 2 && (
                      <div className="mb-4 text-center">
                        <Button onClick={() => setIsFusionModalOpen(true)}>
                           <LinkIcon className="h-5 w-5 mr-2" /> Iniciar Fusão de Sinergia
                        </Button>
                      </div>
                  )}
                  {portfolio.length === 0 && !isLoading ? (
                      <div className="text-center py-12 flex flex-col items-center">
                          <FingerPrintIcon className="h-16 w-16 text-brand-secondary/30 mb-4" />
                          <p className="text-lg font-semibold text-base-heading">Seu Portfólio Está Vazio</p>
                          <p className="text-base-text">Use o Altar de Forja para materializar seu primeiro artefato digital.</p>
                      </div>
                  ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                          {filteredPortfolio.map(artifact => <ArtifactCard key={artifact.hashId} artifact={artifact} onShare={handleShareArtifact} isShareable={true} onSelect={handleFusionSelection} isSelected={selectedForFusion.includes(artifact.hashId)} isSelectable={true} />)}
                      </div>
                  )}
              </Card>

              <Card 
                  title="Mercado Pulsante" 
                  icon={<ChartBarIcon />}
                  counter={`${filteredMarketplace.length}/${marketplaceOpportunities.length}`}
                >
                  <FilterControls
                      searchTerm={marketplaceFilters.searchTerm}
                      onSearchChange={e => setMarketplaceFilters(f => ({ ...f, searchTerm: e.target.value }))}
                      sortOrder={marketplaceFilters.sortOrder}
                      onSortChange={e => setMarketplaceFilters(f => ({ ...f, sortOrder: e.target.value as SortOrder }))}
                  />
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredMarketplace.map(artifact => <ArtifactCard key={artifact.hashId} artifact={artifact} />)}
                  </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}