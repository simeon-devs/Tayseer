# Tayseer Technical Decisions Log

Every technical decision in this document was made based on real benchmark evidence or deliberate architectural reasoning. Do not reopen any decision marked as locked. Do not suggest alternatives to locked decisions. If a new decision needs to be made add it to the open decisions section at the bottom.

---

## Decision 1: OCR Engine

Status: locked
Date: 2026-05-28
Decision: Use Tesseract 5 with lang=ara+eng via pytesseract

Evidence from benchmark on three synthetic Arabic government documents:

Tesseract scored 4.67 out of 5 average quality across salary certificate, bank statement, and Emirates ID. Average processing time was 0.48 seconds per document. All Arabic labels, amounts, and bilingual fields were correctly extracted. One minor artefact on the salary certificate where a single label was partially garbled was identified and resolved with a simple text cleaning step.

QARI-OCR scored 3.0 out of 5 and averaged 225 seconds per document on CPU. This is 468 times slower than Tesseract. Impractical for a live demo where instant processing is the core value proposition.

PaddleOCR failed to install. The paddlepaddle package has no Python 3.14 ARM64 wheel for macOS. This is a compatibility issue with the development environment that is not worth resolving given Tesseract already performs well.

Qwen2-VL-7B via Ollama failed to pull. The model manifest does not exist in the Ollama registry for this version.

Conclusion: Tesseract is fast, accurate on Arabic government documents, runs on CPU with no VRAM requirement, and is production-stable. It is the correct choice for this use case and timeline.

---

## Decision 2: Embedding Model

Status: locked
Date: 2026-05-28
Decision: Use BAAI/bge-m3 via sentence-transformers

Evidence from benchmark on 20 Arabic governance rule chunks with 10 retrieval queries:

BGE-M3 returned the correct top-1 rule for 9 out of 10 queries with an average similarity score of 0.6579. The one miss was on a query about widowed citizens with children where the model returned Rule 14 about disability instead of Rule 13 about divorce and widowhood. The margin was only 0.018 similarity score difference. This is resolvable by adding synonym keywords to Rule 13 in the rules.md file.

paraphrase-multilingual-mpnet-base-v2 scored 6 out of 10 correct with average similarity of 0.5564. This serves as the baseline.

jinaai/jina-embeddings-v3 failed to load due to HuggingFace cache corruption. The fix is documented but since BGE-M3 already meets the 90 percent accuracy target there is no need to retry Jina.

Conclusion: BGE-M3 achieves 90 percent retrieval accuracy on Arabic financial and legal terminology, requires under 2GB VRAM, runs on CPU, and is production-ready.

---

## Decision 3: Vector Database

Status: locked
Date: 2026-05-28
Decision: Use ChromaDB

Reasoning: The governance rules knowledge base contains 30 to 50 chunks at most. This is a trivially small dataset for any vector database. Performance differences between ChromaDB, FAISS, and LanceDB at this scale are irrelevant.

ChromaDB was selected because it has the simplest Python API with direct LlamaIndex integration, runs embedded with no separate process required, saves to a local SQLite file with no operational overhead, and has the best documentation for the hackathon timeline.

FAISS was considered. It is faster at scale but requires manual metadata management and has a lower-level API that adds development time without benefit at our dataset size.

LanceDB was considered. It has a smaller ecosystem with fewer examples for LLM RAG workflows. Not worth the integration risk on a 15-day timeline.

---

## Decision 4: RAG Orchestration Framework

Status: locked
Date: 2026-05-28
Decision: Use LlamaIndex

Reasoning: LlamaIndex is purpose-built for retrieval-first RAG pipelines. It has cleaner APIs for document ingestion, chunking, embedding, and retrieval than LangChain for this specific use case.

LangChain was considered and rejected. LangChain is better suited for complex multi-tool agent orchestration. For a document retrieval plus reasoning pipeline it adds unnecessary abstraction layers that are difficult to debug on a 15-day timeline. Multiple independent AI agents reviewed in our planning phase described LangChain as becoming spaghetti quickly for simple RAG use cases.

---

## Decision 5: Primary LLM

Status: locked
Date: 2026-05-28
Decision: Use Qwen2.5 14B Q4 for development and Qwen2.5 72B for the live demo

Evidence: Qwen2.5 14B was tested with the following governance reasoning prompt on first run with no prompt engineering or Instructor wrapping: a citizen with 45 percent debt to income ratio, 8 months late on payments, net income 18000 AED, arrears 45000 AED. The model returned perfectly valid JSON on the first attempt with approved_amount 45000, duration_months 36, monthly_instalment 1250, a coherent English rationale, and escalate_flag false. The calculation of 45000 divided by 36 equals 1250 is mathematically correct.

Jais 2 8B was evaluated as a UAE-origin Arabic model from Inception AI and G42. Multiple access and compatibility issues were encountered:

First, the model is not available in the Ollama registry under any ollama pull command.

Second, attempting to pull from HuggingFace using the hf.co prefix format failed with a realm host mismatch error in Ollama 0.24.0.

Third, downloading the GGUF file via hf download required accepting gated repository terms on the HuggingFace website and creating a token with appropriate permissions.

Fourth, after successfully downloading the 4.8GB Q4_K_M.gguf file and creating an Ollama Modelfile, Ollama 0.24.0 returned a 500 Internal Server Error when attempting to load the model, indicating a GGUF format compatibility issue with this Ollama version.

Fifth, using llama.cpp directly via brew install llama.cpp, the model loaded but produced only quote characters as output regardless of prompt format, indicating a chat template compatibility issue.

Total time spent on Jais: over one hour with no working output produced. Jais appears on the benchmarking slide as evaluated with the note that it was unavailable for local deployment on the test hardware configuration.

ALLaM was considered. Limited open deployment flexibility and weaker ecosystem than Qwen2.5. Integration risk too high for a 15-day build.

AceGPT was considered and rejected. Built on older Llama 2 architecture, outperformed by modern models.

---

## Decision 6: Structured Output Enforcement

Status: locked
Date: 2026-05-28
Decision: Use Instructor with Pydantic models for all LLM calls that require structured output

Reasoning: Unstructured LLM output is the most common demo failure mode. The model returning malformed JSON or missing fields breaks the entire pipeline. Instructor wraps around the Ollama call and enforces the Pydantic schema, retrying automatically on validation failure. This eliminates an entire category of runtime errors.

---

## Decision 7: PDF Generation

Status: locked
Date: 2026-05-28
Decision: Use WeasyPrint 68.1 with Geeza Pro system font

Evidence: A full bilingual A4 decision letter was generated successfully in the benchmark with correct Arabic RTL heading, correct English LTR heading, a mixed bilingual table, a 3-sentence Arabic body paragraph, and a 3-sentence English body paragraph. The output file was 70,990 bytes and rendered correctly as a PNG confirmation image. Arabic font rendering with Geeza Pro on macOS was clean.

Dependencies required: pango via brew install pango, poppler via brew install poppler for PDF to image conversion.

On Linux the fallback font is Noto Naskh Arabic. This must be installed on the Raspberry Pi if the frontend ever needs to generate PDFs.

---

## Decision 8: No Fine-tuning

Status: locked
Date: 2026-05-28
Decision: Do not fine-tune the LLM. Use RAG plus structured prompting only.

Reasoning: Fine-tuning on a 15-day timeline with a consumer machine is not realistic. Fine-tuning a 14B model requires days of compute even on a good GPU. It requires a large, carefully curated, high-quality dataset. It risks degrading the model's general reasoning while memorising specific rules. If governance rules change the model must be retrained from scratch.

RAG plus prompting achieves the same outcome without any of these drawbacks. Rules are updated by editing rules.md and re-embedding. No retraining required. The system is also more auditable because every rule can be read by a human and its influence on any specific decision can be traced through the rules_applied field in the DecisionOutput schema.

---

## Decision 9: Sovereignty Deployment Strategy

Status: locked
Date: 2026-05-28
Decision: Develop on MacBook M4, demo on RunPod H100, frame production as Azure UAE North or Core42

Reasoning: Azure UAE North GPU instances are limited in availability and expensive for a hackathon. H100 instances cost approximately 6.98 USD per hour on Azure versus approximately 2.50 USD per hour on RunPod. For a hackathon demo budget this is a meaningful difference.

The sovereignty narrative is preserved because no real citizen data is used in the demo, all cases are synthetic, and the architecture uses only open-source components that can be deployed on any sovereign UAE infrastructure. Azure UAE North and Core42 Compass are mentioned explicitly in the pitch as the production deployment targets.

---

## Decision 10: Git Commit Convention

Status: locked
Date: 2026-05-28
Decision: All commits use author name simeon-devs and email simw4380@gmail.com. Claude is never a co-author.

Command to configure: git config user.name simeon-devs and git config user.email simw4380@gmail.com

Commit message format: type(module): short description
Examples: feat(A1): add docker compose setup, fix(B2): correct debt ratio calculation, docs(CLAUDE): update module status

---

## Open Decisions

This section is for decisions not yet made. Add items here as they arise during the build.

Frontend authentication strategy for the staff dashboard: to be decided during C2 module. Options are simple password env variable, JWT tokens, or no authentication for the demo since it is a local network deployment.

Notification delivery for citizen decisions: to be decided during B3 module. Options are simulated SMS button, email via local SMTP, or in-app notification only.
