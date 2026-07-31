import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Coach advice endpoint using Gemini
  app.post("/api/ai-coach", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY_MISSING",
          message: "La clé API Gemini n'est pas configurée dans les variables d'environnement.",
        });
      }

      const { prompt, userContext } = req.body;

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Tu es GymTrack AI Coach, un entraîneur de musculation expert, bienveillant, scientifique et motivant.
Tu réponds en français clair, concis et directement structuré.
Fournis des conseils pratiques sur la surcharge progressive, l'exécution des mouvements, la récupération, la nutrition sportive et la gestion de la fatigue.
Si l'utilisateur pose une question sur un exercice spécifique, donne des repères d'exécution biomécaniques précis (angles, trajectoire, respiration).`;

      const formattedPrompt = `Contexte de l'utilisateur :
- Programme : ${userContext?.currentProgram || 'PPL'}
- Séance du jour : ${userContext?.sessionName || 'Non spécifiée'}
- Historique récent : ${userContext?.recentSummary || 'Débutant/Intermédiaire'}

Question / Demande : ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "Désolé, je n'ai pas pu générer de réponse." });
    } catch (error: any) {
      console.error("Erreur API Gemini AI Coach:", error);
      res.status(500).json({
        error: "GEMINI_ERROR",
        message: error.message || "Une erreur est survenue lors du contact avec l'assistant IA.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GymTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
