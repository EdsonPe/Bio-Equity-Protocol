import { GoogleGenAI, Type } from "@google/genai";
import { Artifact, EssenceSuggestions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


const artifactSchema = {
  type: Type.OBJECT,
  properties: {
    hashId: {
      type: Type.STRING,
      description: "Um hash hexadecimal único e fictício de 64 caracteres para o artefato."
    },
    name: {
      type: Type.STRING,
      description: "Um nome evocativo e futurista para o artefato digital."
    },
    description: {
      type: Type.STRING,
      description: "Uma descrição detalhada das qualidades intrínsecas e do potencial do artefato."
    },
    manifesto: {
        type: Type.STRING,
        description: "Um texto poético e curto (2-3 sentenças) que encapsula a alma e a filosofia do artefato."
    },
    coreAttributes: {
      type: Type.ARRAY,
      description: "Uma lista de 3 a 5 atributos chave que definem a essência do artefato (ex: 'Veracidade', 'Resiliência', 'Adaptação').",
      items: { type: Type.STRING },
    },
    marketValue: {
        type: Type.NUMBER,
        description: "Um valor de mercado inicial plausível para o artefato, entre 5000 e 50000. Se for uma fusão, deve ser maior que a soma dos pais."
    },
    currency: {
        type: Type.STRING,
        description: "A moeda para o valor de mercado, que deve ser 'Aura Credits (AC)'."
    },
    applications: {
      type: Type.ARRAY,
      description: "Uma lista de 2 a 3 aplicações práticas ou conceituais para o artefato. Exemplos: 'Validação de Transações Críticas', 'Garantia de Autenticidade', 'Acesso a Redes de Confiança', 'Prova de Reputação'.",
      items: { type: Type.STRING },
    }
  },
  required: ["hashId", "name", "description", "manifesto", "coreAttributes", "marketValue", "currency", "applications"],
};


const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        centralConcept: {
            type: Type.STRING,
            description: "Um conceito central poético e conciso que captura a essência da inspiração."
        },
        coreValues: {
            type: Type.STRING,
            description: "Uma string contendo 3 a 4 valores fundamentais, separados por vírgula, que representam a inspiração."
        },
        aspiration: {
            type: Type.STRING,
            description: "Uma frase que descreve a missão ou o propósito potencial derivado da inspiração."
        },
        tacitValueAssessment: {
            type: Type.OBJECT,
            description: "Uma análise estratégica do potencial da inspiração com base em modelos de negócios do futuro.",
            properties: {
                summary: {
                    type: Type.STRING,
                    description: "Um resumo estratégico de uma frase sobre o potencial de mercado da inspiração."
                },
                decentralizationPotential: {
                    type: Type.NUMBER,
                    description: "Pontuação (0-100) da aptidão da ideia para operar em ecossistemas descentralizados (Web3, DAOs)."
                },
                networkEffectScalability: {
                    type: Type.NUMBER,
                    description: "Pontuação (0-100) do potencial de crescimento exponencial à medida que mais usuários aderem."
                },
                dataSovereigntyAlignment: {
                    type: Type.NUMBER,
                    description: "Pontuação (0-100) do alinhamento com o princípio de soberania de dados do usuário."
                },
                 marketCreationIndex: {
                    type: Type.NUMBER,
                    description: "Pontuação (0-100) da capacidade da ideia de criar uma categoria de mercado totalmente nova."
                }
            },
            required: ["summary", "decentralizationPotential", "networkEffectScalability", "dataSovereigntyAlignment", "marketCreationIndex"]
        }
    },
    required: ["centralConcept", "coreValues", "aspiration", "tacitValueAssessment"]
}

export const createArtifact = async (combinedInput: string): Promise<Artifact> => {
  const systemInstruction = `Você é o 'Aura Protocol Forging Engine'. Sua função é transformar a essência digital de um usuário (representada por um conceito, valores e aspiração) em um artefato digital único e valioso. Gere um nome futurista, uma descrição detalhada, um 'Manifesto do Artefato' poético (2-3 sentenças), atributos principais, um valor de mercado em 'Aura Credits (AC)', um ID de hash e aplicações práticas. Responda APENAS com o objeto JSON, aderindo estritamente ao schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crie um artefato digital a partir da seguinte essência: ${combinedInput}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: artifactSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as Artifact;
    return parsedResult;
  } catch (error) {
    console.error("Error calling Gemini API for artifact creation:", error);
    throw new Error("Failed to forge the artifact with Gemini API.");
  }
};


export const getSuggestionsForEssence = async (
    inspiration: { type: 'image' | 'audio', file: File } | { type: 'text', text: string }
): Promise<EssenceSuggestions> => {
    const systemInstruction = `Você é uma IA estrategista de mercados futuros, especializada em avaliar o potencial disruptivo de novas ideias. Sua tarefa é analisar a inspiração do usuário através da lente de modelos de negócios da próxima geração (Web3, DAOs, economias de dados soberanos). Realize uma 'Análise de Potencial Estratégico', avaliando a inspiração em 'Potencial de Descentralização', 'Escalabilidade de Efeito de Rede', 'Alinhamento com Soberania de Dados' e 'Índice de Criação de Mercado' (pontuações de 0 a 100). Forneça um resumo estratégico conciso. Em seguida, extraia a essência para o 'Conceito Central', 'Valores' e 'Aspiração'. Responda APENAS com o objeto JSON, aderindo ao schema.`;
    
    let contents: any;
    const analysisPrompt = `Analise a seguinte fonte de inspiração (${inspiration.type}) e extraia sua essência para o protocolo Bio-Equity.`;

    if (inspiration.type === 'text') {
        contents = `${analysisPrompt}\n\nTexto: "${inspiration.text}"`;
    } else {
        const base64Data = await fileToBase64(inspiration.file);
        contents = {
            parts: [
                { text: analysisPrompt },
                {
                    inlineData: {
                        mimeType: inspiration.file.type,
                        data: base64Data
                    }
                }
            ]
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as EssenceSuggestions;

    } catch(error) {
        console.error("Error calling Gemini API for suggestions:", error);
        throw new Error("Failed to get suggestions from Gemini API.");
    }
};

export const fuseArtifacts = async (artifact1: Artifact, artifact2: Artifact, goal: string): Promise<Artifact> => {
  const systemInstruction = `Você é um 'Alquimista Digital' do Protocolo Aura. Sua tarefa é fundir dois artefatos digitais em um novo e mais poderoso 'Artefato Composto'. Analise os dois artefatos pais e o objetivo do usuário para a fusão. O resultado deve ser uma combinação sinérgica de suas forças, refletido em um novo nome, descrição, manifesto, atributos e um valor de mercado maior (maior que a soma dos pais). Responda estritamente com o schema JSON.`;

  const prompt = `
    Fusão de Artefatos:
    Artefato 1: ${JSON.stringify(artifact1)}
    Artefato 2: ${JSON.stringify(artifact2)}
    Objetivo da Fusão: "${goal}"

    Gere o novo Artefato Composto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: artifactSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as Artifact;
    
    // Adiciona a informação de origem
    const finalResult: Artifact = {
        ...parsedResult,
        origin: {
            type: 'fusion',
            parents: [artifact1.hashId, artifact2.hashId]
        }
    };

    return finalResult;

  } catch (error) {
    console.error("Error calling Gemini API for artifact fusion:", error);
    throw new Error("Failed to fuse artifacts with Gemini API.");
  }
};