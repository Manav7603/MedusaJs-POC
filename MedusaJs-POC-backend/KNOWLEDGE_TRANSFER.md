# Telecom BSS Implementation - Complete Knowledge Transfer Document

**Project**: MedusaJS Telecom Business Support System (BSS)  
**Date**: January 2026  
**Author**: Development Team  
**Purpose**: Comprehensive knowledge transfer for team onboarding and stakeholder review

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Implemented Features](#implemented-features)
5. [Data Models](#data-models)
6. [Workflows & Business Logic](#workflows--business-logic)
7. [API Endpoints](#api-endpoints)
8. [Testing & Verification](#testing--verification)
9. [Deployment & Operations](#deployment--operations)
10. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

### What We Built
A complete **Telecom Business Support System (BSS)** built on MedusaJS framework that handles:
- **Subscription Management**: Prepaid and postpaid telecom subscriptions
- **Phone Number Provisioning**: MSISDN allocation and lifecycle management
- **Billing & Renewals**: Automated recurring billing for prepaid/postpaid plans
- **Usage Tracking**: Real-time data and voice usage monitoring with automatic barring
- **Product Catalog**: Devices (smartphones, accessories) and telecom plans
- **Customer Portal APIs**: Number validation, recharge flows

### Business Value
- **Automated Operations**: Reduces manual intervention in subscription lifecycle
- **Real-time Monitoring**: Tracks usage and prevents quota overages
- **Scalable Architecture**: Built on MedusaJS framework for enterprise scale
- **Multi-currency Support**: Handles INR and USD pricing
- **Flexible Plans**: Supports both prepaid and postpaid business models

---

## 2. System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                         │
│  Next.js Storefront + React Components                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API Layer                              │
│  Store API (Public) + Admin API (Protected)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                MedusaJS Framework                        │
│  Workflows • Events • Jobs • Modules                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Custom Telecom Module                       │
│  Subscriptions • MSISDN • Plans • Usage                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│  PostgreSQL (Data) + Redis (Jobs/Events)                │
└─────────────────────────────────────────────────────────┘
```

### Key Technologies
- **Backend**: MedusaJS v2, Node.js, TypeScript
- **Database**: PostgreSQL (primary), Redis (caching/jobs)
- **ORM**: MikroORM
- **Workflows**: MedusaJS Workflows SDK
- **Frontend**: Next.js 14+, React Server Actions
- **API**: RESTful HTTP endpoints

---

## 3. Core Components

### 3.1 Telecom Core Module

**Location**: `src/modules/telecom-core/`

**Purpose**: Custom MedusaJS module that extends the framework with telecom-specific entities and business logic.

#### Entities (Data Models)

1. **Subscription** (`models/subscription.ts`)
   - Represents a customer's telecom subscription
   - Links customer → plan → phone number
   - Tracks status (pending, active, suspended, barred, cancelled)
   - Stores billing dates and renewal information

2. **MsisdnInventory** (`models/msisdn-inventory.ts`)
   - Phone number inventory management
   - Status: available, reserved, allocated, suspended
   - Tracks assignment to subscriptions

3. **PlanConfiguration** (`models/plan-configuration.ts`)
   - Defines plan quotas and limits
   - Data quota (MB), voice quota (minutes)
   - Contract duration, 5G support
   - Links to product catalog

4. **UsageCounter** (`models/usage-counter.ts`)
   - Tracks monthly usage per subscription
   - Data used (MB), voice used (minutes)
   - Period tracking (month/year)

#### Service Layer

**File**: `src/modules/telecom-core/service.ts`

Provides CRUD operations for all telecom entities:
```typescript
class TelecomCoreModuleService {
  // Subscriptions
  createSubscriptions(data)
  listSubscriptions(filters)
  updateSubscriptions(id, data)
  
  // MSISDN Management
  createMsisdnInventory(data)
  listMsisdnInventory(filters)
  
  // Plan Configurations
  createPlanConfigurations(data)
  listPlanConfigurations(filters)
  
  // Usage Tracking
  createUsageCounters(data)
  listUsageCounters(filters)
}
```

---

### 3.2 Workflows

**Location**: `src/workflows/telecom/`

Workflows orchestrate complex business processes with built-in rollback support.

#### A. Subscription Provisioning Workflow

**File**: `provision-subscription.ts`

**Purpose**: End-to-end subscription creation from order completion

**Steps**:
1. **Extract Plan Items**: Find plan products in order
2. **Allocate MSISDN**: Reserve phone number from inventory
3. **Create Subscription**: Link customer + plan + number
4. **Activate Inventory**: Mark MSISDN as allocated
5. **Create Usage Counter**: Initialize tracking for current month
6. **Update Subscription**: Set to "active" status

**Trigger**: Automatically runs when order is placed (via event subscriber)

**Input**:
```typescript
{
  order_id: string
  customer_id: string
}
```

**Output**:
```typescript
{
  subscription_id: string
  msisdn: string
  status: "active"
}
```

**Rollback**: If any step fails, all previous steps are automatically reversed

---

#### B. Renewal Processing Workflow

**File**: `process-renewal.ts`

**Purpose**: Handle subscription renewals (prepaid and postpaid)

**Logic Flow**:
```
Check Subscription Type
        ↓
    ┌───────┴───────┐
    ↓               ↓
PREPAID         POSTPAID
    ↓               ↓
Extend          Generate
28 days         Invoice
    ↓               ↓
Create          Send to
Usage           Billing
Counter         System
    ↓               ↓
Set Status      Set Status
"active"        "active"
```

**Prepaid Renewal**:
- Extends `next_renewal_date` by validity period (28/84/365 days)
- Creates new `UsageCounter` for the period
- Resets usage to zero

**Postpaid Renewal**:
- Generates invoice for previous month
- Sends to billing system
- Continues service (no interruption)

**Scheduled Execution**: Runs daily via cron job

---

### 3.3 Scheduled Jobs

**Location**: `src/jobs/`

#### Daily Renewals Job

**File**: `process-daily-renewals.ts`

**Schedule**: Runs every day at midnight

**Logic**:
1. Find subscriptions where `next_renewal_date` = today
2. For each subscription, trigger renewal workflow
3. Log results and errors

**Configuration**:
```typescript
{
  name: "process-daily-renewals",
  schedule: "0 0 * * *", // Midnight daily
  data: {}
}
```

---

### 3.4 Event Subscribers

**Location**: `src/subscribers/`

#### Order Placed Subscriber

**File**: `order-placed.ts`

**Trigger**: When order status changes to "placed"

**Action**: Initiates provisioning workflow

**Flow**:
```
Order Placed Event
      ↓
Check if order contains plan products
      ↓
Trigger provision-subscription workflow
      ↓
Customer gets active subscription + phone number
```

---

## 4. Implemented Features

### 4.1 Subscription Provisioning

**What It Does**: Automatically provisions telecom subscriptions when customers purchase plans

**User Journey**:
1. Customer adds device + plan to cart
2. Completes checkout
3. System automatically:
   - Allocates phone number
   - Creates subscription
   - Activates service
   - Sends confirmation

**Technical Flow**:
```
Cart → Order → Event → Workflow → Subscription → Active Service
```

**Files**:
- Workflow: `src/workflows/telecom/provision-subscription.ts`
- Subscriber: `src/subscribers/order-placed.ts`
- Test: `src/scripts/test-provisioning.ts`

---

### 4.2 Recurring Billing Engine

**What It Does**: Automatically renews subscriptions and handles billing

**Prepaid Flow**:
```
Day 1: Activation (₹299 paid)
Day 28: Auto-renewal
  → Extend validity to Day 56
  → Reset usage counters
  → Status: Active
```

**Postpaid Flow**:
```
Month 1: Service active
End of Month 1: Generate invoice
  → Send bill (₹499)
  → Continue service
  → Customer pays within grace period
```

**Files**:
- Workflow: `src/workflows/telecom/process-renewal.ts`
- Job: `src/jobs/process-daily-renewals.ts`
- Test: `src/scripts/test-renewal-workflow.ts`

---

### 4.3 Data Usage Tracking

**What It Does**: Monitors real-time usage and enforces quotas

**Features**:
- **Real-time Updates**: API endpoint receives usage from network
- **Quota Enforcement**: Automatically bars service at 100% usage
- **Monthly Tracking**: Separate counters for each billing period
- **Event Emission**: Triggers alerts when limits reached

**API Endpoint**: `POST /admin/telecom/hooks/usage-update`

**Request**:
```json
{
  "msisdn": "9876543210",
  "data_used_mb": 1024,
  "voice_used_min": 120
}
```

**Logic**:
1. Find subscription by MSISDN
2. Get/create usage counter for current month
3. Increment usage values
4. Check against plan quota
5. If exceeded → set status to "barred"
6. Emit `telecom.usage.limit_reached` event

**Files**:
- API: `src/api/admin/telecom/hooks/usage-update/route.ts`
- Test: `src/scripts/test-usage-tracking.ts`

---

### 4.4 Product Catalog

**What It Does**: Manages devices, accessories, and telecom plans

**Categories**:
1. **Smartphones**: iPhone 15, Samsung Galaxy S24
2. **Accessories**: AirPods Pro, Screen Protectors, Chargers
3. **Plans**: Prepaid and postpaid telecom plans

**Products Created**:

| Product | Price | Category | Metadata |
|---------|-------|----------|----------|
| iPhone 15 | $799-$899 | Smartphones | Brand, 5G, Screen size |
| Samsung Galaxy S24 | $799-$859 | Smartphones | Brand, 5G, AI features |
| AirPods Pro | $249 | Accessories | ANC, Spatial Audio |
| Screen Protector | $9.99 | Accessories | 9H hardness |
| Hero 299 | ₹299 | Plans | 28d, 1.5GB/day |
| Hero 719 | ₹719 | Plans | 84d, 2GB/day |

**Metadata Structure**:
```typescript
// Device Metadata
{
  brand: "Apple",
  model: "iPhone 15",
  connectivity: "5G",
  screen_size: "6.1 inches"
}

// Plan Metadata
{
  telecom_type: "plan",
  plan_type: "prepaid",
  validity_days: "28",
  daily_data_gb: "1.5",
  total_data_gb: "42",
  voice: "Unlimited",
  sms: "100/day"
}
```

**Files**:
- Device Catalog: `src/scripts/seed-telecom-catalog.ts`
- Indian Plans: `src/scripts/seed-indian-plans.ts`

---

### 4.5 Bundle Cart (Phone + Plan)

**What It Does**: Allows customers to purchase device + plan together

**Server Action**: `addToCartWithPlan()`

**Input**:
```typescript
{
  device_variant_id: "variant_iphone15_black",
  plan_variant_id: "variant_hero299",
  country_code: "IN"
}
```

**Logic**:
1. Get or create cart
2. Add device line item with metadata: `{ linked_plan: plan_id }`
3. Add plan line item with metadata: `{ linked_device: device_id, allocated_number: "PENDING" }`
4. Return cart

**Metadata Linking**:
```json
{
  "items": [
    {
      "variant_id": "device_variant",
      "metadata": {
        "linked_plan": "plan_variant_id",
        "bundle_type": "device"
      }
    },
    {
      "variant_id": "plan_variant",
      "metadata": {
        "linked_device": "device_variant_id",
        "allocated_number": "PENDING_SELECTION",
        "bundle_type": "plan"
      }
    }
  ]
}
```

**React Component**: `<BuyBundleButton />`

**Files**:
- Server Action: `storefront-nextjs/src/actions/cart.ts`
- Component: `storefront-nextjs/src/components/buy-bundle-button.tsx`

---

### 4.6 Number Validation API

**What It Does**: Validates if a phone number is your customer (for recharge)

**Endpoint**: `GET /store/telecom/validate-number/:msisdn`

**Use Case**: Recharge portal - verify number before showing plans

**Response**:
```json
// Valid customer
{
  "valid": true,
  "message": "Number verified. You can proceed with recharge."
}

// Not your customer
{
  "valid": false,
  "message": "This number is not registered with our network"
}
```

**Privacy**: Does NOT expose plan details, usage, or billing info

**Files**:
- API: `src/api/store/telecom/validate-number/[msisdn]/route.ts`
- Test: `src/scripts/test-number-validation.ts`

---

## 5. Data Models

### Entity Relationship Diagram

```
┌─────────────┐
│  Customer   │
│ (Medusa)    │
└──────┬──────┘
       │
       │ 1:N
       ↓
┌─────────────────┐      ┌──────────────────┐
│  Subscription   │──────│ PlanConfiguration│
│                 │ N:1  │                  │
│ - customer_id   │      │ - product_id     │
│ - msisdn_id     │      │ - data_quota_mb  │
│ - plan_config_id│      │ - voice_quota_min│
│ - status        │      │ - type           │
│ - next_renewal  │      └──────────────────┘
└────────┬────────┘
         │
         │ 1:1
         ↓
┌──────────────────┐
│ MsisdnInventory  │
│                  │
│ - msisdn         │
│ - status         │
│ - subscription_id│
└────────┬─────────┘
         │
         │ 1:N
         ↓
┌──────────────────┐
│  UsageCounter    │
│                  │
│ - subscription_id│
│ - data_used_mb   │
│ - voice_used_min │
│ - period_month   │
│ - period_year    │
└──────────────────┘
```

### Subscription Lifecycle

```
┌──────────┐
│ PENDING  │ ← Order placed, not yet provisioned
└────┬─────┘
     │
     ↓ Provisioning Workflow
┌──────────┐
│ ACTIVE   │ ← Service active, can make calls/use data
└────┬─────┘
     │
     ├──→ Usage exceeds quota
     │    ┌──────────┐
     │    │ BARRED   │ ← Service suspended, needs recharge
     │    └────┬─────┘
     │         │
     │         ↓ Recharge
     │    ┌──────────┐
     │    │ ACTIVE   │
     │    └──────────┘
     │
     ├──→ Payment fails
     │    ┌──────────┐
     │    │SUSPENDED │ ← Grace period, service limited
     │    └────┬─────┘
     │         │
     │         ↓ Payment received
     │    ┌──────────┐
     │    │ ACTIVE   │
     │    └──────────┘
     │
     └──→ Customer cancels
          ┌──────────┐
          │CANCELLED │ ← Subscription terminated
          └──────────┘
```

---

## 6. Workflows & Business Logic

### Workflow Architecture

MedusaJS workflows provide:
- **Atomic Operations**: All steps succeed or all rollback
- **Retry Logic**: Automatic retries on transient failures
- **Compensation**: Undo actions if workflow fails
- **Observability**: Built-in logging and monitoring

### Provisioning Workflow Deep Dive

**File**: `src/workflows/telecom/provision-subscription.ts`

**Step-by-Step Execution**:

```typescript
// Step 1: Extract Plan Items
const planItems = order.items.filter(
  item => item.metadata?.bundle_type === "plan"
)

// Step 2: Allocate MSISDN
const msisdn = await findAvailableMsisdn()
await reserveMsisdn(msisdn.id)

// Step 3: Create Subscription
const subscription = await createSubscription({
  customer_id: order.customer_id,
  msisdn_id: msisdn.id,
  plan_config_id: planItem.metadata.plan_config_id,
  status: "pending"
})

// Step 4: Activate MSISDN
await updateMsisdn(msisdn.id, {
  status: "allocated",
  subscription_id: subscription.id
})

// Step 5: Create Usage Counter
await createUsageCounter({
  subscription_id: subscription.id,
  period_month: currentMonth,
  period_year: currentYear,
  data_used_mb: 0,
  voice_used_min: 0
})

// Step 6: Activate Subscription
await updateSubscription(subscription.id, {
  status: "active",
  activated_at: new Date()
})
```

**Rollback Example**:
If Step 5 fails:
- Step 4 rollback: Set MSISDN back to "available"
- Step 3 rollback: Delete subscription
- Step 2 rollback: Release MSISDN reservation

---

### Renewal Workflow Deep Dive

**File**: `src/workflows/telecom/process-renewal.ts`

**Conditional Logic**:

```typescript
// Use transform for branching
const renewalAction = transform({ subscription }, (data) => {
  if (data.subscription.plan_type === "prepaid") {
    return "extend_validity"
  } else {
    return "generate_invoice"
  }
})

// Execute based on condition
when(renewalAction, {
  matches: "extend_validity",
  then: () => {
    // Prepaid logic
    const newRenewalDate = addDays(
      subscription.next_renewal_date,
      validityDays
    )
    
    updateSubscription({
      next_renewal_date: newRenewalDate,
      status: "active"
    })
    
    createUsageCounter({
      subscription_id: subscription.id,
      period_month: nextMonth,
      period_year: nextYear
    })
  }
})

when(renewalAction, {
  matches: "generate_invoice",
  then: () => {
    // Postpaid logic
    createInvoice({
      customer_id: subscription.customer_id,
      amount: monthlyCharge,
      due_date: addDays(today, 15)
    })
    
    updateSubscription({
      status: "active",
      last_bill_date: today
    })
  }
})
```

---

## 7. API Endpoints

### Admin APIs (Protected)

#### 1. Usage Update Hook
```
POST /admin/telecom/hooks/usage-update
```

**Purpose**: Receive usage updates from network infrastructure

**Authentication**: Admin API key required

**Request**:
```json
{
  "msisdn": "9876543210",
  "data_used_mb": 1024,
  "voice_used_min": 120
}
```

**Response**:
```json
{
  "success": true,
  "subscription_id": "sub_123",
  "usage_counter_id": "uc_456",
  "status": "active",
  "quota_exceeded": false
}
```

**Business Logic**:
1. Find subscription by MSISDN
2. Get plan configuration for quota
3. Find/create usage counter for current month
4. Increment usage values
5. Check if quota exceeded:
   - If data_used >= data_quota → set status to "barred"
   - Emit event: `telecom.usage.limit_reached`
6. Return updated status

---

### Store APIs (Public)

#### 1. Validate Number
```
GET /store/telecom/validate-number/:msisdn
```

**Purpose**: Check if number is your customer (for recharge)

**Authentication**: None (public)

**Response**:
```json
{
  "valid": true,
  "message": "Number verified. You can proceed with recharge."
}
```

**Use Cases**:
- Recharge portals
- Number portability checks
- Customer verification

---

## 8. Testing & Verification

### Test Scripts

All test scripts located in `src/scripts/`

#### 1. Provisioning Test
```bash
npx medusa exec ./src/scripts/test-provisioning.ts
```

**What It Tests**:
- Creates test customer
- Creates test order with plan
- Triggers provisioning workflow
- Verifies subscription created
- Checks MSISDN allocated
- Validates usage counter initialized

---

#### 2. Renewal Test
```bash
npx medusa exec ./src/scripts/test-renewal-workflow.ts
```

**What It Tests**:
- Creates subscription with past renewal date
- Triggers renewal workflow
- Verifies prepaid: validity extended
- Verifies postpaid: invoice generated
- Checks usage counter created for new period

---

#### 3. Usage Tracking Test
```bash
npx medusa exec ./src/scripts/test-usage-tracking.ts
```

**What It Tests**:
- Creates subscription
- Sends usage updates via API
- Verifies usage increments
- Tests quota enforcement
- Checks automatic barring at 100%

---

#### 4. Number Validation Test
```bash
npx medusa exec ./src/scripts/test-number-validation.ts
```

**What It Tests**:
- Validates existing customer number
- Tests non-existent number
- Verifies response format

---

### Manual Testing Checklist

**End-to-End Flow**:
1. ✅ Seed catalog: `npx medusa exec ./src/scripts/seed-telecom-catalog.ts`
2. ✅ Seed plans: `npx medusa exec ./src/scripts/seed-indian-plans.ts`
3. ✅ Create customer via Admin UI
4. ✅ Add device + plan to cart
5. ✅ Complete checkout
6. ✅ Verify subscription created (check database)
7. ✅ Verify MSISDN allocated
8. ✅ Send usage update via API
9. ✅ Check usage counter updated
10. ✅ Test renewal (manually update renewal date to today)

---

## 9. Deployment & Operations

### Environment Setup

**Required Environment Variables**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/medusa

# Redis (for jobs and events)
REDIS_URL=redis://localhost:6379

# Admin
ADMIN_CORS=http://localhost:7001

# Store
STORE_CORS=http://localhost:8000
```

### Database Migrations

**Run Migrations**:
```bash
npx medusa db:migrate
```

**Generated Tables**:
- `subscription`
- `msisdn_inventory`
- `plan_configuration`
- `usage_counter`

### Starting the Server

**Development**:
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm run start
```

### Monitoring

**Key Metrics to Monitor**:
1. **Provisioning Success Rate**: % of orders successfully provisioned
2. **Renewal Success Rate**: % of renewals processed without errors
3. **Usage Update Latency**: Time from network event to database update
4. **MSISDN Availability**: Number of available phone numbers
5. **Barred Subscriptions**: Count of subscriptions hitting quota

**Logging**:
- All workflows log to console with `[Workflow Name]` prefix
- API endpoints log requests and responses
- Errors include stack traces

---

## 10. Future Enhancements

### Planned Features

1. **Number Portability**
   - Port-in workflow for existing numbers
   - Port-out process
   - Carrier integration

2. **Family Plans**
   - Multiple subscriptions under one account
   - Shared data pools
   - Primary/secondary numbers

3. **Add-on Management**
   - International roaming packs
   - Data boosters
   - Caller tune subscriptions

4. **Advanced Billing**
   - Proration for mid-cycle changes
   - Tax calculation
   - Invoice generation (PDF)

5. **Customer Self-Service**
   - Usage dashboard
   - Plan upgrade/downgrade
   - Number selection during checkout

6. **Analytics & Reporting**
   - Revenue reports
   - Usage analytics
   - Customer churn prediction

---

## Appendix A: File Structure

```
src/
├── modules/
│   └── telecom-core/
│       ├── models/
│       │   ├── subscription.ts
│       │   ├── msisdn-inventory.ts
│       │   ├── plan-configuration.ts
│       │   └── usage-counter.ts
│       ├── service.ts
│       └── index.ts
│
├── workflows/
│   └── telecom/
│       ├── provision-subscription.ts
│       ├── process-renewal.ts
│       └── steps/
│           ├── allocate-msisdn.ts
│           ├── create-subscription.ts
│           └── activate-inventory.ts
│
├── jobs/
│   └── process-daily-renewals.ts
│
├── subscribers/
│   └── order-placed.ts
│
├── api/
│   ├── admin/
│   │   └── telecom/
│   │       └── hooks/
│   │           └── usage-update/
│   │               └── route.ts
│   └── store/
│       └── telecom/
│           └── validate-number/
│               └── [msisdn]/
│                   └── route.ts
│
└── scripts/
    ├── seed-telecom-catalog.ts
    ├── seed-indian-plans.ts
    ├── test-provisioning.ts
    ├── test-renewal-workflow.ts
    ├── test-usage-tracking.ts
    └── test-number-validation.ts
```

---

## Appendix B: Database Schema

### Subscription Table
```sql
CREATE TABLE subscription (
  id VARCHAR PRIMARY KEY,
  customer_id VARCHAR NOT NULL,
  msisdn_id VARCHAR,
  plan_config_id VARCHAR,
  status VARCHAR, -- pending, active, suspended, barred, cancelled
  activated_at TIMESTAMP,
  next_renewal_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### MSISDN Inventory Table
```sql
CREATE TABLE msisdn_inventory (
  id VARCHAR PRIMARY KEY,
  msisdn VARCHAR UNIQUE NOT NULL,
  status VARCHAR, -- available, reserved, allocated, suspended
  subscription_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Plan Configuration Table
```sql
CREATE TABLE plan_configuration (
  id VARCHAR PRIMARY KEY,
  product_id VARCHAR,
  type VARCHAR, -- prepaid, postpaid
  data_quota_mb INTEGER,
  voice_quota_min INTEGER,
  contract_months INTEGER,
  is_5g BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Usage Counter Table
```sql
CREATE TABLE usage_counter (
  id VARCHAR PRIMARY KEY,
  subscription_id VARCHAR NOT NULL,
  data_used_mb INTEGER DEFAULT 0,
  voice_used_min INTEGER DEFAULT 0,
  period_month INTEGER,
  period_year INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Appendix C: Quick Reference Commands

```bash
# Development
npm run dev                                    # Start dev server

# Database
npx medusa db:migrate                          # Run migrations
npx medusa db:seed                             # Seed core data

# Seeding
npx medusa exec ./src/scripts/seed-telecom-catalog.ts   # Seed devices
npx medusa exec ./src/scripts/seed-indian-plans.ts      # Seed plans

# Testing
npx medusa exec ./src/scripts/test-provisioning.ts      # Test provisioning
npx medusa exec ./src/scripts/test-renewal-workflow.ts  # Test renewals
npx medusa exec ./src/scripts/test-usage-tracking.ts    # Test usage
npx medusa exec ./src/scripts/test-number-validation.ts # Test validation

# API Testing
curl http://localhost:9000/store/telecom/validate-number/9876543210

curl -X POST http://localhost:9000/admin/telecom/hooks/usage-update \
  -H "Content-Type: application/json" \
  -d '{"msisdn":"9876543210","data_used_mb":1024,"voice_used_min":120}'
```

---

## Conclusion

This document provides a comprehensive overview of the Telecom BSS implementation. For questions or clarifications, please refer to:
- Code comments in source files
- MedusaJS documentation: https://docs.medusajs.com
- Test scripts for usage examples

**Document Version**: 1.0  
**Last Updated**: January 2026
