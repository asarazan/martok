package net.sarazan.martok

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

@Serializable(with = Hateful.UnionSerializer::class)
abstract class Hateful {
    abstract val id: String
    abstract val foo: String?
    abstract val type: String

    @Serializable
    data class HatefulState1(
        override val id: String,
        override val foo: String?,
        override val type: String,
        val state: State1
    ) : Hateful()

    @Serializable
    data class HatefulState2(
        override val id: String,
        override val foo: String?,
        override val type: String,
        val state: State2
    ) : Hateful()

    object UnionSerializer : JsonContentPolymorphicSerializer<Hateful>(Hateful::class) {
        override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive("type1") -> HatefulState1.serializer()
            JsonPrimitive("type2") -> HatefulState2.serializer()
            else -> throw IllegalArgumentException("Unexpected gameType: $type")
        }
    }

}

@Serializable
data class State1(
    val foo: String,
    val bar: Double
)

@Serializable
data class State2(
    val foo: Boolean,
    val bar: String
)
