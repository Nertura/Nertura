# Nertura — AI System Architecture

> Specification of all AI capabilities embedded in the Nertura Agriculture Operating System.

---

## AI Philosophy

Nertura's AI is **embedded, actionable, and accountable** — not a chatbot bolted onto legacy software. Every AI capability produces recommendations tied to real operational data, with transparent reasoning, confidence scores, and human override at every decision point.

### Design Principles

1. **Context-aware** — AI knows the user's farms, crops, season, and role
2. **Explainable** — Every recommendation includes reasoning and data sources
3. **Human-in-the-loop** — AI suggests; humans decide and act
4. **Privacy-preserving** — Customer data trains only with consent; federated learning for global models
5. **Offline-capable** — Critical models (disease detection) run on-device when connectivity is limited
6. **Multilingual** — AI Assistant and alerts in user's preferred language

---

## AI System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI SERVICES LAYER                            │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│ AI Assistant │   Computer   │  Predictive  │   Optimization         │
│  (LLM + RAG) │   Vision     │  Analytics   │   Engine               │
├──────────────┴──────────────┴──────────────┴────────────────────────┤
│                      Model Registry & Versioning                     │
├─────────────────────────────────────────────────────────────────────┤
│   Feature Store  │  Training Pipeline  │  Inference API  │  Edge SDK │
├─────────────────────────────────────────────────────────────────────┤
│              Data Layer (Operational + External Feeds)               │
└─────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Tiers

| Tier | Deployment | Use Case |
|------|------------|----------|
| **Cloud inference** | Managed GPU cluster | LLM assistant, complex forecasting |
| **Edge inference** | Mobile/on-device | Disease detection in field (offline) |
| **Batch processing** | Scheduled jobs | Yield prediction, market forecasting |
| **Real-time streaming** | Event-driven | Weather risk alerts, irrigation triggers |

---

## AI Capability Catalog

| # | Capability | Type | Primary Module | Tier |
|---|------------|------|----------------|------|
| 1 | AI Assistant | LLM + RAG | Global | Professional+ |
| 2 | Crop Disease Detection | Computer Vision | Crop Management | Professional+ |
| 3 | Yield Prediction | Predictive ML | Crop Management / Reports | Business+ |
| 4 | Irrigation Optimization | Optimization ML | Irrigation | Professional+ |
| 5 | Weather Risk Alerts | Predictive ML | Weather Intelligence | Starter+ |
| 6 | Market Price Forecasting | Time Series ML | Marketplace / Reports | Business+ |

---

## 1. AI Assistant

### Purpose

Conversational AI interface that helps users query operational data, receive recommendations, and execute platform actions through natural language.

### Capabilities

| Capability | Description | Example |
|------------|-------------|---------|
| **Operational Q&A** | Answer questions about farm data | "What was my corn yield last season?" |
| **Recommendation** | Proactive suggestions based on context | "Field 3 soil moisture is low — irrigate today?" |
| **Action execution** | Create tasks, log observations, send messages | "Create a spraying task for Field 2 tomorrow" |
| **Report generation** | Natural language to report | "Show me water usage by field this month" |
| **Agronomic guidance** | Crop-specific best practices | "When should I apply nitrogen to my wheat?" |
| **Platform help** | How-to guidance for Nertura features | "How do I add a new field?" |

### Architecture

```
User Query
    │
    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Intent     │────►│  Context     │────►│   LLM       │
│  Classifier  │     │  Assembly    │     │  (fine-     │
│              │     │  (RAG)       │     │   tuned)    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────┐             │
                    │  Tool / API  │◄────────────┘
                    │  Execution   │
                    └──────────────┘
```

### Context Assembly (RAG)

The assistant retrieves relevant context before generating responses:

| Context Source | Data |
|----------------|------|
| **User profile** | Role, farms, language, preferences |
| **Operational data** | Active crops, recent tasks, inventory, weather |
| **Knowledge base** | Crop guides, regional agronomic practices, platform docs |
| **Conversation history** | Prior messages in session |

### Safety & Guardrails

- No medical or legal advice beyond agricultural scope
- Financial recommendations include disclaimers
- Pesticide/chemical recommendations reference label data only
- All action executions require user confirmation
- Audit log of all AI-initiated actions

### Availability

| Tier | Limits |
|------|--------|
| Professional | 100 queries/day |
| Business | 500 queries/day |
| Enterprise | Unlimited + custom knowledge base |

---

## 2. Crop Disease Detection

### Purpose

Computer vision system that identifies crop diseases, pests, and nutrient deficiencies from field photos with actionable treatment recommendations.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Image classification** | Identify disease/pest from leaf, fruit, or plant photos |
| **Severity scoring** | Estimate affected area percentage (0–100%) |
| **Multi-crop support** | Models for major global crops (expandable catalog) |
| **Treatment recommendations** | Suggested actions based on identified condition |
| **Historical tracking** | Link detections to field, crop, and season for trend analysis |
| **Batch scanning** | Process multiple images from scouting trip |
| **Offline mode** | On-device inference for top 20 diseases (mobile app) |

### Supported Crops (Launch)

| Crop | Diseases (Initial) |
|------|-------------------|
| Corn | Northern leaf blight, gray leaf spot, rust, common smut |
| Soybean | Frogeye leaf spot, brown spot, rust, SDS |
| Wheat | Rust, septoria, powdery mildew, fusarium |
| Tomato | Early blight, late blight, bacterial spot |
| Coffee | Coffee leaf rust, berry disease |
| Rice | Blast, brown spot, sheath blight |
| Grapes | Downy mildew, powdery mildew, botrytis |

*Catalog expands quarterly based on market demand.*

### Model Architecture

| Component | Technology |
|-----------|------------|
| **Detection model** | Convolutional neural network (EfficientNet / ViT) |
| **Training data** | Public datasets + Nertura-collected (consented) field images |
| **Inference** | Cloud API (primary); TFLite/CoreML on mobile (offline) |
| **Confidence threshold** | Results below 70% confidence flagged as "uncertain — expert review recommended" |

### User Workflow

```
1. User captures photo in field (Crop Management → Observation)
2. AI analyzes image (2–5 seconds cloud; instant offline for supported diseases)
3. Result displayed: disease name, confidence, severity, affected area
4. Treatment recommendation with product suggestions from inventory
5. User confirms → auto-logged as pest/disease incident
6. Notification sent to farm manager if severity > threshold
```

### Feedback Loop

Users can confirm or correct AI diagnoses. Corrections feed model retraining pipeline (with consent).

---

## 3. Yield Prediction

### Purpose

Machine learning models that forecast crop yield at field, farm, and organization level to support planning, sales, and contract decisions.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Mid-season forecast** | Updated prediction as season progresses |
| **Pre-season estimate** | Initial forecast based on plan, soil, and historical data |
| **Confidence intervals** | Range estimate (e.g., 4.2–4.8 t/ha at 90% confidence) |
| **Factor attribution** | Which variables most influence the prediction |
| **Scenario modeling** | "What if" analysis (additional irrigation, delayed planting) |
| **Multi-field aggregation** | Farm and organization-level rollups |
| **Historical accuracy** | Track prediction vs actual for model transparency |

### Input Features

| Category | Features |
|----------|----------|
| **Crop plan** | Crop type, variety, planting date, expected harvest date |
| **Historical** | Past yields for field/crop, regional averages |
| **Weather** | GDD accumulation, rainfall, temperature extremes |
| **Soil** | Type, pH, nutrient levels |
| **Management** | Input applications, irrigation volume, task completion rate |
| **Satellite** | NDVI/vegetation index time series (V2) |
| **Disease/pest** | Incidents logged during season |

### Model Types

| Model | Use Case | Update Frequency |
|-------|----------|------------------|
| **Gradient boosting (XGBoost)** | Primary yield prediction | Weekly during season |
| **Deep learning (LSTM)** | Time-series mid-season adjustment | After major weather events |
| **Ensemble** | Final prediction combining both | On-demand and scheduled |

### Output Integration

- Dashboard KPI widget
- Marketplace listing quantity suggestions
- Reports module forecast vs actual
- CRM contract grower target tracking
- AI Assistant answers yield-related queries

---

## 4. Irrigation Optimization

### Purpose

AI-driven irrigation scheduling that minimizes water usage while maintaining or improving crop performance.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Schedule recommendation** | Optimal irrigation timing and duration per field |
| **Volume optimization** | Minimum water needed based on ET, soil moisture, crop stage |
| **Multi-field prioritization** | Rank fields by urgency when water budget is limited |
| **Weather-adjusted** | Auto-adjust for forecast rain, temperature changes |
| **Cost optimization** | Factor in water cost and energy (pumping) cost |
| **Constraint respect** | Honor water allocation limits and regulatory caps |
| **What-if simulation** | Compare outcomes of different scheduling strategies |

### Input Features

| Feature | Source |
|---------|--------|
| Crop type and growth stage | Crop Management |
| Soil type and moisture | Farm Management + IoT sensors |
| Evapotranspiration (ET) | Weather Intelligence |
| Weather forecast | Weather Intelligence |
| Irrigation system capacity | Irrigation module |
| Water budget remaining | Irrigation module |
| Historical yield response | Yield Prediction (feedback) |

### Optimization Engine

```
Objective: Minimize water usage
Subject to:
  - Soil moisture ≥ crop-specific threshold
  - Water budget ≤ allocation limit
  - Irrigation system capacity constraints
  - No irrigation during frost/rain events
  - Crop stage-specific water requirements
```

Uses linear programming with ML-calibrated crop water requirement curves.

### Automation Levels

| Level | Behavior | User Action |
|-------|----------|-------------|
| **Advisory** | AI recommends schedule; user approves | Manual approval |
| **Semi-auto** | AI creates schedule; user can modify before execution | Review and confirm |
| **Full-auto** | AI executes via IoT valve controllers | Monitor only (Enterprise + IoT) |

---

## 5. Weather Risk Alerts

### Purpose

Proactive, ML-enhanced weather risk detection that goes beyond simple threshold alerts to predict agricultural impact.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Frost risk** | Probabilistic frost prediction 24–72 hours ahead |
| **Heat stress** | Crop-specific heat damage risk scoring |
| **Flood / excess rain** | Field-level drainage risk based on soil and topography |
| **Drought stress** | Cumulative water deficit tracking and forecast |
| **Wind damage** | Lodging risk for tall crops (corn, wheat) |
| **Hail probability** | Regional hail risk from radar and model data |
| **Composite risk score** | Single 0–100 risk index per farm per day |
| **Impact assessment** | Estimated crop damage potential in currency/hectare |

### Alert Severity Matrix

| Severity | Criteria | Notification |
|----------|----------|--------------|
| **Critical** | >80% probability of crop damage | Push + SMS + in-app |
| **High** | 50–80% probability | Push + in-app |
| **Moderate** | 25–50% probability | In-app + email digest |
| **Low** | <25% probability | Dashboard indicator only |

### Model Architecture

| Component | Method |
|-----------|--------|
| **Weather forecast ensemble** | Blend multiple API providers |
| **Impact model** | Crop-specific damage functions calibrated to regional data |
| **Risk scorer** | Gradient boosting on historical weather-damage pairs |
| **Alert generator** | Rule engine + ML score → severity classification |

### Recommended Actions

Each alert includes AI-generated action recommendations:

| Risk | Recommended Actions |
|------|---------------------|
| Frost | Delay irrigation, activate frost protection, harvest early if mature |
| Heat stress | Increase irrigation, apply anti-transpirant, shade young plants |
| Flood | Check drainage, delay field operations, document for insurance |
| Drought | Prioritize irrigation, reduce non-essential water use |
| Wind | Delay spraying, check crop lodging, secure equipment |

---

## 6. Market Price Forecasting

### Purpose

Time series forecasting of agricultural commodity prices to help farmers, cooperatives, and exporters optimize selling timing and contract negotiations.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Price forecast** | 1-week, 1-month, 3-month price predictions |
| **Trend direction** | Rising, falling, stable with confidence |
| **Seasonal patterns** | Historical seasonal price curves by crop and region |
| **Market comparison** | Compare prices across markets/destinations |
| **Sell/hold recommendation** | AI recommendation on optimal selling window |
| **Contract pricing support** | Suggested contract price based on forecast + risk premium |
| **Alert on price movement** | Notify when forecast shifts significantly |

### Data Sources

| Source | Data |
|--------|------|
| **Market exchanges** | CBOT, local commodity exchanges |
| **Government reports** | USDA WASDE, FAO, national crop reports |
| **Trade platforms** | Aggregated Marketplace transaction data |
| **News / sentiment** | Agricultural news NLP sentiment scoring |
| **Currency** | Exchange rates for export market pricing |
| **Freight costs** | Shipping rate indices for export margin calculation |

### Model Architecture

| Model | Purpose |
|-------|---------|
| **ARIMA / Prophet** | Baseline time series forecast |
| **LSTM neural network** | Multi-variate forecast with external features |
| **Ensemble** | Weighted combination with confidence intervals |
| **Sentiment overlay** | Adjust forecast based on news/event sentiment |

### Output Integration

- Marketplace listing price suggestions
- Dashboard commodity price widget
- CRM contract negotiation support
- AI Assistant price queries
- Reports: forecast vs actual market price

### Disclaimers

All market forecasts include standard financial disclaimers. Nertura does not provide financial advice. Predictions are probabilistic estimates, not guarantees.

---

## AI Data Governance

### Training Data Policy

| Data Type | Usage |
|-----------|-------|
| **Customer operational data** | Used only with explicit opt-in consent |
| **Anonymized aggregates** | Cross-customer benchmarks (no individual identification) |
| **Public datasets** | Open agricultural research data |
| **User corrections** | Disease detection feedback (consented) |

### Model Lifecycle

```
Data Collection → Validation → Training → Evaluation → Staging → Production → Monitoring → Retrain
                                                                                    │
                                                                              Drift detection
                                                                              Performance tracking
                                                                              User feedback loop
```

### Performance Monitoring

| Metric | Target |
|--------|--------|
| Disease detection accuracy | >90% top-1 on validation set |
| Yield prediction MAPE | <15% at harvest |
| Irrigation water savings | >10% vs manual scheduling |
| Weather alert lead time | >24h for frost; >48h for drought |
| Market price forecast MAPE | <8% at 1-month horizon |
| AI Assistant satisfaction | >4.2/5 user rating |

---

## AI Roadmap Summary

| Phase | Capabilities |
|-------|-------------|
| **MVP** | AI Assistant (basic), Weather Risk Alerts (rule + ML), Disease Detection (top crops) |
| **V2** | Yield Prediction, Irrigation Optimization, expanded disease catalog |
| **V3** | Market Price Forecasting, satellite NDVI integration, voice assistant |
| **Future** | Autonomous scouting drones, robotic integration, carbon modeling, federated global models |

---

*Document owner: Product Architecture / AI Engineering*  
*Last updated: June 2026*  
*Status: Approved foundation*
