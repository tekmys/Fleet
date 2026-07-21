# DEVELOPMENT OF AN ARTIFICIAL INTELLIGENCE-POWERED LEARNING MANAGEMENT SYSTEM FOR HIGHER EDUCATION INSTITUTIONS

---

**A Final Year Project Report Submitted to the Department of Computer Science / Information Technology**

**[University Name]**

**In Partial Fulfilment of the Requirements for the Award of**

**Bachelor of Science in Computer Science / Information Technology**

---

**By**

**[Student Full Name]**

**[Matriculation Number]**

---

**Supervisor: [Supervisor Name]**

**[Month] [Year]**

---

---

## DECLARATION

I hereby declare that this project report titled *"Development of an Artificial Intelligence-Powered Learning Management System for Higher Education Institutions"* is my own original work. It has not been submitted previously for any degree or examination at this or any other institution. All sources of information used in the study have been duly acknowledged.

**Signature: ______________________**

**Name: [Student Full Name]**

**Date: ______________________**

---

**Supervisor's Certification**

This is to certify that this project was carried out by the above-named student under my supervision and is approved for submission.

**Signature: ______________________**

**Name: [Supervisor Name]**

**Date: ______________________**

---

---

## ABSTRACT

The proliferation of digital technologies in education has created an urgent demand for intelligent, adaptive, and efficient Learning Management Systems (LMS) that go beyond traditional content delivery. Existing platforms such as Moodle, Blackboard, and Canvas, while widely adopted, offer limited native artificial intelligence (AI) capabilities, leaving significant gaps in personalised learning, automated assessment feedback, and academic integrity monitoring. This project presents the design, development, and evaluation of an AI-powered Learning Management System tailored for higher education institutions, integrating the Anthropic Claude large language model (LLM) to deliver intelligent educational services across multiple user roles.

The system was developed using an Agile iterative methodology over four sprints, employing a modern technology stack comprising React 18 with TypeScript on the frontend, Node.js with Express.js on the backend, Prisma ORM with a MySQL relational database, and Anthropic's Claude API for AI feature delivery. The platform supports three distinct user roles — Administrator, Lecturer, and Student — each with a dedicated dashboard and scoped permissions enforced through role-based access control (RBAC) and JSON Web Token (JWT) authentication.

Key AI features implemented include a course-scoped study assistant leveraging retrieval-augmented generation (RAG), automated grading feedback with draft-and-confirm workflows, multiple-choice quiz generation from uploaded materials, text summarisation, and AI-driven plagiarism detection comparing submissions across a course pool. Supporting features include direct messaging with in-app notifications, module and resource management, assignment submission workflows, gradebooks, and course announcements.

Functional testing confirmed that all core and AI-enhanced features operated as designed. The AI plagiarism detection, study assistant, and auto-grading modules demonstrated strong utility for both learners and educators. The system contributes a working reference implementation for AI-integrated LMS development in resource-constrained institutional environments and provides a foundation for future enhancements including adaptive learning pathways and predictive analytics.

**Keywords:** Learning Management System, Artificial Intelligence, Large Language Model, Retrieval-Augmented Generation, Role-Based Access Control, Plagiarism Detection, Auto-Grading, Higher Education Technology.

---

---

## ACKNOWLEDGEMENTS

I wish to express my sincere gratitude to the Almighty God for the wisdom, strength, and perseverance granted throughout this project.

My profound appreciation goes to my project supervisor, [Supervisor Name], whose guidance, patience, and constructive criticism were invaluable in shaping this research. Your expertise and consistent encouragement kept me focused throughout this journey.

I am grateful to the faculty and staff of the Department of Computer Science / Information Technology at [University Name] for providing a conducive academic environment. Special thanks to all lecturers whose teachings equipped me with the theoretical and practical foundations required for this project.

To my family, thank you for your unwavering support, prayers, and sacrifices throughout my academic journey. Your belief in me was my greatest motivation.

To my friends and colleagues, thank you for the collaborative discussions, peer reviews, and moral support that enriched this work.

---

---

## TABLE OF CONTENTS

- Declaration
- Abstract
- Acknowledgements
- Table of Contents
- List of Figures
- List of Tables
- List of Abbreviations

**Chapter One: Introduction**
- 1.1 Background of the Study
- 1.2 Problem Statement
- 1.3 Research Objectives
- 1.4 Research Questions
- 1.5 Significance of the Study
- 1.6 Scope and Limitations
- 1.7 Definition of Terms
- 1.8 Organisation of the Report

**Chapter Two: Literature Review**
- 2.1 Introduction
- 2.2 Learning Management Systems: An Overview
- 2.3 Evolution and Adoption of LMS in Higher Education
- 2.4 Artificial Intelligence in Education
- 2.5 Large Language Models and Their Educational Applications
- 2.6 Retrieval-Augmented Generation in Educational Contexts
- 2.7 Automated Assessment and Feedback Systems
- 2.8 AI-Based Plagiarism Detection
- 2.9 Role-Based Access Control in Educational Platforms
- 2.10 Review of Existing LMS Solutions
- 2.11 Identified Research Gaps
- 2.12 Theoretical Framework
- 2.13 Conceptual Framework
- 2.14 Chapter Summary

**Chapter Three: Methodology**
- 3.1 Introduction
- 3.2 Research Design
- 3.3 System Development Methodology
- 3.4 Sprint Planning and Deliverables
- 3.5 Tools and Technologies
- 3.6 System Architecture Design
- 3.7 Database Design Approach
- 3.8 Security Design
- 3.9 System Requirements Analysis
- 3.10 Use Case Summary
- 3.11 Chapter Summary

**Chapter Four: System Design, Implementation, and Testing**
- 4.1 Introduction
- 4.2 System Architecture
- 4.3 Database Schema
- 4.4 Authentication and Authorisation
- 4.5 Backend API Implementation
- 4.6 Frontend Implementation
- 4.7 AI Module Implementation
- 4.8 Direct Messaging and Notification System
- 4.9 Module and Resource Management
- 4.10 Assessment and Grading Subsystem
- 4.11 User Interface Design
- 4.12 Testing Strategy
- 4.13 Functional Testing Results
- 4.14 AI Feature Evaluation
- 4.15 System Performance Observations
- 4.16 Discussion of Results
- 4.17 Comparison with Existing Systems
- 4.18 Chapter Summary

**Chapter Five: Conclusion and Recommendations**
- 5.1 Summary of Findings
- 5.2 Achievement of Research Objectives
- 5.3 Contributions to Knowledge
- 5.4 Limitations of the Study
- 5.5 Recommendations for Future Work
- 5.6 Concluding Remarks

- References
- Appendices

---

---

## LIST OF FIGURES

| Figure | Title |
|--------|-------|
| Figure 3.1 | Agile Sprint Cycle Diagram |
| Figure 3.2 | System Architecture Diagram (Three-Tier) |
| Figure 3.3 | Entity Relationship Diagram (ERD) |
| Figure 4.1 | JWT Authentication Flow |
| Figure 4.2 | Role-Based Access Control Model |
| Figure 4.3 | AI Integration Architecture |
| Figure 4.4 | Retrieval-Augmented Generation Pipeline |
| Figure 4.5 | Direct Messaging System Flow |
| Figure 4.6 | Plagiarism Detection Workflow |
| Figure 4.7 | Admin Dashboard Interface |
| Figure 4.8 | Lecturer Dashboard Interface |
| Figure 4.9 | Student Dashboard Interface |
| Figure 4.10 | AI Study Assistant Interface |
| Figure 4.11 | Plagiarism Report Sample Output |
| Figure 4.12 | Gradebook Interface |

---

---

## LIST OF TABLES

| Table | Title |
|-------|-------|
| Table 2.1 | Comparison of Existing LMS Platforms |
| Table 3.1 | Sprint Deliverables Summary |
| Table 3.2 | Technology Stack Summary |
| Table 4.1 | API Endpoint Summary |
| Table 4.2 | Database Models Overview |
| Table 4.3 | Functional Test Cases and Results |
| Table 4.4 | AI Feature Evaluation Summary |
| Table 4.5 | Comparative Analysis with Existing Systems |

---

---

## LIST OF ABBREVIATIONS

| Abbreviation | Meaning |
|---|---|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| ERD | Entity Relationship Diagram |
| FYP | Final Year Project |
| HTTP | Hypertext Transfer Protocol |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| LMS | Learning Management System |
| MCQ | Multiple Choice Question |
| MVC | Model-View-Controller |
| ORM | Object-Relational Mapping |
| RBAC | Role-Based Access Control |
| RAG | Retrieval-Augmented Generation |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| UI | User Interface |
| UX | User Experience |
| VITE | Next Generation Frontend Tooling |

---

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Background of the Study

The global education landscape has undergone profound transformation over the past two decades, driven by the rapid expansion of digital technologies and internet connectivity. The integration of information and communication technologies (ICT) into teaching and learning environments has produced Learning Management Systems (LMS) — software platforms that facilitate the creation, delivery, management, and tracking of educational content and activities (Turnbull et al., 2021). From early course management tools in the late 1990s to the sophisticated, cloud-hosted platforms of today, LMS have become indispensable infrastructure in higher education institutions worldwide.

The COVID-19 pandemic of 2020 further accelerated the adoption of LMS platforms, compelling institutions that had previously relied on face-to-face instruction to rapidly deploy digital learning solutions (Dhawan, 2020). This unprecedented shift exposed both the strengths and the significant limitations of existing platforms. While established systems such as Moodle, Blackboard, and Canvas provide reliable content delivery and administrative functions, they offer limited native artificial intelligence capabilities, leaving educators and learners without intelligent support for personalised learning, automated feedback, and academic integrity monitoring.

Concurrently, advances in artificial intelligence — particularly the development of large language models (LLMs) such as GPT-4 and Anthropic's Claude — have created new possibilities for intelligent educational services. These models demonstrate remarkable proficiency in natural language understanding, generation, reasoning, and summarisation, making them highly applicable to a range of educational tasks (Brown et al., 2020). The intersection of LMS and AI presents an opportunity to build systems that not only manage content and users but actively support the learning process through intelligent, context-aware assistance.

This project responds to this opportunity by developing a fully functional, role-aware, AI-integrated Learning Management System designed for the operational realities of higher education institutions. The system leverages Anthropic's Claude API to deliver five distinct AI-powered features: a course-scoped study assistant, automated grading feedback, quiz generation, material summarisation, and AI-driven plagiarism detection. These capabilities are embedded within a secure, multi-role platform that supports the workflows of administrators, lecturers, and students.

## 1.2 Problem Statement

Despite widespread adoption of LMS in higher education, several persistent limitations constrain their effectiveness. Firstly, most commercial and open-source LMS platforms are predominantly passive content repositories — they deliver materials but offer little intelligent engagement with learners. Students navigating a course module receive no contextual guidance, adaptive recommendations, or conversational support aligned to specific course content (Zawacki-Richter et al., 2019).

Secondly, the assessment and grading process in most LMS places a heavy burden on lecturers. Manual grading of textual submissions is time-consuming, and the feedback cycle is often delayed, reducing the formative value of assessments for students. Wisniewski et al. (2020) demonstrated through a large-scale meta-analysis that the timeliness and specificity of feedback are among the strongest determinants of learning outcomes, a finding that underscores the cost of delayed grading in traditional LMS workflows. While some platforms have introduced basic AI grading tools, these are typically restricted to objective question types and are not extensible to short-answer or essay responses.

Thirdly, academic dishonesty through plagiarism and contract cheating remains a significant challenge in online learning environments. Cotton et al. (2023) documented how the widespread availability of generative AI tools has compounded this challenge, enabling students to produce original-appearing but intellectually unengaged submissions that evade conventional string-matching detection systems. Existing LMS platforms typically rely on third-party integrations such as Turnitin for plagiarism detection, which incur licensing costs and do not address within-cohort collusion.

Fourthly, many institutions in developing economies face the additional constraint of limited financial resources, making the licensing costs of feature-rich commercial LMS platforms prohibitive. There is a need for a purpose-built, open-architecture solution that institutions can deploy and customise without ongoing vendor licensing fees.

This project addresses these gaps by developing an AI-powered LMS that integrates intelligent tutoring, automated grading, plagiarism detection, and real-time communication into a unified platform accessible to all three stakeholder roles.

## 1.3 Research Objectives

The following objectives guided this research:

1. To design and develop a fully functional, role-based Learning Management System supporting Administrator, Lecturer, and Student workflows.
2. To integrate artificial intelligence capabilities powered by Anthropic Claude into the LMS for intelligent educational support.
3. To implement a course-scoped AI study assistant using retrieval-augmented generation (RAG) principles.
4. To develop an AI-assisted automated grading feedback module for short-answer and essay submissions.
5. To implement an AI-driven plagiarism detection system that compares student submissions within a course assignment pool.
6. To build AI tools for lecturers, including MCQ quiz generation and material summarisation.
7. To implement a secure, JWT-based authentication system with role-based access control.
8. To evaluate the system's functional correctness and the utility of its AI features.

## 1.4 Research Questions

This research was guided by the following questions:

1. How can large language models be effectively integrated into a Learning Management System to provide personalised, course-scoped learning assistance?
2. What architectural design patterns best support the integration of AI features within a multi-role LMS?
3. To what extent can AI-generated grading feedback reduce the marking workload of lecturers while maintaining feedback quality?
4. How effective is an LLM-based approach to plagiarism detection compared to traditional string-matching methods within a course submission pool?
5. What is the functional correctness of the developed AI-powered LMS as evaluated through systematic test cases?

## 1.5 Significance of the Study

This research contributes to both academic knowledge and practical educational technology in several ways.

**For students,** the AI study assistant provides 24/7 contextual academic support grounded in actual course materials, reducing dependency on scheduled office hours and enabling self-directed learning. The timely availability of AI-generated grade feedback supports faster learning cycles.

**For lecturers,** the AI grading assistance reduces the manual effort associated with marking text-based submissions. The quiz generation and summarisation tools accelerate the preparation of teaching materials. The plagiarism detection capability empowers lecturers to identify academic integrity concerns without requiring expensive third-party subscriptions.

**For institutions,** the system offers a scalable, open-architecture alternative to commercial LMS platforms. The full-stack implementation with documented code provides institutions with a customisable codebase they can extend to meet specific local needs.

**For the research community,** this project demonstrates a practical methodology for integrating LLM capabilities into educational software, providing a reference implementation that other researchers and developers can build upon. It contributes to the growing body of literature on AI in education (AIEd) at the application layer.

## 1.6 Scope and Limitations

**Scope:** The system covers user management (admin-controlled), course and module management, resource management, assignment submission and grading, direct messaging, in-app notifications, course announcements, and five AI-powered features. The platform is designed as a web application targeting desktop and responsive mobile browsers.

**Limitations:** The following constraints apply to this study:

- The system does not support video conferencing or live virtual classrooms; these are considered out of scope.
- File uploads to the platform utilise Azure Blob Storage configuration, which requires institutional cloud credentials for production deployment.
- The AI study assistant uses a lightweight RAG approach based on module and resource metadata rather than full document indexing; deep document semantic search was not implemented due to the absence of a vector database in the MySQL stack.
- User acceptance testing (UAT) with actual student and lecturer populations was not conducted within the project timeframe; evaluation is based on functional testing.
- The AI features are dependent on Anthropic's Claude API, which requires an active API key and incurs usage costs based on token consumption.
- The system was not deployed to a production environment; demonstration was conducted on a local development setup.

## 1.7 Definition of Terms

**Artificial Intelligence (AI):** The simulation of human intelligence processes by computer systems, including learning, reasoning, and self-correction (Russell & Norvig, 2020).

**Large Language Model (LLM):** A type of AI model trained on vast corpora of text data, capable of understanding and generating human language with high proficiency (Brown et al., 2020).

**Learning Management System (LMS):** A software application for the administration, documentation, tracking, reporting, and delivery of educational courses and training programmes (Turnbull et al., 2021).

**Retrieval-Augmented Generation (RAG):** An AI technique that combines information retrieval from a knowledge base with language model generation to produce context-grounded responses (Gao et al., 2023).

**Role-Based Access Control (RBAC):** A method of regulating access to computer resources based on the roles assigned to individual users within an organisation, where permissions are associated with roles rather than directly with users (Siriwardena, 2020).

**JSON Web Token (JWT):** An open standard (RFC 7519) for securely transmitting information between parties as a JSON object, commonly used for authentication in web applications.

**ORM (Object-Relational Mapping):** A programming technique for converting data between incompatible type systems in object-oriented programming languages and relational databases.

**Plagiarism Detection:** The process of identifying instances of copying or close paraphrasing in student submissions without proper attribution.

## 1.8 Organisation of the Report

This report is organised into five chapters. Chapter One provides the introduction, including the background, problem statement, objectives, research questions, and scope. Chapter Two reviews relevant literature on LMS, artificial intelligence in education, LLMs, RAG, automated assessment, and plagiarism detection. Chapter Three presents the research methodology, development approach, and tools used. Chapter Four details the system design, implementation, and testing across all components, including functional test results, AI feature evaluation, and discussion of findings. Chapter Five concludes the study with a summary of achievements, limitations, and recommendations for future work.

---

---

# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Introduction

This chapter reviews existing literature relevant to the development of an AI-powered Learning Management System. The review encompasses the evolution of LMS technology, the application of artificial intelligence in education, the specific capabilities of large language models relevant to this project, automated assessment systems, plagiarism detection technologies, and role-based access control. The chapter concludes by identifying the research gaps addressed by this project and presenting the theoretical and conceptual frameworks underpinning the study.

## 2.2 Learning Management Systems: An Overview

A Learning Management System is a software platform that enables institutions to manage, deliver, and track educational content and interactions. Turnbull et al. (2021) described LMS as integrated software environments that centralise instructional content, learner management, assessment delivery, and communication within a single platform accessible via web browser, noting that implementation challenges — including staff training, content migration, and technical integration — are as significant as the selection of the platform itself. The core functionality of an LMS typically includes user management, course authoring and enrolment, content delivery, assessment, communication tools, and reporting.

The LMS market encompasses a wide spectrum of tools, from lightweight course management systems to comprehensive enterprise platforms. Deployment models include proprietary commercial systems (such as Blackboard), open-source platforms (such as Moodle), and cloud-hosted Software-as-a-Service (SaaS) solutions (such as Canvas and D2L Brightspace). Binyamin et al. (2019) conducted a systematic analysis of LMS adoption factors across 42 studies and found that system quality, information quality, and perceived ease of use were the most consistent predictors of sustained adoption — findings that underscore the importance of a clean, role-appropriate user interface in any new LMS development.

## 2.3 Evolution and Adoption of LMS in Higher Education

The adoption of LMS in higher education has been extensively documented. Binyamin et al. (2019) identified perceived usefulness, ease of use, and system quality as critical success factors for LMS adoption, findings that underscore the importance of intuitive user interface design and adequate role-specific tooling. Almaiah et al. (2020) extended this analysis in the context of emergency remote teaching during COVID-19, finding that system usability and perceived usefulness were the strongest determinants of student satisfaction with LMS platforms — reinforcing the need for deliberately designed, role-aware interfaces.

The COVID-19 pandemic created an unprecedented natural experiment in LMS adoption at scale. Dhawan (2020) documented that institutions worldwide were compelled to migrate entire curricula to digital platforms within weeks, revealing the scalability limitations of on-premises LMS deployments and accelerating institutional interest in cloud-based and AI-augmented solutions. This context reinforced the case for developing flexible, AI-integrated platforms that can adapt to rapid pedagogical shifts.

## 2.4 Artificial Intelligence in Education

The field of Artificial Intelligence in Education (AIEd) has a rich history dating to the development of intelligent tutoring systems (ITS). Zawacki-Richter et al. (2019) situated this history in the context of modern higher education, tracing the progression from early rule-based tutoring systems to contemporary machine learning and natural language processing applications. The aspiration of achieving one-on-one tutoring effectiveness at scale — originally articulated as the "2 sigma problem" — has resurfaced as a central motivation for LLM-powered educational tools, given that frontier models can now sustain extended instructional dialogues with students (Kasneci et al., 2023).

Zawacki-Richter et al. (2019) conducted a systematic review of AI applications in higher education and identified four principal application areas: profiling and prediction (early warning systems, dropout prediction), intelligent tutoring systems, assessment and feedback, and adaptive learning systems. Their review found that the majority of published research addressed prediction and profiling, while practical deployment of conversational tutoring and automated feedback remained relatively sparse — a gap that this project directly addresses.

Holmes et al. (2019) argued that the most promising near-term applications of AI in education are not in replacing teachers but in augmenting their capabilities: automating routine tasks, providing personalised feedback at scale, and generating content. This perspective aligns with the design philosophy of the present system, in which AI features support rather than supplant educator judgement — evidenced by the draft-and-confirm workflow for AI-generated grades.

The rapid emergence of generative AI tools from 2022 onwards — most notably ChatGPT and Claude — produced a seismic shift in both the capabilities available to educational technology developers and the concerns facing educational institutions. Kasneci et al. (2023) provided a comprehensive analysis of the opportunities and challenges posed by large language models in education, identifying personalised tutoring, automated feedback, and content generation as high-value applications while cautioning about risks including hallucination, over-reliance, and academic dishonesty. Their framework for responsible LLM use in education — which emphasises transparency, human oversight, and contextual grounding — informed several design decisions in the present project, including the explicit labelling of AI-generated grades as drafts and the scoping of the study assistant to verified course content.

UNESCO (2023) published institutional guidance on generative AI in education, recommending that institutions prioritise student data privacy, academic integrity, and pedagogical validity when deploying AI tools. The guidance underscores the importance of keeping educators in the decision loop — a principle operationalised in this project through the draft-and-confirm grading mechanism and the role-restricted access controls on all AI endpoints.

Baidoo-Anu and Owusu Ansah (2023) examined the educational implications of generative AI at the higher education level, documenting both opportunities — including improved accessibility of personalised tutoring and reduction of administrative burden — and risks relating to assessment validity. Their analysis reinforced the case for developing AI tools that are integrated within the institutional LMS rather than accessed as external consumer products, enabling institutions to govern how AI capabilities are used within their educational workflows. This integration model is precisely the architecture adopted in the present system, where all AI endpoints are mediated through the institutional backend.

## 2.5 Large Language Models and Their Educational Applications

The emergence of large language models represented a qualitative shift in the capabilities available to educational AI applications. Zhao et al. (2023) provided a comprehensive survey of LLM development from 2019 to 2023, tracing the progression from BERT-class encoder models to the GPT family of autoregressive decoder models and the emergence of instruction-tuned, RLHF-aligned models capable of following complex multi-step instructions. Brown et al. (2020) demonstrated that GPT-3, with 175 billion parameters, could perform few-shot learning across a wide range of tasks, including question answering, summarisation, and code generation, without task-specific training. Subsequent models — including GPT-4, Anthropic Claude, and Google Gemini — have further expanded these capabilities while improving factual grounding and safety alignment.

In educational contexts, LLMs have been applied to automated essay scoring (Ramesh & Sanampudi, 2022), question generation (Pan et al., 2019), explanation generation, and conversational tutoring. Okonkwo and Ade-Ibijola (2021) reviewed 53 studies on chatbot applications in education and found that chatbot-based tutors could effectively support student learning, particularly for knowledge recall and procedural tasks, though they identified limitations in handling complex reasoning and maintaining contextual coherence across extended dialogues.

Anthropic's Claude model series, used in this project, is distinguished by its Constitutional AI training approach, which prioritises helpfulness, harmlessness, and honesty (Bai et al., 2022). The `claude-sonnet-4-20250514` model employed offers high-quality natural language understanding and generation with strong instruction-following capabilities, making it suitable for structured educational tasks such as grading feedback generation and quiz creation.

OpenAI (2023) documented the capabilities of GPT-4 across a range of professional and academic benchmarks, reporting performance at or above the 90th percentile on examinations including the bar exam, medical licensing examination, and advanced placement tests. These results demonstrated that frontier LLMs had crossed a threshold of competence that makes them practically useful for complex educational tasks, not merely surface-level text generation. This finding validated the use of production-grade LLM APIs — rather than locally hosted smaller models — as the AI backbone for the present system.

Mollick and Mollick (2023) conducted a practitioner-focused investigation of how LLMs can be deployed to implement evidence-based teaching strategies — including the generation of practice problems, explanations at varied complexity levels, and formative feedback — without requiring instructors to possess technical AI expertise. Their work demonstrated that carefully designed prompt templates, embedded within institutional tools, could bridge the gap between AI capability and classroom application. This insight directly motivated the design of the AI Tools modal in the present system, which presents lecturers with structured, purpose-specific AI interfaces (quiz generator, summariser) rather than a raw chat interface.

Regarding prompt engineering, which is a critical determinant of LLM output quality in structured tasks, White et al. (2023) introduced a pattern catalogue for LLM prompting, identifying patterns relevant to educational contexts including the persona pattern (assigning the model a role such as "study assistant for this course"), the template pattern (requiring output in a specified format), and the verification pattern (instructing the model to flag uncertainty). All three patterns are applied in the AI endpoints of the present system: the study assistant prompt assigns a course-specific persona; the quiz generator and grading endpoints specify precise JSON output templates; and system prompts for both the study assistant and grading endpoints instruct the model to avoid fabrication and express uncertainty where appropriate.

## 2.6 Retrieval-Augmented Generation in Educational Contexts

Retrieval-Augmented Generation (RAG) was introduced by Lewis et al. (2020) as a technique that combines dense retrieval from an external knowledge base with generative language model output, enabling models to produce responses grounded in specific, updatable information rather than relying solely on parametric knowledge baked into model weights. This is particularly valuable in educational settings, where responses must be grounded in specific course materials rather than general world knowledge.

In the context of this project, a lightweight RAG approach was implemented by constructing a contextual summary of course modules and resources — including module titles, resource types, and resource URLs — and injecting this context into the system prompt of each AI study assistant query. While this does not constitute full semantic document retrieval (which would require vector embeddings and a specialised vector store), it ensures that the AI assistant's responses are oriented toward the specific content structure of the queried course. Gao et al. (2023) noted that structured metadata from existing application databases — such as relational course content indices — is a valid and efficient retrieval source for naive RAG implementations, particularly when the target knowledge domain is bounded and well-structured, as is the case with individual course content.

Gao et al. (2023) published a comprehensive survey of RAG for large language models, categorising RAG implementations along a spectrum from naive (direct context injection) to advanced (multi-hop retrieval, iterative refinement, and re-ranking). The lightweight context injection approach used in this project falls within the naive RAG category. Gao et al. noted that naive RAG is appropriate for structured knowledge sources — such as course content indices — where the document collection is small enough to fit within a single context window and semantic similarity search is not required. The authors further identified the primary limitation of naive RAG as the inability to retrieve relevant passages from large unstructured document corpora, which is consistent with the limitation acknowledged in this project regarding full-document semantic search. The survey provides a clear roadmap for upgrading the study assistant to an advanced RAG pipeline using vector embeddings and a dedicated vector store such as Qdrant or Pinecone — a direction recommended for future work in Chapter Five.

## 2.7 Automated Assessment and Feedback Systems

Automated assessment has been a focus of educational technology research since the development of computer-adaptive testing (CAT) in the 1970s. Modern systems extend well beyond multiple-choice scoring to include automated essay scoring (AES), short-answer grading, and formative feedback generation.

Wisniewski et al. (2020) conducted a meta-analysis of 435 studies on educational feedback and found that feedback specificity and timeliness were the strongest predictors of learning outcome improvement, with the effect size of timely, specific feedback substantially exceeding that of generic or delayed feedback. Traditional LMS grading workflows — in which a lecturer marks submissions asynchronously and posts feedback days or weeks later — frequently fail to meet this timeliness criterion. AI-assisted grading offers the potential to dramatically compress the feedback cycle.

Ramesh and Sanampudi (2022) surveyed automated short-answer grading systems and noted that the advent of LLMs had significantly improved grading accuracy on open-ended responses compared to earlier lexical similarity approaches. The authors cautioned, however, that fully automated grading without human review remained a risk for high-stakes assessments, recommending hybrid human-AI grading workflows. This finding directly informed the design decision in this project to implement AI grading as a draft that lecturers must review and explicitly publish — preventing unreviewed AI outputs from being presented to students as official grades.

## 2.8 AI-Based Plagiarism Detection

Academic plagiarism represents a persistent challenge for online learning environments. Cotton et al. (2023) documented the compounding effect of generative AI tools on academic dishonesty, while Bretag et al. (2019) provided quantitative evidence that plagiarism detection systems themselves can incentivise paraphrasing plagiarism rather than original work. Traditional detection methods — including string matching, shingling, and fingerprinting — are effective for detecting verbatim copying but struggle with paraphrased or AI-generated content.

LLM-based plagiarism detection approaches offer a complementary strategy: rather than comparing strings, the model analyses semantic similarity, shared reasoning patterns, and unusual phrasal congruence across submissions. While this approach is not a replacement for formal forensic tools in high-stakes academic misconduct proceedings, it provides lecturers with an accessible first-pass indicator at zero marginal cost per query beyond API usage. This is the approach implemented in this system's plagiarism check feature, which presents results as an investigative aid for lecturers rather than a definitive determination of guilt — a distinction explicitly communicated in the system's user interface.

The emergence of generative AI tools has fundamentally altered the academic integrity landscape in ways that traditional plagiarism detection tools are ill-equipped to address. Cotton et al. (2023) analysed the implications of ChatGPT for academic dishonesty and noted that AI-generated text is largely undetectable by conventional string-matching systems, since the content is original in a technical sense even when its production required no substantive intellectual effort from the student. Their analysis recommended that institutions shift toward assessment designs that emphasise demonstration of process — such as reflective journals, oral defences, and iterative submissions — as complements to AI detection tools.

Perkins (2023) similarly examined the academic integrity implications of LLMs in higher education, observing that the distinction between legitimate AI assistance and academic misconduct is contested and context-dependent. Perkins recommended that institutional policy should specify clearly what constitutes permissible AI use and that detection tools should be used to open conversations with students rather than as evidence in formal misconduct proceedings. This perspective reinforces the design decision in the present system to label the AI plagiarism check as an "investigative aid" and to present findings as indicators rather than verdicts, ensuring that the tool supports rather than supplants the academic judgement of the lecturer.

Khalil and Er (2023) reviewed the effectiveness of AI content detectors for identifying LLM-generated text and found that current tools exhibit high false positive rates and are easily circumvented by paraphrasing, highlighting the limitation of AI detection as a standalone integrity mechanism. The plagiarism detection feature in the present system is therefore positioned as a within-cohort collusion detector rather than a general AI-usage detector, focusing on identifying suspicious similarity between student submissions — a well-defined and tractable task — rather than attempting to determine whether text was AI-generated.

## 2.9 Role-Based Access Control in Educational Platforms

The RBAC model defines a structure in which permissions to perform operations on objects are associated with roles rather than directly with users, and users acquire permissions by being assigned to roles. Siriwardena (2020) described RBAC as the dominant access control model for enterprise web applications, noting its suitability for multi-stakeholder systems where distinct user types require precisely differentiated access to resources and operations. NIST (2020) further formalised RBAC in the context of zero-trust architecture, emphasising that role-based access decisions must be made at the application layer and not delegated to network perimeter controls — a principle reflected in this project's server-side middleware enforcement.

In the present system, three roles are implemented: ADMIN, LECTURER, and STUDENT, forming a hierarchical permission structure. Role enforcement is implemented at the API middleware layer, ensuring that role checks are applied consistently regardless of the frontend interface. Siriwardena (2020) described this server-side enforcement pattern as a standard requirement for REST API security, noting that client-side role checks should be treated as a usability convenience rather than a security control, since HTTP requests can be crafted directly without using the application's frontend.

## 2.10 Review of Existing LMS Solutions

**Table 2.1: Comparison of Existing LMS Platforms**

| Feature | Moodle | Blackboard | Canvas | This System |
|---|---|---|---|---|
| Open Source | Yes | No | No | Yes |
| AI Study Assistant | Plugin only | Limited | Limited | Native (LLM-based) |
| Auto-grading Feedback | Basic | Basic | Basic | AI-generated, draft workflow |
| Plagiarism Detection | Third-party | Turnitin (paid) | Turnitin (paid) | Native AI (course pool) |
| Quiz Generation | Manual | Manual | Manual | AI-generated from text |
| Direct Messaging | Basic | Yes | Yes | Yes, with notifications |
| Role-Based Access | Yes | Yes | Yes | Yes (JWT + middleware) |
| Deployment | On-premise | Cloud (paid) | Cloud (paid) | Cloud-ready |
| Licensing Cost | Free | High | Moderate | Free |

Moodle, as the dominant open-source LMS globally (Turnbull et al., 2021), provides a plugin ecosystem through which AI capabilities can be added, but native integration is limited and plugin quality varies substantially. Blackboard and Canvas offer enterprise AI features, but these are typically restricted to analytics and prediction dashboards rather than student-facing AI tutoring. None of the reviewed platforms offer native, no-cost AI plagiarism comparison against an institution's own submission pool.

## 2.11 Identified Research Gaps

The literature review reveals the following gaps that this project addresses:

1. **Gap in native LLM integration:** Most existing LMS platforms treat AI as an external integration rather than a core architectural component. There is limited published work on full-stack LMS implementations with natively integrated LLMs across multiple educational workflows.

2. **Gap in course-scoped conversational assistance:** Existing AI tutoring implementations are often generic and not grounded in specific institutional course content. A course-scoped RAG-based assistant anchored to actual module structure addresses this gap.

3. **Gap in draft-and-confirm AI grading:** Research recommends human-in-the-loop workflows for AI grading, but few implementations document a production-ready draft-and-confirm mechanism integrated with a full LMS.

4. **Gap in accessible, institution-internal plagiarism tools:** LLM-based comparison of submissions within an institutional assignment pool offers a cost-free alternative to licensed tools, yet this approach is underrepresented in the practical implementation literature.

## 2.12 Theoretical Framework

This research is grounded in the **Technology Acceptance Model (TAM)** and the **Cognitive Load Theory (CLT)**. TAM posits that users' adoption of a technology system is determined by two primary factors: perceived usefulness and perceived ease of use. Scherer et al. (2019) conducted a meta-analysis of TAM studies in technology-enhanced learning and confirmed that perceived usefulness is the strongest predictor of continued use intention. These constructs informed the user interface design decisions in this project — specifically the emphasis on intuitive role-aware dashboards, minimal cognitive overhead in navigation, and transparency in AI-generated outputs (e.g., clearly marking AI grades as drafts).

Sweller et al. (2019) established that learning is enhanced when instructional materials are designed to reduce extraneous cognitive load and promote active cognitive engagement, and refined these principles in the context of digital learning environments by noting that interface complexity and cognitive load interact to determine learning effectiveness. The AI study assistant, by providing conversational, on-demand responses grounded in course content rather than requiring students to navigate multiple documents, directly reduces extraneous cognitive load in line with these principles.

## 2.13 Conceptual Framework

The conceptual framework for this project positions the AI-powered LMS as a mediating layer between three actor groups (Administrators, Lecturers, and Students) and the core educational processes they engage in (User Management, Content Delivery, Assessment, Communication, and AI-Assisted Learning). The Anthropic Claude API serves as an intelligent service layer accessed exclusively through the system's backend, ensuring that AI capabilities are governed by business logic and access controls rather than being directly exposed to end users. The framework emphasises:

- **Security:** JWT authentication and RBAC enforce access boundaries.
- **Role differentiation:** Each user type interacts with a contextually appropriate feature set.
- **AI augmentation:** AI features support rather than replace human decision-making.
- **Transparency:** AI outputs are clearly labelled as system-generated and, where appropriate, require human confirmation before acting on students.

## 2.14 Chapter Summary

This chapter reviewed the theoretical and empirical foundations of this project across the domains of LMS technology, AI in education, LLMs, RAG, automated assessment, plagiarism detection, and RBAC. The review identified four principal research gaps addressed by this project and presented the TAM and CTML as the theoretical framework governing design decisions. The following chapter presents the methodology employed to develop the system.

---

---

# CHAPTER THREE: METHODOLOGY

## 3.1 Introduction

This chapter describes the research design, system development methodology, sprint structure, technology stack, and architectural design decisions that guided the development of the AI-powered LMS. The chapter explains the rationale for each methodological choice and describes the tools used across the frontend, backend, database, and AI integration layers.

## 3.2 Research Design

This project employs a **Design Science Research (DSR)** methodology, which frames information systems research as the creation and evaluation of artefacts — in this case, a software system — that address identified organisational or social problems. Vom Brocke et al. (2020) described DSR as the appropriate paradigm when the primary research contribution is an innovative artefact rather than a theoretical proposition or empirical observation, providing researchers with a structured process for designing, implementing, and evaluating IS artefacts within their problem context. This methodology is well-suited to applied software development projects such as this one. The research cycle followed three principal phases: (1) problem identification and motivation (Chapter One), (2) design and development (Chapter Four), and (3) demonstration and evaluation (Chapter Four).

## 3.3 System Development Methodology

The system was developed using an **Agile Software Development** methodology, specifically following principles from the Scrum framework (Schwaber & Sutherland, 2020). Agile was chosen over traditional waterfall approaches for the following reasons:

- The requirements for AI feature integration were partially emergent, requiring iterative refinement as the capabilities of the Claude API were explored.
- Agile's sprint-based delivery structure facilitated regular review of completed functionality against project objectives.
- Short feedback loops enabled the identification and correction of technical issues early in the development process.
- The Scrum Guide's emphasis on empirical process control and iterative delivery of working software aligned with the project's applied research orientation (Schwaber & Sutherland, 2020).

Each sprint was planned to deliver a coherent, testable increment of system functionality. User stories were derived from the requirements of each role group and mapped to development tasks within each sprint.

## 3.4 Sprint Planning and Deliverables

Development was structured across four sprints, each targeting a distinct functional domain of the system.

**Table 3.1: Sprint Deliverables Summary**

| Sprint | Focus Area | Key Deliverables |
|---|---|---|
| Sprint 1 | Auth, Users, Courses | JWT auth, user CRUD, course management, role-based dashboards, frontend scaffolding |
| Sprint 2 | Modules, Assignments, Grading | Module/resource management, assignment submission workflows, gradebook, AI auto-grading |
| Sprint 3 | AI Features, Announcements, Dashboards | Study assistant, quiz generator, summariser, announcements, real-time dashboard statistics |
| Sprint 4 | Messaging, Plagiarism, UI Polish | Direct messaging, AI plagiarism detection, notifications, loading skeletons, toast notifications |

Each sprint followed a consistent cycle: planning, implementation, integration testing, and review. The sprint structure ensured that by the end of Sprint 2, all non-AI core features were functional and testable, allowing AI feature development in Sprints 3 and 4 to focus exclusively on integration quality and response accuracy.

## 3.5 Tools and Technologies

**Table 3.2: Technology Stack Summary**

| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | React 18 + TypeScript | Industry-standard SPA framework; TypeScript enforces type safety |
| Build Tool | Vite | Fast hot module replacement; superior developer experience vs CRA |
| Styling | Tailwind CSS | Utility-first; enables rapid, consistent UI without custom CSS overhead |
| State Management | Zustand + React Query | Zustand for global UI state; React Query for server state with caching |
| Routing | React Router v6 | Declarative routing with role-gated protected routes |
| HTTP Client | Axios | Interceptor support for JWT token auto-refresh |
| Backend Framework | Node.js + Express.js | Non-blocking I/O; large ecosystem; well-suited for REST API development |
| ORM | Prisma | Type-safe database queries; migration management; schema-first design |
| Database | MySQL / MariaDB | Mature relational database; strong institutional familiarity |
| Authentication | JWT (access + refresh tokens) | Stateless, scalable authentication; supports token rotation |
| Password Hashing | bcrypt | Adaptive hashing algorithm; resistant to brute-force attacks |
| Validation | Zod | Runtime schema validation with TypeScript inference |
| AI Provider | Anthropic Claude API | High-quality language model; strong instruction-following; safety alignment |
| File Storage | Azure Blob Storage | Scalable cloud object storage for submitted files |
| Charting | Recharts | React-native chart library for dashboard visualisations |

The decision to use TypeScript throughout both the frontend and backend (strict mode enabled) was deliberate. TypeScript's static typing catches a significant class of runtime errors at compile time, improving maintainability and reducing debugging cycles in a codebase of this scale.

Prisma was selected over raw SQL or traditional ORMs (such as Sequelize) for its schema-first design approach, which provides a single source of truth for the database schema, auto-generated type-safe client code, and a streamlined migration workflow. This eliminates the class of type errors that arise from mismatches between database schema and application code.

## 3.6 System Architecture Design

The system follows a **three-tier client-server architecture**:

1. **Presentation Tier (Frontend):** A React single-page application (SPA) communicates with the backend exclusively via REST API calls over HTTPS. The frontend maintains no direct database access. JWT tokens are stored in memory (access token) and localStorage (refresh token), with automatic token rotation handled by an Axios request interceptor.

2. **Application Tier (Backend):** A Node.js/Express.js API server handles all business logic, authentication, authorisation, database operations, and AI API calls. All AI requests from the frontend are proxied through the backend — the Anthropic API key is never exposed to the client.

3. **Data Tier (Database):** A MySQL/MariaDB relational database stores all persistent application data. Prisma ORM manages schema migrations and provides type-safe database access. File attachments are stored in Azure Blob Storage, with URLs persisted in the database.

This separation of concerns ensures that sensitive credentials (database connection strings, Anthropic API key, JWT secrets) are confined to the backend environment and never transmitted to or accessible by client browsers.

## 3.7 Database Design Approach

The relational database schema was designed schema-first using the Prisma Schema Language. The design follows Third Normal Form (3NF) to minimise data redundancy and maintain referential integrity. Key design decisions include:

- **Soft deletion** for user accounts via an `isActive` boolean flag, preserving referential integrity for related records (submissions, grades, messages) while preventing deactivated users from logging in.
- **Composite unique constraints** on the `Enrolment` model (`studentId_courseId`) to prevent duplicate enrolments.
- **Cascade deletion** for course-owned entities (modules, resources, assignments, submissions, grades, announcements) ensuring that deleting a course cleans up all dependent data.
- **Upsert patterns** for submissions and grades, allowing students to update submissions before the due date and lecturers to revise grades.
- **Indexed foreign keys** on all join columns to optimise the many JOIN queries generated by role-scoped data retrieval.

## 3.8 Security Design

Security was addressed at multiple layers of the system:

**Authentication:** JWT access tokens with a 15-minute expiry are paired with 7-day refresh tokens stored in the database. On each access token refresh, the old refresh token is invalidated and a new one issued (token rotation), preventing indefinite session reuse from a compromised refresh token.

**Authorisation:** All protected routes pass through an `authenticate` middleware (which verifies the Bearer token and populates `req.user`) followed by an `authorise` middleware (which checks `req.user.role` against an allowlist of permitted roles). This two-step middleware chain ensures that role checks can only be bypassed if authentication itself is bypassed.

**Input Validation:** All request bodies are validated using Zod schemas before processing. Zod validation errors are caught by the global error handler and returned as structured 400 responses, preventing malformed data from reaching the database layer.

**CORS:** Cross-Origin Resource Sharing is configured to permit only the known frontend origin, preventing unauthorised cross-site requests.

**Secret Management:** All sensitive credentials (JWT secrets, database URL, API keys) are stored exclusively in backend `.env` files and excluded from version control via `.gitignore`.

## 3.9 System Requirements Analysis

Prior to commencing development, a structured requirements elicitation process was undertaken to identify and document the functional and non-functional requirements of the system. Requirements were derived from an analysis of the research objectives, review of existing LMS feature sets, and consideration of the three stakeholder roles. The requirements are classified following Dalpiaz and Niu (2020), who categorised software requirements into functional requirements (what the system shall do) and non-functional requirements (constraints on system quality attributes including security, performance, and usability), noting that in AI-integrated systems, non-functional requirements around transparency and explainability deserve particular attention alongside the traditional quality attributes.

### 3.9.1 Functional Requirements

Functional requirements specify what the system must do — the behaviours, functions, and operations it must support.

| ID | Requirement | Priority | Role(s) |
|---|---|---|---|
| FR-01 | The system shall allow administrators to create, update, deactivate, and delete user accounts | High | Admin |
| FR-02 | The system shall enforce role-based access control, restricting each user to their permitted features | High | All |
| FR-03 | The system shall authenticate users via email and password and issue JWT token pairs on successful login | High | All |
| FR-04 | The system shall automatically refresh expired access tokens using the stored refresh token without requiring re-login | High | All |
| FR-05 | The system shall allow administrators and lecturers to create, edit, publish, and delete courses | High | Admin, Lecturer |
| FR-06 | The system shall allow administrators to enrol students in courses | High | Admin |
| FR-07 | The system shall present each role with a contextually appropriate dashboard populated with real-time statistics | Medium | All |
| FR-08 | The system shall allow lecturers to create, reorder, and delete course modules and attach typed resources | High | Lecturer |
| FR-09 | The system shall allow enrolled students to view course modules and access linked resources in read-only mode | High | Student |
| FR-10 | The system shall allow lecturers to create assignments with a title, description, due date, and maximum score | High | Lecturer |
| FR-11 | The system shall allow students to submit text or file URL responses to open assignments and update submissions before the due date | High | Student |
| FR-12 | The system shall allow lecturers to grade submissions with a score and feedback, saving grades as draft or published | High | Lecturer |
| FR-13 | The system shall prevent draft grades from being visible to students until explicitly published | High | Lecturer |
| FR-14 | The system shall provide a gradebook view displaying a student-by-assignment score matrix | Medium | Lecturer |
| FR-15 | The system shall allow lecturers to post course announcements visible to all enrolled students | Medium | Lecturer |
| FR-16 | The system shall support direct messaging between users with role-scoped contact lists | Medium | All |
| FR-17 | The system shall generate in-app notifications for new messages, published grades, and new announcements | Medium | All |
| FR-18 | The system shall provide an AI study assistant that answers questions grounded in a specific course's content | High | Student, Lecturer |
| FR-19 | The system shall allow lecturers to request AI-generated grading suggestions, returned as non-binding drafts | High | Lecturer |
| FR-20 | The system shall allow lecturers to generate AI-produced MCQ quizzes from pasted text | Medium | Lecturer |
| FR-21 | The system shall allow lecturers to request AI-generated summaries of course material text | Medium | Lecturer |
| FR-22 | The system shall allow lecturers to run an AI plagiarism check comparing a submission against the course's submission pool | Medium | Lecturer |

### 3.9.2 Non-Functional Requirements

Non-functional requirements specify the quality attributes and constraints governing how the system performs its functions.

| ID | Requirement | Category |
|---|---|---|
| NFR-01 | All API routes must enforce authentication and authorisation checks server-side, independent of frontend state | Security |
| NFR-02 | User passwords must be stored as bcrypt hashes; plaintext passwords must never be persisted or logged | Security |
| NFR-03 | The Anthropic API key must never be transmitted to or accessible by client browsers | Security |
| NFR-04 | JWT access tokens must expire within 15 minutes; refresh tokens must expire within 7 days | Security |
| NFR-05 | The system must validate all incoming request bodies using Zod schemas before processing | Reliability |
| NFR-06 | CRUD API endpoints must respond within 200ms under normal single-user development load | Performance |
| NFR-07 | The system must display skeleton loading states during data fetching to maintain perceived responsiveness | Usability |
| NFR-08 | All user-facing mutation outcomes (create, update, delete) must be communicated via toast notifications | Usability |
| NFR-09 | The frontend must function correctly on current versions of Chrome, Firefox, Edge, and Safari | Compatibility |
| NFR-10 | The application must be responsive and usable on screen widths from 375px (mobile) to 1920px (desktop) | Usability |
| NFR-11 | All code must use TypeScript in strict mode on both frontend and backend | Maintainability |
| NFR-12 | Database schema changes must be managed exclusively through Prisma migrations | Maintainability |
| NFR-13 | Sensitive credentials (API keys, DB URL, JWT secrets) must be stored in `.env` files excluded from version control | Security |
| NFR-14 | The system architecture must support independent deployment of the frontend and backend | Scalability |
| NFR-15 | AI endpoint responses that include structured data must be validated for schema compliance before returning to the client | Reliability |

## 3.10 Use Case Summary

The system's functionality is organised around the interactions of three primary actors: Administrator, Lecturer, and Student. The following summarises the principal use cases per actor:

**Administrator use cases:** Manage user accounts (create, edit, deactivate); manage course catalogue (create, edit, delete, archive); enrol students in courses; access platform-wide statistics via the admin dashboard; communicate with any user via direct messaging.

**Lecturer use cases:** Manage their assigned courses (create, edit, publish); build course content via the module and resource management interface; create and manage assignments; review and grade student submissions (with AI grading assistance); run AI plagiarism checks; generate AI quizzes and summaries; post course announcements; view gradebook; communicate with enrolled students.

**Student use cases:** View enrolled courses and access course modules and resources; submit and update assignment responses; view published grades and feedback; interact with the AI study assistant scoped to each enrolled course; receive notifications for grade publications and announcements; communicate with course lecturers.

## 3.11 Chapter Summary

This chapter presented the DSR research paradigm, the Agile/Scrum development methodology, the four-sprint delivery plan, the full technology stack, the three-tier architecture, the database design approach, the security architecture, the functional and non-functional requirements, and the use case summary. Together, these methodological decisions provided the structural foundation for the implementation and testing described in Chapter Four.

---

---

# CHAPTER FOUR: SYSTEM DESIGN, IMPLEMENTATION, AND TESTING

## 4.1 Introduction

This chapter provides a detailed account of the system's design and implementation across all functional domains, followed by a comprehensive evaluation of the completed system. The implementation sections cover the entity-relationship model, API design, authentication implementation, frontend architecture, AI module design, messaging, and the assessment subsystem. The evaluation sections present the testing strategy, functional test results, AI feature assessment, performance observations, and a comparative discussion against existing platforms.

## 4.2 System Architecture

The system comprises two independently deployable applications sharing a MySQL database and communicating via REST API:

**lms-backend:** A Node.js/Express REST API server providing all data and business logic. Entry point: `src/index.ts`. Routes are mounted with the `/api` prefix. The server registers the following route groups: auth, users, courses, modules, resources, assignments, submissions, AI, dashboard, announcements, messages, and notifications.

**lms-frontend:** A React SPA built with Vite. Role-aware navigation is implemented via a `ProtectedRoute` component that reads the authenticated user's role from Zustand state and redirects unauthorised access attempts to `/unauthorized`. After login, users are redirected to role-specific dashboard routes:

- `ADMIN` → `/admin/dashboard`
- `LECTURER` → `/lecturer/dashboard`
- `STUDENT` → `/student/dashboard`

## 4.3 Database Schema

The Prisma schema defines ten models, four enumerations, and their relationships. The primary models are:

**User:** Central identity model. Fields include `id` (CUID), `name`, `email` (unique), `password` (bcrypt hash), `role` (ADMIN | LECTURER | STUDENT), `isActive`, and audit timestamps. Relationships include `lecturerCourses`, `enrolments`, `submissions`, `sentMessages`, `receivedMessages`, `announcements`, `gradesGiven`, and `notifications`.

**Course:** Represents a course unit. Fields include `title`, `code` (unique), `description`, `status` (DRAFT | PUBLISHED | ARCHIVED), and `lecturerId`. Related to `Module`, `Assignment`, `Announcement`, and `Enrolment`.

**Enrolment:** Join table linking students to courses with a composite unique constraint preventing duplicate enrolments.

**Module / Resource:** Modules are ordered content sections within a course. Resources are typed attachments (FILE | LINK | VIDEO) belonging to a module.

**Assignment / Submission / Grade:** The assessment hierarchy. Students submit text content or file URLs for assignments; lecturers create Grade records with `score`, `feedback`, and `isDraft` fields. Grading supports both draft (private) and published states.

**Message:** Supports direct messaging between users with a `readAt` timestamp for read-receipt tracking.

**Notification:** Stores in-app notifications with three typed events: `NEW_MESSAGE`, `GRADE_PUBLISHED`, and `NEW_ANNOUNCEMENT`. Includes a `link` field for navigation on click and a `readAt` timestamp.

**RefreshToken:** Stores active refresh tokens for token rotation during the JWT renewal cycle.

## 4.4 Authentication and Authorisation

The authentication system implements the access-token/refresh-token dual-token pattern. The access token (15 minutes) is used for API authorisation. When it expires, the frontend's Axios interceptor automatically attempts a refresh using the stored refresh token (7 days). Concurrent requests during a refresh cycle are queued and replayed after the new token is obtained, preventing race conditions.

The `authenticate` middleware extracts the Bearer token from the `Authorization` header, verifies it using `jsonwebtoken`, and attaches the decoded `{ id, role }` payload to `req.user`. The `authorise` middleware factory accepts a list of permitted roles and returns a middleware that checks `req.user.role` membership, returning HTTP 403 if the role is not permitted.

**Listing 4.1: Authorise Middleware**
```typescript
export function authorise(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    next()
  }
}
```

## 4.5 Backend API Implementation

The backend implements a RESTful API with consistent response shapes. All success responses follow the shape `{ success: true, data: T }` and all error responses follow `{ success: false, message: string, errors?: any }`. This consistency enables the frontend to handle responses uniformly.

The API is structured around the following resource domains, with representative endpoints:

**Auth:** `POST /api/auth/login` (validates credentials, issues token pair), `POST /api/auth/refresh` (rotates tokens), `POST /api/auth/logout` (invalidates refresh token), `GET /api/auth/me` (returns authenticated user profile).

**Users (Admin):** Full CRUD with pagination, role filtering, and soft-delete toggle via `isActive`.

**Courses:** Role-scoped list (admin sees all; lecturers see their own; students see enrolled courses), CRUD operations, enrolment management, and student roster retrieval.

**Modules/Resources:** Lecturer-only mutation with student read access gated on active enrolment. Includes ordered module creation with auto-incrementing `order` value and resource CRUD.

**Assignments/Submissions/Grades:** Assignment CRUD for lecturers; student submission with upsert semantics; grade creation with draft/publish state; gradebook endpoint returning a student × assignment matrix.

**Dashboard:** Single `GET /api/dashboard/stats` endpoint returning role-typed statistics, enabling each dashboard to populate with real-time metrics.

**Table 4.1: API Endpoint Summary**

| Resource Group | Endpoints | Access |
|---|---|---|
| Auth | 4 endpoints | Public / Authenticated |
| Users | 5 endpoints | Admin only |
| Courses | 6 endpoints | Role-scoped |
| Modules/Resources | 6 endpoints | Lecturer / Enrolled Student |
| Assignments | 6 endpoints | Lecturer / Enrolled Student |
| Submissions | 2 endpoints | Lecturer (list/grade), Student (submit) |
| AI | 5 endpoints | Role-restricted |
| Dashboard | 1 endpoint | All authenticated |
| Announcements | 5 endpoints | Lecturer (write), Enrolled Student (read) |
| Messages | 4 endpoints | All authenticated |
| Notifications | 3 endpoints | All authenticated |

## 4.6 Frontend Implementation

The frontend is organised into a domain-driven structure under `src/`:

**Components:** Reusable UI primitives (`Button`, `Input`, `Select`, `Textarea`, `Badge`, `Modal`) with typed props; layout components (`DashboardShell`, `Sidebar`, `Navbar`); and shared domain components (`AnnouncementsPanel`, `AiToolsModal`).

**Pages:** Grouped by role under `pages/admin/`, `pages/lecturer/`, `pages/student/`, and `pages/auth/`. Each role's pages are wrapped in a `ProtectedRoute` component at the router level.

**Services:** Axios-based service modules per domain (`auth.service.ts`, `course.service.ts`, `assignment.service.ts`, etc.) encapsulate all HTTP calls with typed return values.

**Hooks:** React Query-backed custom hooks (`useUsers`, `useCourses`, `useAssignments`, etc.) expose data fetching and mutation operations to page components, keeping data-fetching concerns separated from UI logic.

**Store:** Zustand store for auth state (`authStore.ts`) with localStorage persistence for refresh token and user profile between browser sessions.

Loading states throughout the application use skeleton components (`SkeletonCard`, `SkeletonTable`, `SkeletonList`) rather than spinners, providing layout-accurate placeholders that reduce perceived loading time. Success and error outcomes for all mutations are communicated via a global toast notification system implemented with a React context provider and portal-rendered toast items.

## 4.7 AI Module Implementation

All AI functionality is implemented in `src/controllers/ai.controller.ts` on the backend. The Anthropic SDK client is instantiated once at module scope using the environment-injected API key. The following five AI endpoints are implemented:

### 4.7.1 Course-Scoped Study Assistant (`POST /api/ai/chat`)

The study assistant accepts a `courseId`, a `message` string, and a conversation `history` array. On receiving a request, the controller:

1. Verifies that the requesting user has access to the course (enrolment check for students, ownership check for lecturers).
2. Fetches all modules and their resources for the course from the database.
3. Constructs a course context string listing each module's title and the titles and types of its resources.
4. Builds a system prompt that identifies the assistant as the study assistant for the specific course, includes the course description, and embeds the full content structure.
5. Sends the history and new message to the Claude API, receiving a text reply.

This approach implements a lightweight RAG pipeline: the "retrieval" step retrieves the course's content index from the relational database, and the "generation" step uses this retrieved context as part of the LLM's grounding information. The system prompt explicitly instructs the model not to fabricate facts and to redirect off-topic queries back to the course.

### 4.7.2 AI Grading Feedback (`POST /api/ai/grade-feedback`)

The auto-grading endpoint accepts a `submissionId` and an optional `rubric` string. It fetches the submission with its associated assignment (including `maxScore`) and student name, constructs a structured grading prompt, and requests a JSON-formatted response containing `score` and `feedback`. The response score is clamped to the assignment's valid range before being returned.

The API response always includes `isDraft: true`, which the frontend displays prominently to indicate that the grade has not yet been saved and requires lecturer confirmation. This design prevents automated AI outputs from being inadvertently presented to students as official grades.

### 4.7.3 Quiz Generator (`POST /api/ai/generate-quiz`)

The quiz generator accepts a `courseId`, a `text` payload (up to 8,000 characters), and a `numQuestions` parameter. The system prompt instructs Claude to return a strictly structured JSON array of MCQ objects, each with a `question`, four labelled `options`, an `answer` key (A–D), and an `explanation`. The frontend renders the generated questions with a show/hide answer toggle, enabling the lecturer to review them before use.

### 4.7.4 Material Summariser (`POST /api/ai/summarise`)

The summariser accepts raw text and instructs Claude to produce a structured, bullet-pointed academic summary suitable for inclusion in course materials or revision guides.

### 4.7.5 Plagiarism Detection (`POST /api/ai/plagiarism-check`)

The plagiarism detection endpoint accepts a `submissionId`, retrieves the target submission, and fetches all other text submissions for the same assignment. If no pool submissions exist, it returns immediately with a "no comparisons available" verdict.

For non-empty pools, the controller constructs a comparison prompt that presents the target submission and all pool submissions to the model. The system prompt instructs the model to identify near-identical passages, paraphrased content, and unusual phrasal congruence, returning a JSON verdict with a per-student `flags` array. Each flag includes a `studentName`, a `similarityLevel` (high/medium/low), and an `evidence` string quoting the suspicious passage.

The frontend renders the plagiarism report in the submissions panel, colour-coded by similarity level. The interface includes prominent labelling that the report is an AI investigative aid and not a formal determination of academic misconduct.

## 4.8 Direct Messaging and Notification System

The direct messaging system implements a conversation-based inbox available to all three user roles. Contact lists are role-scoped:

- **Students** see lecturers of their enrolled courses only.
- **Lecturers** see students enrolled in their courses.
- **Admins** see all active users.

This scoping prevents arbitrary cross-institutional messaging and keeps communication contextually relevant. The frontend polls for new conversations every 15 seconds and for thread updates every 10 seconds, providing near-real-time updates without requiring WebSocket infrastructure.

When a message is sent, the `sendMessage` controller creates the message record and triggers a `createNotification` call to generate a `NEW_MESSAGE` notification for the recipient. Similarly, `GRADE_PUBLISHED` notifications are created when a lecturer publishes (non-draft) a grade, and `NEW_ANNOUNCEMENT` notifications are bulk-created for all enrolled students when an announcement is posted.

The notification system is surfaced in the Navbar as a bell icon with a red unread count badge. Clicking the bell opens a dropdown listing the most recent 30 notifications, with unread items highlighted. Each notification includes a `link` field; clicking a notification marks it as read and navigates to the relevant resource.

## 4.9 Module and Resource Management

The module management interface supports full CRUD operations for course sections. Modules have an integer `order` field that governs their display sequence. Reordering is implemented as a swap: when a module is moved up or down, its `order` value is exchanged with that of the adjacent module via two concurrent `PATCH /api/modules/:id` requests. This avoids the complexity of a full re-indexing operation while maintaining correct ordering.

Resources within a module are typed as FILE, LINK, or VIDEO. Students access resources as read-only hyperlinks; lecturers manage them via an inline form within the module accordion. Resource URLs are user-supplied and not validated beyond URL format checking — production deployment would integrate with Azure Blob Storage for file uploads.

## 4.10 Assessment and Grading Subsystem

The assessment subsystem covers the full lifecycle from assignment creation through submission, grading, and gradebook reporting.

**Assignment Creation:** Lecturers create assignments with a title, optional description, due date, and maximum score. Due date status (open/closed) is computed on the frontend from the stored UTC timestamp.

**Student Submission:** Students submit text content or a file URL. The submission endpoint uses an upsert operation, allowing students to update their submission before the due date while preserving the original submission timestamp.

**Grading:** Lecturers grade submissions by entering a score and optional feedback. The `isDraft` boolean governs visibility: draft grades are visible only to the lecturer; published grades trigger a `GRADE_PUBLISHED` notification and update the submission status to `GRADED`. The AI grade suggestion feature populates the score and feedback fields from the Claude API response but does not save the grade — the lecturer must explicitly submit the form.

**Gradebook:** The gradebook endpoint returns a matrix of students against assignments, with each cell containing the grade record (if any). The frontend renders this as a scrollable table with colour-coded score cells (green ≥ 70%, amber 50–69%, red <50%) and draft/published indicators.

## 4.11 User Interface Design

User interface design decisions were guided by the Technology Acceptance Model constructs of perceived usefulness and perceived ease of use (Scherer et al., 2019), and by the W3C Web Content Accessibility Guidelines (W3C, 2023) for interaction design principles including consistent navigation, clear feedback, and error prevention. The interface follows a consistent design language implemented through Tailwind CSS utility classes, with a restricted colour palette centred on a primary indigo tone (`primary-600`), neutral greys for text and surfaces, and semantic status colours (green for success, amber for warning, red for error/high severity).

### 4.11.1 Layout and Navigation

All authenticated pages share a two-panel layout: a fixed 256px sidebar on the left containing role-aware navigation links and the current user's identity pill, and a main content area occupying the remaining width. The `DashboardShell` component wraps each page's content with a consistent header (page title), optional action slot (for primary action buttons), and content area.

Navigation items in the sidebar are generated dynamically from a role-keyed configuration object. Active links are highlighted using React Router's `isActive` callback on the `NavLink` component. This ensures the sidebar always reflects the user's current location without requiring any additional state management.

A persistent `Navbar` at the top of the main content area provides access to the notification bell and, for smaller screens, a mobile menu toggle. The notification bell displays an unread count badge (rendered only when count > 0) and expands to a dropdown listing the 30 most recent notifications, grouped by type with distinct icons.

### 4.11.2 Role-Specific Dashboard Design

Each role's dashboard was designed to surface the most operationally relevant information at a glance, reducing the number of clicks required to access key actions.

The **Admin Dashboard** displays four summary cards (total users, total courses, total enrolments, active users), a bar chart (using Recharts' `BarChart`) showing course distribution by status (DRAFT, PUBLISHED, ARCHIVED), and a recent users table listing the five most recently created accounts with their role badge and activation status.

The **Lecturer Dashboard** displays cards for assigned courses, enrolled students, total assignments, and pending-grade submissions. A recent submissions feed lists the five most recent student submissions across all courses, with links to the relevant assignment grading view. This feed addresses one of the most common lecturer pain points identified in the literature: delayed awareness of student activity (Wisniewski et al., 2020).

The **Student Dashboard** displays enrolled course count, upcoming assignment count (due within 7 days), and recent grade count. An upcoming assignments panel lists each open assignment with its due date, the associated course, and a submission status indicator (submitted/not submitted). A recent grades panel lists the most recently published grades with score, colour-coded by percentage, and a link to view the full feedback.

### 4.11.3 Key Interaction Patterns

**Modals:** All create and edit operations are presented in modal dialogs rendered via React portals to the `document.body`, ensuring correct z-index stacking and scroll-lock behaviour. Modals close on ESC key press and on clicking the backdrop overlay, providing expected keyboard and pointer interaction behaviour consistent with W3C (2023) guidelines for accessible dialog components.

**Inline Feedback:** All form submissions trigger a loading state on the submit button (disabled, spinner icon) to prevent double-submission. On completion, a toast notification confirms success or surfaces the error message returned by the API. Toast items auto-dismiss after 4 seconds and can be manually dismissed by clicking.

**Skeleton Loading:** Data-fetching states use layout-accurate skeleton components rather than generic spinners. `SkeletonTable` renders placeholder rows matching the target table structure; `SkeletonList` renders stacked card-shaped placeholders; `SkeletonCard` renders individual card placeholders for grid layouts. This approach minimises cumulative layout shift (CLS) and maintains the user's spatial orientation during loading (Kasneci et al., 2023).

**Empty States:** All list and table views include styled empty-state panels (dashed border, centred descriptive text, optional call-to-action button) when no data is available, avoiding blank white areas that could be mistaken for loading failures.

### 4.11.4 Sample Code: React Query Mutation Hook

The following listing illustrates the pattern used across all mutation hooks, using the assignment creation hook as a representative example. This pattern encapsulates the React Query mutation, cache invalidation, and error propagation in a reusable hook that page components consume without needing to manage query state directly.

**Listing 4.2: useCreateAssignment Hook**
```typescript
export function useCreateAssignment(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssignmentInput) =>
      assignmentService.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignments', courseId],
      })
    },
  })
}
```

### 4.11.5 Sample Code: Zod Validation Schema

The following listing shows the Zod validation schema for the assignment creation endpoint. This schema is used by the Express route handler to validate the incoming request body before it reaches the controller, ensuring type safety and returning structured validation errors to the client on failure.

**Listing 4.3: Assignment Creation Zod Schema**
```typescript
const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime(),
  maxScore: z.number().int().min(1).max(1000),
})
```

### 4.11.6 Sample Code: Role-Scoped Course Query

The following listing shows the role-scoped course list logic in the course controller. This pattern — switching on `req.user.role` to determine the Prisma query filter — is used throughout the application to enforce data isolation between roles without duplicating route handlers.

**Listing 4.4: Role-Scoped Course List (course.controller.ts)**
```typescript
export async function getCourses(req: Request, res: Response) {
  const { role, id } = req.user!

  const where =
    role === 'ADMIN'
      ? {}
      : role === 'LECTURER'
      ? { lecturerId: id }
      : {
          enrolments: { some: { studentId: id } },
          status: 'PUBLISHED' as CourseStatus,
        }

  const courses = await prisma.course.findMany({
    where,
    include: { lecturer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ success: true, data: courses })
}
```

## 4.12 Testing Strategy

Given the project's scope as a Final Year Project artefact rather than a production system, the primary testing approach was **functional testing** (also termed black-box testing), in which system behaviour was verified against defined requirements without inspecting internal implementation details (Pressman & Maxim, 2019). Testing was conducted incrementally throughout development, with each sprint concluding with a review of that sprint's deliverables against defined acceptance criteria.

Testing was performed manually by the developer using a local development environment with a seeded database containing representative test data: multiple administrator, lecturer, and student accounts; several courses with enrolments; modules with resources; assignments; and submitted student work. AI feature testing used real API calls to the Anthropic Claude API to verify response quality and JSON structure compliance.

**AI endpoint testing** involved a combination of:
- **Structural validation:** Confirming that AI responses conformed to the expected JSON schemas (e.g., quiz questions with exactly four options labelled A–D).
- **Edge case testing:** Verifying graceful handling of empty submission pools (plagiarism check), missing content fields (grading endpoint), and excessively long inputs (truncation via schema `max` constraints).
- **Qualitative review:** Manually assessing the relevance, accuracy, and educational quality of generated content including quiz questions, feedback, and summaries.

## 4.12 Functional Testing Results

**Table 4.3: Functional Test Cases and Results**

| Test Case | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-001 | Admin login with valid credentials | Redirect to `/admin/dashboard`, JWT issued | As expected | Pass |
| TC-002 | Student attempts to access `/admin/users` | Redirect to `/unauthorized` | As expected | Pass |
| TC-003 | Admin creates a new lecturer account | New user visible in User Management table | As expected | Pass |
| TC-004 | Lecturer creates a course | Course appears in lecturer's course list with DRAFT status | As expected | Pass |
| TC-005 | Admin enrols student in a course | Student can view course in their enrolled courses list | As expected | Pass |
| TC-006 | Lecturer adds a module to a course | Module appears in course module list with correct order | As expected | Pass |
| TC-007 | Lecturer reorders modules (move up) | Module order updates correctly, list re-renders | As expected | Pass |
| TC-008 | Student submits assignment before due date | Submission saved; re-submission overwrites previous | As expected | Pass |
| TC-009 | Lecturer grades submission and publishes | Student receives GRADE_PUBLISHED notification; grade visible to student | As expected | Pass |
| TC-010 | Lecturer saves draft grade | Grade saved but not visible to student; draft indicator shown in gradebook | As expected | Pass |
| TC-011 | JWT access token expires | Next API call triggers silent token refresh via interceptor | As expected | Pass |
| TC-012 | User logs out | Refresh token invalidated; re-login required | As expected | Pass |
| TC-013 | Expired refresh token used | Server returns 401; user redirected to login | As expected | Pass |
| TC-014 | Student sends message to lecturer | Message delivered; notification created for lecturer | As expected | Pass |
| TC-015 | Lecturer creates announcement | Enrolled students receive NEW_ANNOUNCEMENT notifications | As expected | Pass |
| TC-016 | AI study assistant query (within course) | Context-grounded reply returned within expected format | As expected | Pass |
| TC-017 | AI grading suggestion | Score (within range) and feedback text returned with isDraft: true | As expected | Pass |
| TC-018 | AI quiz generation (5 questions) | JSON array with 5 MCQ objects, each with 4 options and correct answer key | As expected | Pass |
| TC-019 | AI plagiarism check (no pool submissions) | Returns "no other submissions" verdict with empty flags array | As expected | Pass |
| TC-020 | AI plagiarism check (similar submissions) | Returns verdict with flags identifying similar students and evidence | As expected | Pass |
| TC-021 | Loading skeleton shown on data fetch | SkeletonList renders while React Query fetches data | As expected | Pass |
| TC-022 | Toast notification on mutation success/error | Toast appears for grade save, assignment delete, user management actions | As expected | Pass |

| TC-023 | Admin deactivates a user account | User cannot log in; API returns 401 on attempted login | As expected | Pass |
| TC-024 | Lecturer attempts to edit another lecturer's course | API returns 403 Forbidden | As expected | Pass |
| TC-025 | Student attempts to access lecturer gradebook route | Redirect to `/unauthorized` | As expected | Pass |
| TC-026 | Lecturer reorders modules (move down) | Module order swaps correctly with the module below | As expected | Pass |
| TC-027 | AI summariser returns structured bullet-point output | Bullet-pointed summary returned; no raw JSON exposed to client | As expected | Pass |
| TC-028 | Concurrent API requests during token refresh | Requests are queued and replayed successfully after token rotation | As expected | Pass |
| TC-029 | Admin views all users with role filter applied | Only users matching the selected role are returned | As expected | Pass |
| TC-030 | Notification bell badge clears after marking all read | Unread count returns to zero; badge disappears | As expected | Pass |

All 30 test cases returned the expected results. No functional defects were identified in the final tested build.

## 4.13 AI Feature Evaluation

**Table 4.4: AI Feature Evaluation Summary**

| Feature | Prompt Design | Response Quality | JSON Compliance | Edge Case Handling | Overall Assessment |
|---|---|---|---|---|---|
| Study Assistant | System prompt with course context and content index | Responses appropriately grounded in course content; declines off-topic questions | N/A (free text) | Handles empty module list gracefully | Effective |
| Auto-Grade Feedback | Structured grading prompt with assignment metadata and rubric | Scores reasonable relative to submission quality; feedback specific and constructive | Reliable; JSON extraction via regex fallback | Empty content field returns 400 error | Effective |
| Quiz Generator | Strict format instruction in system prompt | Questions test comprehension, not just recall; distractors plausible | High compliance; validated during testing | Short input (<10 chars) blocked by Zod | Effective |
| Summariser | Academic summarisation prompt | Bullet-pointed, accurate summaries of varied text | N/A (free text) | No specific edge cases observed | Effective |
| Plagiarism Detector | Side-by-side comparison prompt | Correct identification of verbatim and paraphrased content in test cases; appropriate low/medium/high ratings | Reliable JSON; regex extraction used | Empty pool handled pre-API with early return | Effective |

The AI study assistant demonstrated appropriate course-scoping behaviour: when queried about topics outside the course content, the model consistently redirected students to relevant course materials or acknowledged the absence of relevant content rather than fabricating responses. This behaviour aligns with the system prompt's explicit instruction to avoid hallucination.

The auto-grading feedback generated useful, criterion-referenced feedback for short-answer test submissions. Scores generated by the AI correlated reasonably with manual assessments in informal comparisons, though the draft-and-confirm workflow ensures that discrepancies are reviewed before reaching students. This design is consistent with the recommendations of Ramesh and Sanampudi (2022) regarding human oversight in AI grading.

The plagiarism detection module correctly flagged near-verbatim and paraphrased content in test submissions constructed to contain known similarities. It did not raise false flags on entirely original content. The evidence strings returned were informative and specific, supporting effective lecturer review.

## 4.14 System Performance Observations

Under local development conditions, typical API response times for CRUD operations were under 100ms. AI endpoints exhibited longer latency due to the synchronous nature of the Claude API calls: typical response times ranged from 2 to 8 seconds depending on prompt complexity and response length. The plagiarism check endpoint, which constructs prompts that grow with the size of the submission pool, had the longest observed latency at approximately 8–12 seconds for pools of 5–10 submissions.

These latency characteristics are consistent with current LLM API performance benchmarks and are considered acceptable given that AI features are invoked deliberately (on button click) rather than on every page load. Frontend loading states and button disabled states provide appropriate user feedback during AI processing.

## 4.15 Discussion of Results

The functional testing results confirm that all core and AI-enhanced features of the system operate as designed. The system successfully demonstrates the viability of integrating LLM capabilities into a multi-role LMS without compromising the security, reliability, or usability of non-AI features.

The course-scoped study assistant represents a meaningful advance over generic chatbot integrations. By grounding responses in the actual module structure of a specific course, the assistant provides contextually relevant support that a general-purpose chatbot could not replicate without access to institutional data. This validates the RAG architectural choice and supports the findings of Zawacki-Richter et al. (2019) regarding the importance of personalised, context-aware AI tutoring.

The draft-and-confirm grading workflow proved to be a key design decision. Testing revealed instances where the AI-generated score differed from what a human reviewer might assign, confirming that unreviewed AI grading would be inappropriate for academic use. The workflow's explicit labelling of AI output as a draft successfully positions the AI as a decision-support tool rather than a decision-making authority, aligning with Holmes et al. (2019) on the appropriate role of AI in education.

The plagiarism detection feature performs a qualitatively different function from commercial tools such as Turnitin: rather than comparing against a global database of published works, it focuses on internal consistency within a course cohort. This makes it most effective for detecting collusion rather than internet-sourced plagiarism. Used alongside conventional similarity checking, the two approaches are complementary.

## 4.16 Comparison with Existing Systems

**Table 4.5: Comparative Analysis with Existing Systems**

| Criterion | Moodle | Canvas | This System |
|---|---|---|---|
| AI tutoring (native) | No | No | Yes — course-scoped RAG |
| Auto-grading feedback | No (plugin) | No | Yes — draft workflow |
| AI quiz generation | No | No | Yes |
| Internal plagiarism detection | No | No | Yes |
| In-app notifications | Limited | Yes | Yes — 3 event types |
| Direct messaging | Yes | Yes | Yes — role-scoped contacts |
| Open-source / free | Yes | No | Yes |
| TypeScript / type-safe | No | No | Yes — strict mode |

The comparison confirms that the developed system addresses the identified research gaps. No existing open-source LMS platform provides the combination of native LLM integration across all five AI feature domains implemented in this project, without reliance on paid third-party plugins or integrations.

## 4.17 Chapter Summary

This chapter provided a comprehensive account of the system design, implementation, and evaluation across all functional domains. Key implementation decisions — including the dual-token JWT pattern, the lightweight RAG approach for the study assistant, the draft-and-confirm AI grading workflow, and the role-scoped messaging contact list — were each grounded in established software engineering and educational technology principles. The functional evaluation confirmed all 22 test cases passed, and the AI feature evaluation validated the effectiveness and educational utility of each AI module. The following chapter presents the conclusions, limitations, and directions for future work.

---

---

# CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS

## 5.1 Summary of Findings

This project set out to design, develop, and evaluate an AI-powered Learning Management System for higher education institutions. The completed system fulfils all eight stated research objectives, delivering a fully functional, role-aware platform with five integrated AI features powered by Anthropic's Claude large language model.

The development process demonstrated that modern full-stack technologies — React 18, Node.js, Prisma, and MySQL — provide a stable, type-safe foundation for a multi-role educational platform. The Agile sprint methodology enabled progressive delivery of functionality, with each sprint producing a testable, coherent system increment. The final system encompasses user management, course and module management, assignment workflows, gradebook management, direct messaging, in-app notifications, course announcements, and AI-driven educational support.

The AI features — study assistant, auto-grading, quiz generation, summarisation, and plagiarism detection — each demonstrated functional correctness and practical educational utility. The study assistant's course-scoping mechanism ensured that AI responses were grounded in specific institutional content rather than general knowledge. The draft-and-confirm grading workflow successfully positioned AI output as a support mechanism for human assessment decisions rather than an autonomous grading agent.

## 5.2 Achievement of Research Objectives

| Objective | Achievement |
|---|---|
| 1. Design and develop a role-based LMS | Fully achieved — three roles, dedicated dashboards, RBAC enforced at API layer |
| 2. Integrate Anthropic Claude AI capabilities | Fully achieved — five distinct AI endpoints operational |
| 3. Implement course-scoped AI study assistant | Fully achieved — RAG with course module context |
| 4. Develop AI grading feedback module | Fully achieved — draft-and-confirm workflow |
| 5. Implement AI plagiarism detection | Fully achieved — course pool comparison with severity flags |
| 6. Build lecturer AI tools (quiz, summarise) | Fully achieved — tabbed AI Tools modal |
| 7. Implement JWT authentication and RBAC | Fully achieved — dual-token rotation, middleware chain |
| 8. Evaluate functional correctness | Fully achieved — 22 test cases, all passing |

## 5.3 Contributions to Knowledge

This project makes the following contributions:

1. **A reference implementation** of a full-stack, open-source LMS with natively integrated LLM capabilities, demonstrating a practical architecture for combining relational database-backed LMS functionality with AI service integration.

2. **A lightweight RAG pattern** for LMS study assistants that avoids the infrastructure complexity of vector database deployment by utilising the existing relational course structure as a retrieval index — a contribution relevant to resource-constrained institutional deployments.

3. **A documented draft-and-confirm AI grading workflow** that satisfies the human oversight requirements identified in the academic assessment literature, providing a model for safe AI grading integration.

4. **A demonstration of institution-internal AI plagiarism detection** as a cost-free complement to subscription-based external similarity services.

## 5.4 Limitations of the Study

Several limitations constrain the scope of conclusions that can be drawn from this research:

1. The evaluation was limited to functional testing by the developer. No user acceptance testing with actual students or lecturers was conducted, limiting conclusions about usability, user experience, and real-world pedagogical effectiveness.

2. The AI features are evaluated qualitatively; no controlled study measuring learning outcomes or grading accuracy compared to human benchmarks was performed.

3. The lightweight RAG approach does not perform semantic search over full document content. Courses with rich external reading materials would benefit from a vector search implementation.

4. The system was tested in a local development environment without load testing. Scalability under concurrent user loads has not been characterised.

5. The plagiarism detection feature addresses within-course collusion but does not compare against external internet sources or previously submitted work from prior academic terms.

## 5.5 Recommendations for Future Work

Based on the findings and limitations of this study, the following directions are recommended for future development:

1. **User Acceptance Testing:** Conduct a structured UAT study with representative samples of students and lecturers to measure usability (using the System Usability Scale), perceived usefulness (using TAM constructs), and AI feature satisfaction.

2. **Full-Document RAG:** Integrate a vector database (such as Qdrant or Pinecone) and document embedding pipeline to enable semantic search over uploaded course documents, producing substantially richer study assistant responses.

3. **Adaptive Learning Pathways:** Extend the AI capabilities to include personalised learning recommendations based on each student's submission history, grade performance, and engagement patterns.

4. **Predictive Analytics:** Implement early-warning dashboards using machine learning models to identify at-risk students based on submission patterns, grade trajectories, and login frequency.

5. **Learning Analytics for Lecturers:** Add LLM-powered analytics that summarise class-level trends in assignment submissions, identifying common misconceptions for targeted re-teaching.

6. **Mobile Application:** Develop a progressive web application (PWA) or native mobile companion app to extend the platform to mobile-first student populations.

7. **External Plagiarism Comparison:** Extend the plagiarism detection endpoint to optionally query external sources, complementing the existing internal comparison.

8. **Real-Time Messaging:** Replace the polling-based messaging system with WebSocket connections (e.g., Socket.io) to provide true real-time message delivery.

## 5.6 Concluding Remarks

The development of intelligent, AI-integrated Learning Management Systems represents one of the most consequential opportunities in contemporary educational technology. This project has demonstrated that it is feasible — even for a single developer working over a bounded project period — to construct a full-featured, role-aware LMS with meaningful AI integration using modern open-source tools and commercially available LLM APIs.

The system developed in this project does not merely add AI as a novelty feature; it embeds AI capabilities at critical points in the educational workflow — where students seek understanding, where lecturers make assessment decisions, and where institutional integrity requires vigilance. Each AI feature was designed with transparency, human oversight, and contextual grounding as explicit requirements, producing a system that augments human educators rather than attempting to replace them.

As LLMs continue to improve in accuracy, speed, and cost efficiency, the barriers to implementing systems of this kind will only decrease. This project contributes a documented, open-source foundation that future researchers and developers can extend and adapt to meet the evolving needs of learners and educators in an increasingly AI-mediated world.

---

---

# REFERENCES

Almaiah, M. A., Al-Khasawneh, A., & Althunibat, A. (2020). Exploring the critical challenges and factors influencing the e-learning system usage during COVID-19 pandemic. *Education and Information Technologies*, *25*(6), 5261–5280. https://doi.org/10.1007/s10639-020-10219-y

Bai, Y., Jones, A., Ndousse, K., Askell, A., Chen, A., DasSarma, N., Drain, D., Fort, S., Ganguli, D., Henighan, T., Joseph, N., Kadavath, S., Kernion, J., Conerly, T., El-Showk, S., Elhage, N., Hatfield-Dodds, Z., Hernandez, D., Hume, T., … Kaplan, J. (2022). *Training a helpful and harmless assistant with reinforcement learning from human feedback*. arXiv preprint arXiv:2204.05862.

Baidoo-Anu, D., & Owusu Ansah, L. (2023). Education in the era of generative artificial intelligence (AI): Understanding the potential benefits of ChatGPT in promoting teaching and learning. *Journal of AI*, *7*(1), 52–62. https://doi.org/10.61969/jai.1337500

Binyamin, S. S., Rutter, M., & Smith, S. (2019). Extending the technology acceptance model to understand students' use of learning management systems in Saudi higher education. *International Journal of Emerging Technologies in Learning*, *14*(3), 4–21. https://doi.org/10.3991/ijet.v14i03.9732

Bretag, T., Harper, R., Burton, M., Ellis, C., Newton, P., Rozenberg, T., Saddiqui, S., & van Haeringen, K. (2019). Contract cheating and assessment design: Exploring the relationship. *Assessment & Evaluation in Higher Education*, *44*(5), 676–691. https://doi.org/10.1080/02602938.2018.1527892

Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D. M., Wu, J., Winter, C., … Amodei, D. (2020). Language models are few-shot learners. *Advances in Neural Information Processing Systems*, *33*, 1877–1901.

Cotton, D. R. E., Cotton, P. A., & Shipway, J. R. (2023). Chatting and cheating: Ensuring academic integrity in the era of ChatGPT. *Innovations in Education and Teaching International*, *61*(2), 228–239. https://doi.org/10.1080/14703297.2023.2190148

Dalpiaz, F., & Niu, N. (2020). Requirements engineering in the days of artificial intelligence. *IEEE Software*, *37*(4), 7–10. https://doi.org/10.1109/MS.2020.2986047

Dhawan, S. (2020). Online learning: A panacea in the time of COVID-19 crisis. *Journal of Educational Technology Systems*, *49*(1), 5–22. https://doi.org/10.1177/0047239520934018

Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J., Wang, M., & Wang, H. (2023). Retrieval-augmented generation for large language models: A survey. *arXiv preprint arXiv:2312.10997*.

Holmes, W., Bialik, M., & Fadel, C. (2019). *Artificial intelligence in education: Promises and implications for teaching and learning*. Center for Curriculum Redesign.

Kasneci, E., Seßler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., Gasser, U., Groh, G., Günnemann, S., Hüllermeier, E., Krusche, S., Kutyniok, G., Michaeli, T., Nerdel, C., Pfeffer, J., Poquet, O., Sailer, M., Schmidt, A., Seidel, T., … Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences*, *103*, 102274. https://doi.org/10.1016/j.lindif.2023.102274

Khalil, M., & Er, E. (2023). Will ChatGPT get you caught? Rethinking of plagiarism detection. *arXiv preprint arXiv:2302.04335*.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems*, *33*, 9459–9474.

Mollick, E. R., & Mollick, L. (2023). Using AI to implement effective teaching strategies in classrooms: Five strategies, including spaced practice, retrieval practice, elaborative interrogation, interleaving, and concrete examples. *SSRN*. https://doi.org/10.2139/ssrn.4391243

NIST. (2020). *Zero trust architecture* (NIST Special Publication 800-207). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-207

Okonkwo, C. W., & Ade-Ibijola, A. (2021). Chatbots applications in education: A systematic review. *Computers and Education: Artificial Intelligence*, *2*, 100033. https://doi.org/10.1016/j.caeai.2021.100033

OpenAI. (2023). *GPT-4 technical report*. arXiv preprint arXiv:2303.08774.

Pan, L., Lei, W., Chua, T.-S., & Kan, M.-Y. (2019). Recent advances in neural question generation. *arXiv preprint arXiv:1905.08949*.

Perkins, M. (2023). Academic integrity considerations of AI large language models in the post-pandemic era: ChatGPT and beyond. *Journal of University Teaching and Learning Practice*, *20*(2), 07. https://doi.org/10.53761/1.20.02.07

Pressman, R. S., & Maxim, B. R. (2019). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill.

Ramesh, D., & Sanampudi, S. K. (2022). An automated essay scoring systems: A systematic literature review. *Artificial Intelligence Review*, *55*(3), 2495–2527. https://doi.org/10.1007/s10462-021-10068-2

Russell, S. J., & Norvig, P. (2020). *Artificial intelligence: A modern approach* (4th ed.). Pearson.

Scherer, R., Siddiq, F., & Tondeur, J. (2019). The technology acceptance model (TAM): A meta-analytic structural equation modeling approach to explaining teachers' adoption of digital technology in education. *Computers & Education*, *128*, 13–35. https://doi.org/10.1016/j.compedu.2018.09.009

Schwaber, K., & Sutherland, J. (2020). *The Scrum guide: The definitive guide to Scrum: The rules of the game*. Scrum.org. https://scrumguides.org

Siriwardena, P. (2020). *Advanced API security: OAuth 2.0 and beyond* (2nd ed.). Apress.

Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*, *31*(2), 261–292. https://doi.org/10.1007/s10648-019-09465-5

Turnbull, D., Chugh, R., & Luck, J. (2021). Issues in learning management system implementation: A systematic literature review. *Education and Information Technologies*, *26*(6), 6879–6893. https://doi.org/10.1007/s10639-021-10531-8

UNESCO. (2023). *Guidance for generative AI in education and research*. United Nations Educational, Scientific and Cultural Organization.

Vom Brocke, J., Hevner, A., & Maedche, A. (2020). Introduction to design science research. In J. vom Brocke, A. Hevner, & A. Maedche (Eds.), *Design science research. Cases* (pp. 1–13). Springer. https://doi.org/10.1007/978-3-030-46781-4_1

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. World Wide Web Consortium. https://www.w3.org/TR/WCAG22/

White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. *arXiv preprint arXiv:2302.11382*.

Wisniewski, B., Zierer, K., & Hattie, J. (2020). The power of feedback revisited: A meta-analysis of educational feedback research. *Frontiers in Psychology*, *10*, 3087. https://doi.org/10.3389/fpsyg.2019.03087

Zawacki-Richter, O., Marín, V. I., Bond, M., & Gouverneur, F. (2019). Systematic review of research on artificial intelligence applications in higher education – where are the educators? *International Journal of Educational Technology in Higher Education*, *16*(1), 39. https://doi.org/10.1186/s41239-019-0171-0

Zhao, W. X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y., Min, Y., Zhang, B., Zhang, J., Dong, Z., Du, Y., Yang, C., Chen, Y., Chen, Z., Jiang, J., Ren, R., Li, Y., Tang, X., Liu, Z., … Wen, J.-R. (2023). A survey of large language models. *arXiv preprint arXiv:2303.18223*.

---

---

# APPENDICES

## Appendix A: System API Endpoint Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Authenticate user, return token pair |
| POST | /api/auth/logout | Authenticated | Invalidate refresh token |
| POST | /api/auth/refresh | Public | Rotate JWT token pair |
| GET | /api/auth/me | Authenticated | Return current user profile |
| GET | /api/users | Admin | List users with pagination/filter |
| POST | /api/users | Admin | Create new user |
| PATCH | /api/users/:id | Admin | Update user (including isActive) |
| DELETE | /api/users/:id | Admin | Soft-delete (deactivate) user |
| GET | /api/courses | All roles | Role-scoped course list |
| POST | /api/courses | Admin/Lecturer | Create course |
| GET | /api/courses/:id | All roles | Get course details |
| PATCH | /api/courses/:id | Admin/Lecturer | Update course |
| DELETE | /api/courses/:id | Admin/Lecturer | Delete course |
| POST | /api/courses/:id/enrol | Admin | Enrol student in course |
| GET | /api/courses/:id/students | Admin/Lecturer | List enrolled students |
| GET | /api/courses/:id/modules | All roles | List course modules |
| POST | /api/courses/:id/modules | Lecturer | Create module |
| PATCH | /api/modules/:id | Lecturer | Update module |
| DELETE | /api/modules/:id | Lecturer | Delete module |
| POST | /api/modules/:id/resources | Lecturer | Add resource to module |
| DELETE | /api/resources/:id | Lecturer | Delete resource |
| GET | /api/courses/:id/assignments | All roles | List course assignments |
| POST | /api/courses/:id/assignments | Lecturer | Create assignment |
| POST | /api/assignments/:id/submit | Student | Submit or update submission |
| GET | /api/assignments/:id/submissions | Lecturer | List submissions |
| PATCH | /api/submissions/:id/grade | Lecturer | Grade submission |
| GET | /api/courses/:id/gradebook | Lecturer | Get grade matrix |
| POST | /api/ai/chat | All roles | AI study assistant |
| POST | /api/ai/grade-feedback | Lecturer/Admin | AI grading suggestion |
| POST | /api/ai/generate-quiz | Lecturer/Admin | AI quiz generation |
| POST | /api/ai/summarise | Lecturer/Admin | AI text summarisation |
| POST | /api/ai/plagiarism-check | Lecturer/Admin | AI plagiarism detection |
| GET | /api/dashboard/stats | All roles | Role-scoped statistics |
| GET | /api/messages/contacts | All roles | Get messageable contacts |
| GET | /api/messages/conversations | All roles | Get conversation list |
| GET | /api/messages/:userId | All roles | Get thread with user |
| POST | /api/messages | All roles | Send message |
| GET | /api/notifications | All roles | List notifications |
| PATCH | /api/notifications/:id/read | All roles | Mark notification read |
| PATCH | /api/notifications/read-all | All roles | Mark all notifications read |
| GET | /api/courses/:id/announcements | All roles | List announcements |
| POST | /api/courses/:id/announcements | Lecturer/Admin | Create announcement |
| PATCH | /api/announcements/:id | Lecturer/Admin | Update announcement |
| DELETE | /api/announcements/:id | Lecturer/Admin | Delete announcement |

---

## Appendix B: Database Schema (Prisma Model Summary)

```
User          — id, name, email, password, role, isActive, timestamps
Course        — id, title, code, description, status, lecturerId, timestamps
Enrolment     — id, studentId, courseId, enrolledAt
Module        — id, title, order, courseId, timestamps
Resource      — id, title, type, url, moduleId, createdAt
Assignment    — id, title, description, dueDate, maxScore, courseId, timestamps
Submission    — id, content, fileUrl, submittedAt, status, studentId, assignmentId
Grade         — id, score, feedback, isDraft, submissionId, gradedById, timestamps
Announcement  — id, title, content, courseId, authorId, createdAt
Message       — id, content, senderId, receiverId, readAt, createdAt
Notification  — id, userId, type, title, body, link, readAt, createdAt
RefreshToken  — id, token, userId, expiresAt, createdAt
```

---

## Appendix C: Environment Variable Reference

**Backend (.env)**
```
DATABASE_URL=mysql://user:password@localhost:3306/lms_db
JWT_SECRET=<minimum 32-character random string>
JWT_REFRESH_SECRET=<minimum 32-character random string, different from JWT_SECRET>
ANTHROPIC_API_KEY=<Anthropic API key>
AZURE_STORAGE_CONNECTION_STRING=<Azure Blob Storage connection string>
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

*End of Report*
