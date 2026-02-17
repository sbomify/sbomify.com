---

title: "Understanding in-toto: Securing the Software Supply Chain"
description: "Introduction to in-toto, the open-source framework from NYU for securing software supply chains through layout definitions, signed link metadata, and verification."
author:
  display_name: Cowboy Neil
categories:
  - education
tags: [in-toto, security, supply-chain]
date: 2024-08-14
slug: what-is-in-toto
---

In today's software landscape, securing the software supply chain is more crucial than ever. With increasing concerns about vulnerabilities and supply chain attacks, developers and organizations are looking for robust solutions to ensure the integrity of their software from development to deployment. One such solution is **[in-toto](https://github.com/in-toto/in-toto)**. In this post, we'll explore what in-toto is, how it works, and why it might be the key to securing your software supply chain.

### What is in-toto?

In-toto is an open-source framework designed to secure the entire software supply chain. It provides a way to ensure that all steps in the software development and deployment process are executed as intended, without tampering or unintended changes. The name "in-toto" is derived from the Latin phrase "in toto," meaning "in total" or "completely," which reflects the framework's comprehensive approach to security.

The in-toto framework was originally developed by researchers at New York University as part of the Supply Chain Integrity, Transparency, and Trust (SCITT) project. It is now maintained as an open-source project and has been adopted by various organizations to enhance the security of their development pipelines.

### How Does in-toto Work?

In-toto operates by establishing a chain of trust throughout the entire software supply chain. It does this through a series of steps:

1. **Defining a Layout**: The first step in using in-toto is to define a "layout," which is essentially a blueprint of the software supply chain. The layout specifies the steps involved in the development process, the expected materials and products of each step, and the parties responsible for executing those steps.

2. **Creating and Signing Link Metadata**: As each step in the layout is executed, in-toto generates "link metadata," which records the details of the step, including the command run, the materials used (such as source code), and the products generated (such as binaries). This metadata is then signed by the entity responsible for the step, creating a cryptographic proof of its execution.

3. **Verifying the Supply Chain**: Once all steps are completed, in-toto verifies the entire supply chain by checking that each step was executed according to the layout and that the link metadata is valid. This ensures that no unauthorized changes were made during the process.

4. **Reproducibility and Transparency**: In-toto emphasizes transparency by making all the metadata and verification processes open and auditable. This allows for third-party verification and ensures that the integrity of the software can be independently verified.

### Why is in-toto Important?

In-toto addresses several key challenges in securing the software supply chain:

- **Preventing Supply Chain Attacks**: By providing end-to-end verification of the software supply chain, in-toto helps prevent attacks where malicious actors might attempt to inject vulnerabilities during the development process.

- **Ensuring Compliance**: For organizations that need to comply with regulatory requirements or internal security policies, in-toto provides a clear and auditable trail of the software's development history.

- **Building Trust**: In-toto's transparent and verifiable process builds trust among developers, users, and stakeholders, ensuring that the software they rely on has not been tampered with.

### Real-World Use Cases

In-toto has been adopted by several organizations and integrated into popular tools and frameworks:

- **The Open Source Security Foundation (OpenSSF)**: In-toto is part of the OpenSSF's efforts to secure open-source software, providing a framework to protect against supply chain attacks in critical open-source projects.

- **Tern**: Tern, a tool for container image inspection, uses in-toto to track and verify the steps involved in building a container image, ensuring its integrity.

- **Datadog**: Datadog, a cloud monitoring platform, has integrated in-toto into its CI/CD pipeline to secure the delivery of its software updates.

### Getting Started with in-toto

To start using in-toto, you can visit the [in-toto GitHub repository](https://github.com/in-toto/in-toto) for detailed documentation and examples. The repository provides guides on how to define layouts, generate link metadata, and verify the software supply chain.

In-toto is implemented in Python, and you can install it via pip:

```bash
pip install in-toto
```

From there, you can start defining your software supply chain's layout and securing your development pipeline.

### Wrapping up

In-toto offers a powerful and flexible framework for securing the software supply chain, addressing the growing concerns of supply chain attacks and software integrity. By incorporating in-toto into your development processes, you can ensure that your software is built and delivered exactly as intended, without any unauthorized changes. As supply chain security becomes increasingly important, tools like in-toto are invaluable in safeguarding the integrity of your software.

Stay secure, and happy coding!
