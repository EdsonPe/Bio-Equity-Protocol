export interface Artifact {
  hashId: string;
  name: string;
  description: string;
  coreAttributes: string[];
  marketValue: number;
  currency: string;
  trend?: 'rising' | 'stable';
  applications?: string[];
  manifesto?: string;
  origin?: {
    type: 'fusion';
    parents: [string, string];
  };
}

export interface TacitValueAssessment {
  summary: string;
  decentralizationPotential: number;
  networkEffectScalability: number;
  dataSovereigntyAlignment: number;
  marketCreationIndex: number;
}

export interface EssenceSuggestions {
    centralConcept: string;
    coreValues: string;
    aspiration: string;
    tacitValueAssessment: TacitValueAssessment;
}