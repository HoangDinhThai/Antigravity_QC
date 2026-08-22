# Estimation Template - Full Example

## Example Estimation for an E-commerce Project

```markdown
# Project Estimation: E-Commerce Platform

## Thông tin dự án
- **Khách hàng:** ABC Corp
- **Ngày tạo:** 2026-02-01
- **Phiên bản:** v1.0
- **Phạm vi:** MVP - Phase 1
- **Nguồn yêu cầu:** 
  - source-docs/requirements/ecom-prd-v1.pdf
  - Figma: https://figma.com/xxx
  - Meeting notes: source-docs/meeting-notes/kickoff-2026-01-25.md

---

## Tổng quan Estimation

| Hạng mục | Giá trị |
|----------|---------|
| Tổng số tính năng | 15 features |
| Effort cơ bản | 85 man-days |
| Buffer (25%) | 21 man-days |
| **Tổng Effort** | **106 man-days** |
| Timeline ước tính | 10-12 weeks (2.5 FTE) |

### Phân bổ theo Role (Tổng quan)

| Role | Man-days | % |
|------|----------|---|
| Backend Developer | 40 | 38% |
| Frontend Developer | 37 | 35% |
| QC Engineer | 21 | 20% |
| DevOps | 8 | 7% |
| **Tổng** | **106** | 100% |

---

## Chi tiết Estimation theo Module

### Module 1: Authentication & User Management

| # | Tính năng | Screens | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|---------|------|-----------|--------|------------|-------|
| 1.1 | Đăng ký tài khoản | 2 | S | 4 | 1.0 | 4 | Email verify included |
| 1.2 | Đăng nhập | 1 | S | 3 | 1.0 | 3 | JWT, remember me |
| 1.3 | Quên mật khẩu | 2 | S | 3 | 1.0 | 3 | Email reset flow |
| 1.4 | Quản lý profile | 2 | S | 3 | 1.0 | 3 | Avatar upload |
| | **Subtotal** | **7** | | **13** | | **13** | |

### Module 2: Product Catalog

| # | Tính năng | Screens | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|---------|------|-----------|--------|------------|-------|
| 2.1 | Danh sách sản phẩm | 1 | M | 5 | 1.0 | 5 | Filter, sort, pagination |
| 2.2 | Chi tiết sản phẩm | 1 | M | 4 | 1.0 | 4 | Gallery, variants |
| 2.3 | Tìm kiếm sản phẩm | 1 | M | 5 | 1.2 | 6 | Full-text search, suggest |
| 2.4 | Danh mục sản phẩm | 2 | S | 3 | 1.0 | 3 | Nested categories |
| | **Subtotal** | **5** | | **17** | | **18** | |

### Module 3: Shopping Cart & Wishlist

| # | Tính năng | Screens | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|---------|------|-----------|--------|------------|-------|
| 3.1 | Giỏ hàng | 1 | M | 6 | 1.1 | 7 | Update quantity, remove |
| 3.2 | Wishlist | 1 | S | 3 | 1.0 | 3 | Add/remove items |
| | **Subtotal** | **2** | | **9** | | **10** | |

### Module 4: Checkout & Payment

| # | Tính năng | Screens | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|---------|------|-----------|--------|------------|-------|
| 4.1 | Checkout flow | 3 | L | 12 | 1.2 | 14 | Multi-step wizard |
| 4.2 | Địa chỉ giao hàng | 2 | M | 5 | 1.0 | 5 | Address management |
| 4.3 | Tích hợp thanh toán | 1 | L | 8 | 1.4 | 11 | VNPay integration |
| 4.4 | Xác nhận đơn hàng | 1 | S | 3 | 1.0 | 3 | Order summary, email |
| | **Subtotal** | **7** | | **28** | | **33** | |

### Module 5: Order Management (User)

| # | Tính năng | Screens | Size | Base (md) | Factor | Final (md) | Notes |
|---|-----------|---------|------|-----------|--------|------------|-------|
| 5.1 | Lịch sử đơn hàng | 1 | S | 4 | 1.0 | 4 | List, filter by status |
| 5.2 | Chi tiết đơn hàng | 1 | S | 3 | 1.0 | 3 | View order details |
| 5.3 | Hủy đơn hàng | - | XS | 2 | 1.0 | 2 | Cancel flow |
| | **Subtotal** | **2** | | **9** | | **9** | |

### Infrastructure & Setup

| # | Hạng mục | Size | Effort (md) | Notes |
|---|----------|------|-------------|-------|
| 6.1 | Project setup & architecture | M | 3 | Boilerplate, folder structure |
| 6.2 | Database design | M | 2 | Schema, migrations |
| 6.3 | CI/CD setup | S | 2 | GitHub Actions |
| 6.4 | Development environment | S | 1 | Docker, local setup |
| | **Subtotal** | | **8** | |

---

## Tổng hợp Effort

| Module | Base (md) | With Factor (md) |
|--------|-----------|------------------|
| 1. Authentication | 13 | 13 |
| 2. Product Catalog | 17 | 18 |
| 3. Cart & Wishlist | 9 | 10 |
| 4. Checkout & Payment | 28 | 33 |
| 5. Order Management | 9 | 9 |
| 6. Infrastructure | 8 | 8 |
| **Subtotal** | **84** | **91** |
| QC Effort (20%) | | 18 |
| **Total before buffer** | | **109** |
| Risk Buffer (15%) | | 16 |
| **GRAND TOTAL** | | **125 man-days** |

---

## Phân bổ chi tiết theo Role

### Backend Developer (45 man-days)

| Module | Tasks | Effort |
|--------|-------|--------|
| Auth | API đăng ký, đăng nhập, JWT, email service | 8d |
| Products | API products, categories, search, filter | 10d |
| Cart | API cart operations, session handling | 5d |
| Checkout | API order creation, payment integration | 15d |
| Orders | API order management, status updates | 5d |
| Infra | Database design, setup | 2d |

### Frontend Developer (42 man-days)

| Module | Tasks | Effort |
|--------|-------|--------|
| Auth | Forms, validation, profile UI | 6d |
| Products | Product list, detail, search UI | 10d |
| Cart | Cart page, wishlist UI | 6d |
| Checkout | Checkout wizard, address forms | 12d |
| Orders | Order history, detail pages | 5d |
| Common | Layout, components, responsive | 3d |

### QC Engineer (25 man-days)

| Module | Tasks | Effort |
|--------|-------|--------|
| Test cases | Write test cases all modules | 8d |
| Manual testing | Execute test cases | 12d |
| Bug verification | Verify bug fixes | 5d |

### DevOps (8 man-days)

| Tasks | Effort |
|-------|--------|
| CI/CD setup | 2d |
| Staging environment | 2d |
| Production setup | 2d |
| Monitoring setup | 2d |

---

## Timeline đề xuất

```
Week 1-2:   Setup + Auth Module
Week 3-4:   Product Catalog
Week 5-6:   Cart + Wishlist
Week 7-9:   Checkout + Payment
Week 10:    Order Management + QC
Week 11:    Bug fixing + UAT
Week 12:    Go-live preparation
```

### Milestones

| # | Milestone | Target | Deliverables |
|---|-----------|--------|--------------|
| M1 | Project Setup | Week 1 | Dev environment ready |
| M2 | Auth Complete | Week 2 | Login/Register working |
| M3 | Catalog Complete | Week 4 | Browse products |
| M4 | Cart Complete | Week 6 | Add to cart working |
| M5 | Checkout Complete | Week 9 | Full purchase flow |
| M6 | Feature Freeze | Week 10 | All features done |
| M7 | UAT Ready | Week 11 | QC passed |
| M8 | Go-live | Week 12 | Production deployment |

---

## Giả định (Assumptions)

1. **Requirements**
   - PRD là phiên bản cuối cùng, không thay đổi lớn
   - Figma design đầy đủ cho tất cả screens
   - Content (text, images) do khách hàng cung cấp

2. **Technical**
   - Tech stack: Node.js + React (team đã có kinh nghiệm)
   - Database: PostgreSQL
   - Hosting: AWS (khách hàng cung cấp)

3. **Process**
   - Khách hàng review và feedback trong 2 ngày làm việc
   - Weekly sync meeting 1 tiếng
   - Slack channel cho communication hàng ngày

4. **Team**
   - 1 Backend Developer (full-time)
   - 1 Frontend Developer (full-time)
   - 0.5 QC Engineer
   - 0.25 DevOps

---

## Rủi ro và Mitigation

| # | Rủi ro | Probability | Impact | Mitigation |
|---|--------|-------------|--------|------------|
| R1 | Payment gateway integration delay | Medium | High | Buffer 2 ngày, có fallback manual flow |
| R2 | Design changes during development | Medium | Medium | Change request process, re-estimate nếu > 20% |
| R3 | Performance issues với search | Low | Medium | Implement Elasticsearch nếu cần |
| R4 | Third-party API downtime | Low | High | Mock data cho development |

---

## Ngoài phạm vi (Out of Scope)

Những hạng mục sau **KHÔNG** bao gồm trong estimation này:

- [ ] **Admin Panel** - Cần estimate riêng (~40 man-days)
- [ ] **Mobile App** - Chỉ có responsive web
- [ ] **Inventory Management** - Không quản lý tồn kho
- [ ] **Promotions/Coupons** - Phase 2
- [ ] **Reviews/Ratings** - Phase 2
- [ ] **Data migration** - Từ hệ thống cũ
- [ ] **SEO optimization** - Basic only
- [ ] **Analytics integration** - Google Analytics basic
- [ ] **Multi-language** - Vietnamese only
- [ ] **Training** - Cho nhân viên khách hàng
- [ ] **Maintenance** - Sau go-live 1 tháng
- [ ] **Server costs** - AWS infrastructure

---

## Điều kiện áp dụng

1. Estimation có hiệu lực trong **30 ngày** kể từ ngày tạo
2. Thay đổi scope > 20% cần **re-estimate**
3. Giá final sẽ được xác nhận sau **Discovery phase**
4. Payment terms: 30% upfront, 40% mid-project, 30% completion

---

## Phụ lục: Screen Analysis từ Figma

| # | Screen Name | Components | Complexity | Notes |
|---|-------------|------------|------------|-------|
| 1 | Home page | Banner, categories, products | M | 3 API calls |
| 2 | Product list | Filter sidebar, grid, pagination | M | Search integration |
| 3 | Product detail | Gallery, variants, reviews | M | Complex state |
| 4 | Cart | Item list, quantity, total | M | Real-time update |
| 5 | Checkout Step 1 | Address form | S | Validation |
| 6 | Checkout Step 2 | Shipping options | S | API integration |
| 7 | Checkout Step 3 | Payment | M | VNPay redirect |
| 8 | Order confirm | Summary | S | Email trigger |
| 9 | Order history | Order list | S | Filtering |
| 10 | Order detail | Order info | S | Status tracking |
| 11 | Login | Form | XS | JWT flow |
| 12 | Register | Form, OTP | S | Email verify |
| 13 | Profile | Form, avatar | S | Upload |
| 14 | Forgot password | Form | XS | Email flow |

---

## Lịch sử thay đổi

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1.0 | 2026-02-01 | Initial estimation | PM Name |
| v1.1 | 2026-02-05 | Added payment integration details | PM Name |
```
