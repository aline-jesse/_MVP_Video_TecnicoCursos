# Test Fixtures

Esta pasta contém arquivos de teste necessários para execução dos testes E2E.

## Arquivos Necessários

### 1. sample.pptx (Obrigatório)
- **Descrição**: Arquivo PowerPoint válido com 5-10 slides
- **Tamanho**: ~2-5 MB
- **Conteúdo**: Slides com texto, imagens e formatação básica
- **Uso**: Testes de upload bem-sucedido, processamento de slides, geração de TTS

### 2. large-file.pptx (Obrigatório)
- **Descrição**: Arquivo PowerPoint grande para teste de limite
- **Tamanho**: >50 MB (próximo ao limite de 100 MB)
- **Conteúdo**: Muitos slides com imagens de alta resolução
- **Uso**: Testes de validação de tamanho, progresso de upload longo

### 3. small-sample.pptx (Obrigatório)
- **Descrição**: Arquivo PowerPoint pequeno com 2-3 slides
- **Tamanho**: ~500 KB - 1 MB
- **Conteúdo**: Slides simples com pouco texto
- **Uso**: Testes rápidos, validação básica

### 4. corrupted.pptx (Obrigatório)
- **Descrição**: Arquivo PowerPoint corrompido ou inválido
- **Tamanho**: Qualquer
- **Criação**: Renomear um arquivo .txt para .pptx ou corromper um .pptx válido
- **Uso**: Testes de validação de erro, tratamento de exceções

### 5. test.txt (Obrigatório)
- **Descrição**: Arquivo de texto simples
- **Tamanho**: ~1 KB
- **Conteúdo**: Qualquer texto
- **Uso**: Testes de validação de tipo de arquivo

### 6. test-image.jpg (Opcional)
- **Descrição**: Imagem JPEG para testes
- **Tamanho**: ~1-2 MB
- **Uso**: Testes adicionais de validação de tipo

## Como Criar os Fixtures

### Opção 1: Manual
1. Crie uma apresentação PowerPoint com 5-10 slides
2. Salve como `sample.pptx`
3. Faça uma cópia e adicione muitas imagens grandes, salve como `large-file.pptx`
4. Faça uma cópia com apenas 2-3 slides, salve como `small-sample.pptx`
5. Crie um arquivo de texto e renomeie para `corrupted.pptx`
6. Crie um arquivo `test.txt` com qualquer conteúdo

### Opção 2: Automatizada (PowerShell)
```powershell
# Execute na pasta fixtures
.\create-fixtures.ps1
```

### Opção 3: Download de Exemplos
```powershell
# Templates públicos do Microsoft Office
# https://templates.office.com/
```

## Estrutura Esperada

```
e2e/fixtures/
├── README.md (este arquivo)
├── sample.pptx (5-10 slides, ~2-5 MB)
├── large-file.pptx (muitos slides, >50 MB)
├── small-sample.pptx (2-3 slides, ~1 MB)
├── corrupted.pptx (arquivo inválido)
├── test.txt (arquivo de texto)
└── test-image.jpg (opcional)
```

## Validação

Para verificar se todos os fixtures estão presentes:

```powershell
# PowerShell
Get-ChildItem -Path . -File | Select-Object Name, Length
```

Saída esperada:
```
Name               Length
----               ------
sample.pptx        ~2-5 MB
large-file.pptx    >50 MB
small-sample.pptx  ~1 MB
corrupted.pptx     Qualquer
test.txt           ~1 KB
```

## Notas Importantes

- **NÃO** commitar arquivos grandes (>10 MB) no Git
- Use `.gitignore` para excluir fixtures grandes
- Mantenha `sample.pptx` pequeno para facilitar compartilhamento
- Recrie fixtures se os testes começarem a falhar inexplicavelmente

## Git Ignore

Adicione ao `.gitignore`:
```
e2e/fixtures/*.pptx
e2e/fixtures/*.jpg
e2e/fixtures/*.png
!e2e/fixtures/sample.pptx
e2e/downloads/
```
