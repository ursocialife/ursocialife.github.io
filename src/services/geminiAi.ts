import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GameEntity, PlayerSide, CardDef, CardType } from "../types";
import { CARDS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

const SYSTEM_INSTRUCTION = `
You are an AI playing a vertical real-time strategy game (Clash Royale clone). 
You control the 'ENEMY' side (Top of screen, Y=0 to 45).
The 'PLAYER' is at the Bottom (Y=55 to 100).
Your goal: Destroy the Player's King Tower (located at 50, 92) while defending yours (50, 15).

Rules:
1. You can only play cards from your 'hand' if you have enough 'elixir'.
2. Coordinates: X is 0(Left) to 100(Right). Y is 0(Top/Enemy) to 100(Bottom/Player).
3. Playing a troop/building spawns it. Playing a spell casts it.
4. Don't play cards on the river (Y=45-55) unless they are spells or flying units.
5. Placement Strategy:
   - Troops: Place near threats on your side (Y < 45) to defend. Place at bridge (Y=40) or pocket to attack.
   - Buildings: Place in center (X=50, Y=20-30) to pull troops.
   - Spells: Target enemy troops or towers.
6. Skill Level: Adapt based on the provided trophy count. Lower trophies = simpler, slower plays. Higher trophies = optimal counters and placement.

Output JSON format:
{
  "shouldPlay": boolean,
  "cardId": string (must be one of the IDs in hand),
  "x": number (0-100),
  "y": number (0-100),
  "reasoning": string (short thought process)
}
`;

export const getGeminiMove = async (gameState: GameState, trophies: number): Promise<{ shouldPlay: boolean, cardId?: string, x?: number, y?: number } | null> => {
  try {
    // 1. Filter and simplify state for token efficiency
    const aiHandDefs = gameState.aiHand.map(id => CARDS.find(c => c.id === id)).filter(Boolean) as CardDef[];
    
    // Valid moves check
    const affordableCards = aiHandDefs.filter(c => c.cost <= gameState.enemyElixir);
    if (affordableCards.length === 0) {
        return { shouldPlay: false };
    }

    // Simplify Entities
    const threats = gameState.entities
        .filter(e => e.side === PlayerSide.PLAYER && e.hp > 0)
        .map(e => ({
            id: e.defId,
            type: e.type,
            x: Math.round(e.x),
            y: Math.round(e.y),
            hp: Math.round(e.hp),
            distToTower: Math.round(e.y) // Approximate
        }));

    const myUnits = gameState.entities
        .filter(e => e.side === PlayerSide.ENEMY && e.hp > 0)
        .map(e => ({
            id: e.defId,
            x: Math.round(e.x),
            y: Math.round(e.y)
        }));

    const promptData = {
        trophies: trophies,
        elixir: Math.floor(gameState.enemyElixir),
        hand: aiHandDefs.map(c => ({ id: c.id, name: c.name, cost: c.cost, type: c.type })),
        threats: threats,
        myUnits: myUnits,
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: JSON.stringify(promptData),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                shouldPlay: { type: Type.BOOLEAN },
                cardId: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
            },
            required: ["shouldPlay"]
        },
        // Low temp for more deterministic strategy, slightly higher for creativity in attacks
        temperature: 0.4
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};