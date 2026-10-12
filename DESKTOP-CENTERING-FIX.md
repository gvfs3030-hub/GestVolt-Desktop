# GestVolt Desktop 1.3.5 — correção de centralização

A versão anterior já permitia rolar o onboarding, mas o conteúdo limitado por `maxWidth` continuava ancorado à esquerda.

Correção: o shim do `ScrollView` desktop agora aplica `margin-left: auto` e `margin-right: auto` quando o contêiner possui largura máxima. O CSS inclui a mesma regra como fallback. Conteúdos que ocupam 100% da largura não são visualmente alterados; o formulário de onboarding deverá ficar centralizado na janela inteira.

A rolagem vertical e a persistência local foram preservadas.
