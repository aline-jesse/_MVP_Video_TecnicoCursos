
# MetaHuman Assets

## 📦 Assets Necessários

Para renderização de avatares hiper-realistas, você precisa importar os seguintes MetaHumans do Quixel Bridge:

### 1. `metahuman_01` - Executivo Brasileiro
- **Gênero:** Masculino
- **Idade:** 45 anos
- **Etnia:** Latino
- **Características:** Cabelo grisalho, barba aparada, expressão confiante
- **Roupa:** Terno formal (azul marinho)

### 2. `metahuman_02` - Engenheira de Segurança
- **Gênero:** Feminino
- **Idade:** 35 anos
- **Etnia:** Latina
- **Características:** Cabelo preto longo, expressão profissional
- **Roupa:** Uniforme de engenharia (camisa branca + capacete)

### 3. `metahuman_03` - Instrutor de Treinamento
- **Gênero:** Masculino
- **Idade:** 50 anos
- **Etnia:** Latino
- **Características:** Cabelo curto, bigode, expressão amigável
- **Roupa:** Camisa polo (laranja) com logo de segurança

## 🔧 Como Importar

### Via Quixel Bridge (Recomendado)

1. Abra o **Quixel Bridge** no Unreal Engine 5.3
2. Navegue até a seção **MetaHumans**
3. Use o **MetaHuman Creator** para customizar ou escolher presets
4. Export para o projeto `AvatarProject`
5. Nomeie os assets como `metahuman_01`, `metahuman_02`, `metahuman_03`

### Via MetaHuman Creator Web

1. Acesse https://metahuman.unrealengine.com/
2. Crie ou customize um MetaHuman
3. Faça download do preset
4. Importe no Unreal Engine via Bridge

## 📁 Estrutura de Diretórios

```
AvatarProject/Content/MetaHumans/
├── metahuman_01/
│   ├── BP_metahuman_01.uasset
│   ├── Face/
│   │   ├── metahuman_01_FaceMesh.uasset
│   │   └── metahuman_01_FaceMat.uasset
│   ├── Body/
│   └── Rig/
├── metahuman_02/
└── metahuman_03/
```

## 🎭 Blendshapes ARKit

Os MetaHumans suportam os seguintes blendshapes ARKit para lip-sync:

- `CTRL_expressions_jawOpen`
- `CTRL_expressions_jawForward`
- `CTRL_expressions_mouthClose`
- `CTRL_expressions_mouthFunnel`
- `CTRL_expressions_mouthPucker`
- `CTRL_expressions_mouthLeft_smileSharp`
- `CTRL_expressions_mouthRight_smileSharp`
- `CTRL_expressions_tongueOut`

E mais 50+ blendshapes adicionais para expressões faciais detalhadas.

## 📋 Checklist de Setup

- [ ] Unreal Engine 5.3 instalado
- [ ] Quixel Bridge instalado e logado
- [ ] MetaHuman Plugin ativado no projeto
- [ ] 3 MetaHumans importados e nomeados corretamente
- [ ] Rig facial configurado para ARKit blendshapes
- [ ] Testes de lip-sync funcionando

## 🔗 Links Úteis

- [MetaHuman Creator](https://metahuman.unrealengine.com/)
- [Quixel Bridge Download](https://quixel.com/bridge)
- [Documentação MetaHuman](https://docs.unrealengine.com/5.3/en-US/metahuman-creator-in-unreal-engine/)
- [ARKit Blendshapes Reference](https://arkit-face-blendshapes.com/)
