# GestVolt Desktop — correção robusta de rolagem 1.3.4

A captura de tela da versão 1.3.3 mostrou que a área de onboarding ainda ocupava apenas parte da largura e que o conteúdo inferior continuava inacessível. Esta revisão altera a geometria dos contêineres, não só a aparência do scrollbar.

## Alterações

- `#root` e o wrapper DOM do `SafeAreaProvider` agora ocupam toda a janela Electron e são colunas flexíveis.
- O `ScrollView` do desktop é um elemento DOM com uma caixa de rolagem real e dimensões definidas pelo contêiner.
- O conteúdo interno é um contêiner flex de altura intrínseca (`max-content`) e `flex-shrink: 0`, para que não seja comprimido até caber na altura visível.
- O onboarding usa uma área de rolagem que preenche a janela e mantém seu cartão centralizado em relação à largura total.
- A rolagem funciona com roda do mouse, barra de rolagem e teclas Page Down/End quando o contêiner está focado.
- A mudança é exclusiva do alias desktop; o app Android continua com o ScrollView nativo do React Native.

## Validação

Foram verificadas a sintaxe TSX e a estrutura JSON. A instalação das dependências não terminou neste ambiente, então a compilação Windows precisa ser confirmada pelo workflow do GitHub Actions.
