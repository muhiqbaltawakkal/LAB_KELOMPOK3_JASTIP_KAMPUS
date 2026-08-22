# Build Mobile

Konfigurasi EAS berada di `mobile/eas.json`. Profil `preview` menghasilkan APK dan profil
`production` menghasilkan build store dengan version code otomatis.

API URL dibaca dari `expo.extra.apiUrl` atau `EXPO_PUBLIC_API_URL`. Jangan memakai
`localhost` pada APK yang dipasang di HP fisik.
