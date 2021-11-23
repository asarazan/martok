package net.sarazan.martok

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonObject

@Serializable
data class Foo(
    val foo: String? = null
)

@Serializable
data class One(
    val foo: String
)

@Serializable
data class Two(
    val bar: String
)

@Serializable
data class Three(
    val foo: String? = null,
    val bar: String? = null
)