# Passo a Passo - Solução 2: Separação em 2 Modelos

## 📋 Resumo da Implementação

A infraestrutura foi completamente atualizada para usar **2 modelos separados**:

1. **Modelo Fisiológico** (Binary Classifier): Classifica "acordado" vs "dormindo"
2. **Modelo Emocional** (6 Classes): Classifica "dor", "enjoo", "medo", "tristeza", "neutro", "sono"

## 🎯 Melhorias Implementadas

### 1. Regularização para Evitar Overfitting
- ✅ **Early Stopping**: Para o treinamento se a validação não melhorar por 10 épocas
- ✅ **Dropout (30%)**: Na camada classificadora do modelo
- ✅ **Weight Decay (1e-4)**: Regularização L2 no otimizador

### 2. Data Augmentation Melhorada
- ✅ **Gaussian Blur**: Suavização aleatória (20% de probabilidade)
- ✅ **Gaussian Noise**: Ruído gaussiano (10% de probabilidade)
- ✅ **Variação de brilho/contraste/saturação**: Aumentado
- ✅ **Rotação e espelhamento horizontal**: Mantidos

### 3. Arquitetura de 2 Modelos
- ✅ Separação de responsabilidades (fisiológico vs emocional)
- ✅ Elimina conflito matemático entre classes opostas
- ✅ Cada modelo é especializado em seu domínio

### 4. Compatibilidade com C#
- ✅ `ModelLoader.cs`: Atualizado para carregar 2 modelos ONNX
- ✅ `EmotionDetectionService.cs`: Lógica para usar os 2 modelos sequencialmente
- ✅ Fallback para modelo legado mantido para compatibilidade

---

## 📁 Arquivos Criados/Modificados

### Python (Treinamento)
- ✅ `src/training/config_dual_state.py` - Configuração para 2 modelos
- ✅ `src/training/model_dual_state.py` - Modelo com Dropout
- ✅ `src/training/train_dual_state.py` - Script de treinamento com early stopping
- ✅ `src/training/transforms_custom.py` - Transform customizado (GaussianNoise)

### C# (Backend)
- ✅ `back/ML/ModelLoader.cs` - Carrega 2 modelos ONNX
- ✅ `back/Services/EmotionDetectionService.cs` - Lógica de 2 modelos
- ✅ `back/Program.cs` - Configuração de inicialização dos modelos

---

## 🚀 PASSO A PASSO PARA USAR

### Etapa 1: Organizar o Dataset

Certifique-se de que seu dataset tem a seguinte estrutura em `src/datasets/`:

```
src/datasets/
├── acordado/        (imagens de pessoas acordadas)
├── desacordado/     (imagens de pessoas dormindo)
├── dor/             (imagens de expressão de dor)
├── enjoo/           (imagens de expressão de enjoo)
├── medo/            (imagens de expressão de medo)
├── sono/            (imagens de expressão de sono)
├── triste/          (imagens de expressão de tristeza)
└── neutro/          (imagens de expressão neutra)
```

**Dica**: Quanto mais imagens diversificadas em cada pasta, melhor a generalização.

---

### Etapa 2: Configurar Treinamento de Teste

Abra `src/training/config_dual_state.py` e verifique:

```python
IMAGES_PER_CLASS: int = 150   # Mantenha 150 para teste
EPOCHS: int = 2               # Mantenha 2 para teste rápido
```

Isso garante um treinamento rápido para validar que tudo funciona.

---

### Etapa 3: Treinar os 2 Modelos (Teste)

Execute o treinamento a partir da raiz do projeto (`Site_PerceptAI/`):

```bash
cd C:\Users\Solange\Desktop\TCC\Site_PerceptAI
python src/training/train_dual_state.py
```

**O que vai acontecer**:
1. O script treina o **Modelo Fisiológico** (acordado/dormindo)
2. Gera métricas, matriz de confusão e exporta ONNX
3. Em seguida, treina o **Modelo Emocional** (6 emoções)
4. Gera métricas, matriz de confusão e exporta ONNX

**Arquivos gerados**:
- `outputs/onnx_physio/perceptai_physio.onnx` - Modelo fisiológico
- `outputs/onnx_emotion/perceptai_emotion.onnx` - Modelo emocional
- `outputs/checkpoints_physio/` - Checkpoints do modelo fisiológico
- `outputs/checkpoints_emotion/` - Checkpoints do modelo emocional
- `outputs/metrics_physio/` - Relatórios JSON
- `outputs/metrics_emotion/` - Relatórios JSON
- `outputs/plots_physio/` - Gráficos (matriz de confusão, curvas)
- `outputs/plots_emotion/` - Gráficos (matriz de confusão, curvas)

---

### Etapa 4: Copiar Modelos ONNX para o Backend

Após o treinamento, copie os arquivos ONNX para a pasta do backend C#:

```bash
# Copia modelo fisiológico
copy outputs\onnx_physio\perceptai_physio.onnx back\ML\

# Copia modelo emocional
copy outputs\onnx_emotion\perceptai_emotion.onnx back\ML\
```

Ou manualmente:
1. Vá em `outputs/onnx_physio/` e copie `perceptai_physio.onnx`
2. Cole em `back/ML/`
3. Vá em `outputs/onnx_emotion/` e copie `perceptai_emotion.onnx`
4. Cole em `back/ML/`

---

### Etapa 5: Testar o Backend Localmente

1. Abra o projeto C# em `back/`
2. Compile e execute o servidor:
   ```bash
   cd back
   dotnet run
   ```
3. Verifique no console se os 2 modelos foram carregados:
   ```
   [ModelLoader] Carregando modelo fisiológico: .../perceptai_physio.onnx
   [ModelLoader] Carregando modelo emocional: .../perceptai_emotion.onnx
   ```

Se aparecer esse log, os modelos foram carregados com sucesso!

---

### Etapa 6: Testar com Imagens Reais

Use o endpoint de debug para testar:

```bash
# Coloque uma imagem de teste em back/test-images/example.jpg
# Acesse: http://localhost:5000/debug/test
```

Ou use o endpoint principal via Postman/curl:

```bash
POST http://localhost:5000/api/detection
Content-Type: application/json

{
  "image": "base64_string_aqui"
}
```

---

### Etapa 7: Fazer Treinamento Definitivo

Depois de validar que tudo funciona com o teste de 150 imagens/2 épocas:

1. **Abra `src/training/config_dual_state.py`**
2. **Altere para treinamento definitivo**:
   ```python
   IMAGES_PER_CLASS: int = 1000   # De 150 para 1000
   EPOCHS: int = 50               # De 2 para 50 (com early stopping)
   ```
3. **Execute novamente**:
   ```bash
   python src/training/train_dual_state.py
   ```

**Observação**: O early stopping pode interromper antes de 50 épocas se a validação não melhorar por 10 épocas consecutivas. Isso é **normal e desejável** - evita overfitting.

---

### Etapa 8: Deploy no Render

1. **Copie os novos modelos ONNX** para `back/ML/`
2. **Commit e push** para o GitHub
3. O Render fará o deploy automático

**Importante**: Certifique-se de que os arquivos ONNX estão sendo incluídos no build. Verifique seu `.csproj`:

```xml
<ItemGroup>
  <None Include="ML\perceptai_physio.onnx">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
  <None Include="ML\perceptai_emotion.onnx">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

Se não tiver isso, adicione ao arquivo `back/PerceptAI.API.csproj`.

---

## 🔍 Como Verificar se Funcionou

### 1. Logs do Backend
No console do backend, você deve ver:
```
[ModelLoader] Carregando modelo fisiológico: .../perceptai_physio.onnx
[ModelLoader] Carregando modelo emocional: .../perceptai_emotion.onnx
```

### 2. Logs de Inferência
Ao fazer uma requisição, se estiver usando os 2 modelos novos, não aparecerá log de fallback.

Se aparecer:
```
[EmotionDetectionService] Usando modelo legado (único) - modelos novos não carregados
```
Significa que os modelos ONNX não foram encontrados. Verifique os caminhos.

### 3. Frontend
No frontend, o resultado deve mostrar:
- **Estado Fisiológico**: "acordado" ou "dormindo"
- **Estado Emocional**: uma das 6 emoções (ou null se dormindo)

---

## ⚠️ Solução de Problemas

### Problema: "Modelo ONNX não encontrado"

**Solução**:
1. Verifique se os arquivos `perceptai_physio.onnx` e `perceptai_emotion.onnx` existem em `back/ML/`
2. Verifique o `.csproj` para garantir que os arquivos são copiados para o output
3. No deployment do Render, verifique se os arquivos estão sendo incluídos no build

### Problema: "Falha ao carregar modelo ONNX"

**Solução**:
1. Verifique se o arquivo ONNX não está corrompido (teste localmente com Python)
2. Verifique se a versão do ONNX Runtime é compatível com o modelo exportado
3. Tente reexportar o modelo ONNX com `opset_version=12`

### Problema: Overfitting ainda acontece

**Solução**:
1. Aumente `EARLY_STOPPING_PATIENCE` para 15 ou 20 épocas
2. Aumente `DROPOUT_RATE` para 0.4 ou 0.5
3. Aumente `WEIGHT_DECAY` para 1e-3
4. Adicione mais data augmentation (elastic transform, cutout, mixup)

### Problema: Precisão baixa em imagens reais

**Solução**:
1. **Implemente Face Detection** (Solução 1 mencionada anteriormente)
2. Adicione mais imagens diversificadas ao dataset
3. Considere usar dataset público (AffectNet) e fazer fine-tuning

---

## 📊 Próximos Passos Opcionais

### 1. Implementar Face Detection (Solução 1)
Adicionar MediaPipe ou MTCNN no preprocessing C# para detectar e recortar o rosto automaticamente antes de passar para o modelo.

### 2. Usar Dataset Público (Solução 3)
Baixar AffectNet ou FER-2013 e fazer fine-tuning em vez de treinar do zero com dataset customizado.

### 3. Ajustar Thresholds
Testar diferentes valores de `MinEmotionThreshold` (atualmente 0.30) para encontrar o melhor equilíbrio entre precisão e recall.

---

## ✅ Checklist de Validação

- [ ] Dataset organizado em `src/datasets/` com todas as 8 pastas
- [ ] Treinamento de teste executado com sucesso (150 imagens, 2 épocas)
- [ ] Modelos ONNX gerados em `outputs/onnx_physio/` e `outputs/onnx_emotion/`
- [ ] Modelos ONNX copiados para `back/ML/`
- [ ] Backend carrega os 2 modelos sem erros
- [ ] Teste com imagem real retorna resultado razoável
- [ ] Treinamento definitivo executado (1000 imagens, 50 épocas com early stopping)
- [ ] Deploy no Render funciona com os novos modelos

---

## 🎉 Conclusão

Com essa implementação, você terá:

1. **Dois modelos especializados** que não competem entre si
2. **Regularização robusta** (early stopping, dropout, weight decay)
3. **Data augmentation melhorada** para melhor generalização
4. **Fallback compatível** caso algo dê errado
5. **Pipeline de treinamento reproduzível** e configurável

Isso deve resolver drasticamente o problema de overfitting e viés do modelo anterior!
