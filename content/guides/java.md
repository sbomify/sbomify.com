---

url: /guides/java/
title: "SBOM Generation Guide for Java - Maven, Gradle"
description: "Learn how to generate Software Bill of Materials for Java projects. Complete guide with pom.xml, build.gradle, and gradle.lockfile examples, CycloneDX and SPDX output."
section: guides
---

## Source vs Build SBOMs

Java has a mature dependency management ecosystem with Maven and Gradle as the primary build tools. Understanding the difference between source and build SBOMs is particularly important in Java due to:

- **Transitive dependency resolution**: Java's dependency managers resolve complex transitive dependency trees
- **Scope differences**: Dependencies can be compile-time, runtime, test, or provided
- **Multi-module projects**: Enterprise Java applications often consist of many modules

For source SBOMs, you're generating from `pom.xml`, `build.gradle`, or `gradle.lockfile`. For build SBOMs, you're analyzing the actual JARs in your classpath or the final packaged artifact.

## Lockfile Deep Dive

### Maven (pom.xml)

Maven's `pom.xml` is both a manifest and a build file. Dependencies are declared with optional version ranges:

```xml
<project>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <version>3.2.0</version>
    </dependency>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.16.0</version>
    </dependency>
  </dependencies>
</project>
```

**Important considerations:**

- Maven doesn't have a traditional lockfile - versions in `pom.xml` can be ranges or managed by parent POMs
- Use the `maven-enforcer-plugin` with `<dependencyConvergence>` to ensure consistent versions
- Consider using a BOM (Bill of Materials) POM for version management

To get the effective dependencies with resolved versions:

```bash
mvn dependency:tree
mvn dependency:list
```

### Gradle (build.gradle / build.gradle.kts)

Gradle supports both Groovy (`build.gradle`) and Kotlin (`build.gradle.kts`) DSLs:

```groovy
// build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web:3.2.0'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.16.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
```

```kotlin
// build.gradle.kts
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.2.0")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.16.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}
```

### Gradle Lockfile (gradle.lockfile)

For reproducible builds, Gradle supports dependency locking:

```bash
# Enable dependency locking
gradle dependencies --write-locks
```

This creates a `gradle.lockfile`:

```
# This is a Gradle generated file for dependency locking.
com.fasterxml.jackson.core:jackson-annotations:2.16.0=compileClasspath,runtimeClasspath
com.fasterxml.jackson.core:jackson-core:2.16.0=compileClasspath,runtimeClasspath
com.fasterxml.jackson.core:jackson-databind:2.16.0=compileClasspath,runtimeClasspath
org.springframework.boot:spring-boot-starter-web:3.2.0=compileClasspath,runtimeClasspath
```

To enable locking in your `build.gradle`:

```groovy
dependencyLocking {
    lockAllConfigurations()
}
```

## Transitive Dependency Resolution

Both Maven and Gradle resolve transitive dependencies, but with different strategies:

| Aspect              | Maven                            | Gradle                                                            |
| ------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Conflict resolution | Nearest definition wins          | Newest version wins (default)                                     |
| Dependency scope    | compile, provided, runtime, test | implementation, api, compileOnly, runtimeOnly, testImplementation |
| BOM support         | `<dependencyManagement>`         | `platform()`                                                      |

Understanding these differences is crucial because your SBOM should accurately reflect what ends up in your final artifact.

## Multi-Module Projects

Enterprise Java applications often use multi-module structures:

```
my-app/
├── pom.xml (parent)
├── core/
│   └── pom.xml
├── api/
│   └── pom.xml
└── web/
    └── pom.xml
```

For SBOM generation, you have two approaches:

1. **Per-module SBOMs**: Generate an SBOM for each module
2. **Aggregate SBOM**: Generate a single SBOM for the entire project

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Java, sbomify uses **cdxgen** under the hood as it has the best support for Maven and Gradle projects.

**Standalone (no account needed):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: pom.xml
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-java-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: pom.xml
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

The action supports: `pom.xml`, `build.gradle`, `build.gradle.kts`, and `gradle.lockfile`.

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cdxgen (recommended for manual use):**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -t maven -o sbom.cdx.json
```

**CycloneDX Maven Plugin:**

```xml
<plugin>
    <groupId>org.cyclonedx</groupId>
    <artifactId>cyclonedx-maven-plugin</artifactId>
    <version>2.9.1</version>
</plugin>
```

```bash
mvn cyclonedx:makeAggregateBom
```

**CycloneDX Gradle Plugin:**

```groovy
plugins {
    id 'org.cyclonedx.bom' version '3.1.0'
}
```

```bash
gradle cyclonedxBom
```

**Trivy:**

```bash
trivy fs --format cyclonedx --output sbom.cdx.json .
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: pom.xml
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## Best Practices

1. **Use dependency locking** - Enable Gradle lockfiles for reproducible builds
2. **Pin versions explicitly** - Avoid version ranges in production dependencies
3. **Use BOMs for version management** - Spring Boot BOM, Jackson BOM, etc.
4. **Separate compile and runtime scopes** - Be clear about what goes into your final artifact
5. **Exclude test dependencies** - Unless required for compliance
6. **Consider shaded/uber JARs** - These need special handling for accurate SBOMs

## Handling Shaded/Uber JARs

If you use the Maven Shade Plugin or Gradle Shadow Plugin to create uber JARs, the dependencies are bundled inside. For accurate SBOMs:

1. Generate the SBOM **before** shading
2. Use tools that can analyze the shaded JAR contents
3. Consider using cdxgen's `--deep` flag:

```bash
cdxgen -t java --deep -o sbom.cdx.json
```

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes additional Java-specific tools like CycloneDX Java and SPDX Java libraries.
