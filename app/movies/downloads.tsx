import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const downloads = () => {
  return (
    <SafeAreaView className='flex-1 bg-background'>

    <View>
      <Text className='text-white'>downloads</Text>
    </View>
    </SafeAreaView>
  )
}

export default downloads