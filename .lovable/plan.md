## Contexto

O build no Appflow compilou e assinou com sucesso; a falha foi apenas no envio para a App Store Connect (`upload_ipa_to_app_store`, erro Apple `-22938`) — app-specific password inválida/expirada nas credenciais do Appflow. Nenhum problema no código do app.

## Mudança no projeto

- `capacitor.config.ts`: alterar `ios.buildNumber` de `'14'` para `'15'`, garantindo um número de build limpo para a próxima tentativa de upload.

Nenhuma outra alteração de código é necessária.

## Ação sua (fora do Lovable)

1. Gerar nova app-specific password em account.apple.com (Sign-In and Security → App-Specific Passwords) — ou, preferencialmente, criar uma App Store Connect API Key (Issuer ID + Key ID + .p8), que não expira ao trocar a senha da Apple ID.
2. Atualizar a credencial na Destination "App Store Connect" do Appflow.
3. Fazer git pull, commit e push para disparar o novo build.
