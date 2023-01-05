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
enum class Type1(
    val serialName: String
) {
    @SerialName("type 1") TYPE_1("type 1"),
}

@Serializable
enum class Type1(
    val serialName: String
) {
    @SerialName("type 2") TYPE_2("type 2"),
}

@Serializable
enum class Types(
    val serialName: String
) {
    @SerialName("type 1") TYPE_1("type 1"),
    @SerialName("type 2") TYPE_2("type 2");
}

@Serializable
data class Tagged(
    val id: String,
    val type1: Type1,
    val type2: Type2,
    val types: Types
)