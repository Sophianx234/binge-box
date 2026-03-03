import { View, Text, TextInput } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'

const SearchBar = () => {
  const router = useRouter()
  
  return (
    <View className="flex-row items-center  justify-center bg-surface rounded-full px-6 ">
      <Ionicons name="search" size={20} color="#00E5FF" className="mr-2 text-accent" />
      <TextInput placeholder='Search movie...' onPress={()=>router.push('/search')} className="placeholder:text-[#8899B6] py-4  size-full text-[#8899B6] "/>
    </View>
  )
}

export default SearchBar