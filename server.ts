import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { FloraClient } from '@flora-ai/flora';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to reliably find Flora API key from env or .env/.env.example
function getFloraApiKey(): string | null {
  const envKey = process.env.FLORA_API_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'MY_FLORA_API_KEY') {
    return envKey.trim();
  }

  // Check /.env
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/FLORA_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1] && match[1] !== 'MY_FLORA_API_KEY') {
        return match[1].trim();
      }
    }
  } catch {
    // ignore
  }

  // Check /.env.example
  try {
    const examplePath = path.resolve(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, 'utf8');
      const match = content.match(/FLORA_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1] && match[1] !== 'MY_FLORA_API_KEY') {
        return match[1].trim();
      }
    }
  } catch {
    // ignore
  }

  return null;
}

// Helper to get GoogleGenAI client safely
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({ apiKey: key });
}

// Model alias mapping to Flora catalog IDs
const MODEL_MAPPING: Record<string, string> = {
  // Primary Models
  'nano-banana-pro': 't2i-gemini-3-pro',
  'nano-banana-2-1': 't2i-elote-gateway',
  'seedream-5-pro': 't2i-gengateway-seedream-5-pro-t2i',
  'gpt-image-2': 't2i-gpt-image-2-t2i',

  // Direct IDs
  't2i-gemini-3-pro': 't2i-gemini-3-pro',
  't2i-elote-gateway': 't2i-elote-gateway',
  't2i-gengateway-seedream-5-pro-t2i': 't2i-gengateway-seedream-5-pro-t2i',
  't2i-gpt-image-2-t2i': 't2i-gpt-image-2-t2i',

  // Backward compatibility aliases
  'flux-1.1-pro': 't2i-gemini-3-pro',
  'flux-dev': 't2i-gengateway-seedream-5-pro-t2i',
  'ideogram-v2': 't2i-gpt-image-2-t2i',
  'midjourney-v6-style': 't2i-gemini-3-pro',
  'sdxl-turbo': 't2i-elote-gateway',
  'recraft-v3': 't2i-gpt-image-2-t2i',
};

// Curated list of user-requested Flora AI supported models
const FLORA_MODELS = [
  {
    id: 'nano-banana-pro',
    floraModelId: 't2i-gemini-3-pro',
    name: 'Nano Banana Pro',
    creator: 'Google DeepMind / Flora',
    description: 'Model penalaran visual generasi flagship dengan pemahaman prompt bahasa alami mendalam, detail pencahayaan realistis, dan estetika premium.',
    badge: 'Flagship AI',
    speed: 'Presisi (~5s)',
    styles: ['Photorealistic', 'Cinematic', 'Complex Prompt', 'Editorial'],
  },
  {
    id: 'nano-banana-2-1',
    floraModelId: 't2i-elote-gateway',
    name: 'Nano Banana 2.1',
    creator: 'Generation Gateway / Flora',
    description: 'Model generasi cepat dan efisien dengan pencahayaan dinamis, resolusi tajam, dan pemrosesan karakter manusia superior.',
    badge: 'Super Populer',
    speed: 'Kilat (~4s)',
    styles: ['Portrait', 'Dynamic Lighting', 'Modern Anime', 'Concept Art'],
  },
  {
    id: 'seedream-5-pro',
    floraModelId: 't2i-gengateway-seedream-5-pro-t2i',
    name: 'Seedream 5 Pro',
    creator: 'ByteDance / Generation Gateway',
    description: 'Generasi visual generasi terbaru dengan rendering pemandangan fantasi spektakuler, tekstur organik hidup, dan gradasi warna kaya.',
    badge: 'Visual Spektakuler',
    speed: 'Cepat (~5s)',
    styles: ['Epic Fantasy', 'Landscape', 'Sci-Fi', 'Digital Painting'],
  },
  {
    id: 'gpt-image-2',
    floraModelId: 't2i-gpt-image-2-t2i',
    name: 'GPT Image 2',
    creator: 'OpenAI / Fal Gateway',
    description: 'Keunggulan pemahaman teks presisi tinggi, tata letak grafis terstruktur, penulisan huruf di gambar, dan desain poster modern.',
    badge: 'Tipografi & Desain',
    speed: 'Sedang (~6s)',
    styles: ['Typography', 'Graphic Poster', 'Vector Art', 'Product Design'],
  },
];

// In-memory cache for resolved workspace and project IDs
let cachedWorkspaceId: string | null = null;
let cachedProjectId: string | null = null;

async function resolveFloraWorkspaceAndProject(
  client: FloraClient,
  preferredWsId?: string,
  preferredPrjId?: string
): Promise<{ workspaceId: string; projectId: string }> {
  // 1. Resolve Workspace (must start with ws_)
  let workspaceId: string | null = null;
  if (preferredWsId && preferredWsId.trim().startsWith('ws_')) {
    workspaceId = preferredWsId.trim();
  } else if (cachedWorkspaceId && cachedWorkspaceId.startsWith('ws_')) {
    workspaceId = cachedWorkspaceId;
  } else if (process.env.FLORA_WORKSPACE_ID && process.env.FLORA_WORKSPACE_ID.trim().startsWith('ws_')) {
    workspaceId = process.env.FLORA_WORKSPACE_ID.trim();
  }

  if (!workspaceId) {
    const wsRes = await client.workspaces.list();
    const list = (wsRes as any)?.workspaces;
    if (list && list.length > 0) {
      workspaceId = list[0].workspace_id || list[0].id;
    }
  }

  if (!workspaceId || !workspaceId.startsWith('ws_')) {
    throw new Error('Tidak ditemukan workspace yang valid (harus berawalan ws_) di akun Flora.ai Anda.');
  }
  cachedWorkspaceId = workspaceId;

  // 2. Resolve Project (must start with prj_)
  let projectId: string | null = null;
  if (preferredPrjId && preferredPrjId.trim().startsWith('prj_')) {
    projectId = preferredPrjId.trim();
  } else if (cachedProjectId && cachedProjectId.startsWith('prj_')) {
    projectId = cachedProjectId;
  } else if (process.env.FLORA_PROJECT_ID && process.env.FLORA_PROJECT_ID.trim().startsWith('prj_')) {
    projectId = process.env.FLORA_PROJECT_ID.trim();
  }

  if (!projectId) {
    try {
      const prjList = await client.projects.list({ workspace_id: workspaceId });
      for await (const p of prjList) {
        if (p.project_id && p.project_id.startsWith('prj_')) {
          projectId = p.project_id;
          break;
        }
      }
    } catch (e) {
      console.warn('Could not list projects for workspace:', e);
    }

    // If still no project, create one on Flora
    if (!projectId) {
      try {
        const created = await client.projects.create({
          workspace_id: workspaceId,
          name: 'Flora AI Studio Generations',
        });
        projectId = (created as any).project_id;
      } catch (createErr) {
        console.warn('Could not auto-create project:', createErr);
      }
    }
  }

  if (!projectId || !projectId.startsWith('prj_')) {
    throw new Error('Project ID Flora.ai tidak ditemukan atau gagal dibuat di workspace.');
  }
  cachedProjectId = projectId;

  return { workspaceId, projectId };
}

// 1. Flora.ai Status endpoint
app.get('/api/flora/status', async (_req: Request, res: Response) => {
  const floraKey = getFloraApiKey();

  if (!floraKey) {
    return res.json({
      configured: false,
      valid: false,
      keyMask: null,
      message: 'FLORA_API_KEY belum dikonfigurasi di .env. Tambahkan kunci API untuk mengaktifkan cluster Lanexa Ai Studio.',
      provider: 'Lanexa Ai Studio (Belum Aktif)',
    });
  }

  try {
    const client = new FloraClient({ apiKey: floraKey });
    let workspaces: any[] = [];
    try {
      const wsResponse = await client.workspaces.list();
      workspaces = (wsResponse as any)?.workspaces || [];
      if (workspaces.length > 0) {
        const firstWsId = workspaces[0].workspace_id || workspaces[0].id;
        if (firstWsId && firstWsId.startsWith('ws_')) {
          cachedWorkspaceId = firstWsId;
        }
      }
    } catch (wsErr) {
      console.warn('Flora workspaces query error:', wsErr);
    }

    const keyMask = floraKey.slice(0, 5) + '••••••••' + floraKey.slice(-4);
    return res.json({
      configured: true,
      valid: true,
      keyMask,
      workspacesCount: workspaces.length,
      workspaces: workspaces.map((w: any) => ({
        id: w.workspace_id || w.id,
        name: w.name || 'Workspace Flora',
      })),
      defaultWorkspace: cachedWorkspaceId,
      provider: 'Lanexa Ai Studio (Terhubung)',
    });
  } catch (err: any) {
    console.error('Lanexa status error:', err);
    return res.json({
      configured: true,
      valid: false,
      keyMask: floraKey.slice(0, 4) + '••••',
      message: err.message || 'Gagal memverifikasi API key ke server Lanexa Ai Studio',
      provider: 'Lanexa Ai Studio (Invalid Key)',
    });
  }
});

// 2. Models list endpoint
app.get('/api/flora/models', async (_req: Request, res: Response) => {
  return res.json({
    source: 'flora_curated',
    models: FLORA_MODELS,
  });
});

// 3. Prompt enhancement endpoint (AI Prompt Crafter using Gemini Text)
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  const { prompt, style } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt diperlukan' });
  }

  const gemini = getGeminiClient();
  if (!gemini) {
    const enhanced = `${prompt.trim()}, ${style || 'cinematic lighting'}, highly detailed, intricate textures, masterpiece, 8k resolution, photorealistic studio lighting, award-winning composition`;
    return res.json({ enhancedPrompt: enhanced });
  }

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert prompt engineer for professional image generative models (Nano Banana Pro, Seedream 5 Pro, GPT Image 2).
Given this user idea or prompt in Indonesian or English:
"${prompt}"
${style ? `Target Visual Style: ${style}` : ''}

Task: Expand this into ONE single, high-fidelity, descriptive prompt in English that specifies:
- Subject and posture/action
- Lighting, atmosphere, volumetric rays, or shadows
- Textures, materials, camera lens/film stock (e.g. 50mm f/1.4, Hasselblad, Leica 35mm)
- Composition, depth of field, color grading
DO NOT include markdown, quotation marks, or preamble. Return ONLY the enhanced prompt string.`,
    });

    const enhanced = response.text?.trim() || prompt;
    return res.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    console.error('Enhance prompt error:', err);
    return res.json({
      enhancedPrompt: `${prompt.trim()}, ultra detailed, cinematic volumetric lighting, 8k, photorealistic quality`,
    });
  }
});

// 4. Main Image Generation Endpoint via Flora.ai
app.post('/api/generate', async (req: Request, res: Response) => {
  const {
    prompt,
    negative_prompt,
    model = 'nano-banana-pro',
    aspect_ratio = '1:1',
    style_preset = 'Photorealistic',
    seed,
    workspace_id,
  } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt teks wajib diisi.' });
  }

  const floraKey = getFloraApiKey();

  if (!floraKey) {
    return res.status(400).json({
      error: 'FLORA_API_KEY belum dikonfigurasi. Silakan tambahkan FLORA_API_KEY di file .env Anda.',
    });
  }

  try {
    const client = new FloraClient({ apiKey: floraKey });

    // Resolve workspace & project required by Flora API
    const { workspaceId, projectId } = await resolveFloraWorkspaceAndProject(
      client,
      workspace_id
    );

    // Resolve target Flora model ID
    const targetModelId = MODEL_MAPPING[model] || model || 't2i-flux-2';

    // Map aspect ratio parameter
    const allowedAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:2'];
    const validAr = allowedAspectRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';

    // Build Flora generation payload
    const payload: any = {
      type: 'image',
      prompt: prompt.trim(),
      model: targetModelId,
      workspace_id: workspaceId,
      project_id: projectId,
      params: {
        aspect_ratio: validAr,
      },
    };

    if (seed !== undefined && seed !== null && !isNaN(Number(seed))) {
      payload.params.seed = Number(seed);
    }
    if (negative_prompt && negative_prompt.trim()) {
      payload.params.negative_prompt = negative_prompt.trim();
    }

    console.log('Dispatching Flora.ai image generation:', {
      model: targetModelId,
      workspace_id: workspaceId,
      project_id: projectId,
      prompt: prompt.slice(0, 60) + '...',
    });

    const generation = await client.generations.create(payload);
    console.log('Flora run initiated:', {
      run_id: (generation as any).run_id,
      poll_url: (generation as any).poll_url,
      charged_cost: (generation as any).charged_cost,
    });

    // Poll until completion if poll_url is provided
    if ((generation as any).poll_url) {
      const pollUrl = (generation as any).poll_url.startsWith('http')
        ? (generation as any).poll_url
        : `https://app.flora.ai${(generation as any).poll_url}`;

      const startTime = Date.now();
      let completed = false;
      let assetUrl: string | null = null;
      let lastPollData: any = null;

      // Poll every 2 seconds up to 55 seconds
      while (Date.now() - startTime < 55000 && !completed) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(pollUrl, {
          headers: {
            Authorization: `Bearer ${floraKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (pollRes.ok) {
          lastPollData = await pollRes.json();
          if (lastPollData.status === 'completed' || lastPollData.state === 'completed') {
            completed = true;
            assetUrl =
              lastPollData.outputs?.[0]?.url ||
              lastPollData.outputs?.[0]?.asset_url ||
              lastPollData.asset_url ||
              lastPollData.image_url ||
              lastPollData.result?.url;
          } else if (lastPollData.status === 'failed' || lastPollData.state === 'failed') {
            throw new Error(lastPollData.error?.message || 'Generasi gambar Flora.ai gagal pada cluster');
          }
        }
      }

      if (assetUrl) {
        return res.json({
          success: true,
          engine: 'Lanexa Ai Studio',
          imageUrl: assetUrl,
          prompt,
          model: targetModelId,
          aspect_ratio: validAr,
          runId: (generation as any).run_id,
          chargedCost: (generation as any).charged_cost || 0,
          canvasUrl: (generation as any).canvas_url || null,
        });
      } else {
        throw new Error('Generasi Flora.ai melebihi batas waktu (timeout). Coba lagi dalam beberapa saat.');
      }
    }

    // Direct image URL in response
    const directUrl =
      (generation as any).outputs?.[0]?.url ||
      (generation as any).asset_url ||
      (generation as any).image_url;

    if (directUrl) {
      return res.json({
        success: true,
        engine: 'Lanexa Ai Studio',
        imageUrl: directUrl,
        prompt,
        model: targetModelId,
        aspect_ratio: validAr,
        runId: (generation as any).run_id,
        chargedCost: (generation as any).charged_cost || 0,
        canvasUrl: (generation as any).canvas_url || null,
      });
    }

    throw new Error('Flora.ai tidak mengembalikan URL gambar yang valid.');
  } catch (err: any) {
    console.error('Flora.ai error during generation:', err);
    const errMsg = err?.body?.error?.message || err?.message || 'Terjadi kesalahan saat memanggil API Flora.ai';
    return res.status(500).json({
      error: `Error Flora.ai: ${errMsg}`,
    });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lanexa Ai Studio running on port ${PORT}`);
  });
}

startServer();
