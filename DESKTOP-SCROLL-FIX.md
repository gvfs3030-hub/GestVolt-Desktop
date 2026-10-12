# Correção da rolagem no GestVolt Desktop 1.3.3

## Causa
A tela de onboarding já utilizava um componente `ScrollView`, mas a implementação no desktop dependia do tratamento de `overflowY` pelo resolvedor de estilos do React Native Web. Nessa configuração, o CSS de rolagem não se aplicava de forma confiável e o `body`/`#root` continuam intencionalmente com `overflow: hidden` para evitar duas barras de rolagem concorrentes.

## Correção
- O shim desktop agora exporta uma implementação DOM para `ScrollView`.
- O contêiner externo recebe `overflow-y: auto` / `overflow-x: hidden` diretamente como estilos CSS do navegador.
- O conteúdo interno permanece em `react-native-web.View`, preservando os estilos RN do conteúdo.
- O CSS define `min-height: 0`, `min-width: 0` e `overscroll-behavior: contain`.
- As páginas de onboarding, área principal, relatórios e formulários usam o mesmo shim.
- O alias é somente do build desktop no Vite; o app Android continua usando o `ScrollView` nativo.

## Validação
A sintaxe dos arquivos TSX e a estrutura dos arquivos de configuração foram validadas. A build Electron/Windows precisa ser executada pelo workflow no GitHub para validar dependências e empacotamento em ambiente Windows.
