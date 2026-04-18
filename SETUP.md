# BikeRoute — Setup

## 1. Instalar dependências

```bash
npm install
```

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 3. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/migrations/001_initial.sql`
3. Em **Authentication > Providers**, habilite **Google** e configure o Client ID/Secret
4. Em **Authentication > URL Configuration**, adicione nos Redirect URLs:
   - `bikeroute://auth/callback`
   - `http://localhost:5173` (para testes no browser)

## 4. Testar no browser

```bash
npm run dev
```

Abra `http://localhost:5173`. O GPS funcionará via Geolocation API do browser (HTTPS ou localhost).

## 5. Gerar APK Android

```bash
# Build do web
npm run build

# Adicionar plataforma (apenas primeira vez)
npx cap add android

# Sincronizar arquivos
npx cap sync

# Abrir no Android Studio
npx cap open android
```

No Android Studio: **Build > Generate Signed APK** ou use **Run** para testar no dispositivo.

### Permissões Android necessárias

Adicione ao `android/app/src/main/AndroidManifest.xml` dentro de `<manifest>`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<!-- GPS em background (tela desligada) — Android 10+ -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
```

### Deep link Android (callback Google OAuth)

Adicione ao `android/app/src/main/AndroidManifest.xml` dentro da `<activity>`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="bikeroute" android:host="auth"/>
</intent-filter>
```

## 6. iOS

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

Adicione ao `ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>BikeRoute precisa do GPS para gravar suas rotas.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>BikeRoute usa GPS em segundo plano para gravar enquanto você pedala.</string>
<key>UIBackgroundModes</key>
<array><string>location</string></array>
```

## Arquitetura

```
GPS (Capacitor) → GpsTracker (src/lib/gps.ts)
                       ↓ flush a cada 10s
                  IndexedDB/Dexie (src/lib/db.ts)
                       ↓ quando online
                  Network listener (src/lib/sync.ts)
                       ↓
                  Supabase (routes + route_points)
```

- **Offline-first**: todas as gravações vão para Dexie (IndexedDB) primeiro
- **syncedAt = undefined** marca registros pendentes de sync
- **Sync automático** ao reconectar a rede
- **Exportação**: JSON (backup completo) + GPX por rota (compatível com Strava/Garmin)
