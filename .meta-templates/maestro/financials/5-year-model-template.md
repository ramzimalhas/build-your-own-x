# Maestro 5-Year Financial Model Template

## Instructions

This template provides formulas and structure for building a complete financial model in Google Sheets or Excel.

---

## Tab 1: Assumptions

| Category | Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Notes |
|----------|--------|--------|--------|--------|--------|--------|-------|
| **Pricing** | Enterprise ACV (Avg) | $120K | $150K | $180K | $200K | $220K | Price increases with maturity |
| | Government ACV (Avg) | $500K | $750K | $1M | $1.2M | $1.5M | Large contracts |
| | API Cost per 1K calls | $0.10 | $0.12 | $0.15 | $0.18 | $0.20 | Usage-based pricing |
| **Growth** | Enterprise Customers (end) | 20 | 120 | 400 | 900 | 1,800 | 6x, 3.3x, 2.25x, 2x growth |
| | Government Customers (end) | 2 | 10 | 25 | 50 | 80 | Higher ACV, slower sales |
| | Consumer MAU (end) | 5K | 80K | 500K | 2.5M | 8M | Viral growth post-launch |
| **Churn** | Enterprise Monthly Churn | 2% | 1.5% | 1% | 0.8% | 0.5% | Decreasing as PMF improves |
| | Government Monthly Churn | 0.5% | 0.3% | 0.2% | 0.1% | 0.1% | Very sticky |
| **CAC** | Enterprise CAC | $36K | $28K | $22K | $18K | $15K | Improves with brand |
| | Government CAC | $120K | $100K | $80K | $65K | $50K | Long sales cycles |
| **Margins** | Gross Margin % | 70% | 75% | 78% | 80% | 82% | Economies of scale |
| | COGS: Cloud Infrastructure | 40% | 35% | 30% | 28% | 25% | % of revenue |
| | COGS: AI Inference | 35% | 30% | 28% | 25% | 23% | % of revenue |
| | COGS: Support | 25% | 20% | 15% | 12% | 10% | % of revenue |
| **Opex** | R&D as % of Revenue | 120% | 60% | 45% | 35% | 28% | Front-loaded investment |
| | S&M as % of Revenue | 180% | 90% | 60% | 45% | 35% | GTM-heavy early |
| | G&A as % of Revenue | 80% | 40% | 25% | 18% | 15% | Overhead scales |

**Formulas:**
- Enterprise Revenue Year N = `Customers_End_Year_N * ACV_Year_N`
- Churn Impact = `Customers_Start_Year_N * (1 - Monthly_Churn^12)`
- Gross Margin $ = `Revenue * Gross_Margin_%`

---

## Tab 2: Revenue Projection

### Enterprise Revenue

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Formula |
|--------|--------|--------|--------|--------|--------|---------|
| Customers (Start) | 0 | 16 | 100 | 360 | 810 | `=Previous_Year_End * (1-Annual_Churn)` |
| New Customers | 20 | 104 | 300 | 540 | 990 | Assumption |
| Churned Customers | 4 | 16 | 40 | 72 | 135 | `=Start_Customers * (1 - (1-Monthly_Churn)^12)` |
| Customers (End) | 16 | 100 | 360 | 810 | 1,665 | `=Start + New - Churned` |
| **Revenue** | **$1.92M** | **$15M** | **$64.8M** | **$162M** | **$366M** | `=Avg_Customers * ACV` |

### Government Revenue

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Formula |
|--------|--------|--------|--------|--------|--------|---------|
| Customers (Start) | 0 | 2 | 10 | 24 | 49 | `=Previous_Year_End * (1-Annual_Churn)` |
| New Customers | 2 | 8 | 15 | 26 | 31 | Assumption |
| Churned Customers | 0 | 0 | 1 | 1 | 2 | `=Start_Customers * (1 - (1-Monthly_Churn)^12)` |
| Customers (End) | 2 | 10 | 24 | 49 | 78 | `=Start + New - Churned` |
| **Revenue** | **$1M** | **$7.5M** | **$24M** | **$58.8M** | **$117M** | `=Avg_Customers * Govt_ACV` |

### API & Transaction Revenue

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Formula |
|--------|--------|--------|--------|--------|--------|---------|
| Total API Calls (M) | 10 | 150 | 800 | 3,000 | 10,000 | Based on MAU growth |
| Revenue per 1M Calls | $100 | $120 | $150 | $180 | $200 | Assumption |
| **API Revenue** | **$1K** | **$18K** | **$120K** | **$540K** | **$2M** | `=Calls * Price` |
| Transaction GMV | $0 | $500K | $5M | $25M | $80M | Marketplace volume |
| Take Rate | 0% | 2.5% | 2.5% | 2.5% | 2.5% | Transaction fee |
| **Transaction Revenue** | **$0** | **$12.5K** | **$125K** | **$625K** | **$2M** | `=GMV * Take_Rate` |

### Total Revenue

| Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|
| **$2.92M** | **$22.5M** | **$89M** | **$221M** | **$487M** |

---

## Tab 3: Expense Budget

### Cost of Goods Sold (COGS)

| Category | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Notes |
|----------|--------|--------|--------|--------|--------|-------|
| Cloud Infrastructure | $350K | $2.3M | $8.9M | $22M | $49M | AWS/Azure compute, storage |
| AI Inference Costs | $300K | $2M | $7.6M | $19M | $42M | GPT-4, Claude API calls |
| Support (Salaries) | $225K | $1.5M | $5.7M | $14M | $31M | Customer success team |
| **Total COGS** | **$875K** | **$5.8M** | **$22.2M** | **$55M** | **$122M** | |
| **Gross Profit** | **$2.05M** | **$16.7M** | **$66.8M** | **$166M** | **$365M** | |
| **Gross Margin %** | **70%** | **74%** | **75%** | **75%** | **75%** | Target: 75-80% |

### Operating Expenses

#### R&D (Engineering + Product)

| Role | Headcount Y1 | Avg Salary | Total Y1 | Headcount Y5 | Notes |
|------|--------------|------------|----------|--------------|-------|
| Software Engineers | 12 | $120K | $1.44M | 80 | Backend, mobile, AI |
| Engineering Manager | 1 | $180K | $180K | 8 | Team leads |
| Product Managers | 2 | $150K | $300K | 12 | Enterprise + consumer |
| Designers | 2 | $110K | $220K | 8 | UX/UI, spatial |
| Data Scientists | 3 | $140K | $420K | 15 | AI/ML research |
| DevOps/Security | 2 | $130K | $260K | 10 | Infrastructure |
| **R&D Total Y1** | **22** | | **$2.82M** | **133** | |

**R&D Total by Year:** Y1: $2.82M | Y2: $8M | Y3: $18M | Y4: $35M | Y5: $60M

#### Sales & Marketing

| Role | Headcount Y1 | Avg Salary | Total Y1 | Headcount Y5 | Notes |
|------|--------------|------------|----------|--------------|-------|
| Enterprise AEs | 3 | $140K + $60K comm | $600K | 25 | Quota: $1M each |
| Government AEs | 1 | $160K + $80K comm | $240K | 8 | Large deals |
| SDRs | 2 | $60K + $20K comm | $160K | 15 | Lead gen |
| Marketing Manager | 1 | $130K | $130K | 5 | Content, events |
| Customer Success | 2 | $90K | $180K | 20 | Onboarding, renewals |
| **S&M Total Y1** | **9** | | **$1.31M** | **73** | + $2M ad spend Y1 |

**S&M Total by Year:** Y1: $3.31M ($1.31M + $2M ads) | Y2: $10M | Y3: $22M | Y4: $45M | Y5: $75M

#### General & Administrative

| Role | Headcount Y1 | Avg Salary | Total Y1 | Headcount Y5 | Notes |
|------|--------------|------------|----------|--------------|-------|
| CEO | 1 | $200K | $200K | 1 | Founder salary |
| CFO | 0 | | $0 | 1 | Hired Year 2 |
| General Counsel | 1 | $180K | $180K | 3 | UAE compliance critical |
| Compliance Manager | 1 | $110K | $110K | 4 | PDPL, GDPR audits |
| Finance/Ops | 1 | $80K | $80K | 8 | Accounting, HR |
| Office/Misc | | | $200K | | Dubai office, SaaS tools |
| **G&A Total Y1** | **4** | | **$770K** | **17** | |

**G&A Total by Year:** Y1: $770K | Y2: $2M | Y3: $4.5M | Y4: $8M | Y5: $13M

### Total Operating Expenses

| Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|
| **$6.9M** | **$20M** | **$44.5M** | **$88M** | **$148M** |

---

## Tab 4: Cash Flow

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|--------|--------|--------|--------|--------|--------|
| **Revenue** | $2.92M | $22.5M | $89M | $221M | $487M |
| **COGS** | ($875K) | ($5.8M) | ($22.2M) | ($55M) | ($122M) |
| **Gross Profit** | $2.05M | $16.7M | $66.8M | $166M | $365M |
| **Operating Expenses** | ($6.9M) | ($20M) | ($44.5M) | ($88M) | ($148M) |
| **EBITDA** | **($4.85M)** | **($3.3M)** | **$22.3M** | **$78M** | **$217M** |
| **Cash Burn (Monthly)** | ($404K) | ($275K) | Profitable | Profitable | Profitable |
| | | | | | |
| **Funding Raised** | $5M (Seed) | $20M (Series A) | $0 | $0 | $0 |
| **Cash Balance (End)** | $150K | $16.9M | $39.2M | $117M | $334M |
| **Runway (Months)** | 12 | 61 | ∞ | ∞ | ∞ |

**Notes:**
- Seed: $5M at $20M post (25% dilution)
- Series A: $20M at $100M post (20% dilution)
- Break-even: Q2 Year 3
- Assumes no additional fundraising after Series A

---

## Tab 5: Unit Economics

### Enterprise Customer

| Metric | Calculation | Value |
|--------|-------------|-------|
| **Annual Contract Value (ACV)** | Assumption | $120,000 |
| **Gross Margin %** | 75% | 75% |
| **Gross Margin $** | ACV * GM% | $90,000 |
| | | |
| **Customer Acquisition Cost (CAC)** | Assumption | $36,000 |
| **Sales Cycle (days)** | Assumption | 90 |
| **Onboarding Cost** | Assumption | $8,000 |
| **Total CAC** | CAC + Onboarding | $44,000 |
| | | |
| **Monthly Churn** | Assumption | 2% |
| **Annual Churn** | 1 - (1 - Monthly)^12 | 21.5% |
| **Average Lifetime (months)** | 1 / Monthly Churn | 50 months |
| | | |
| **Customer Lifetime Value (LTV)** | GM$ * Avg Lifetime / 12 | $375,000 |
| **LTV / CAC Ratio** | LTV / Total CAC | **8.5x** |
| **Payback Period (months)** | Total CAC / (GM$ / 12) | **5.9 months** |
| **Magic Number** | (Qtr Revenue Growth) / (Qtr S&M Spend) | **1.8** (target: >1) |

### Government Customer

| Metric | Value | Notes |
|--------|-------|-------|
| ACV | $500,000 | 4x larger than enterprise |
| CAC | $120,000 | Longer sales cycle |
| LTV | $16.7M | Very sticky (0.3% monthly churn) |
| LTV / CAC | **139x** | Extremely valuable |
| Payback Period | 3.8 months | Fast given contract size |

### Consumer User (Future State)

| Metric | Value | Notes |
|--------|-------|-------|
| Monthly Active Users (MAU) | 500K (Year 3) | North star metric |
| Conversion to Paid | 5% | Freemium model |
| Paid ARPU (monthly) | $9.99 | Subscription tier |
| CAC (organic) | $2 | Viral growth |
| LTV | $180 | 18-month retention |
| LTV / CAC | **90x** | Highly efficient |

---

## Tab 6: Sensitivity Analysis

### Base Case (above)

### Bull Case (20% better on key metrics)

| Metric | Base | Bull | Impact |
|--------|------|------|--------|
| Enterprise ACV | $120K | $144K | +20% revenue |
| New Customers/Year | 20 → 104 → 300 | 24 → 125 → 360 | +20% growth |
| Gross Margin | 70% → 75% | 75% → 80% | +5pp margin |
| **Year 3 Revenue** | $89M | **$128M** | **+44%** |
| **Year 3 EBITDA** | $22M | **$48M** | **+118%** |

### Bear Case (20% worse on key metrics)

| Metric | Base | Bear | Impact |
|--------|------|------|--------|
| Enterprise ACV | $120K | $96K | -20% revenue |
| New Customers/Year | 20 → 104 → 300 | 16 → 83 → 240 | -20% growth |
| Gross Margin | 70% → 75% | 65% → 70% | -5pp margin |
| **Year 3 Revenue** | $89M | **$52M** | **-42%** |
| **Year 3 EBITDA** | $22M | **($3M)** | **-112%** |
| **Additional Funding Needed** | $0 | **$15M (Series A+)** | Bridge to profitability |

---

## Key Metrics Dashboard

| Metric | Target | Actual Y1 | Status |
|--------|--------|-----------|--------|
| **ARR Growth Rate** | >200% YoY | 671% (Y1→Y2) | ✅ Exceeds |
| **Net Revenue Retention** | >120% | 140% | ✅ Strong expansion |
| **Gross Margin** | >75% | 74% (Y2) | 🟡 On track |
| **Magic Number** | >1.0 | 1.8 | ✅ Efficient growth |
| **Burn Multiple** | <1.5x | 1.2x | ✅ Capital efficient |
| **Payback Period** | <12 months | 5.9 months | ✅ Excellent |
| **LTV / CAC** | >3x | 8.5x | ✅ Exceptional |
| **Rule of 40** | >40% | 55% (Y3) | ✅ Top quartile |

**Rule of 40:** Growth Rate % + EBITDA Margin % ≥ 40%
- Year 3: 296% growth + 25% EBITDA margin = 321% ✅

---

## Export Instructions

1. **Copy to Google Sheets:**
   - Create tabs: Assumptions, Revenue, Expenses, Cash Flow, Unit Economics, Sensitivity
   - Input all values and formulas
   - Add charts: Revenue by segment, Headcount growth, Burn rate

2. **Visualizations to Create:**
   - Waterfall chart: Revenue buildup by segment
   - Line chart: Cash balance over time
   - Bar chart: Headcount by department
   - Scatter plot: CAC vs LTV by customer segment

3. **Share with Investors:**
   - Export as Excel (.xlsx)
   - Include summary slide (1-pager)
   - Link to live Google Sheet for diligence
