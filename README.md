Martok - Glory To Your Schema!
==

![Build Status](https://github.com/asarazan/martok/actions/workflows/ci.yaml/badge.svg)
[![codecov](https://codecov.io/gh/asarazan/martok/branch/main/graph/badge.svg?token=AAIV2Q9PRS)](https://codecov.io/gh/asarazan/martok)

![image](https://user-images.githubusercontent.com/542872/141661639-3dc8c2e3-d44d-4e56-bed5-7aea1c1f4cb8.png)

Martok is built for one thing and one thing only: converting Typescript schemas into 
[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 
schemas. *It's the brutal and chaotic rival to [Dukat](https://github.com/Kotlin/dukat).*

### Why Kotlin? Why Typescript?
We've always been big believers in [Kotlin Multiplatform for Mobile](https://kotlinlang.org/lp/mobile/) --
but also recognize the (well-earned) dominance of Node on the backend. Martok creates an automated schema pipeline from the
Typescript in your backend codebase to the Kotlin data layer in your Android & iOS apps.

### Why Not QuickType?
QuickType has gotten quite old and difficult to develop. The PRs have mostly stagnated, 
we currently cannot find a way to successfully build the project, so we've moved on.

### Can I see some example output?
Sure! Check out the comparison files we use for our automated tests [HERE](tests/comparisons/single).

_For a quick example:_
```typescript
export type Unions = {
  foo: { bar: string } | { baz: string };
};
```
_Would translate to_
```kotlin
@Serializable
data class Unions(
    val foo: Foo
) {
    @Serializable
    data class Foo(
        val bar: String? = null,
        val baz: String? = null
    )
}
```

### Installation
```shell
npm install -g martok
```

### Usage
```shell 
# Martok works with single files, directories, and always infers the right thing to do.
martok ./someFile.d.ts -o Schema.kt --package example
martok ./someDirectory -o BigSchema.kt
martok ./someDirectory -o ./outputDirectory # produce lots of little files.
```

### SUPPORTS
* Multiple source files
* Output to multiple files or a single mega-file
* Interfaces + Inheritance
* Type Aliases + Intersections + Unions
* string, number, boolean, Arrays, any
* Anonymous types
* Cross-references to other types
* kotlinx.serializable
* kotlinx.datetime _(When annotated with `@Date` or `@DateTime`. See [HERE](https://github.com/asarazan/martok/blob/main/tests/comparisons/special/DateTime.d.ts) for examples)_
* Custom package name
* Enums
* optional fields
* Typescript "Utility" types (e.g. `Omit` and `Pick`)
* Configurable numeric precision via the `@precision` jsdoc tag

### TODO
* Fully discriminated/disagreeing unions
* documentation
* Intended for `.d.ts` files. Work on safer execution for `.ts` 
