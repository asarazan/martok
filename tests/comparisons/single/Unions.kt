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

@Serializable
data class StringUnions(
    val foo: List<FooItem>
) {
    @Serializable
    enum class FooItem(
        val serialName: String
    ) {
        @SerialName("hey") HEY("hey"),
        @SerialName("hi") HI("hi");
    }
}
