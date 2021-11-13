Martok
==
## Glory to your schema!

![image](https://user-images.githubusercontent.com/542872/141661639-3dc8c2e3-d44d-4e56-bed5-7aea1c1f4cb8.png)


Martok is built for one thing and one thing only: 
converting Typescript schemas into 
[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 
schemas. It's the brutal and chaotic rival to 
[Dukat](https://github.com/Kotlin/dukat).



### SUPPORTS
* Multiple source files
* Interfaces
* Types
* string, number, boolean, any
* Cross-references to other types
* kotlinx.serializable
* Custom package name
* optional fields

### TODO
* Arrays
* Multi-file Output
  * Mostly there, just need to track references for imports
* enums
* union types
* kotlinx.datetime
* documentation
* Intended for `.d.ts` files. Work on safer execution for `.ts` 
