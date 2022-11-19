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

import kotlinx.datetime.Instant
import kotlinx.datetime.serializers.InstantIso8601Serializer

@Serializable
data class WithDates(

    /**
     * @DateTime
     */
    @SerialName("use_decorators")
    @Serializable(with = InstantIso8601Serializer::class)
    val useDecorators: Instant,

    @Serializable(with = InstantIso8601Serializer::class)

    val utcDate1: Instant,
    @Serializable(with = InstantIso8601Serializer::class)

    val isoDate2: Instant,
    @Serializable(with = InstantIso8601Serializer::class)

    val fooDate: Instant,

    val justAString: String
)
