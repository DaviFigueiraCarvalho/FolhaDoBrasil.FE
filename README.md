# Folha do Brasil

Front-end público de notícias (Expo web estático), separado do VoidMMA.FE.Client. Consome `GET /api/v2/news` (público, sem login). A publicação continua no VoidMMA.FE.ADM.

```bash
cp .env.example .env   # EXPO_PUBLIC_API_BASE_URL
npm install
npm run web            # dev
npm run build:web      # export estático em dist/
docker compose up -d --build   # nginx em http://localhost:8092
```

A API precisa liberar a origem deste site em CORS (porta 8092 em container, 8081 no dev).

`src/features/news/parseNews.ts` é cópia do parser usado no VoidMMA.FE.ADM (prévia do editor): mantenha os dois iguais.
