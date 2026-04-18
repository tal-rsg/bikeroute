#!/bin/bash
# Roda após "npx cap add android" para adicionar permissões de GPS e deep link OAuth

MANIFEST="android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST" ]; then
  echo "Execute primeiro: npx cap add android"
  exit 1
fi

# Adiciona permissões de localização (antes de <application)
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.INTERNET"/>\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>\n    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>\n</manifest>|' "$MANIFEST"

echo "✓ Permissões adicionadas ao AndroidManifest.xml"
echo "Agora rode: npx cap open android"
