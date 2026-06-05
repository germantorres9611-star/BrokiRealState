---
name: Broki services data model
description: Two independent property management sub-services in localStorage
---

# Property Management Sub-services

Two separate localStorage keys, each a fully editable sub-service:

1. `broki_audiovisual_svc` → type `AudiovisualSubService` — video/photo production for property sales
2. `broki_brokerage_svc` → type `BrokerageSubService` — rental brokerage/management

Old key `broki_property_mgmt` is no longer used (legacy); `usePropertyMgmtService()` is an alias for `useAudiovisualService()` for backward compat.

**Why:** User requested two independent sub-services replacing the original single-service model, each with different fields and fully editable from admin.

**How to apply:** Admin Config page → "Servicios" tab has two forms. Each has its own `visible` toggle.
