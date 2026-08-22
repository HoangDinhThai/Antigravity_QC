# Estimation Factors Reference

Detailed guide on factors affecting estimation.

## 1. Technology Stack Factors

### Familiar vs New Technology

| Scenario | Factor | Notes |
|----------|--------|-------|
| Team has > 2 years experience | 1.0x | Baseline |
| Team has 1-2 years experience | 1.1x | Minor learning |
| Team has < 1 year experience | 1.2-1.3x | Learning curve |
| Completely new technology | 1.4-1.5x | Significant learning |

### Framework Complexity

| Framework | Web App | Mobile | Notes |
|-----------|---------|--------|-------|
| React/Vue/Angular | 1.0x | - | Standard |
| Next.js/Nuxt | 1.1x | - | SSR complexity |
| React Native | - | 1.0x | Cross-platform |
| Flutter | - | 1.1x | Different paradigm |
| Native iOS/Android | - | 1.5x | Two codebases |

### Database

| Type | Factor | When |
|------|--------|------|
| PostgreSQL/MySQL | 1.0x | Standard relational |
| MongoDB | 1.0x | Document DB (if team familiar) |
| Complex queries, triggers | 1.2x | Advanced DB features |
| Multiple databases | 1.3x | Microservices, CQRS |

---

## 2. Requirements Clarity Factors

### Documentation Quality

| Quality | Factor | Indicators |
|---------|--------|------------|
| Excellent | 0.9x | Complete PRD, Figma, user stories with AC |
| Good | 1.0x | PRD with basic wireframes |
| Fair | 1.2x | General requirements, missing details |
| Poor | 1.4x | Verbal requirements, no documentation |
| Vague | 1.5x+ | "Just make it work like competitor X" |

### Requirement Stability

| Stability | Factor | When |
|-----------|--------|------|
| Stable | 1.0x | Requirements finalized, signed off |
| Minor changes expected | 1.1x | Small UI tweaks possible |
| Changes likely | 1.3x | Customer undecided on some features |
| High volatility | 1.5x | Customer "figuring it out" |

---

## 3. Business Logic Complexity

### Calculation Rules

| Complexity | Factor | Examples |
|------------|--------|----------|
| Simple | 1.0x | Basic CRUD, no calculations |
| Moderate | 1.2x | Pricing rules, discounts |
| Complex | 1.4x | Tax calculations, multi-currency |
| Very Complex | 1.6x+ | Financial calculations, compliance |

### Workflow Complexity

| Type | Factor | Examples |
|------|--------|----------|
| Linear | 1.0x | Simple form submission |
| Branching | 1.2x | Approval workflows |
| Multi-party | 1.4x | Buyer-seller-admin flows |
| State machine | 1.5x | Order lifecycle, complex status |

---

## 4. Integration Factors

### External APIs

| Integration Type | Add Effort | Notes |
|------------------|-----------|-------|
| Well-documented REST API | 2-3d | Stripe, Twilio |
| Poorly documented API | 4-6d | Trial and error |
| Legacy SOAP/XML | 5-8d | Complex parsing |
| Real-time (WebSocket) | 4-6d | Connection management |
| OAuth2/SSO | 2-4d | Auth flow complexity |

### Third-party Services (Vietnam)

| Service | Typical Effort | Notes |
|---------|---------------|-------|
| VNPay | 4-6d | Good docs, sandbox available |
| MoMo | 4-6d | Similar to VNPay |
| ZaloPay | 3-5d | Simpler integration |
| Viettel/VNPT SMS | 2-3d | Basic API |
| Email (SendGrid/SES) | 1-2d | Well documented |
| Firebase Push | 2-3d | Good SDK |

---

## 5. Quality Level Factors

### MVP vs Production

| Level | Factor | Includes |
|-------|--------|----------|
| Prototype/POC | 0.6x | Happy path only, no error handling |
| MVP | 0.8x | Core features, basic error handling |
| Production | 1.0x | Full features, proper error handling |
| Enterprise | 1.3x | Audit logs, compliance, high availability |

### Testing Requirements

| Level | QC Factor | Coverage |
|-------|-----------|----------|
| Minimal | 10% | Smoke test only |
| Basic | 15% | Happy path testing |
| Standard | 20% | Happy path + edge cases |
| Comprehensive | 25% | Including load testing |
| Full automation | 30%+ | Unit + Integration + E2E |

---

## 6. Team Factors

### Team Experience with Project Domain

| Experience | Factor |
|------------|--------|
| Same domain, > 3 projects | 0.9x |
| Same domain, 1-2 projects | 1.0x |
| New domain, similar concepts | 1.1x |
| Completely new domain | 1.3x |

### Team Collaboration

| Factor | Impact |
|--------|--------|
| Co-located team | 1.0x |
| Same timezone remote | 1.05x |
| Different timezone (< 4hrs) | 1.1x |
| Different timezone (> 4hrs) | 1.2x |
| Language barrier | 1.1x additional |

---

## 7. UI/UX Factors

### Design Complexity

| Complexity | Factor | Examples |
|------------|--------|----------|
| Standard UI | 1.0x | Bootstrap/Material templates |
| Custom design | 1.2x | Custom components |
| Complex animations | 1.3x | Micro-interactions |
| Pixel-perfect | 1.3x | Designer reviews every detail |

### Responsive Requirements

| Level | Factor | Covers |
|-------|--------|--------|
| Desktop only | 0.8x | Single breakpoint |
| Desktop + Mobile | 1.0x | 2 breakpoints |
| Full responsive | 1.2x | All devices, orientations |
| PWA | 1.3x | Offline, installable |

---

## 8. Non-functional Requirements

### Performance

| Requirement | Additional Effort |
|-------------|-------------------|
| Standard (< 3s load) | 0 |
| Fast (< 1s load) | 10-15% |
| Real-time updates | 20-30% |
| High throughput | 15-25% |

### Security

| Level | Additional Effort |
|-------|-------------------|
| Basic (auth, HTTPS) | 0 |
| Moderate (input validation, rate limiting) | 10% |
| High (pen testing, security audit) | 20-30% |
| Compliance (PCI-DSS, GDPR) | 30-50% |

### Scalability

| Level | Additional Effort |
|-------|-------------------|
| Single server | 0 |
| Horizontal scaling ready | 10-15% |
| Multi-region | 20-30% |

---

## 9. Common Multipliers Quick Reference

### Small Project (< 30 man-days base)
- Buffer: +25-30%
- Typical total factor: 1.3-1.5x

### Medium Project (30-100 man-days base)
- Buffer: +20-25%
- Typical total factor: 1.2-1.4x

### Large Project (> 100 man-days base)
- Buffer: +15-20%
- Typical total factor: 1.15-1.3x

---

## 10. Estimation Formula

```
Final Estimate = Base Effort × Tech Factor × Requirement Factor × Complexity Factor + Buffer

Example:
Base Effort: 50 man-days
Tech Factor: 1.1 (new framework)
Requirement Factor: 1.2 (fair documentation)
Complexity Factor: 1.2 (moderate business logic)

Calculated: 50 × 1.1 × 1.2 × 1.2 = 79.2 man-days
Buffer (20%): 15.8 man-days
Total: 95 man-days
```

---

## 11. Sanity Check

After calculation, check with benchmarks:

| Project Type | Typical Range |
|--------------|---------------|
| Landing page | 5-15 man-days |
| Simple CRUD app | 20-40 man-days |
| E-commerce MVP | 80-150 man-days |
| Social app MVP | 100-200 man-days |
| Enterprise system | 200-500+ man-days |

If the estimate is too far outside the range, review the factors.
