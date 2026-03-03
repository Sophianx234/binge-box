import { View, Text, Image } from 'react-native'
import React from 'react'

const Logo = () => {
  return (
    <View className="flex-row items-center justify-center mt-10 mb-4">

        <View className="size-20">

        <Image source={require('../assets/logo.png')} className="size-full object-cover " />
        </View>
        <View className=" pt-8 -translate-x-2 flex-row  items-center justify-center">

        <Text className="text-3xl  text-center text-accent  font-bebas">Binge</Text> 
        <Text className="text-white font-concert mt-4 text-center italic  ">

        Box
        </Text>
        </View>
        </View>
  )
}

export default Logo