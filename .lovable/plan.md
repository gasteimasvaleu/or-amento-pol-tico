

## Diagnóstico: Display Name errado no iOS

O `capacitor.config.ts` já está correto com `appName: 'Mandato Intelligence'`. O problema é que o Xcode cacheia o `CFBundleDisplayName` antigo do primeiro `cap init`/`cap sync`.

### Solução (não requer mudança de código)

O nome do app no iOS é controlado pelo arquivo `ios/App/App/Info.plist` dentro do projeto Xcode. O `npx cap sync` deveria atualizar, mas às vezes o cache persiste.

**No seu Mac, execute:**

```bash
git pull
npm run build
npx cap sync ios
```

Depois, **no Xcode**, verifique manualmente:
1. Abra o projeto iOS (`npx cap open ios`)
2. Clique em **App** no navegador lateral → aba **General**
3. Em **Display Name**, mude para `Mandato Intelligence`
4. Ou edite diretamente o arquivo `ios/App/App/Info.plist` e altere a chave `CFBundleDisplayName` para `Mandato Intelligence`

Se preferir via terminal:
```bash
cd ios/App/App
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'Mandato Intelligence'" Info.plist
```

Depois faça o build e instale novamente no dispositivo.

**Nenhuma alteração de código é necessária** — o config já está correto. É apenas o cache do Xcode que precisa ser atualizado manualmente.

