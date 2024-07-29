---
layout: post
status: publish
published: true
title: 'The Role of SBOMs in an OBOM: Ensuring Compliance and Security in Smart Thermometer
  Development'
author:
  display_name: viktor
  login: viktor
author_login: viktor
author_url: https://sbomify.com
wordpress_id: 272
wordpress_url: https://sbomify.com/?p=272
date: '2024-07-09 15:04:57 +0200'
date_gmt: '2024-07-09 15:04:57 +0200'
categories:
- Uncategorized
tags: []
comments: []
---

In today's software landscape, compliance with security and transparency mandates is more critical than ever. Executive orders, such as the one issued by the U.S. government in May 2021, emphasize the importance of Software Bill of Materials (SBOMs) for ensuring software security and integrity. While SBOMs provide detailed inventories of software components, integrating them into an Operations Bill of Materials (OBOM) offers an enhanced framework that encompasses both software and runtime operational dependencies. This article explores the central role of SBOMs in OBOMs, using the development of a smart thermometer as an example, and discusses how this integration ensures compliance and bolsters security.

## Understanding SBOMs

### What is an SBOM?

A Software Bill of Materials (SBOM) is a formal record that lists all components, libraries, and modules included in a software product. It provides a transparent view of the software’s codebase, aiding in dependency tracking, license management, and vulnerability identification. According to recent executive orders, SBOMs are essential for maintaining software security and transparency.

## Example: Smart Thermometer Development

### Components of the Smart Thermometer

1. **Python Backend**: The backend server written in Python, which handles data processing and user interactions.
2. **Docker Files**: Containerization files used to ensure consistent deployment environments.
3. **Device Software**: Firmware written in Rust, running on the thermometer device, which includes dependencies specific to the embedded system.

## Central Role of SBOMs in OBOMs

### Aggregated SBOM for Compliance

In the context of a smart thermometer, an aggregated SBOM provides a comprehensive inventory of all software components involved:

- **Backend SBOM**: Listing Python libraries and dependencies.
- **Container SBOM**: Including Docker configurations and base images.
- **Device SBOM**: Documenting Rust dependencies and embedded libraries.

### Integrating SBOMs into OBOMs

An OBOM incorporates these SBOMs and extends them by adding runtime operational information:

- **Runtime Dependencies**: Specific libraries and services required for the backend and device software to function during runtime.
- **Configuration Settings**: Environment variables, configuration files, and system settings necessary for deployment and operation.
- **Infrastructure Components**: Details about cloud servers, network configurations, and other infrastructure elements.
- **Operational Tools**: Monitoring, logging, and backup tools essential for maintaining the operational integrity of the system.

### Benefits of SBOM Integration

#### Enhanced Security and Compliance

**Example: Comprehensive Vulnerability Management**

Integrating SBOMs within an OBOM allows for detailed tracking of both software and operational components, ensuring compliance with security standards outlined in executive orders. For the smart thermometer, this means that any vulnerabilities identified in the Python libraries, Docker images, or Rust dependencies can be promptly addressed, ensuring the overall security of the product.

#### Operational Transparency

**Example: Detailed Auditing and Compliance**

An aggregated SBOM within an OBOM provides a transparent view of all software and runtime components used in the smart thermometer, facilitating easier audits and ensuring compliance with regulatory standards. This transparency is crucial for meeting the requirements set by executive orders, which mandate visibility into software supply chains.

## OBOM as a Value-Added Extension

### Runtime Information

While the SBOM is central to compliance, incorporating it into an OBOM adds valuable runtime information:

- **Runtime Dependencies**: Ensuring that all necessary libraries and services are available and correctly configured during the operation of the smart thermometer.
- **Configuration Management**: Detailed documentation of environment variables, configuration files, and system settings for consistent deployments across different environments.

### Enhancing Security and Efficiency with OBOM

#### Streamlined Deployment

By integrating SBOMs into an OBOM, the smart thermometer’s development team can ensure consistent deployment processes. This minimizes the risk of deployment failures and enhances operational efficiency.

#### Disaster Recovery

Incorporating SBOMs into an OBOM aids in disaster recovery by providing detailed information about the operational setup. This ensures that in case of a system failure, the exact configurations and dependencies can be quickly restored.

#### Improved Collaboration

An OBOM that includes SBOMs fosters better collaboration between development and operations teams, ensuring that deployment and maintenance processes are well-aligned.

## End-to-End Example: Smart Thermometer OBOM

To illustrate a valid end-to-end example that complies with the CycloneDX standard, here is a simplified version of an OBOM for a smart thermometer:

### Example JSON Structure

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.3",
  "version": 1,
  "components": [
    {
      "type": "application",
      "name": "Smart Thermometer Backend",
      "version": "2.0.0",
      "bom-ref": "backend-1",
      "components": [
        {
          "type": "library",
          "name": "Flask",
          "version": "1.1.2",
          "bom-ref": "flask-1",
          "licenses": [
            {
              "license": {
                "id": "BSD-3-Clause"
              }
            }
          ]
        },
        {
          "type": "library",
          "name": "Requests",
          "version": "2.23.0",
          "bom-ref": "requests-1",
          "licenses": [
            {
              "license": {
                "id": "Apache-2.0"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "container",
      "name": "Smart Thermometer Container",
      "version": "1.0.0",
      "bom-ref": "container-1",
      "components": [
        {
          "type": "operating-system",
          "name": "Ubuntu",
          "version": "20.04",
          "bom-ref": "ubuntu-1"
        },
        {
          "type": "library",
          "name": "Docker",
          "version": "19.03",
          "bom-ref": "docker-1"
        }
      ]
    },
    {
      "type": "firmware",
      "name": "Smart Thermometer Device Firmware",
      "version": "3.2.1",
      "bom-ref": "firmware-1",
      "components": [
        {
          "type": "library",
          "name": "Rust Standard Library",
          "version": "1.49.0",
          "bom-ref": "rust-stdlib-1"
        },
        {
          "type": "library",
          "name": "Embedded HAL",
          "version": "0.2.4",
          "bom-ref": "embedded-hal-1"
        }
      ]
    }
  ],
  "dependencies": [
    {
      "ref": "backend-1",
      "dependsOn": [
        "flask-1",
        "requests-1"
      ]
    },
    {
      "ref": "container-1",
      "dependsOn": [
        "ubuntu-1",
        "docker-1"
      ]
    },
    {
      "ref": "firmware-1",
      "dependsOn": [
        "rust-stdlib-1",
        "embedded-hal-1"
      ]
    }
  ],
  "metadata": {
    "timestamp": "2023-07-09T14:28:00Z",
    "tools": [
      {
        "vendor": "CycloneDX",
        "name": "CycloneDX Maven Plugin",
        "version": "1.4.0"
      }
    ],
    "component": {
      "type": "application",
      "name": "Smart Thermometer",
      "version": "3.0.0",
      "bom-ref": "smart-thermometer-1"
    }
  }
}
```

### Explanation

- **Components**: This section lists all components of the smart thermometer, including backend libraries, Docker container elements, and device firmware libraries.
- **Dependencies**: Specifies the relationships between components, indicating which components depend on others.
- **Metadata**: Contains additional information about the BOM, such as the timestamp, tools used to generate the BOM, and details about the top-level component (the smart thermometer).

## Conclusion

While the inclusion of Software Bills of Materials (SBOMs) is mandated by executive orders for ensuring software security and transparency, integrating SBOMs into an Operations Bill of Materials (OBOM) provides additional operational benefits. For the development of a smart thermometer, this integration enhances security, compliance, and operational efficiency. By adopting SBOMs as a foundational element and viewing OBOM as a value-added extension, organizations can build a more secure, transparent, and resilient software ecosystem.

---

**References:**

1. Executive Order on Improving the Nation's Cybersecurity. (2021). The White House. Retrieved from [White House](https://www.whitehouse.gov/briefing-room/statements-releases/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/)
2. CycloneDX. (n.d.). *CycloneDX Specification*. Retrieved from [CycloneDX](https://cyclonedx.org/specification/overview/)
3. National Institute of Standards and Technology (NIST). (2021). *Security and Privacy Controls for Information Systems and Organizations*. Retrieved from [NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)

By focusing on the critical role of SBOMs within OBOMs, organizations can ensure compliance with executive mandates while leveraging the additional benefits of a comprehensive operational framework.
