```markdown
---
name: pm-estimation
description: Creates project estimation from customer requirements. Use when user says "estimate project", "create estimation", "estimate effort", "project quote", or when PM/TL needs cost/time estimation. Supports PRD, Figma, wireframes, and requirement docs.
---

# Project Estimation

Create comprehensive project estimation from customer requirements for quotation, resource planning, and project proposals.

## 🛑 Global Directive: No Ad-hoc Scripts
**DO NOT CREATE** temporary or ad-hoc scripts (e.g. Python, Bash, Node.js) and ask the user to run them in order to complete a task. If a requested tool or capability is not supported by your current environment or tools, **just tell the user directly** what you cannot do, rather than attempting to script a workaround.

## ⚠️ Language Directive

**All estimation outputs MUST be written in Vietnamese (Tiếng Việt).**

- Feature names: Vietnamese
- Descriptions: Vietnamese  
- Notes and assumptions: Vietnamese
- Technical terms: Can keep original English terms

---

## What is Project Estimation?

```
Estimation = Analyze requirements → Size features → Apply factors → Calculate effort/cost

Customer Requirements → Feature Breakdown → Effort Estimation → Cost Calculation → Proposal
                         (size & complexity)     (man-days)        (cost + buffer)
```

### Estimation vs WBS

| Aspect | Estimation | WBS |
|--------|------------|-----|
| Purpose | Quote project, resource planning | Task management, sprint planning |
| Timing | Before project starts | After project approved |
| Detail level | Feature/module level | Task level (0.5-5 days) |
| Output | Cost proposal, timeline | Task assignments |
| Accuracy | ±20-30% | ±10-15% |

---

## Supported Input Types

| Type | Extensions | What to Extract |
|------|------------|-----------------|
| PRD/BRD | .pdf, .docx | Features, requirements, scope |
| Figma/Wireframes | .figma, .pdf, .png | Screens, UI complexity |
| User Stories | .xlsx, .csv | Stories, acceptance criteria |
| Meeting Notes | .md, .txt | Requirements, decisions |
| API Spec | .yaml, .json | Endpoints, integrations |
| Existing Specs | spec/*.md | Pre-analyzed requirements |

---

## Estimation Process

### Step 1: Gather Requirements

```markdown
Ask the user:
1. Where are the requirement documents?
2. Are there Figma/design files?
3. Project type? (Web app, Mobile app, API, Full-stack...)
4. Tech stack constraints?
5. Timeline expectations?
6. Quality requirements? (MVP vs Production-ready)
```

### Step 2: Feature Discovery

Identify all features from source materials:

```markdown
## Feature Discovery Checklist

### From Documents
- [ ] Explicit feature list in PRD
- [ ] User stories
- [ ] Acceptance criteria
- [ ] Business rules

### From Designs
- [ ] Screen count
- [ ] Form complexity
- [ ] Navigation flows
- [ ] Special UI components

### Implied Features (Often missed!)
- [ ] Authentication & Authorization
- [ ] Error handling & Validation
- [ ] Notifications (email, push)
- [ ] Admin/CMS features
- [ ] Reports & Analytics
- [ ] Data import/export
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Multi-language support
```

### Step 3: Size Each Feature

Use T-shirt sizing for initial estimation:

| Size | Description | Man-days (Base) | Example |
|------|-------------|-----------------|---------|
| XS | Simple CRUD, 1 screen | 1-2d | Static page, simple list |
| S | Standard feature, 2-3 screens | 3-5d | User profile, simple form |
| M | Medium complexity, 3-5 screens | 5-10d | Product catalog, search |
| L | Complex feature, 5-10 screens | 10-20d | Checkout flow, dashboard |
| XL | Very complex, 10+ screens | 20-40d | Admin system, reporting |

### Step 4: Apply Complexity Factors

Adjust base estimation with factors:

| Factor | Impact | Multiplier |
|--------|--------|------------|
| **Tech Stack** | | |
| - Familiar stack | Lower effort | 1.0x |
| - New technology | Learning curve | 1.2-1.5x |
| - Legacy integration | Complexity | 1.3-1.5x |
| **Requirements** | | |
| - Clear, documented | Baseline | 1.0x |
| - Vague, changing | Risk | 1.3-1.5x |
| - Complex business rules | Logic | 1.2-1.4x |
| **Quality** | | |
| - MVP/POC | Minimal | 0.7-0.8x |
| - Production-ready | Standard | 1.0x |
| - Enterprise-grade | High standards | 1.2-1.5x |
| **Integration** | | |
| - No integration | Baseline | 1.0x |
| - 1-2 simple APIs | Minor | 1.1x |
| - Multiple/complex APIs | Significant | 1.3-1.5x |

### Step 5: Calculate Effort by Role

Distribute effort across roles:

| Project Type | Backend | Frontend | QC | DevOps |
|--------------|---------|----------|-----|--------|
| Web App (Full) | 35-40% | 35-40% | 15-20% | 5-10% |
| API Only | 60-70% | 0% | 20-25% | 10-15% |
| Mobile App | 30-35% | 40-45% | 15-20% | 5-10% |
| Admin/CMS | 30-35% | 40-45% | 15-20% | 5-10% |

### Step 6: Add Buffer & Management

```markdown
## Buffer Guidelines

| Category | Buffer % | When to Apply |
|----------|----------|---------------|
| Requirements Risk | 10-20% | Vague/incomplete requirements |
| Technical Risk | 10-15% | New tech, complex integration |
| Communication | 5-10% | Customer timezone, language |
| PM/Lead overhead | 10-15% | Project coordination |
| **Recommended Total** | **20-30%** | Standard projects |
```

### Step 7: Generate Estimation Document

---

## Output Format

### Estimation Document Structure

```markdown
# Project Estimation: {Project Name}

## Thông tin dự án
- **Khách hàng:** [Customer name]
- **Ngày tạo:** [YYYY-MM-DD]
- **Phiên bản:** v1.0
- **Phạm vi:** [MVP / Full / Phase X]
- **Nguồn yêu cầu:** [List of input documents]

---

## Tổng quan Estimation

| Hạng mục | Giá trị |
|----------|---------|
| Tổng số tính năng | X features |
| Effort cơ bản | X man-days |
| Buffer (Y%) | X man-days |
| **Tổng Effort** | **X man-days** |
| Timeline ước tính | X weeks |

---

## Chi tiết Estimation theo Module

### Module 1: {Module Name}

| # | Tính năng | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|------|-----------|--------|------------|-------|
| 1 | Feature A | M | 8 | 1.2 | 10 | Complex validation |
| 2 | Feature B | S | 3 | 1.0 | 3 | Standard CRUD |
| | **Subtotal** | | **11** | | **13** | |

### Module 2: {Module Name}

| # | Tính năng | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|------|-----------|--------|------------|-------|
| 3 | Feature C | L | 15 | 1.3 | 20 | External API integration |
| | **Subtotal** | | **15** | | **20** | |

---

## Phân bổ theo Role

| Role | Man-days | % | Ghi chú |
|------|----------|---|---------|
| Backend Developer | X | 35% | API, Database, Business logic |
| Frontend Developer | X | 35% | UI/UX, Responsive |
| QC Engineer | X | 20% | Test cases, Testing |
| DevOps/Infra | X | 10% | Setup, CI/CD, Deployment |
| **Tổng** | **X** | 100% | |

---

## Timeline ước tính

| Phase | Thời gian | Deliverables |
|-------|-----------|--------------|
| Discovery & Setup | Week 1 | Environment, Architecture |
| Development Sprint 1-2 | Week 2-5 | Core features |
| Development Sprint 3 | Week 6-7 | Remaining features |
| QC & Bug Fixing | Week 8-9 | Testing, fixes |
| UAT & Go-live | Week 10 | Deployment |

---

## Giả định & Điều kiện

### Giả định (Assumptions)
1. Khách hàng phản hồi review trong vòng 2 ngày làm việc
2. Requirements không thay đổi đáng kể sau khi bắt đầu
3. Thiết kế UI được cung cấp hoàn chỉnh
4. [Other assumptions...]

### Điều kiện áp dụng
1. Estimation này có hiệu lực trong 30 ngày
2. Scope thay đổi > 20% cần re-estimate
3. [Other conditions...]

---

## Rủi ro & Mitigation

| # | Rủi ro | Mức độ | Mitigation |
|---|--------|--------|------------|
| 1 | Requirements chưa rõ ràng | High | Thêm discovery phase |
| 2 | Integration với hệ thống cũ | Medium | Buffer thêm 20% |
| 3 | [Other risks...] | | |

---

## Ngoài phạm vi (Out of Scope)

Những hạng mục sau KHÔNG bao gồm trong estimation này:
- [ ] Server/Infrastructure cost
- [ ] Third-party license fees
- [ ] Data migration từ hệ thống cũ
- [ ] Training cho end-users
- [ ] Maintenance sau go-live
- [ ] [Other items...]
```

---

## Screen-based Estimation (From Figma/Wireframes)

When estimating from designs:

### Screen Complexity Matrix

| Screen Type | Complexity | Base Effort | Examples |
|-------------|------------|-------------|----------|
| Static Page | XS | 0.5-1d | About, Terms, FAQ |
| Simple Form | S | 1-2d | Contact, Login |
| List + Search | S-M | 2-3d | Product list, User list |
| Detail Page | S-M | 1-2d | Product detail, Profile |
| Complex Form | M | 3-5d | Multi-step, Validation |
| Dashboard | M-L | 5-8d | Charts, widgets |
| CRUD Module | M | 5-8d | Full admin module |
| Wizard/Flow | L | 8-15d | Checkout, Onboarding |

### Screen Analysis Checklist

```markdown
For each screen, identify:
- [ ] Data sources (how many APIs?)
- [ ] Form fields & validation
- [ ] Actions/buttons
- [ ] State management needs
- [ ] Responsive requirements
- [ ] Animations/transitions
- [ ] Special components (charts, maps, editors)
```

---

## API Estimation Guide

| API Type | Base Effort | Examples |
|----------|-------------|----------|
| Simple CRUD | 1-2d per entity | User, Product, Category |
| CRUD + Business Logic | 2-4d per entity | Order, Payment |
| Complex Query | 2-3d | Report, Dashboard data |
| External Integration | 3-5d per service | Payment gateway, SMS |
| Real-time | 3-5d | WebSocket, Chat |
| File Upload/Process | 2-4d | Import, Export |

---

## Common Estimation Mistakes

### ❌ Frequently Underestimated

| Item | Why Missed | Add |
|------|-----------|-----|
| Authentication | "It's just login" | 3-5d |
| Error handling | Not in happy path | 20% |
| Validation | Frontend & Backend | 10-15% |
| Email/Notifications | Separate service | 2-5d |
| Admin features | Customer assumes included | 30-50% |
| Mobile responsive | "Make it work on mobile" | 20-30% |
| Search | "Simple search box" | 2-5d |
| Loading states | UX details | 5-10% |
| Edge cases | Not in requirements | 15-20% |

### ✅ Estimation Best Practices

1. **Always estimate full feature** (BE + FE + QC)
2. **Include hidden work**: Setup, documentation, deployment
3. **Ask clarifying questions** before estimating
4. **Use ranges** when uncertain (e.g., 10-15 days)
5. **Document assumptions** explicitly
6. **Review with team** before finalizing
7. **Compare with similar projects** for sanity check

---

## Templates

### Quick Estimation Template (For Small Projects)

```markdown
| # | Feature | Screens | Size | Effort (md) |
|---|---------|---------|------|-------------|
| 1 | Authentication | 3 | S | 5 |
| 2 | Dashboard | 1 | M | 8 |
| ... | ... | ... | ... | ... |
| | **Subtotal** | | | **X** |
| | Buffer (25%) | | | **Y** |
| | **Total** | | | **Z** |
```

### Detailed Estimation Template (For Large Projects)

See [references/estimation-template.md](references/estimation-template.md)

---

## Integration with Other Skills

| Skill | Relationship |
|-------|--------------|
| `pm-spec-creator` | Input: Extracted requirements |
| `pm-task-create` | Output: Use estimation as task input |

---

## File Output Location

```
project-management/
├── estimation/
│   ├── {project-name}-estimation-v1.md    # Estimation document
│   ├── {project-name}-estimation-v2.md    # Revision (if scope changes)
│   └── archive/                            # Previous versions
└── proposals/
    └── {project-name}-proposal.md          # Customer-facing proposal
```

---

## Completion Checklist

- [ ] All features from requirements identified?
- [ ] Design/Figma screens analyzed?
- [ ] Hidden features included? (Auth, Admin, Notifications...)
- [ ] Complexity factors applied?
- [ ] Role distribution realistic?
- [ ] Buffer added (20-30%)?
- [ ] Assumptions documented?
- [ ] Risks identified?
- [ ] Out-of-scope items listed?
- [ ] Reviewed with tech lead/team?

```
