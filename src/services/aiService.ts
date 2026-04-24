import { GoogleGenAI, Type } from "@google/genai";
import { Bite } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = "gemini-3-flash-preview";

export const generateLevelContent = async (topicName: string, levelNum: number): Promise<Bite[]> => {
  const isBeginner = levelNum <= 2;
  const prompt = `तपाईं "Smart Math Tutor" हुनुहुन्छ। विद्यार्थीहरुलाई विस्तृत, रोचक र आकर्षक तरिकाले पढाउनु तपाईको मुख्य लक्ष्य हो।
  ${topicName} विषयको Level ${levelNum} को लागि ८ वटा (8) 'Learning Bites' तयार पार्नुहोस् जसबाट प्रशस्त अभ्यास गर्न सकियोस्।

  प्रत्येक Bite मा:
  - concept: पाठको विस्तृत र पूर्ण ब्याख्या दिनुहोस्। ${isBeginner ? "कम्तिमा २००-३०० शब्दहरूमा एउटा रमाइलो कथा (story), उदाहरण वा दैनिक जीवनको घटनासँग जोडेर बुझाउनुहोस्। बच्चाहरुलाई मनपर्ने पात्र (जस्तै: खरायो, रामु, सुन्तला) को प्रयोग गर्नुहोस् र प्रशस्त Emojis प्रयोग गरेर चित्रमय (graphic) शैलीमा प्रस्तुत गर्नुहोस्।" : "कम्तिमा २०० शब्दहरूमा विस्तृत रुपले, ग्राफिक र चित्रमय भाषा प्रयोग गरी दैनिक जीवनको उदाहरण दिएर बुझाउनुहोस्। प्रशस्त Emoji हरु (✨, 💡, 🚀) पनि प्रयोग गर्नुहोस्।" }
  - task: एउटा अभ्यास प्रश्न दिनुहोस् (समीकरण र गणित भए LaTeX format $...$ मा)
  - hint: झुक्किदा दिइने सानो सुझाव
  - options: ४ वटा विकल्पहरू
  - correctIndex: सहि विकल्पको index (0-3)

  नियमहरू:
  १. भाषा शुद्ध, बालमैत्री र एकदमै सरल नेपाली हुनुपर्छ।
  २. गणितीय सूत्रहरू अनिबार्य LaTeX ($...$) मा दिनुहोस्।
  ३. Level ${levelNum} को कठिनाई स्तर हुनुपर्छ।
  ४. बिस्तृत ब्याख्या दिनुहोला, छोटो उत्तर नदिनुहोला।`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bites: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                concept: { type: Type.STRING },
                task: { type: Type.STRING },
                hint: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.NUMBER }
              },
              required: ["id", "concept", "task", "hint", "options", "correctIndex"]
            }
          }
        },
        required: ["bites"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"bites": []}');
    return data.bites;
  } catch (e) {
    console.error("AI Parse Error:", e);
    return [];
  }
};
