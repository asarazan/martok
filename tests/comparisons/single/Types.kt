package net.sarazan.martok

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonContentPolymorphicSerializer
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject

typealias FooLike = Foo
typealias StringLike = String

@Serializable
data class Foo(
    val bar: String
)

@Serializable
data class Bar(
    val bar: String,
    val baz: Double
)

@Serializable
data class Baz(
    val bar: String,
    val baz: Double,
    val ban: Boolean
)

@Serializable
data class SomeArrayItem(
    val foo: String
)
typealias SomeArray = List<SomeArrayItem>