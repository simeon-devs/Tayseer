# Tayseer Demo Day Checklist

Run through this checklist before and during the demo. Every item is numbered. Tick each one as you go.

---

## 30 Minutes Before

1. Connect MacBook to the venue network via Ethernet or confirm stable WiFi.
2. Run `ipconfig getifaddr en0` and confirm the IP has not changed from `10.42.200.53`. If it has changed, update `frontend/.env.local` and `NEXT_PUBLIC_API_URL` and rebuild the frontend with `npm run build` inside `frontend/`.
3. Start all backend services: `docker-compose up -d` from the project root.
4. Wait 30 seconds for PostgreSQL and ChromaDB to initialise.
5. Confirm backend health: `curl http://localhost:8000/health`. You should see `"status": "ok"`.
6. Run demo data setup to get a clean dataset: `docker-compose exec fastapi python backend/demo_setup.py`. Confirm the output shows 5 approved and 3 escalated.
7. If using RunPod: follow RUNPOD_SETUP.md now so the 72B model is warm before the audience arrives.
8. Start the production frontend: `PORT=3001 node frontend/.next/standalone/server.js &`
9. Confirm frontend is running: open `http://localhost:3001/citizen` in the browser.

---

## 15 Minutes Before

10. Open all required browser tabs in this order:
    - Tab 1: `http://localhost:3001/citizen` (citizen portal, submission form)
    - Tab 2: `http://localhost:3001/staff/cases` (staff case queue)
    - Tab 3: `http://localhost:3001/staff/analytics` (analytics dashboard)
    - Tab 4: `http://localhost:8000/docs` (API documentation, if needed)
11. Verify the staff cases page shows 8 cases from the demo setup.
12. Verify the analytics page shows the approval and escalation rates.
13. Confirm screen mirroring or projector is working and the audience can see the browser.
14. Close all other applications and notifications to avoid interruptions.

---

## 5 Minutes Before

15. Do a practice run of the full citizen submission flow using this test data:
    - Name: Khalid Al Mansoori
    - Emirates ID: 784-1990-9999999-9
    - Monthly income: 18000
    - Existing obligations: 1800
    - Arrears amount: 30000
    - Delay duration: 6 months
    - Reason: Medical expenses
16. Confirm the decision page loads and shows an approved outcome or escalation with rationale.
17. Download the PDF letter and confirm it opens correctly.
18. Confirm the QR verification URL at `http://localhost:3001/verify/{case_uuid}` returns a valid result.
19. Restart the browser tab on the citizen portal form to have a clean page ready for the demo.

---

## During the Demo

20. Open the citizen portal at `http://localhost:3001/citizen`.
21. Narrate the problem: housing arrears rescheduling currently takes 5 working days with manual review. Tayseer makes it instant.
22. Fill in the citizen form live. Use a name that sounds authentic. Use realistic figures.
23. Submit the form. The system will process the request in real time.
24. Navigate to the decision result page. Show the approved amount, instalment, duration, and the bilingual rationale.
25. Click the download PDF button. Show the generated Arabic and English letter with the QR code.
26. Open the staff dashboard at `http://localhost:3001/staff/cases`. Show the case that just came in.
27. Click into the case. Show the AI decision with confidence score, rules applied, and rationale.
28. If demonstrating escalation: select one of the escalated cases from the queue. Show the escalation reason and the manual override flow.
29. Navigate to `http://localhost:3001/staff/analytics`. Show the dashboard metrics: approval rate, escalation rate, average resolution time, and the comparison of 5 working days versus real time.
30. Scan or navigate to the QR verification URL to show the authenticity verification feature.

---

## Fallback Procedures

If the LLM is slow or unresponsive:

31. Open a second browser tab showing the pre-run decision results from the staff dashboard.
32. Explain that the AI decision engine is processing and show the previously generated cases as evidence of the system working.
33. If Ollama is completely unreachable, switch to RunPod using RUNPOD_SETUP.md.

If the frontend fails to load:

34. Navigate directly to `http://localhost:8000/docs` and demonstrate the API endpoints live.
35. Use the Swagger UI to submit a decision request and show the structured JSON response.

If the database is empty:

36. Run `docker-compose exec fastapi python backend/demo_setup.py` in a terminal window.
37. Refresh the staff dashboard.

---

## After the Demo

38. Stop the frontend process: find the PID with `lsof -ti:3001` and kill it.
39. Stop all backend services: `docker-compose down`.
40. If RunPod was used: stop the pod instance to avoid unnecessary charges.
