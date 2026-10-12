# GestVolt Desktop 1.3.4 — correção robusta de rolagem

Esta versão corrige a tela de onboarding para que o conteúdo ocupe toda a janela e role até o fim, inclusive em janelas redimensionadas. O componente `ScrollView` desktop usa um viewport DOM com altura definida e conteúdo com altura intrínseca, além de um root flexível no Electron.

## Build Windows pelo GitHub Actions

1. Coloque o conteúdo deste diretório na raiz do repositório GitHub.
2. Mantenha `.github/workflows/build-windows-desktop.yml`.
3. Em **Actions**, execute **Build GestVolt Desktop for Windows (Scroll Fix 1.3.4)**.
4. Baixe o artefato `GestVolt-Windows-Desktop` e extraia os `.exe`.

## O que foi corrigido

- O contêiner raiz ocupa toda a janela Electron, evitando layout com metade da largura.
- A tela inicial tem um scroll viewport absoluto, com altura limitada à janela.
- O conteúdo interno não pode encolher até a altura do viewport; a altura intrínseca permite a rolagem.
- A rolagem suporta roda do mouse, barra de rolagem e teclas PageDown/End.
- O layout dos outros formulários e páginas também usa o mesmo `ScrollView` DOM, sem alterar o app Android.

Esta versão ainda precisa ser compilada e testada no GitHub Actions/Windows para confirmar o artefato final.
