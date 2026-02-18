---

title: "Software Development Life Cycle (SDLC): A Complete Guide"
description: "Learn what the Software Development Life Cycle (SDLC) is, its phases and models, and how SBOMs integrate into each stage for security and compliance."
categories:
  - education
tags: [sdlc, security, compliance, devsecops]
tldr: "The Software Development Life Cycle (SDLC) defines the phases software goes through from planning to retirement. Integrating SBOMs and security checks at each phase — especially during build and deployment — catches vulnerabilities early and satisfies compliance frameworks like the EU CRA and EO 14028."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is SDLC in software development?"
    answer: "SDLC stands for Software Development Life Cycle. It is a structured process that guides software development from initial planning through deployment and ongoing maintenance, providing a framework of phases including requirements analysis, design, implementation, testing, deployment, and maintenance."
  - question: "What are the most common SDLC models?"
    answer: "The most widely used models are Waterfall, Agile (including Scrum and Kanban), DevOps, V-Model, Spiral, and Lean. Agile and DevOps are the most popular for modern web and cloud applications due to their iterative approach and emphasis on continuous delivery."
  - question: "How do SBOMs fit into the SDLC?"
    answer: "SBOMs integrate into multiple SDLC phases. During implementation, SBOM generation tools capture component inventories. During testing, SBOMs enable automated vulnerability scanning. During deployment, SBOMs are distributed alongside release artifacts for compliance. During maintenance, SBOMs allow rapid identification of affected systems when new vulnerabilities are disclosed."
  - question: "What is the difference between SDLC and DevOps?"
    answer: "SDLC is the overall process framework for software development, while DevOps is a specific approach that emphasizes collaboration between development and operations teams with a focus on automation, continuous integration, and continuous delivery. DevOps can be seen as a modern SDLC model rather than an alternative to the SDLC concept itself."
  - question: "What is a Secure SDLC?"
    answer: "A Secure SDLC integrates security practices into every phase of the software development life cycle, rather than treating security as a final checkpoint. This includes threat modeling during planning, secure coding standards during implementation, SAST/DAST during testing, and vulnerability monitoring during maintenance."
date: 2025-12-15
slug: software-development-life-cycle-sdlc-sbom-integration
---

The Software Development Life Cycle (SDLC) is a structured process that defines the stages involved in developing software from initial concept through deployment and maintenance. SDLC provides a systematic framework that development teams use to plan, create, test, and deliver high-quality software. Understanding the SDLC is essential for any organization building software today, particularly as security and compliance requirements become integral to every phase of development.

![SDLC phases with SBOM integration points](/assets/images/d2/sdlc-sbom.svg)

## What Is the Software Development Life Cycle?

SDLC, short for Software Development Life Cycle, is a methodology used by software engineering teams to design, develop, and test software in a predictable and efficient manner. Rather than writing code ad hoc, SDLC defined processes ensure that each stage of development has clear objectives, deliverables, and quality checks.

The concept of a structured development life cycle emerged in the 1960s as software projects grew in complexity. What began as a simple sequential process has evolved into a family of software development life cycle models, each suited to different project types and organizational needs.

At its core, every SDLC framework answers the same questions: What are we building? How will we build it? How do we know it works? And how do we keep it running?

## The Phases of the SDLC

While specific terminology varies between models, most SDLC frameworks include six to eight phases. Here are the core stages that appear in virtually every approach.

### 1. Planning and Requirements Analysis

The first phase involves gathering business requirements, identifying stakeholders, and defining project scope. Teams assess feasibility, estimate resources, and create a project plan. Security considerations should enter the picture here through threat modeling and risk assessment.

### 2. System Design

Architects and senior developers translate requirements into a technical blueprint. This includes system architecture, technology stack selection, data models, and interface specifications. Design decisions made here have long-lasting implications for security and maintainability.

### 3. Implementation (Coding)

Developers write the actual source code based on the design specifications. This phase typically involves selecting libraries, frameworks, and third-party components. These [dependency](/2026/01/29/what-is-a-dependency-in-software/) choices directly impact the [software supply chain](/2025/12/26/software-supply-chain-management/) and are the foundation of what an [SBOM](/what-is-sbom/) will eventually document.

### 4. Testing

Quality assurance teams verify that the software meets requirements and is free of defects. Testing includes unit tests, integration tests, system tests, and user acceptance testing. Security testing, including vulnerability scanning and penetration testing, is increasingly part of this phase.

### 5. Deployment

The tested software is released to production environments. Deployment strategies such as blue-green deployments, canary releases, and rolling updates help reduce risk. This phase is where CI/CD pipelines automate the build, test, and release process.

### 6. Maintenance and Operations

After deployment, teams monitor the application, fix bugs, apply security patches, and release updates. This phase often lasts the longest and is where vulnerability management and ongoing compliance activities take place.

## Software Development Life Cycle Models

Over the decades, several SDLC models have emerged to address different project needs. Each model organizes the core phases differently.

| Model         | Approach                            | Best Suited For                                | Key Characteristic                                    |
| ------------- | ----------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| **Waterfall** | Sequential, linear                  | Well-defined projects with stable requirements | Each phase completes before the next begins           |
| **Agile**     | Iterative, incremental              | Projects with evolving requirements            | Short sprints, continuous feedback                    |
| **Spiral**    | Risk-driven, iterative              | Large, high-risk projects                      | Risk analysis at every iteration                      |
| **V-Model**   | Verification and validation         | Safety-critical and regulated systems          | Each development phase has a corresponding test phase |
| **DevOps**    | Continuous integration and delivery | Fast-moving organizations                      | Merges development and operations                     |
| **Lean**      | Waste elimination                   | Startups and rapid prototyping                 | Minimize overhead, maximize value                     |

The Waterfall model was the original SDLC approach, moving linearly from requirements through deployment. Agile methodologies, including Scrum and Kanban, replaced the rigid sequential approach with iterative cycles that deliver working software in short sprints. Most modern teams use some form of Agile combined with DevOps practices.

## Where Security Fits: From SDLC to Secure SDLC

Traditional SDLC models treated security as a gate at the end of development — a final check before release. This approach consistently proved inadequate. Vulnerabilities discovered late in the cycle are far more expensive to fix than those caught early.

The Secure Software Development Life Cycle (SSDLC or Secure SDLC) integrates security activities into every phase:

- **Planning:** Threat modeling, security requirements definition
- **Design:** Security architecture review, attack surface analysis
- **Implementation:** Secure coding standards, dependency management, SBOM generation
- **Testing:** Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), [Software Composition Analysis (SCA)](/2026/01/11/software-composition-analysis-sca/)
- **Deployment:** Configuration hardening, secrets management, SBOM distribution
- **Maintenance:** Vulnerability monitoring, patch management, SBOM updates

This shift-left approach — moving security earlier in the development process — is central to [DevSecOps](https://www.nist.gov/publications/devsecops-nist-special-publication-800-218-secure-software-development-framework-ssdf), where security becomes a shared responsibility across the entire team rather than a bottleneck at the end.

## SDLC and SBOMs: Integration at Every Phase

A [Software Bill of Materials](/what-is-sbom/) (SBOM) documents every component, library, and dependency in a piece of software. Rather than treating SBOM generation as a one-time event, modern organizations integrate SBOMs throughout the SDLC.

### During Implementation

When developers add dependencies — open source libraries, frameworks, and packages — they shape the software's composition. This is the moment to begin tracking what goes into the build. Tools like the [sbomify GitHub Action](https://github.com/sbomify/github-action/) can generate SBOMs automatically as part of the build process. See our [SBOM generation guides](/guides/) for language-specific instructions covering Python, JavaScript, Java, Go, Rust, and more.

### During Testing

SBOMs enable automated [vulnerability scanning](/2026/02/01/sbom-scanning-vulnerability-detection/). Once you have a complete inventory of components, platforms like [sbomify](https://sbomify.com) can continuously monitor your SBOMs against vulnerability databases. Standalone tools like [Grype](https://github.com/anchore/grype) and [OWASP Dependency-Track](https://dependencytrack.org/) can also cross-reference your SBOM against the [National Vulnerability Database](https://nvd.nist.gov/) (NVD) and [OSV](https://osv.dev/). See our [resources page](/resources/) for a complete list of SBOM generation and analysis tools.

### During Deployment

The SBOM becomes a release artifact alongside the software itself. Compliance frameworks including the [EU Cyber Resilience Act](/compliance/eu-cra/) and [Executive Order 14028](/compliance/eo-14028/) require SBOMs to be available to downstream consumers. Signing the SBOM provides tamper-evidence for the supply chain.

### During Maintenance

As new vulnerabilities are discovered — often months or years after deployment — SBOMs allow organizations to quickly determine whether they are affected. When the [Log4Shell vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2021-44228) was disclosed in December 2021, organizations with SBOMs could identify affected systems in minutes rather than weeks.

## SDLC Best Practices for Modern Teams

1. **Choose the right model for your context.** Agile works well for most web and cloud applications. V-Model or Spiral may be more appropriate for safety-critical systems in medical devices or automotive software.

2. **Shift security left.** Integrate threat modeling in planning, dependency review in implementation, and automated security testing in CI/CD. Catching vulnerabilities early saves time and reduces risk.

3. **Automate everything repeatable.** Use CI/CD pipelines to automate builds, tests, security scans, SBOM generation, and deployments. Manual processes introduce inconsistency and slow the cycle.

4. **Track your dependencies.** Every third-party library is a potential risk vector. Maintain SBOMs, monitor for vulnerabilities, and have a process for updating or replacing compromised components.

5. **Build compliance into the workflow.** Rather than scrambling for compliance at audit time, embed [SBOM generation](/guides/) and vulnerability scanning into your standard SDLC process. This is especially critical for organizations subject to the [NTIA minimum elements](/compliance/ntia-minimum-elements/) or [CISA guidance](/compliance/cisa-minimum-elements/).

6. **Measure and improve.** Track metrics like lead time, deployment frequency, mean time to recovery, and vulnerability remediation time. Use retrospectives to continuously improve the process.

## NIST and the SDLC

The National Institute of Standards and Technology (NIST) has published several frameworks relevant to securing the SDLC:

- **[NIST SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)** (Secure Software Development Framework, SSDF) provides practices for integrating security into the development process, organized into four groups: Prepare the Organization, Protect the Software, Produce Well-Secured Software, and Respond to Vulnerabilities.
- **[NIST SP 800-53](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)** includes the SA (System and Services Acquisition) and SR (Supply Chain Risk Management) control families that directly address SDLC security controls.
- **[NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)** provides a high-level structure for managing cybersecurity risk that maps to SDLC activities.

These frameworks are increasingly referenced in procurement requirements and regulatory compliance, making them essential reading for teams working on government or critical infrastructure projects.

## Frequently Asked Questions

### What is SDLC in software development?

SDLC stands for Software Development Life Cycle. It is a structured process that guides software development from initial planning through deployment and ongoing maintenance. The SDLC provides a framework of phases — including requirements analysis, design, implementation, testing, deployment, and maintenance — that help teams deliver reliable software in a systematic way.

### What are the most common SDLC models?

The most widely used software development life cycle models are Waterfall, Agile (including Scrum and Kanban), DevOps, V-Model, Spiral, and Lean. Agile and DevOps are the most popular for modern web and cloud applications due to their iterative approach and emphasis on continuous delivery.

### How do SBOMs fit into the SDLC?

SBOMs integrate into multiple SDLC phases. During implementation, SBOM generation tools capture component inventories. During testing, SBOMs enable automated vulnerability scanning. During deployment, SBOMs are distributed alongside release artifacts for compliance. During maintenance, SBOMs allow rapid identification of affected systems when new vulnerabilities are disclosed. See our [SBOM generation guides](/guides/) for language-specific integration steps.

### What is the difference between SDLC and DevOps?

SDLC is the overall process framework for software development, while DevOps is a specific approach that emphasizes collaboration between development and operations teams with a focus on automation, continuous integration, and continuous delivery. DevOps can be seen as a modern SDLC model rather than an alternative to the SDLC concept itself.

### What is a Secure SDLC?

A Secure SDLC (sometimes called SSDLC) integrates security practices into every phase of the software development life cycle, rather than treating security as a final checkpoint. This includes threat modeling during planning, secure coding standards during implementation, SAST/DAST during testing, and vulnerability monitoring during maintenance. NIST SP 800-218 (SSDF) provides a standardized framework for implementing a Secure SDLC.
