# Tayseer Governance Rules

This file is the single source of truth for all rescheduling governance rules.
Every change to this file requires re-running build_index to update the ChromaDB embeddings.
Rules are numbered RULE-001 through RULE-040.

---

## RULE-001

Rule ID: RULE-001
Category: debt_ratio
Condition: Citizen debt to income ratio is below 20 percent (نسبة الدين إلى الدخل أقل من 20 بالمئة)
Threshold: DTI < 20%
Outcome: Approve rescheduling with maximum flexibility. Offer shortest available duration of 12 to 24 months with no additional conditions required. Priority approval track. (الموافقة على إعادة الجدولة بأقصى قدر من المرونة مع أقصر فترة متاحة)
Example: Citizen earns 30000 AED monthly with existing obligations of 4000 AED (13.3 percent). Arrears of 24000 AED. Debt to income ratio is well below 20 percent. Approve over 12 months at 2000 AED per month with no further conditions.

---

## RULE-002

Rule ID: RULE-002
Category: debt_ratio
Condition: Citizen debt to income ratio is between 20 and 30 percent (نسبة الدين إلى الدخل بين 20 و30 بالمئة)
Threshold: 20% <= DTI < 30%
Outcome: Approve rescheduling on standard terms. Duration of 18 to 24 months. No special conditions required. Standard processing track. (الموافقة على إعادة الجدولة بالشروط القياسية ومدة 18 إلى 24 شهرًا)
Example: Citizen earns 25000 AED monthly with obligations of 6000 AED (24 percent). Arrears of 40000 AED. Approve over 24 months at 1667 AED per month.

---

## RULE-003

Rule ID: RULE-003
Category: debt_ratio
Condition: Citizen debt to income ratio is between 30 and 40 percent (نسبة الدين إلى الدخل بين 30 و40 بالمئة)
Threshold: 30% <= DTI < 40%
Outcome: Approve rescheduling with extended duration. Offer 24 to 36 months to reduce monthly instalment burden. Require submission of all mandatory documents before approval is finalised. (الموافقة على إعادة الجدولة بمدة ممتدة من 24 إلى 36 شهرًا مع اشتراط تقديم جميع الوثائق الإلزامية)
Example: Citizen earns 18000 AED monthly with obligations of 5400 AED (30 percent). Arrears of 50000 AED. Approve over 36 months at 1389 AED per month. All three mandatory documents must be present.

---

## RULE-004

Rule ID: RULE-004
Category: debt_ratio
Condition: Citizen debt to income ratio is between 40 and 50 percent (نسبة الدين إلى الدخل بين 40 و50 بالمئة)
Threshold: 40% <= DTI < 50%
Outcome: Approve rescheduling with extended duration of 36 to 48 months. Monthly instalment must not exceed 15 percent of net monthly income. Mandatory senior officer review of the financial profile before final approval. (الموافقة على إعادة الجدولة بمدة ممتدة من 36 إلى 48 شهرًا مع مراجعة المسؤول الأول)
Example: Citizen earns 20000 AED monthly with obligations of 9000 AED (45 percent). Arrears of 50000 AED. Approve over 48 months at 1042 AED per month. Senior officer review required before issuing letter.

---

## RULE-005

Rule ID: RULE-005
Category: debt_ratio
Condition: Citizen debt to income ratio is between 50 and 55 percent borderline zone (نسبة الدين إلى الدخل بين 50 و55 بالمئة في المنطقة الحدية)
Threshold: 50% <= DTI < 55%
Outcome: Conditional approval only if all five mandatory documents are present and verified, income source is stable government or semi-government employment, and delay duration is under 12 months. Otherwise escalate for senior review. Maximum duration 60 months. (موافقة مشروطة فقط عند توافر جميع الوثائق الإلزامية واستقرار مصدر الدخل)
Example: Citizen earns 16000 AED monthly with obligations of 8320 AED (52 percent). Arrears of 45000 AED. All documents verified. Government employer confirmed. Approve over 60 months at 750 AED per month.

---

## RULE-006

Rule ID: RULE-006
Category: debt_ratio
Condition: Citizen debt to income ratio exceeds 55 percent hard escalation threshold (نسبة الدين إلى الدخل تتجاوز 55 بالمئة حد التصعيد الإلزامي)
Threshold: DTI >= 55%
Outcome: Mandatory escalation. Do not approve automatically. Assign to senior officer queue for manual review. Set case status to escalated. The debt to income ratio is too high for automated approval. Senior management must assess restructuring options. (تصعيد إلزامي. لا يجوز الموافقة التلقائية. يُحال إلى المسؤول الأول لمراجعة يدوية)
Example: Citizen earns 14000 AED monthly with obligations of 8400 AED (60 percent). Arrears of 60000 AED. DTI of 60 percent exceeds the 55 percent threshold. Escalate immediately. Do not issue a decision letter.

---

## RULE-007

Rule ID: RULE-007
Category: debt_ratio
Condition: Citizen debt to income ratio exceeds 70 percent extreme burden zone (نسبة الدين إلى الدخل تتجاوز 70 بالمئة في نطاق الأعباء الشديدة)
Threshold: DTI >= 70%
Outcome: Immediate escalation to senior management with recommendation for comprehensive debt restructuring review. May require referral to social welfare support programs. The debt burden is unsustainable under standard rescheduling framework. (تصعيد فوري إلى الإدارة العليا مع توصية بمراجعة شاملة لإعادة هيكلة الديون)
Example: Citizen earns 10000 AED monthly with obligations of 7500 AED (75 percent). Arrears of 45000 AED. DTI of 75 percent. Escalate to senior management immediately. Refer for social welfare assessment.

---

## RULE-008

Rule ID: RULE-008
Category: debt_ratio
Condition: Citizen has a favourable low debt to income ratio combined with a very small arrears amount relative to monthly income (نسبة دين منخفضة مع مبلغ متأخرات صغير جدًا نسبةً إلى الدخل الشهري)
Threshold: DTI < 25% AND arrears_amount < 2 months of monthly_income
Outcome: Fast-track approval. Approve over 12 months with simplified processing. No senior review required. Minor arrears case with strong repayment capacity. (موافقة سريعة خلال 12 شهرًا مع معالجة مبسطة دون مراجعة مسؤول أول)
Example: Citizen earns 25000 AED monthly with obligations of 3000 AED (12 percent). Arrears of 3000 AED which equals only 0.12 months of income. Fast-track approval over 12 months at 250 AED per month.

---

## RULE-009

Rule ID: RULE-009
Category: income_tier
Condition: Citizen monthly income is below 8000 AED placing them in the lowest income bracket requiring special social protection treatment (الدخل الشهري للمواطن أقل من 8000 درهم في الشريحة الدنيا للدخل مما يستوجب معاملة الحماية الاجتماعية الخاصة)
Threshold: monthly_income < 8000 AED
Outcome: Refer to low-income housing protection programme. Apply maximum duration of 72 months and minimum instalment calculation. Monthly instalment must not exceed 8 percent of gross monthly income. Coordinate with social housing department before finalising terms. (الإحالة إلى برنامج حماية الإسكان للدخل المنخفض مع أقصى مدة 72 شهرًا وأدنى قسط شهري)
Example: Citizen earns 7000 AED monthly with obligations of 1200 AED. Arrears of 28000 AED. Monthly instalment capped at 560 AED (8 percent of income). Reschedule over 50 months. Refer to social housing department.

---

## RULE-010

Rule ID: RULE-010
Category: income_tier
Condition: Citizen monthly income is between 8000 and 10000 AED in the low income bracket (الدخل الشهري للمواطن بين 8000 و10000 درهم في شريحة الدخل المنخفض)
Threshold: 8000 AED <= monthly_income < 10000 AED
Outcome: Apply low income track with extended duration of 48 to 60 months. Monthly instalment must not exceed 10 percent of net income. Waive processing fees. Flag for social worker follow-up within 30 days of approval. (تطبيق مسار الدخل المنخفض بمدة ممتدة من 48 إلى 60 شهرًا مع إعفاء من رسوم المعالجة)
Example: Citizen earns 9000 AED monthly with obligations of 1500 AED. Arrears of 30000 AED. Monthly instalment capped at 900 AED (10 percent). Reschedule over 36 months. Waive all fees. Social worker assigned.

---

## RULE-011

Rule ID: RULE-011
Category: income_tier
Condition: Citizen monthly income is between 10000 and 15000 AED in the lower-middle income bracket (الدخل الشهري للمواطن بين 10000 و15000 درهم في الشريحة الدنيا من الدخل المتوسط)
Threshold: 10000 AED <= monthly_income < 15000 AED
Outcome: Apply standard middle-income rescheduling track. Duration 24 to 36 months. No fee waivers unless special circumstances are documented. Standard instalment calculation applies. (تطبيق مسار إعادة الجدولة القياسية لمتوسطي الدخل بمدة من 24 إلى 36 شهرًا)
Example: Citizen earns 13000 AED monthly with obligations of 2000 AED. Arrears of 38000 AED. Approve over 36 months at 1056 AED per month using standard terms.

---

## RULE-012

Rule ID: RULE-012
Category: income_tier
Condition: Citizen monthly income is between 15000 and 25000 AED in the middle income bracket (الدخل الشهري للمواطن بين 15000 و25000 درهم في شريحة الدخل المتوسط)
Threshold: 15000 AED <= monthly_income < 25000 AED
Outcome: Apply flexible middle-income terms. Duration 18 to 36 months based on arrears amount and DTI. Citizen may request shorter duration for reduced total cost. (تطبيق الشروط المرنة لمتوسطي الدخل بمدة من 18 إلى 36 شهرًا)
Example: Citizen earns 20000 AED monthly with obligations of 3000 AED. Arrears of 48000 AED. Approve over 24 months at 2000 AED per month. Citizen may opt for 18 months at 2667 AED if preferred.

---

## RULE-013

Rule ID: RULE-013
Category: income_tier
Condition: Citizen monthly income exceeds 25000 AED in the high income bracket (الدخل الشهري للمواطن يتجاوز 25000 درهم في شريحة الدخل المرتفع)
Threshold: monthly_income >= 25000 AED
Outcome: Prefer accelerated shorter repayment plan of 12 to 18 months. Higher income citizens have stronger repayment capacity and should not carry rescheduled debt beyond 18 months unless arrears exceed 80000 AED. (تفضيل خطة سداد أسرع من 12 إلى 18 شهرًا نظرًا للقدرة العالية على السداد)
Example: Citizen earns 35000 AED monthly with obligations of 4000 AED. Arrears of 42000 AED. Approve over 12 months at 3500 AED per month. Income capacity supports rapid repayment.

---

## RULE-014

Rule ID: RULE-014
Category: income_tier
Condition: Citizen monthly income exceeds 40000 AED in the high earner bracket (الدخل الشهري للمواطن يتجاوز 40000 درهم في شريحة أصحاب الدخل المرتفع)
Threshold: monthly_income >= 40000 AED
Outcome: Approve with maximum 12 months duration only. High earners are expected to clear arrears rapidly. If citizen objects to 12-month limit refer to supervisor. Ensure monthly instalment does not create financial hardship. (الموافقة مع حد أقصى 12 شهرًا فقط نظرًا للدخل المرتفع)
Example: Citizen earns 55000 AED monthly with obligations of 8000 AED. Arrears of 60000 AED. Approve over 12 months at 5000 AED per month. High income makes rapid clearance feasible.

---

## RULE-015

Rule ID: RULE-015
Category: delay_duration
Condition: Payment delay is under 3 months indicating a short-term minor cash flow issue (تأخر السداد أقل من 3 أشهر مما يشير إلى مشكلة تدفق نقدي قصيرة الأمد)
Threshold: delay_duration_months < 3
Outcome: Treat as minor hardship. Apply shortest available rescheduling duration of 12 months. No special hardship assessment required. Citizen likely experiencing temporary disruption. (معالجة كضائقة بسيطة مع أقصر مدة متاحة 12 شهرًا دون تقييم خاص للضائقة)
Example: Citizen missed 2 monthly payments totalling 6000 AED. Monthly income 18000 AED. Short-term issue. Approve over 12 months at 500 AED per month. No hardship documentation required.

---

## RULE-016

Rule ID: RULE-016
Category: delay_duration
Condition: Payment delay is between 3 and 6 months indicating standard financial hardship (تأخر السداد بين 3 و6 أشهر مما يشير إلى ضائقة مالية قياسية)
Threshold: 3 <= delay_duration_months <= 6
Outcome: Apply standard hardship assessment. Duration 18 to 24 months. Request supporting documents explaining reason for delay. Consider impact of delay on current financial stability before setting instalment. (تطبيق تقييم الضائقة القياسية بمدة من 18 إلى 24 شهرًا مع طلب وثائق داعمة)
Example: Citizen experienced job change causing 5-month payment gap. Arrears of 25000 AED. Income restored. Approve over 24 months at 1042 AED per month. Request letter explaining reason for delay.

---

## RULE-017

Rule ID: RULE-017
Category: delay_duration
Condition: Payment delay is between 6 and 12 months indicating significant and prolonged financial hardship (تأخر السداد بين 6 و12 شهرًا مما يشير إلى ضائقة مالية كبيرة ومطولة)
Threshold: 6 < delay_duration_months <= 12
Outcome: Apply significant hardship track. Duration 24 to 48 months based on income and DTI. Mandatory hardship assessment required. Request salary certificate, bank statements for last 6 months, and reason letter. Set lower instalment to prevent re-default. (تطبيق مسار الضائقة الكبيرة بمدة من 24 إلى 48 شهرًا مع تقييم إلزامي للضائقة)
Example: Citizen had 8 months of payment delay due to salary reduction. Arrears of 38000 AED. Income now stable at 18000 AED. Approve over 36 months at 1056 AED per month. Full hardship pack required.

---

## RULE-018

Rule ID: RULE-018
Category: delay_duration
Condition: Payment delay exceeds 12 months indicating severe chronic hardship requiring enhanced support (تأخر السداد يتجاوز 12 شهرًا مما يشير إلى ضائقة مزمنة شديدة تستوجب دعمًا معززًا)
Threshold: delay_duration_months > 12
Outcome: Apply severe hardship track. Maximum duration 60 months. Mandatory social worker assessment. Consider partial payment deferral for first 3 months of rescheduling period to allow citizen to stabilise finances. Thorough review of income sustainability required. (تطبيق مسار الضائقة الشديدة بأقصى مدة 60 شهرًا مع تقييم اجتماعي إلزامي)
Example: Citizen delayed payments for 15 months due to prolonged unemployment. Now re-employed at 14000 AED monthly. Arrears of 55000 AED. Approve over 60 months at 917 AED per month. First 3 months deferred. Social worker assigned.

---

## RULE-019

Rule ID: RULE-019
Category: delay_duration
Condition: Payment delay exceeds 24 months indicating critical chronic arrears requiring review (تأخر السداد يتجاوز 24 شهرًا مما يشير إلى متأخرات حرجة مزمنة تستوجب المراجعة)
Threshold: delay_duration_months > 24
Outcome: Escalate for senior review. Delay exceeding 24 months indicates a structural financial problem that standard rescheduling alone cannot resolve. Senior officer must assess whether a comprehensive restructuring, partial write-off consideration, or referral to specialist support is appropriate. (تصعيد للمراجعة العليا. التأخير يتجاوز 24 شهرًا يشير إلى مشكلة هيكلية تتجاوز نطاق إعادة الجدولة القياسية)
Example: Citizen delayed payments for 30 months. Arrears of 90000 AED. Multiple income disruptions documented. Escalate to senior officer. Cannot be resolved through standard rescheduling framework alone.

---

## RULE-020

Rule ID: RULE-020
Category: obligation_score
Condition: Citizen monthly financial obligations are between 20 and 30 percent of monthly income (الالتزامات المالية الشهرية للمواطن تتراوح بين 20 و30 بالمئة من الدخل الشهري)
Threshold: 20% <= obligations/income < 30%
Outcome: Standard obligation burden. Apply standard rescheduling terms. Monthly obligations at this level are manageable. No special adjustments required to the rescheduling instalment. (عبء التزامات قياسي. تطبيق شروط إعادة الجدولة القياسية)
Example: Citizen earns 22000 AED monthly with recurring financial commitments of 5500 AED per month (25 percent of income). Standard rescheduling instalment can be added without excessive burden.

---

## RULE-021

Rule ID: RULE-021
Category: obligation_score
Condition: Citizen monthly financial obligations are between 30 and 40 percent of monthly income indicating an elevated recurring commitment burden (الالتزامات المالية الشهرية بين 30 و40 بالمئة من الدخل مما يشير إلى عبء ارتباطات متكررة مرتفع)
Threshold: 30% <= obligations/income < 40%
Outcome: Elevated obligation burden. Extend rescheduling duration to reduce monthly instalment. Ensure that total monthly payments including rescheduling instalment do not exceed 45 percent of monthly income after adding the new instalment. (عبء ارتباطات مرتفع. تمديد مدة إعادة الجدولة لتخفيض القسط الشهري وعدم تجاوز 45 بالمئة إجمالًا)
Example: Citizen earns 20000 AED monthly with existing obligations of 7000 AED (35 percent). Arrears of 40000 AED. Extend duration to 48 months. Monthly instalment 833 AED. Total obligations become 7833 AED (39 percent) which is within the acceptable range.

---

## RULE-022

Rule ID: RULE-022
Category: obligation_score
Condition: Citizen monthly financial obligations are between 40 and 50 percent of monthly income indicating a high ongoing commitment burden requiring close review (الالتزامات المالية الشهرية بين 40 و50 بالمئة من الدخل تستوجب مراجعة دقيقة)
Threshold: 40% <= obligations/income < 50%
Outcome: High obligation burden. Monthly obligations as a percentage of income are in the concerning range. Apply maximum available duration to minimise added instalment. Mandatory review by senior officer to confirm repayment is sustainable. Monthly instalment must not push total obligations above 55 percent of income. (عبء ارتباطات مرتفع جدًا. تطبيق أقصى مدة متاحة مع مراجعة إلزامية من مسؤول أول)
Example: Citizen earns 20000 AED monthly with existing monthly obligations of 9000 AED (45 percent of income). Adding a rescheduling instalment must be carefully sized. Maximum duration 60 months to keep new instalment below 2000 AED.

---

## RULE-023

Rule ID: RULE-023
Category: obligation_score
Condition: Citizen monthly financial obligations exceed 50 percent of monthly income indicating an unsustainable recurring commitment level (الالتزامات المالية الشهرية تتجاوز 50 بالمئة من الدخل مما يشير إلى مستوى ارتباطات متكررة غير مستدام)
Threshold: obligations/income >= 50%
Outcome: Escalate. Monthly obligations exceeding 50 percent of income leaves insufficient capacity to add a rescheduling instalment without causing further financial distress. Refer to senior officer for comprehensive financial assessment and possible restructuring of all obligations. (تصعيد. الالتزامات المالية الشهرية تتجاوز 50 بالمئة من الدخل مما يُعيق إضافة قسط إعادة جدولة)
Example: Citizen earns 18000 AED monthly with ongoing financial obligations of 9500 AED (52.8 percent). Arrears of 30000 AED. Escalate. Adding any rescheduling instalment would exceed safe repayment threshold.

---

## RULE-024

Rule ID: RULE-024
Category: obligation_score
Condition: Citizen monthly financial obligations exceed 60 percent of monthly income indicating extreme financial overcommitment (الالتزامات المالية الشهرية تتجاوز 60 بالمئة من الدخل مما يشير إلى إثقال مالي شديد)
Threshold: obligations/income >= 60%
Outcome: Hard escalation. Monthly financial obligations at or above 60 percent of income constitute extreme overcommitment. Automatic escalation with referral to both senior housing officer and financial counselling service. Standard rescheduling is not appropriate. Comprehensive debt review required. (تصعيد صارم. الالتزامات المالية عند 60 بالمئة أو أكثر تستوجب إحالة فورية لمسؤول الإسكان الأول وخدمة الإرشاد المالي)
Example: Citizen earns 15000 AED monthly with total ongoing financial obligations of 9500 AED (63 percent). Arrears of 25000 AED. Hard escalation. Refer for complete debt review and financial counselling.

---

## RULE-025

Rule ID: RULE-025
Category: escalation
Condition: Citizen Emirates ID is expired or the Emirates ID number could not be verified from the submitted document (بطاقة هوية الإمارات منتهية الصلاحية أو تعذّر التحقق من رقمها من الوثيقة المقدمة)
Threshold: emirates_id_expired = true OR emirates_id_unreadable = true
Outcome: Mandatory escalation. Cannot approve any rescheduling request without a valid verified Emirates ID. Instruct citizen to renew their Emirates ID through ICA channels and resubmit. Set case status to escalated with reason emirates_id_expired. Do not proceed with financial assessment. (تصعيد إلزامي. لا يمكن الموافقة على أي طلب إعادة جدولة بدون هوية إمارات سارية المفعول ومتحقق منها)
Example: Citizen submitted application with Emirates ID showing expiry date of 2023. Current year is 2026. Emirates ID expired three years ago. Escalate immediately. Notify citizen to renew through ICA and resubmit application.

---

## RULE-026

Rule ID: RULE-026
Category: escalation
Condition: Citizen has not submitted a salary certificate or proof of income as a mandatory document (لم يقدم المواطن شهادة الراتب أو إثبات الدخل كوثيقة إلزامية)
Threshold: salary_certificate missing from documents_submitted
Outcome: Escalate for missing mandatory document. A salary certificate is required to verify income claims and calculate debt to income ratio accurately. Without it no financial assessment is possible. Notify citizen to submit a current salary certificate dated within the last 3 months. (تصعيد لوثيقة إلزامية مفقودة. شهادة الراتب مطلوبة للتحقق من مطالبات الدخل وحساب نسبة الدين إلى الدخل)
Example: Citizen submitted Emirates ID and bank statement but omitted salary certificate. The income claim of 18000 AED per month cannot be verified. Escalate. Request salary certificate.

---

## RULE-027

Rule ID: RULE-027
Category: escalation
Condition: Citizen has not submitted a bank statement as a mandatory document (لم يقدم المواطن كشف الحساب البنكي كوثيقة إلزامية)
Threshold: bank_statement missing from documents_submitted
Outcome: Escalate for missing mandatory document. A bank statement is required to verify actual income received and check for any fraud indicators such as inconsistency between stated income and actual deposits. Notify citizen to submit bank statement for the last 3 months. (تصعيد لوثيقة إلزامية مفقودة. كشف الحساب البنكي مطلوب للتحقق من الدخل الفعلي)
Example: Citizen submitted salary certificate and Emirates ID but omitted bank statement. Cannot verify income consistency. Escalate and request 3-month bank statement.

---

## RULE-028

Rule ID: RULE-028
Category: escalation
Condition: Total arrears amount exceeds 100000 AED requiring senior management authorisation (إجمالي مبلغ المتأخرات يتجاوز 100000 درهم مما يستوجب تفويض الإدارة العليا)
Threshold: arrears_amount > 100000 AED
Outcome: Mandatory escalation to senior management. Arrears exceeding 100000 AED cannot be approved at officer level. Case must be reviewed and approved by senior management. Prepare full financial summary report. Set case status to escalated with reason high_arrears_senior_approval_required. (تصعيد إلزامي إلى الإدارة العليا. المتأخرات التي تتجاوز 100000 درهم لا يمكن اعتمادها على مستوى الموظف)
Example: Citizen with arrears of 120000 AED applies for rescheduling. The amount exceeds the 100000 AED senior approval threshold. Escalate. Senior management must review before any decision is issued.

---

## RULE-029

Rule ID: RULE-029
Category: escalation
Condition: Fraud signal detected where stated monthly income and actual bank deposits are inconsistent by more than 40 percent (تم اكتشاف إشارة احتيال حيث يوجد تعارض بين الدخل الشهري المُعلَن والإيداعات البنكية الفعلية بأكثر من 40 بالمئة)
Threshold: abs(stated_income - actual_deposits) / stated_income > 40%
Outcome: Mandatory escalation with fraud flag. The significant discrepancy between declared income and bank evidence suggests potential misrepresentation of financial position. Do not approve. Refer to compliance team for investigation. Set fraud_flag to true in case record. Inform citizen that further documentation will be requested. (تصعيد إلزامي مع علامة احتيال. التناقض الكبير يستوجب الإحالة إلى فريق الامتثال للتحقيق)
Example: Citizen declares income of 25000 AED on salary certificate but bank statement shows average monthly credits of only 9000 AED. Discrepancy of 64 percent. Escalate with fraud flag. Refer to compliance.

---

## RULE-030

Rule ID: RULE-030
Category: escalation
Condition: Citizen has had two or more previously rejected rescheduling applications for the same property (سبق رفض طلبَي إعادة جدولة أو أكثر للمواطن نفسه على العقار ذاته)
Threshold: rejected_applications_count >= 2
Outcome: Escalate. Multiple rejected applications indicate either repeated inability to meet financial criteria or repeated submission of incomplete documentation. Refer to senior officer for a comprehensive review of why previous applications failed and whether the current application addresses those deficiencies. (تصعيد. الطلبات المرفوضة المتعددة تستوجب مراجعة شاملة من مسؤول أول)
Example: Citizen submits third rescheduling application. Two prior applications were rejected due to high DTI and missing documents. Escalate for senior review. Senior officer must assess whether circumstances have changed sufficiently to warrant approval.

---

## RULE-031

Rule ID: RULE-031
Category: escalation
Condition: Salary certificate submitted is older than 3 months and therefore cannot be accepted as current proof of income (شهادة الراتب المقدمة أقدم من 3 أشهر ولذلك لا يمكن قبولها كإثبات دخل حالي)
Threshold: salary_certificate_age_months > 3
Outcome: Escalate for outdated documentation. An outdated salary certificate cannot confirm current income status. The citizen may have changed employment or had a salary change since the certificate was issued. Request a current salary certificate dated within the last 3 months before proceeding. (تصعيد لوثيقة قديمة. شهادة الراتب القديمة لا تؤكد الوضع الوظيفي الحالي)
Example: Citizen submits salary certificate dated 5 months ago showing income of 20000 AED. Employment status may have changed. Escalate. Request current salary certificate dated within the last 3 months.

---

## RULE-032

Rule ID: RULE-032
Category: escalation
Condition: Combined escalation trigger where both debt to income ratio exceeds 55 percent and payment delay exceeds 12 months simultaneously (مشغّل تصعيد مدمج حيث تتجاوز نسبة الدين إلى الدخل 55 بالمئة ويتجاوز تأخر السداد 12 شهرًا في الوقت ذاته)
Threshold: DTI >= 55% AND delay_duration_months > 12
Outcome: Priority escalation. Both the high debt burden and the prolonged delay indicate a severe financial distress situation that requires immediate senior management attention. This combination is the highest-risk profile in the rescheduling system. Assign to senior officer queue with urgent flag. (تصعيد ذو أولوية. كلا المؤشرَين يستدعيان اهتمامًا فوريًا من الإدارة العليا)
Example: Citizen with DTI of 62 percent and 18 months of payment delay. Arrears of 75000 AED. Highest risk profile. Priority escalation to senior officer with urgent status flag.

---

## RULE-033

Rule ID: RULE-033
Category: escalation
Condition: Emirates ID document submitted but the ID number does not match the expected format 784-XXXX-XXXXXXX-X indicating a potentially fraudulent or incorrectly submitted document (رقم بطاقة الهوية لا يتطابق مع الصيغة المتوقعة 784-XXXX-XXXXXXX-X)
Threshold: emirates_id_format_invalid = true
Outcome: Escalate for identity verification failure. A correctly formatted UAE Emirates ID must begin with 784 and follow the 784-XXXX-XXXXXXX-X pattern. An incorrectly formatted ID may indicate a scanning error, a non-UAE ID, or a fraudulent document. Refer to identity verification team. (تصعيد لفشل التحقق من الهوية. رقم الهوية غير صحيح الصيغة)
Example: Submitted Emirates ID shows number 784-1990-123456-5 with only 6 digits in the third segment instead of 7. Format invalid. Escalate for identity verification.

---

## RULE-034

Rule ID: RULE-034
Category: sharia_flag
Condition: Citizen is widowed and the deceased spouse was the primary income earner leaving the citizen as sole provider for dependent children. Widow, widowed, bereaved, single parent, spouse deceased, spouse passed away, main breadwinner deceased, sole provider after bereavement. (المواطن أرمل أو أرملة وكان الزوج المتوفى هو المعيل الرئيسي مما يجعل المواطن المعيل الوحيد للأطفال المعالين. أرمل، أرملة، فقدان الزوج، عائل وحيد، وفاة الزوج)
Threshold: marital_status = widowed OR citizen_type = widow
Outcome: Apply widowhood compassion exception. Extend maximum rescheduling duration by 12 months beyond standard. Reduce monthly instalment by up to 20 percent below standard calculation. Waive all processing fees. Assign dedicated social worker. The state recognises the exceptional hardship faced by widowed citizens with dependent children. (تطبيق استثناء الرحمة بحالة الترمل. تمديد المدة بـ12 شهرًا إضافيًا مع تخفيض القسط الشهري بنسبة 20 بالمئة وإعفاء من جميع الرسوم)
Example: Widow with three dependent children earns 12000 AED monthly from government support and part-time work. Arrears of 20000 AED. Spouse passed away 18 months ago. Apply compassion extension. Reschedule over 48 months instead of standard 36. Monthly instalment 417 AED. All fees waived. Social worker assigned.

---

## RULE-035

Rule ID: RULE-035
Category: sharia_flag
Condition: Citizen is divorced and is the sole custodial parent of dependent children facing additional financial burdens from divorce settlement and custody obligations. Divorced citizen single parent custody children alimony obligations. (المواطن مطلق أو مطلقة وهو الوالد الحاضن الوحيد للأطفال المعالين مع أعباء مالية إضافية من التسوية والنفقة)
Threshold: marital_status = divorced AND has_dependent_children = true
Outcome: Apply single-parent compassion track. Extend rescheduling duration by 6 months beyond standard. Reduce instalment by up to 15 percent. Consider alimony and custody-related expenses in the financial assessment. Waive late payment penalties if divorce occurred within the last 2 years. (تطبيق مسار التعاطف مع الوالد الوحيد. تمديد المدة بـ6 أشهر مع تخفيض القسط بنسبة 15 بالمئة)
Example: Divorced mother with two children earns 14000 AED monthly. Receives 3000 AED alimony. Arrears of 25000 AED accumulated during divorce proceedings. Apply single-parent track. Extend by 6 months. Waive all late penalties as divorce was 14 months ago.

---

## RULE-036

Rule ID: RULE-036
Category: sharia_flag
Condition: Citizen has a clean payment history of more than two years with no missed or late payments prior to the current arrears situation indicating an exceptional and unexpected hardship event. Excellent clean payment history consistent on-time payments good financial track record. (للمواطن سجل سداد نظيف لأكثر من سنتين بدون أي تأخيرات مما يشير إلى ظرف استثنائي وغير متوقع)
Threshold: clean_payment_history_months >= 24
Outcome: Apply clean-record benefit. Reduce rescheduling duration by 6 months from standard calculation. Reduce interest or financing cost by 10 percent. Issue expedited approval within 24 hours rather than standard 3-day processing. A citizen with a previously exemplary payment record deserves recognition and expedited treatment. (تطبيق ميزة السجل النظيف. تقليص المدة بـ6 أشهر مع تخفيض التكلفة بنسبة 10 بالمئة وموافقة سريعة خلال 24 ساعة)
Example: Citizen with 36 months of perfect payment history suddenly fell behind due to unexpected medical expenses. Arrears of 18000 AED. Income 22000 AED. Apply clean-record benefit. Approve within 24 hours. Duration reduced from 24 to 18 months.

---

## RULE-037

Rule ID: RULE-037
Category: sharia_flag
Condition: Citizen is the owner of multiple properties including one or more investment properties in addition to the primary residence where rescheduling is being requested (المواطن مالك لعقارات متعددة تشمل عقارًا استثماريًا أو أكثر بالإضافة إلى الإقامة الرئيسية)
Threshold: property_count >= 2 OR investment_property = true
Outcome: Apply investment property scrutiny rule. A citizen owning investment properties has additional assets that may be liquidated to address arrears without requiring rescheduling. Request full asset disclosure. Senior officer must assess whether rescheduling is truly necessary or whether asset liquidation is more appropriate before approving rescheduling on extended terms. (تطبيق قاعدة فحص العقارات الاستثمارية. المواطن الذي يمتلك عقارات استثمارية يملك أصولًا إضافية يمكن تسييلها)
Example: Citizen owns primary residence and two investment apartments generating rental income. Requests rescheduling claiming financial hardship. Senior officer must review total asset position before approving. Rescheduling may not be the appropriate solution.

---

## RULE-038

Rule ID: RULE-038
Category: sharia_flag
Condition: Citizen holds a government-registered disability certificate indicating a permanent or long-term disability affecting their earning capacity (يحمل المواطن شهادة إعاقة مسجلة لدى الحكومة تشير إلى إعاقة دائمة أو طويلة الأمد تؤثر على قدرته على الكسب)
Threshold: disability_certificate = verified
Outcome: Apply disability compassion track. Maximum rescheduling duration of 72 months. Minimum monthly instalment calculation applies. Waive all processing fees and late payment penalties regardless of how long payments were delayed. Coordinate with Ministry of Community Development for additional support. (تطبيق مسار التعاطف مع الإعاقة. أقصى مدة 72 شهرًا مع الحد الأدنى من القسط الشهري وإعفاء من جميع الرسوم والعقوبات)
Example: Citizen with certified partial disability earns 9000 AED monthly from disability allowance. Arrears of 22000 AED accumulated over 14 months. Apply disability track. Maximum duration 72 months at 306 AED per month. All fees waived. Refer to Ministry of Community Development.

---

## RULE-039

Rule ID: RULE-039
Category: sharia_flag
Condition: Citizen experienced a documented job loss within the past 3 months and has not yet secured replacement employment or has secured employment at a lower income level (تعرّض المواطن لفقدان عمل موثق خلال الأشهر الثلاثة الماضية ولم يؤمن عملًا بديلًا بعد أو آمنه بمستوى دخل أدنى)
Threshold: job_loss_date within last 90 days AND employment_status != stable
Outcome: Apply recent job loss compassion provision. Delay rescheduling start by 3 months to allow citizen time to secure stable employment. If new employment confirmed within 3 months proceed with rescheduling based on new income. If not confirmed after 3 months reassess and escalate if required. (تطبيق أحكام التعاطف مع فقدان العمل الحديث. تأجيل بدء إعادة الجدولة 3 أشهر لإتاحة الفرصة للمواطن لتأمين عمل مستقر)
Example: Citizen lost employment 6 weeks ago due to company liquidation. Previously earned 28000 AED monthly. Currently receiving end of service payment. Arrears of 35000 AED. Defer rescheduling start by 3 months. Re-evaluate when new employment confirmed.

---

## RULE-040

Rule ID: RULE-040
Category: sharia_flag
Condition: Citizen incurred documented extraordinary medical emergency expenses that directly caused or significantly contributed to the current arrears situation (تكبّد المواطن نفقات طوارئ طبية غير عادية موثقة أدّت مباشرةً أو بشكل كبير إلى تراكم المتأخرات الحالية)
Threshold: medical_emergency_documented = true AND medical_cost > 2 months of monthly_income
Outcome: Apply medical hardship exception. Treat arrears as involuntary emergency-induced rather than chronic financial mismanagement. Extend duration by up to 12 months beyond standard. Waive all late payment penalties. Provide compassionate processing with priority track. Attach medical documentation to case file for audit. (تطبيق استثناء الضائقة الطبية. التعامل مع المتأخرات باعتبارها قسرية ناجمة عن طوارئ لا عن سوء إدارة مالية مزمنة)
Example: Citizen incurred 60000 AED in uninsured emergency surgery costs causing 9 months of missed housing payments. Earns 18000 AED monthly. Arrears of 38000 AED. Apply medical hardship exception. Extend by 12 months. Waive all penalties. Attach medical report.
