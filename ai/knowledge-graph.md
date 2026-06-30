# Nertura — Knowledge Graph

> Unified semantic model connecting users, land, crops, diseases, AI interactions, commerce, and community knowledge — the structural backbone of Nertura intelligence.

---

## Purpose

Operational databases store records. The **Knowledge Graph** stores **meaning** — typed entities, relationships, and traversable paths that agents use to reason across the full agriculture value chain.

```
"Which fields are at risk of rust given wet weather,
 what did we spray last year on those fields,
 and which cooperative members supply export-grade corn?"
         │
         ▼
    Single graph traversal — not five SQL joins and a prayer
```

---

## Graph Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NERTURA KNOWLEDGE GRAPH                        │
├─────────────────────────────────────────────────────────────────┤
│  LAYER A: Operational entities (sync from PostgreSQL)             │
│  LAYER B: Intelligence entities (AI interactions, diagnoses)      │
│  LAYER C: Memory nodes (from Memory System)                     │
│  LAYER D: Community nodes (Phase 5+)                              │
│  LAYER E: Global knowledge nodes (anonymized corpus)            │
├─────────────────────────────────────────────────────────────────┤
│  Graph store: Property graph (Neo4j / Neptune) OR               │
│               PostgreSQL relational + materialized paths         │
│  Vector index: Linked embeddings per node for hybrid retrieval    │
└─────────────────────────────────────────────────────────────────┘
```

Launch: **PostgreSQL relational model with graph views**; migrate to dedicated graph DB at 100K+ orgs.

---

## Node Types (Entities)

### Identity & organization

| Node | Key properties | Source table |
|------|----------------|--------------|
| `User` | role, language, trust_score | users |
| `Organization` | type, region, tier | organizations |
| `Role` | permissions | roles |

### Land & operations

| Node | Key properties | Source |
|------|----------------|--------|
| `Farm` | name, area, location_region | farms |
| `Field` | area, soil_type, status | fields |
| `Zone` | soil_variant | zones |
| `CropCatalog` | category, growth_stages | crop_catalog |
| `CropPlan` | season, stage, status | crop_plans |
| `CropTask` | type, due, status | crop_tasks |
| `HarvestRecord` | quantity, grade | harvest_records |
| `InputApplication` | product, rate, date | input_applications |

### Intelligence

| Node | Key properties | Source |
|------|----------------|--------|
| `AIInteraction` | channel, type, confidence | ai_interactions |
| `Diagnosis` | disease, severity, validated | pest_disease_incidents |
| `Observation` | date, severity | observations |
| `Photo` | url, embedding_id | observation_photos |
| `Prediction` | type, value, confidence | ai_predictions |
| `KnowledgeNode` | layer, content, confidence | learning_system |
| `MemoryNode` | layer, type | memory_system |

### Environment

| Node | Key properties | Source |
|------|----------------|--------|
| `WeatherAlert` | type, severity, valid_until | weather_alerts |
| `WeatherSnapshot` | temp, precip, gdd | weather_forecasts |
| `IoTDevice` | type, status | iot_devices |
| `SensorReading` | value, recorded_at | sensor_readings |

### Commerce & relationships

| Node | Key properties | Source |
|------|----------------|--------|
| `CRMAccount` | type, health_score | crm_accounts |
| `CRMDeal` | stage, value | crm_deals |
| `MarketplaceListing` | crop, quantity, price | marketplace_listings |
| `Order` | status, total | orders |
| `Sponsor` | tier, active | sponsor_network [Phase 5] |

### Community [Phase 5+]

| Node | Key properties | Source |
|------|----------------|--------|
| `CommunityPost` | topic, visibility | community_network |
| `ExpertProfile` | credentials, rating | community_network |
| `SharedPractice` | crop, region, outcome | community + learning |

---

## Edge Types (Relationships)

### Operational edges

| Edge | From → To | Semantics |
|------|-----------|-----------|
| `OWNS` | Organization → Farm | Tenancy |
| `CONTAINS` | Farm → Field | Spatial hierarchy |
| `SUBDIVIDES` | Field → Zone | Management zones |
| `PLanted_ON` | CropPlan → Field | Season assignment |
| `INSTANCE_OF` | CropPlan → CropCatalog | Crop type |
| `ASSIGNED_TO` | CropTask → User | Work assignment |
| `APPLIED_TO` | InputApplication → Field | Input log |
| `HARVESTED_FROM` | HarvestRecord → CropPlan | Yield link |
| `OBSERVED_ON` | Observation → Field | Scouting |
| `CAPTURED_IN` | Photo → Observation | Media link |
| `MONITORS` | IoTDevice → Field | Sensor placement |

### Intelligence edges

| Edge | From → To | Semantics |
|------|-----------|-----------|
| `TRIGGERED_BY` | AIInteraction → User | Who asked |
| `ABOUT` | AIInteraction → Field / CropPlan | Context |
| `PRODUCED` | AIInteraction → Diagnosis | AI output |
| `CONFIRMED` | User → Diagnosis | Feedback positive |
| `CORRECTED` | User → Diagnosis | Feedback correction |
| `SIMILAR_TO` | Photo → Photo | Embedding similarity |
| `PREDICTED` | Prediction → CropPlan | Forecast link |
| `VALIDATED_BY` | ExpertProfile → KnowledgeNode | Expert review |
| `DERIVED_FROM` | KnowledgeNode → AIInteraction | Provenance |
| `REMEBERS` | MemoryNode → Field / User | Memory attachment |

### Commerce edges

| Edge | From → To | Semantics |
|------|-----------|-----------|
| `LISTS` | Organization → MarketplaceListing | Seller |
| `OFFERS` | CRMAccount → Order | Buyer relationship |
| `TRACES_TO` | Order → HarvestRecord | Traceability |
| `ORIGINATES_FROM` | MarketplaceListing → Field | Supply proof |
| `SPONSORS` | Sponsor → Organization | Credit/program sponsor |

### Temporal edges

| Edge | Semantics |
|------|-----------|
| `PRECEDES` | Season A → Season B same field |
| `RECURRED_ON` | Disease → Field (multi-season) |
| `FOLLOWED_BY` | Task → Task sequence |

---

## Graph Traversal Patterns (Agent Use Cases)

### AI Farmer: "What's wrong with Field 7?"

```
User ──TRIGGERED_BY──> AIInteraction
Field(7) ──PLanted_ON── CropPlan ──INSTANCE_OF── Corn
Field(7) ──OBSERVED_ON── Observation ──CAPTURED_IN── Photo
Photo ──PRODUCED── Diagnosis(rust, 0.87)
Field(7) ──RECURRED_ON── Diagnosis(blight, 2025)
WeatherAlert(frost) ──ABOUT── Field(7)
```

Agent retrieves subgraph depth 2 from Field 7.

### AI Agronomist: Rotation planning

```
Field ──PRECEDES── Field (season chain via CropPlan)
CropPlan ──HARVESTED_FROM── HarvestRecord (yield trend)
Field ──APPLIED_TO── InputApplication (N timing history)
KnowledgeNode(global) ──SIMILAR_TO── Field (region match)
```

### AI Export Manager: Traceability

```
Order ──TRACES_TO── HarvestRecord ──HARVESTED_FROM── CropPlan
CropPlan ──PLanted_ON── Field ──CONTAINS── Farm
Field ──APPLIED_TO── InputApplication (compliance)
CRMAccount(supplier) ──OFFERS── Order
```

### AI CRM: Member health

```
Organization(co-op) ──OWNS── Farm(member)
Farm ──HARVESTED_FROM── HarvestRecord (delivery timeliness)
User(member) ──TRIGGERED_BY── AIInteraction (engagement)
CRMAccount ──FOLLOWED_BY── CRMDeal (pipeline)
```

---

## Graph + Vector Hybrid Retrieval

Each node with textual content maintains an **embedding**:

```
Query: "northern leaf blight corn treatment"
    │
    ├── Vector search: KnowledgeNode, Diagnosis, AIInteraction summaries
    │
    └── Graph expand: Diagnosis ──ABOUT── Field ──PLanted_ON── CropPlan
                       └── APPLIED_TO── InputApplication (what worked)
```

**GraphRAG pattern:** retrieve seeds by vector → expand neighborhood → rerank by path relevance.

---

## Sync from Operational DB

| Event | Graph update |
|-------|--------------|
| Field created | Upsert Field node + CONTAINS edge |
| Crop plan activated | PLanted_ON edge + CropPlan node |
| Diagnosis confirmed | Diagnosis node + CONFIRMED edge |
| Interaction stored | AIInteraction node + ABOUT edges |
| Order completed | TRACES_TO chain assembled |
| Memory written | MemoryNode + REMEMBERS edge |

Event-driven via message queue from PostgreSQL CDC (Change Data Capture).

---

## Global Knowledge Subgraph

Anonymized nodes detached from identifiable entities:

```
GlobalKnowledgeNode(corn_rust_tr_central_jun)
    ├── AGGREGATES ──> 847 confirmed cases
    ├── TREATED_WITH ──> InputProduct class (fungicide azole)
    └── CORRELATES ──> WeatherPattern(high_humidity)
```

No `OWNS`, `User`, or `Farm` edges with PII. Validated before publish.

---

## Community Subgraph [Phase 5]

```
User ──AUTHORED── CommunityPost ──ABOUT── CropCatalog
CommunityPost ──UPVOTED_BY── User (reputation)
ExpertProfile ──VALIDATED── SharedPractice
SharedPractice ──SIMILAR_TO── KnowledgeNode
```

See `/product/community-network.md`.

---

## Query API (Conceptual)

Agents and modules call Graph Service — not raw Cypher/SQL:

| Operation | Description |
|-----------|-------------|
| `getSubgraph(entity_id, depth, edge_filters)` | Neighborhood retrieval |
| `findPath(from_id, to_id, max_hops)` | Traceability, supply chain |
| `similarEntities(node_id, type, limit)` | Vector + type filter |
| `aggregatePattern(crop, region, season)` | Global stats |
| `explainConnection(a, b)` | Human-readable path for citations |

---

## Citation in Agent Responses

Brain cites graph paths:

> "Based on your Field 7 history — rust diagnosed Jun 2025, treated with Azoxystrobin, yield 4.2 t/ha — and 847 similar cases in your region this month..."

Citation payload: `[path: Field(7) → Diagnosis(2025-06) → InputApplication → HarvestRecord]`

---

## Governance

| Rule | Enforcement |
|------|-------------|
| Cross-org traversal | Blocked except global subgraph |
| PII in global graph | Prohibited; automated scan |
| Edge deletion | Soft delete; audit log |
| Graph export | Included in GDPR bundle as structured JSON |

---

## Scale Roadmap

| Stage | Architecture |
|-------|--------------|
| **Launch** | PostgreSQL + foreign keys + materialized views for hot paths |
| **100K orgs** | Neo4j / Neptune replica synced from CDC |
| **1M+ orgs** | Sharded graph by region; federated global subgraph |

---

## Integration Map

| System | Integration |
|--------|-------------|
| Memory System | MemoryNode entities + REMEMBERS edges |
| Learning System | KnowledgeNode promotion to global subgraph |
| AI Brain | GraphRAG retrieval |
| Agents | Traversal patterns per role |
| Database blueprint | Source of truth for Layer A nodes |

---

*Document owner: Chief AI Platform Architect*  
*Last updated: June 2026*  
*Companion: `/ai/memory-system.md`, `/ai/data-moat-strategy.md`*
