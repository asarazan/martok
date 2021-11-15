Martok [WIP]
==
## Glory to your schema!

![image](https://user-images.githubusercontent.com/542872/141661639-3dc8c2e3-d44d-4e56-bed5-7aea1c1f4cb8.png)


Martok is built for one thing and one thing only: 
converting Typescript schemas into 
[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 
schemas. It's the brutal and chaotic rival to 
[Dukat](https://github.com/Kotlin/dukat).

It is still in the extremely early stages of development, and should not be used.

### Usage
```shell 
# Martok works with single files, directories, and always infers the right thing to do.
martok ./someFile.d.ts -o Schema.kt --package example
martok ./someDirectory -o BigSchema.kt
martok ./someDirectory -o ./outputDirectory
```

### SUPPORTS
* Multiple source files
* Output to multiple files or a single mega-file
* Interfaces + Inheritance
* Types + Intersections
* String Unions
* string, number, boolean, Arrays, any
* Cross-references to other types
* kotlinx.serializable
* Custom package name
* optional fields

### TODO
* Complex Unions
* In-line unions
* Enums
* kotlinx.datetime
* documentation
* Intended for `.d.ts` files. Work on safer execution for `.ts` 
