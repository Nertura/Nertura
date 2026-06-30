# Nertura — Database Blueprint

> Complete entity-relationship model for the Nertura Agriculture Operating System. Designed for multi-tenant SaaS, global scale, and eventual sharding by region.

---

## Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Multi-tenancy** | Row-level tenant isolation via `organization_id` on all tenant-scoped tables |
| **Soft deletes** | `deleted_at` timestamp on all entities; no hard deletes for audit compliance |
| **Audit trail** | `created_at`, `updated_at`, `created_by`, `updated_by` on all mutable entities |
| **UUID primary keys** | Globally unique identifiers for distributed systems and data migration |
| **JSONB metadata** | Flexible `metadata` column for region-specific or evolving attributes |
| **Event sourcing (select)** | Activity and notification events stored as immutable event log |
| **Regional partitioning** | Tables partitioned by `region_code` for data residency compliance |

---

## Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Organization│────►│    User     │────►│    Role     │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ├────► Farm ────► Field ────► Zone
       │         │         │
       │         │         └────► CropPlan ────► CropTask
       │         │                      │              │
       │         │                      ├────► Observation
       │         │                      ├────► HarvestRecord
       │         │                      └────► InputApplication
       │         │
       │         ├────► Equipment
       │         ├────► Infrastructure
       │         └────► IoTDevice ────► SensorReading
       │
       ├────► InventoryItem ────► StockMovement
       │         └────► Warehouse
       │
       ├────► MarketplaceListing ────► Offer ────► Order
       │
       ├────► CRMAccount ────► CRMContact
       │         ├────► CRMInteraction
       │         └────► CRMDeal
       │
       ├────► Subscription ────► Invoice ────► Payment
       │
       ├────► Notification
       ├────► Report
       └────► AuditLog
```

---

## Core Platform Entities

### Organization

Top-level tenant entity. Every customer is an organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Organization display name |
| `slug` | VARCHAR(100) | URL-safe unique identifier |
| `type` | ENUM | `farm`, `cooperative`, `ag_company`, `supplier`, `exporter` |
| `country_code` | CHAR(2) | ISO 3166-1 alpha-2 |
| `region_code` | VARCHAR(20) | Data residency region |
| `timezone` | VARCHAR(50) | Default timezone |
| `default_currency` | CHAR(3) | ISO 4217 |
| `default_language` | CHAR(5) | ISO 639-1 + locale |
| `logo_url` | TEXT | Organization logo |
| `settings` | JSONB | Org-level configuration |
| `status` | ENUM | `active`, `suspended`, `trial`, `cancelled` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

### User

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `email` | VARCHAR(255) | Unique, login identifier |
| `password_hash` | VARCHAR(255) | Bcrypt/Argon2 hash |
| `first_name` | VARCHAR(100) | |
| `last_name` | VARCHAR(100) | |
| `phone` | VARCHAR(20) | Optional |
| `avatar_url` | TEXT | Profile photo |
| `language` | CHAR(5) | User language preference |
| `timezone` | VARCHAR(50) | User timezone override |
| `mfa_enabled` | BOOLEAN | Multi-factor auth status |
| `mfa_secret` | VARCHAR(255) | Encrypted TOTP secret |
| `status` | ENUM | `active`, `invited`, `deactivated` |
| `last_login_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### Role

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization (null for system roles) |
| `name` | VARCHAR(100) | Role name |
| `slug` | VARCHAR(50) | `owner`, `admin`, `manager`, `operator`, `viewer`, `member`, `partner` |
| `permissions` | JSONB | Module × action permission matrix |
| `is_system` | BOOLEAN | Predefined vs custom role |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### UserRole (junction)

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | FK → User |
| `role_id` | UUID | FK → Role |
| `farm_id` | UUID | FK → Farm (optional scope) |
| `assigned_at` | TIMESTAMPTZ | |

### UserSession

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → User |
| `token_hash` | VARCHAR(255) | Hashed session token |
| `ip_address` | INET | |
| `user_agent` | TEXT | |
| `expires_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

---

## Farm Management Entities

### Farm

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | Farm name |
| `description` | TEXT | |
| `address` | JSONB | Structured address (street, city, state, postal, country) |
| `latitude` | DECIMAL(10,7) | Center point |
| `longitude` | DECIMAL(10,7) | Center point |
| `total_area` | DECIMAL(12,4) | Hectares |
| `area_unit` | ENUM | `hectare`, `acre` |
| `timezone` | VARCHAR(50) | Farm-specific timezone |
| `status` | ENUM | `active`, `inactive`, `archived` |
| `metadata` | JSONB | Custom attributes |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### Field

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | Field name/number |
| `boundary` | GEOMETRY(Polygon) | GeoJSON polygon (PostGIS) |
| `area` | DECIMAL(12,4) | Calculated hectares |
| `soil_type` | VARCHAR(100) | |
| `soil_ph` | DECIMAL(4,2) | Latest pH reading |
| `elevation` | DECIMAL(8,2) | Meters |
| `slope` | DECIMAL(5,2) | Percentage |
| `irrigation_system_id` | UUID | FK → IrrigationSystem (optional) |
| `status` | ENUM | `active`, `fallow`, `archived` |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### Zone

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | Zone identifier |
| `boundary` | GEOMETRY(Polygon) | Sub-field polygon |
| `area` | DECIMAL(12,4) | |
| `soil_type` | VARCHAR(100) | Zone-specific soil |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### SoilRecord

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `field_id` | UUID | FK → Field |
| `zone_id` | UUID | FK → Zone (optional) |
| `test_date` | DATE | |
| `ph` | DECIMAL(4,2) | |
| `nitrogen` | DECIMAL(8,2) | ppm |
| `phosphorus` | DECIMAL(8,2) | ppm |
| `potassium` | DECIMAL(8,2) | ppm |
| `organic_matter` | DECIMAL(5,2) | Percentage |
| `lab_name` | VARCHAR(255) | Testing laboratory |
| `report_url` | TEXT | Uploaded lab report |
| `metadata` | JSONB | Additional nutrients |
| `created_at` | TIMESTAMPTZ | |

### Equipment

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `tractor`, `sprayer`, `harvester`, `planter`, `irrigation_pump`, `other` |
| `manufacturer` | VARCHAR(255) | |
| `model` | VARCHAR(255) | |
| `serial_number` | VARCHAR(100) | |
| `year` | SMALLINT | Manufacture year |
| `status` | ENUM | `active`, `maintenance`, `retired` |
| `last_maintenance_at` | DATE | |
| `next_maintenance_at` | DATE | |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Infrastructure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `storage`, `greenhouse`, `processing`, `office`, `other` |
| `capacity` | DECIMAL(12,2) | Storage capacity (tons) or area (sqm) |
| `capacity_unit` | VARCHAR(20) | |
| `latitude` | DECIMAL(10,7) | |
| `longitude` | DECIMAL(10,7) | |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### IoTDevice

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `farm_id` | UUID | FK → Farm |
| `field_id` | UUID | FK → Field (optional) |
| `zone_id` | UUID | FK → Zone (optional) |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `weather_station`, `soil_moisture`, `flow_meter`, `valve_controller`, `camera` |
| `manufacturer` | VARCHAR(255) | |
| `model` | VARCHAR(255) | |
| `serial_number` | VARCHAR(100) | |
| `connection_type` | ENUM | `mqtt`, `api`, `lorawan`, `manual` |
| `last_reading_at` | TIMESTAMPTZ | |
| `status` | ENUM | `online`, `offline`, `error` |
| `config` | JSONB | Device-specific configuration |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### SensorReading

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `device_id` | UUID | FK → IoTDevice |
| `organization_id` | UUID | FK → Organization |
| `reading_type` | VARCHAR(50) | `temperature`, `humidity`, `moisture`, `flow_rate`, etc. |
| `value` | DECIMAL(12,4) | |
| `unit` | VARCHAR(20) | |
| `recorded_at` | TIMESTAMPTZ | Device timestamp |
| `received_at` | TIMESTAMPTZ | Server ingestion timestamp |

*Partitioned by `recorded_at` (monthly) for time-series performance.*

---

## Crop Management Entities

### CropCatalog

Global crop reference data (not tenant-scoped).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Common name |
| `scientific_name` | VARCHAR(255) | |
| `category` | ENUM | `grain`, `oilseed`, `vegetable`, `fruit`, `fiber`, `forage`, `other` |
| `growth_stages` | JSONB | Array of stage definitions |
| `default_inputs` | JSONB | Typical input schedule template |
| `metadata` | JSONB | |

### CropVariety

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_id` | UUID | FK → CropCatalog |
| `name` | VARCHAR(255) | Variety name |
| `days_to_maturity` | SMALLINT | |
| `metadata` | JSONB | |

### CropPlan

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `field_id` | UUID | FK → Field |
| `crop_id` | UUID | FK → CropCatalog |
| `variety_id` | UUID | FK → CropVariety (optional) |
| `season` | VARCHAR(20) | e.g., "2026-Spring" |
| `planting_date` | DATE | Planned/actual |
| `expected_harvest_date` | DATE | |
| `actual_harvest_date` | DATE | |
| `target_yield` | DECIMAL(12,4) | |
| `yield_unit` | VARCHAR(20) | `ton`, `bushel`, `kg` |
| `current_stage` | VARCHAR(50) | Growth stage slug |
| `status` | ENUM | `planned`, `active`, `harvested`, `cancelled` |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### CropTask

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_plan_id` | UUID | FK → CropPlan |
| `organization_id` | UUID | FK → Organization |
| `field_id` | UUID | FK → Field |
| `title` | VARCHAR(255) | |
| `type` | ENUM | `planting`, `spraying`, `fertilizing`, `irrigation`, `scouting`, `harvesting`, `other` |
| `description` | TEXT | |
| `assigned_to` | UUID | FK → User |
| `due_date` | DATE | |
| `completed_at` | TIMESTAMPTZ | |
| `status` | ENUM | `pending`, `in_progress`, `completed`, `overdue`, `cancelled` |
| `priority` | ENUM | `low`, `medium`, `high`, `critical` |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Observation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_plan_id` | UUID | FK → CropPlan |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `observer_id` | UUID | FK → User |
| `notes` | TEXT | |
| `latitude` | DECIMAL(10,7) | GPS at observation point |
| `longitude` | DECIMAL(10,7) | |
| `severity` | ENUM | `none`, `low`, `medium`, `high` |
| `observed_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

### ObservationPhoto

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `observation_id` | UUID | FK → Observation |
| `url` | TEXT | Storage URL |
| `ai_analysis` | JSONB | Disease detection results |
| `created_at` | TIMESTAMPTZ | |

### PestDiseaseIncident

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_plan_id` | UUID | FK → CropPlan |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `observation_id` | UUID | FK → Observation (optional) |
| `type` | ENUM | `disease`, `pest`, `nutrient_deficiency`, `weed` |
| `name` | VARCHAR(255) | Identified condition |
| `severity` | ENUM | `low`, `medium`, `high`, `critical` |
| `affected_area_pct` | DECIMAL(5,2) | |
| `ai_detected` | BOOLEAN | Detected by AI vs manual |
| `ai_confidence` | DECIMAL(5,4) | 0.0000–1.0000 |
| `treatment_applied` | TEXT | |
| `status` | ENUM | `active`, `treated`, `resolved` |
| `detected_at` | TIMESTAMPTZ | |
| `resolved_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

### InputApplication

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_plan_id` | UUID | FK → CropPlan |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `inventory_item_id` | UUID | FK → InventoryItem |
| `product_name` | VARCHAR(255) | |
| `type` | ENUM | `seed`, `fertilizer`, `pesticide`, `herbicide`, `other` |
| `rate` | DECIMAL(10,4) | Application rate |
| `rate_unit` | VARCHAR(20) | kg/ha, L/ha, etc. |
| `total_quantity` | DECIMAL(12,4) | |
| `applied_at` | TIMESTAMPTZ | |
| `applied_by` | UUID | FK → User |
| `pre_harvest_interval_days` | SMALLINT | PHI for compliance |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |

### HarvestRecord

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `crop_plan_id` | UUID | FK → CropPlan |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `quantity` | DECIMAL(12,4) | |
| `unit` | VARCHAR(20) | |
| `quality_grade` | VARCHAR(50) | |
| `moisture_content` | DECIMAL(5,2) | Percentage |
| `harvested_at` | DATE | |
| `harvested_by` | UUID | FK → User |
| `storage_location_id` | UUID | FK → Warehouse |
| `inventory_item_id` | UUID | FK → InventoryItem (auto-created) |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |

---

## Weather Entities

### WeatherForecast

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `forecast_type` | ENUM | `hourly`, `daily` |
| `forecast_time` | TIMESTAMPTZ | Target forecast timestamp |
| `temperature_min` | DECIMAL(5,2) | °C |
| `temperature_max` | DECIMAL(5,2) | °C |
| `humidity` | DECIMAL(5,2) | % |
| `precipitation` | DECIMAL(8,2) | mm |
| `wind_speed` | DECIMAL(6,2) | m/s |
| `wind_direction` | SMALLINT | Degrees |
| `cloud_cover` | DECIMAL(5,2) | % |
| `provider` | VARCHAR(50) | Data source |
| `fetched_at` | TIMESTAMPTZ | |

### WeatherAlert

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `alert_type` | ENUM | `frost`, `heat`, `flood`, `drought`, `wind`, `hail` |
| `severity` | ENUM | `low`, `moderate`, `high`, `critical` |
| `probability` | DECIMAL(5,4) | 0–1 |
| `risk_score` | DECIMAL(5,2) | 0–100 composite |
| `description` | TEXT | |
| `recommended_actions` | JSONB | Array of action strings |
| `affected_field_ids` | UUID[] | Array of field IDs |
| `valid_from` | TIMESTAMPTZ | |
| `valid_until` | TIMESTAMPTZ | |
| `acknowledged_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

### AgriculturalIndex

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `field_id` | UUID | FK → Field (optional) |
| `organization_id` | UUID | FK → Organization |
| `index_type` | ENUM | `gdd`, `et`, `frost_hours`, `chill_hours` |
| `value` | DECIMAL(12,4) | |
| `date` | DATE | |
| `created_at` | TIMESTAMPTZ | |

---

## Irrigation Entities

### IrrigationSystem

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `drip`, `pivot`, `sprinkler`, `flood`, `furrow` |
| `capacity` | DECIMAL(10,2) | Flow rate (L/min or m³/h) |
| `linked_field_ids` | UUID[] | Fields served |
| `automation_level` | ENUM | `manual`, `advisory`, `semi_auto`, `full_auto` |
| `status` | ENUM | `active`, `inactive`, `maintenance` |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### IrrigationSchedule

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `system_id` | UUID | FK → IrrigationSystem |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `scheduled_start` | TIMESTAMPTZ | |
| `scheduled_end` | TIMESTAMPTZ | |
| `volume` | DECIMAL(10,2) | mm or m³ |
| `volume_unit` | VARCHAR(10) | |
| `source` | ENUM | `manual`, `ai_recommended`, `automated` |
| `status` | ENUM | `scheduled`, `running`, `completed`, `cancelled`, `skipped` |
| `ai_confidence` | DECIMAL(5,4) | If AI-generated |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### IrrigationLog

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `schedule_id` | UUID | FK → IrrigationSchedule |
| `field_id` | UUID | FK → Field |
| `organization_id` | UUID | FK → Organization |
| `actual_start` | TIMESTAMPTZ | |
| `actual_end` | TIMESTAMPTZ | |
| `volume_applied` | DECIMAL(10,2) | |
| `volume_unit` | VARCHAR(10) | |
| `operator_id` | UUID | FK → User |
| `cost` | DECIMAL(10,2) | |
| `currency` | CHAR(3) | |
| `created_at` | TIMESTAMPTZ | |

### WaterBudget

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `farm_id` | UUID | FK → Farm |
| `organization_id` | UUID | FK → Organization |
| `season` | VARCHAR(20) | |
| `total_allocation` | DECIMAL(12,2) | m³ |
| `used_volume` | DECIMAL(12,2) | m³ |
| `cost_per_unit` | DECIMAL(10,4) | |
| `currency` | CHAR(3) | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

## Inventory Entities

### Warehouse

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `farm_id` | UUID | FK → Farm (optional) |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `warehouse`, `silo`, `cold_storage`, `field_storage` |
| `capacity` | DECIMAL(12,2) | |
| `capacity_unit` | VARCHAR(20) | |
| `latitude` | DECIMAL(10,7) | |
| `longitude` | DECIMAL(10,7) | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### InventoryItem

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `name` | VARCHAR(255) | |
| `sku` | VARCHAR(100) | |
| `category` | ENUM | `seed`, `fertilizer`, `pesticide`, `fuel`, `packaging`, `harvest`, `other` |
| `unit` | VARCHAR(20) | kg, L, ton, bag, etc. |
| `unit_cost` | DECIMAL(12,4) | |
| `currency` | CHAR(3) | |
| `reorder_threshold` | DECIMAL(12,4) | |
| `supplier_account_id` | UUID | FK → CRMAccount (optional) |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### StockLevel

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `item_id` | UUID | FK → InventoryItem |
| `warehouse_id` | UUID | FK → Warehouse |
| `organization_id` | UUID | FK → Organization |
| `quantity` | DECIMAL(12,4) | |
| `lot_number` | VARCHAR(100) | |
| `expiry_date` | DATE | |
| `updated_at` | TIMESTAMPTZ | |

### StockMovement

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `item_id` | UUID | FK → InventoryItem |
| `organization_id` | UUID | FK → Organization |
| `movement_type` | ENUM | `receive`, `transfer`, `consume`, `sell`, `adjust`, `harvest_intake` |
| `quantity` | DECIMAL(12,4) | Positive = in, negative = out |
| `from_warehouse_id` | UUID | FK → Warehouse |
| `to_warehouse_id` | UUID | FK → Warehouse |
| `reference_type` | VARCHAR(50) | `crop_plan`, `order`, `manual` |
| `reference_id` | UUID | Polymorphic FK |
| `lot_number` | VARCHAR(100) | |
| `performed_by` | UUID | FK → User |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

## Marketplace Entities

### MarketplaceListing

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization (seller) |
| `inventory_item_id` | UUID | FK → InventoryItem (optional) |
| `crop_plan_id` | UUID | FK → CropPlan (traceability) |
| `title` | VARCHAR(255) | |
| `description` | TEXT | |
| `crop_name` | VARCHAR(100) | |
| `quantity` | DECIMAL(12,4) | |
| `unit` | VARCHAR(20) | |
| `price_per_unit` | DECIMAL(12,4) | |
| `currency` | CHAR(3) | |
| `quality_grade` | VARCHAR(50) | |
| `certifications` | JSONB | Array of certification names |
| `delivery_terms` | VARCHAR(100) | FOB, CIF, pickup, etc. |
| `available_from` | DATE | |
| `available_until` | DATE | |
| `visibility` | ENUM | `public`, `cooperative`, `private` |
| `status` | ENUM | `draft`, `active`, `sold`, `expired`, `cancelled` |
| `location_country` | CHAR(2) | |
| `location_region` | VARCHAR(100) | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### MarketplaceRequirement

Buyer wanted ads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization (buyer) |
| `crop_name` | VARCHAR(100) | |
| `quantity` | DECIMAL(12,4) | |
| `unit` | VARCHAR(20) | |
| `max_price_per_unit` | DECIMAL(12,4) | |
| `currency` | CHAR(3) | |
| `quality_requirements` | TEXT | |
| `delivery_destination` | JSONB | |
| `deadline` | DATE | |
| `status` | ENUM | `active`, `fulfilled`, `expired`, `cancelled` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Offer

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `listing_id` | UUID | FK → MarketplaceListing |
| `buyer_org_id` | UUID | FK → Organization |
| `seller_org_id` | UUID | FK → Organization |
| `quantity` | DECIMAL(12,4) | |
| `price_per_unit` | DECIMAL(12,4) | |
| `currency` | CHAR(3) | |
| `message` | TEXT | |
| `status` | ENUM | `pending`, `accepted`, `rejected`, `countered`, `expired` |
| `expires_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Order

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `offer_id` | UUID | FK → Offer |
| `listing_id` | UUID | FK → MarketplaceListing |
| `buyer_org_id` | UUID | FK → Organization |
| `seller_org_id` | UUID | FK → Organization |
| `quantity` | DECIMAL(12,4) | |
| `total_price` | DECIMAL(14,4) | |
| `currency` | CHAR(3) | |
| `status` | ENUM | `confirmed`, `in_transit`, `delivered`, `completed`, `disputed`, `cancelled` |
| `delivery_date` | DATE | |
| `tracking_info` | JSONB | |
| `documents` | JSONB | Array of document URLs |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### ListingPhoto

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `listing_id` | UUID | FK → MarketplaceListing |
| `url` | TEXT | |
| `sort_order` | SMALLINT | |
| `created_at` | TIMESTAMPTZ | |

---

## CRM Entities

### CRMAccount

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization (owner) |
| `linked_org_id` | UUID | FK → Organization (if Nertura customer) |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `customer`, `supplier`, `buyer`, `member`, `partner` |
| `status` | ENUM | `active`, `inactive`, `prospect` |
| `country_code` | CHAR(2) | |
| `address` | JSONB | |
| `tags` | TEXT[] | |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | |

### CRMContact

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `account_id` | UUID | FK → CRMAccount |
| `organization_id` | UUID | FK → Organization |
| `first_name` | VARCHAR(100) | |
| `last_name` | VARCHAR(100) | |
| `email` | VARCHAR(255) | |
| `phone` | VARCHAR(20) | |
| `role` | VARCHAR(100) | Job title |
| `is_primary` | BOOLEAN | Primary contact flag |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### CRMInteraction

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `account_id` | UUID | FK → CRMAccount |
| `contact_id` | UUID | FK → CRMContact (optional) |
| `organization_id` | UUID | FK → Organization |
| `user_id` | UUID | FK → User (logged by) |
| `type` | ENUM | `call`, `meeting`, `email`, `note`, `site_visit` |
| `subject` | VARCHAR(255) | |
| `summary` | TEXT | |
| `interaction_at` | TIMESTAMPTZ | |
| `follow_up_date` | DATE | |
| `created_at` | TIMESTAMPTZ | |

### CRMDeal

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `account_id` | UUID | FK → CRMAccount |
| `organization_id` | UUID | FK → Organization |
| `title` | VARCHAR(255) | |
| `value` | DECIMAL(14,4) | |
| `currency` | CHAR(3) | |
| `stage` | ENUM | `lead`, `qualified`, `proposal`, `negotiation`, `won`, `lost` |
| `expected_close_date` | DATE | |
| `assigned_to` | UUID | FK → User |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

## Billing Entities

### Subscription

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `plan` | ENUM | `starter`, `professional`, `business`, `enterprise` |
| `status` | ENUM | `trialing`, `active`, `past_due`, `cancelled`, `paused` |
| `billing_cycle` | ENUM | `monthly`, `annual` |
| `current_period_start` | TIMESTAMPTZ | |
| `current_period_end` | TIMESTAMPTZ | |
| `trial_end` | TIMESTAMPTZ | |
| `cancelled_at` | TIMESTAMPTZ | |
| `external_subscription_id` | VARCHAR(255) | Stripe/payment provider ID |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Invoice

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `subscription_id` | UUID | FK → Subscription |
| `invoice_number` | VARCHAR(50) | Sequential per org |
| `amount` | DECIMAL(12,2) | |
| `currency` | CHAR(3) | |
| `tax_amount` | DECIMAL(12,2) | |
| `status` | ENUM | `draft`, `open`, `paid`, `void`, `uncollectible` |
| `due_date` | DATE | |
| `paid_at` | TIMESTAMPTZ | |
| `pdf_url` | TEXT | |
| `external_invoice_id` | VARCHAR(255) | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### Payment

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `invoice_id` | UUID | FK → Invoice |
| `organization_id` | UUID | FK → Organization |
| `amount` | DECIMAL(12,2) | |
| `currency` | CHAR(3) | |
| `method` | ENUM | `card`, `bank_transfer`, `local` |
| `status` | ENUM | `pending`, `succeeded`, `failed`, `refunded` |
| `external_payment_id` | VARCHAR(255) | |
| `processed_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

### UsageRecord

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `metric` | VARCHAR(50) | `users`, `farms`, `api_calls`, `ai_queries`, `storage_gb` |
| `quantity` | DECIMAL(12,4) | |
| `recorded_at` | TIMESTAMPTZ | |
| `period_start` | TIMESTAMPTZ | |
| `period_end` | TIMESTAMPTZ | |

---

## Notification & Report Entities

### Notification

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `user_id` | UUID | FK → User |
| `type` | VARCHAR(50) | Module-specific event type |
| `severity` | ENUM | `info`, `warning`, `critical` |
| `title` | VARCHAR(255) | |
| `body` | TEXT | |
| `data` | JSONB | Deep link context, entity references |
| `channels_sent` | TEXT[] | `in_app`, `push`, `email`, `sms` |
| `read_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

### NotificationPreference

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → User |
| `event_type` | VARCHAR(50) | |
| `channel` | ENUM | `in_app`, `push`, `email`, `sms` |
| `enabled` | BOOLEAN | |
| `quiet_hours_start` | TIME | |
| `quiet_hours_end` | TIME | |

### Report

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `created_by` | UUID | FK → User |
| `name` | VARCHAR(255) | |
| `type` | ENUM | `standard`, `custom` |
| `template_slug` | VARCHAR(100) | For standard reports |
| `config` | JSONB | Custom report definition |
| `schedule` | JSONB | Cron expression, recipients |
| `last_run_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### ReportRun

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `report_id` | UUID | FK → Report |
| `organization_id` | UUID | FK → Organization |
| `status` | ENUM | `running`, `completed`, `failed` |
| `output_url` | TEXT | Generated file URL |
| `parameters` | JSONB | Filters applied |
| `started_at` | TIMESTAMPTZ | |
| `completed_at` | TIMESTAMPTZ | |

---

## AI Entities

### AIConversation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `user_id` | UUID | FK → User |
| `title` | VARCHAR(255) | Auto-generated summary |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### AIMessage

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | FK → AIConversation |
| `role` | ENUM | `user`, `assistant`, `system` |
| `content` | TEXT | |
| `metadata` | JSONB | Sources, actions taken, token count |
| `feedback` | ENUM | `positive`, `negative`, null |
| `created_at` | TIMESTAMPTZ | |

### AIPrediction

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `prediction_type` | ENUM | `yield`, `disease`, `irrigation`, `market_price`, `weather_risk` |
| `entity_type` | VARCHAR(50) | `field`, `crop_plan`, `farm`, `listing` |
| `entity_id` | UUID | Polymorphic FK |
| `model_version` | VARCHAR(50) | |
| `prediction` | JSONB | Structured prediction output |
| `confidence` | DECIMAL(5,4) | |
| `valid_from` | TIMESTAMPTZ | |
| `valid_until` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

---

## Audit & System Entities

### AuditLog

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `user_id` | UUID | FK → User |
| `action` | VARCHAR(50) | `create`, `update`, `delete`, `login`, `export` |
| `entity_type` | VARCHAR(50) | Table/entity name |
| `entity_id` | UUID | |
| `changes` | JSONB | Before/after diff |
| `ip_address` | INET | |
| `user_agent` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

*Append-only; never updated or deleted.*

### FileUpload

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `uploaded_by` | UUID | FK → User |
| `filename` | VARCHAR(255) | |
| `mime_type` | VARCHAR(100) | |
| `size_bytes` | BIGINT | |
| `storage_url` | TEXT | |
| `entity_type` | VARCHAR(50) | Polymorphic reference |
| `entity_id` | UUID | |
| `created_at` | TIMESTAMPTZ | |

### APIKey

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK → Organization |
| `created_by` | UUID | FK → User |
| `name` | VARCHAR(100) | |
| `key_hash` | VARCHAR(255) | Hashed API key |
| `prefix` | VARCHAR(10) | First chars for identification |
| `permissions` | JSONB | Scoped permissions |
| `last_used_at` | TIMESTAMPTZ | |
| `expires_at` | TIMESTAMPTZ | |
| `revoked_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

---

## Key Relationships Summary

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| Organization → User | 1:N | Users belong to one org |
| Organization → Farm | 1:N | Org owns multiple farms |
| Farm → Field | 1:N | Farm contains fields |
| Field → Zone | 1:N | Field subdivided into zones |
| Field → CropPlan | 1:N | Multiple seasons per field |
| CropPlan → CropTask | 1:N | Plan generates tasks |
| CropPlan → HarvestRecord | 1:1 | One harvest per plan |
| CropPlan → InputApplication | 1:N | Multiple input applications |
| Observation → ObservationPhoto | 1:N | Multiple photos per observation |
| InventoryItem → StockLevel | 1:N | Stock across warehouses |
| InventoryItem → StockMovement | 1:N | Movement history |
| MarketplaceListing → Offer | 1:N | Multiple offers per listing |
| Offer → Order | 1:1 | Accepted offer becomes order |
| CRMAccount → CRMContact | 1:N | Multiple contacts per account |
| CRMAccount → CRMDeal | 1:N | Multiple deals per account |
| Subscription → Invoice | 1:N | Recurring invoices |
| Invoice → Payment | 1:N | Payment attempts |

---

## Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| All tenant tables | `(organization_id)` | Tenant isolation queries |
| Field | `(farm_id)`, GIST `(boundary)` | Spatial queries |
| CropPlan | `(field_id, season)`, `(status)` | Season lookups |
| CropTask | `(assigned_to, status, due_date)` | Task board queries |
| SensorReading | `(device_id, recorded_at DESC)` | Time-series retrieval |
| StockLevel | `(item_id, warehouse_id)` UNIQUE | Stock lookups |
| MarketplaceListing | `(status, crop_name)`, `(organization_id)` | Browse/search |
| Notification | `(user_id, read_at, created_at DESC)` | Unread feed |
| AuditLog | `(organization_id, created_at DESC)` | Audit queries |
| WeatherForecast | `(farm_id, forecast_time)` | Forecast retrieval |

---

## Scaling Considerations

| Phase | Strategy |
|-------|----------|
| **Launch (<1K orgs)** | Single PostgreSQL instance with read replica |
| **Growth (1K–50K orgs)** | Table partitioning (SensorReading, AuditLog); connection pooling |
| **Scale (50K+ orgs)** | Regional database shards by `region_code`; CQRS for reports |
| **Global** | Multi-region active-active with conflict resolution; edge caching |

---

*Document owner: Product Architecture / Engineering*  
*Last updated: June 2026*  
*Status: Approved foundation*
