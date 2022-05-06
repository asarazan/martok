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

@Serializable(with = Errors.Companion::class)
enum class Errors(
    val value: Int
) {
    ERROR_ONE(400),
    ERROR_TWO(401),
    ERROR_THREE(500);
    companion object : KSerializer<Errors> {
        override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("net.sarazan.martok.Errors", PrimitiveKind.INT)
        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
            400 -> ERROR_ONE
            401 -> ERROR_TWO
            500 -> ERROR_THREE
            else   -> throw IllegalArgumentException("Errors could not parse: $value")
        }
        override fun serialize(encoder: Encoder, value: Errors) {
            return encoder.encodeInt(value.value)
        }
    }
}
