import React, { useState } from 'react';
import { CpuChipIcon, FingerPrintIcon, CurrencyDollarIcon, ChartBarIcon, LinkIcon } from './icons/Icons';
import Button from './Button';

interface SimulationGuideProps {
  onComplete: () => void;
}

const simulationSteps = [
  {
    icon: <CpuChipIcon className="h-12 w-12 text-brand-primary" />,
    title: "Bem-vindo ao Futuro da Identidade Digital",
    description: "Prepare-se para uma jornada onde sua identidade se torna a chave para uma nova classe de ativos digitais. Este é o Bio-Equity Protocol."
  },
  {
    icon: <FingerPrintIcon className="h-12 w-12 text-brand-primary" />,
    title: "O Processo de Forja Multimodal",
    description: "Use uma fonte de inspiração — uma imagem, um texto ou sua própria voz — para 'forjar' um Cripto-Artefato. Cada artefato é um reflexo digital único da sua individualidade."
  },
  {
    icon: <CurrencyDollarIcon />,
    title: "Valor Intrínseco e Manifesto",
    description: "Cada artefato possui atributos, um valor de mercado e um 'Manifesto' poético gerado por IA, que captura sua essência e o torna um ativo com propósito."
  },
    {
    icon: <LinkIcon className="h-12 w-12 text-brand-primary" />,
    title: "Sinergia e Fusão",
    description: "Combine dois de seus artefatos para forjar um 'Artefato Composto' mais poderoso. A fusão cria ativos com novas capacidades e maior valor, incentivando a evolução estratégica."
  },
  {
    icon: <ChartBarIcon />,
    title: "Um Mercado Pulsante Nasce",
    description: "Esses artefatos podem ser mantidos, fundidos e negociados em nosso 'Mercado Pulsante', um ecossistema dinâmico baseado na identidade e colaboração."
  }
];

const SimulationGuide: React.FC<SimulationGuideProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < simulationSteps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };
  
  const currentStep = simulationSteps[step];

  return (
    <div className="min-h-screen bg-base-dark flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="w-full max-w-2xl bg-base-light rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-12 transform transition-all duration-500">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-base-dark rounded-full border-2 border-brand-secondary/30">
            {currentStep.icon}
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-base-heading mb-4">
          {currentStep.title}
        </h2>
        <p className="text-base-text text-lg mb-8">
          {currentStep.description}
        </p>

        <div className="flex justify-center items-center space-x-4 mb-8">
            {simulationSteps.map((_, index) => (
                <div 
                    key={index}
                    className={`h-2.5 rounded-full transition-all duration-300 ${index === step ? 'bg-brand-primary w-8' : 'bg-gray-700 w-2.5'}`}
                />
            ))}
        </div>

        <Button onClick={handleNext}>
          {step < simulationSteps.length - 1 ? "Próximo" : "Entrar no Protocolo"}
        </Button>
      </div>
      <p className="mt-8 text-sm text-gray-500">Simulação de Conceito: Versão 2.0</p>
    </div>
  );
};

export default SimulationGuide;