Martok [WIP]
==
## Glory to your schema!

![image](https://user-images.githubusercontent.com/542872/141661639-3dc8c2e3-d44d-4e56-bed5-7aea1c1f4cb8.png)

Martok is built for one thing and one thing only: converting Typescript schemas into 
[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 
schemas. It's the brutal and chaotic rival to [Dukat](https://github.com/Kotlin/dukat).

It is still in the extremely early stages of development, and should not be used.

### Why Kotlin? Why Typescript?
We're a huge believer in [Kotlin Multiplatform for Mobile](https://kotlinlang.org/lp/mobile/) --
but also accept the increasing prevalence of Node on the backend. Martok creates a schema pipeline from your
Typescript backend to your Kotlin data layer on Android & iOS.

### Why Not QuickType?
QuickType has gotten quite old and difficult to develop. The PRs have mostly stagnated, 
we currently cannot find a way to successfully build the project, so we've moved on.


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
martok ./someDirectory -o WithDates.kt --datePattern standard # [see Patterns.ts]
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
* kotlinx.datetime
* Custom package name
* optional fields

### TODO
* Complex Unions
* Anonymous Intersection Types
* Enums
* documentation
* Intended for `.d.ts` files. Work on safer execution for `.ts` 
