

## Plano: Corrigir erro de signing do RevenueCat no build Appflow

### Diagnóstico

O erro `Signing for "RevenueCat_RevenueCat" requires a development team` ocorre porque os pacotes SPM (como RevenueCat) herdam as configurações de signing do **projeto** (project-level), e não do **target**. 

No seu `project.pbxproj`, o `DEVELOPMENT_TEAM = CASJQDDA7L` está definido apenas nas configurações do **target** App (linhas 318 e 349), mas **não** nas configurações do **projeto** (linhas 199-255 e 257-306). Os pacotes SPM usam as configurações do projeto, por isso falham.

### Solução

Adicionar `DEVELOPMENT_TEAM = CASJQDDA7L` nas build configurations **do projeto** (Debug e Release) no arquivo `ios/App/App.xcodeproj/project.pbxproj`.

**Mudanças no arquivo:**

1. **Debug config do projeto** (seção que começa na linha 199) -- adicionar `DEVELOPMENT_TEAM = CASJQDDA7L;` nos buildSettings
2. **Release config do projeto** (seção que começa na linha 257) -- adicionar `DEVELOPMENT_TEAM = CASJQDDA7L;` nos buildSettings

### Após a mudança

Fazer git pull no Mac e push novamente:
```bash
git pull
git add ios/
git commit -m "Add DEVELOPMENT_TEAM to project-level build settings"
git push
```

Depois, disparar novo build no Appflow.

