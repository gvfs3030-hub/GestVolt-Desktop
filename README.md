# GestVolt Desktop — Windows (Electron + React Native Web)

Versão para computador do GestVolt, preservando a lógica de finanças, relatórios, SQLite, dicas, metas, cartões e assistente local da versão móvel, com navegação lateral otimizada para telas largas.

## Requisitos
- Node.js 22 LTS ou compatível
- Windows 10/11 para gerar o instalador e o executável portátil pelo workflow
- Conexão com internet apenas para instalar dependências e construir o pacote. O aplicativo instalado não depende de internet para operar.

## Rodar em modo de desenvolvimento
```bash
npm install
npm run desktop:dev
```

## Gerar Windows EXE localmente
```bash
npm run desktop:dist
```

Os executáveis ficam em `release/` (instalador NSIS e versão portátil).

## Gerar pelo GitHub Actions
1. Crie um repositório e envie todos os arquivos desta pasta (incluindo `.github/workflows`).
2. Abra a aba **Actions**.
3. Execute **Build GestVolt Desktop for Windows** com **Run workflow**, ou faça push para `main`.
4. Quando terminar, abra a execução e baixe o artefato **GestVolt-Windows-Desktop** na seção **Artifacts**.
5. Extraia o ZIP do artefato. Dentro dele estarão o instalador `GestVolt-...-Setup.exe` e o executável portátil `GestVolt-Portable-1.3.1.exe` (o nome exato pode variar conforme electron-builder).

## Armazenamento e privacidade
- O banco de dados fica no perfil local do Windows do usuário, na pasta `AppData` da aplicação. A versão desktop usa um motor SQLite local empacotado e não compartilha automaticamente o arquivo de banco com Android.
- Os dados não são sincronizados com a nuvem e o aplicativo bloqueia requisições HTTP/HTTPS/WebSocket na versão empacotada.
- Quando `safeStorage` do Electron/Windows está disponível, o arquivo SQLite exportado pelo motor SQL.js é protegido através do armazenamento seguro do sistema operacional. Em sistemas que não disponibilizem esse mecanismo, o código possui fallback local sem criptografia; a versão-alvo deste workflow é Windows.
- Exports e backups são salvos em `Documentos/GestVolt`. O usuário controla os arquivos exportados.
- A cópia do aplicativo de computador possui um banco local separado da versão Android. Para migrar dados, exporte um backup JSON no celular e importe-o no GestVolt Desktop.
- Não existe sincronização automática nem recuperação por conta online. Mantenha backups em local seguro.

## Arquitetura
- Electron: janela desktop e APIs locais via preload com context isolation.
- React Native Web: renderiza os mesmos componentes principais e responsividade em janela desktop.
- SQL.js / SQLite: banco local persistido como arquivo no computador.
- Vite: empacota os recursos locais do renderer.
- GitHub Actions: constrói instalador Windows e executável portátil.

## Observações
O app é local/offline em tempo de execução, mas `npm install` e o workflow precisam de internet para baixar dependências de build. O pacote Windows ainda precisa ser validado no computador de destino, incluindo importação e restauração de backups.


## Correção de dependências (1.3.1)

A versão 1.3.1 fixa `@types/react-dom` em `19.2.3` para manter compatibilidade com `@types/react` 19.2.x e evitar o conflito ERESOLVE causado pela resolução automática de `@types/react-dom` 19.3.0.


## Correção 1.3.2 — cadastro inicial no desktop
- O formulário de primeiro acesso agora usa um contêiner de altura limitada e rolagem vertical explícita no Electron.
- A janela Electron precisa permanecer em tela cheia/normal sem esconder o final do formulário; todos os campos e o botão de conclusão ficam acessíveis rolando até o final.
- Foi incluída uma orientação visual para indicar que há outras seções abaixo.


## Versão 1.3.2 — correção de rolagem do primeiro acesso
- A tela de onboarding agora possui um contêiner de altura definida e rolagem vertical explícita no Electron.
- Todos os campos, opções, saldo inicial e botão de conclusão permanecem acessíveis em janelas menores, usando a roda do mouse ou a barra de rolagem.
- Um aviso visual informa que há seções adicionais abaixo do cabeçalho.
- O restante da navegação, persistência local e workflow de build foi mantido.
