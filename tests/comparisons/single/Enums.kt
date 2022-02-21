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
enum class Strings {
    @SerialName("one") one,
    @SerialName("two") two;
}

@Serializable(with = Ordinals.Companion::class)
enum class Ordinals(
    val value: Int
) {
    zero(0),
    one(1);

    companion object : KSerializer<Ordinals> {
        override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("net.sarazan.martok.Ordinals", PrimitiveKind.INT)

        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
            0      -> zero
            1      -> one
            else   -> throw IllegalArgumentException("Ordinals could not parse: $value")
        }

        override fun serialize(encoder: Encoder, value: Ordinals) {
            return encoder.encodeInt(value.value)
        }
    }
}

@Serializable(with = Numbers.Companion::class)
enum class Numbers(
    val value: Int
) {
    one(1),
    two(2),
    three(3);

    companion object : KSerializer<Numbers> {
        override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("net.sarazan.martok.Numbers", PrimitiveKind.INT)

        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
            1      -> one
            2      -> two
            3      -> three
            else   -> throw IllegalArgumentException("Numbers could not parse: $value")
        }

        override fun serialize(encoder: Encoder, value: Numbers) {
            return encoder.encodeInt(value.value)
        }
    }
}