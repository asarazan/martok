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
data class Complex(
    val foo: Foo,
    val bar: Double
) {
    @Serializable
    data class Foo(
        val foo: String? = null,
        val bar: String? = null,
        val baz: String? = null,
        val baf: String? = null
    )
}

@Serializable
data class Complex2(
    val foo: String? = null,
    val bar: String? = null,
    val baz: String? = null,
    val baf: String? = null
)

@Serializable
data class Complex3(
    val foo: Complex2,
    val bar: Double
)

@Serializable
data class Complex4(
    val foo: Complex2? = null,
    val bar: Double? = null
)