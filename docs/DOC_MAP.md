# Document map

Where each kind of truth lives. All specs are in the [gigshive_doc](https://github.com/cmrade488-blip/gigshive_doc) repository.

| Need | Document | Location |
|---|---|---|
| Start here | START_HERE | https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/START_HERE.md |
| Frontend architecture, standards, module specs | Frontend Engineering Blueprint v1.1 | https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md |
| Types, enums, cache keys, routes, state machines | Frontend Data and State Design v1.1 | https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Data_and_State_Design_v1_1.md |
| Slices, tasks, acceptance, Definition of Done | Frontend MVP Scope and Implementation Plan v1.1 | https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_MVP_Scope_Implementation_Plan_v1_1.md |
| API behaviour, business rules (BR-nn), enumerations | Backend Engineering Blueprint v1.1 | https://github.com/cmrade488-blip/gigshive_doc/tree/main/docs/backend |
| Frontend/backend alignment and open requests | ALIGNMENT_FRONTEND_BACKEND | https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/ALIGNMENT_FRONTEND_BACKEND.md |
| Brand tokens, logo, icons | Brand kit | https://github.com/cmrade488-blip/gigshive_doc/tree/main/brand |
| Public page UI designs | Public-site design | https://github.com/cmrade488-blip/gigshive_doc/tree/main/design/public-site |

## Precedence when documents disagree

1. Backend documents: API behaviour, business rules, enumerations.
2. Frontend Data and State Design: client data modelling.
3. Frontend Engineering Blueprint: frontend architecture and standards.
4. Frontend MVP Plan: frontend scope, order and priority.

The generated OpenAPI types are authoritative for response shapes. The earlier Catalyst V2 documents (docs/archive/catalyst-v2 in gigshive_doc) are out of date; ignore them.

## Where decisions are recorded

- Planning defaults and open items: Blueprint section 16 (FOI-nn) and MVP Plan section 13.2.
- Decisions made in this repository: [docs/adr/](adr/).
- Task status: [docs/tasks/TASKS.md](tasks/TASKS.md).
