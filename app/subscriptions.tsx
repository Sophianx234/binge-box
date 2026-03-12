import { View, Text, ScrollView, Pressable } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Dummy data for our subscription plans
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    period: 'Forever',
    features: ['720p Video Quality', 'With Ads', 'Watch on 1 Device'],
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/ month',
    features: ['1080p Video Quality', 'Ad-Free Experience', 'Download to watch offline', 'Watch on 2 Devices'],
    isPopular: true, // We will highlight this one!
  },
  {
    id: 'ultra',
    name: 'Ultra 4K',
    price: '$14.99',
    period: '/ month',
    features: ['4K + HDR Quality', 'Ad-Free Experience', 'Unlimited Downloads', 'Watch on 4 Devices', 'Dolby Atmos Audio'],
    isPopular: false,
  }
];

export default function SubscriptionScreen() {
  const router = useRouter();
  // Default to 'pro' since your profile screen says "PRO MEMBER"
  const [selectedPlan, setSelectedPlan] = useState('pro'); 

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* --- HEADER --- */}
      <View className="flex-row items-center px-5 pt-4 pb-4">
        <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-[#1A2235]">
          <Ionicons name="chevron-back" size={24} color="#F8F9FA" />
        </Pressable>
        <Text className="text-white text-xl font-bold ml-4">Choose Your Plan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- HEADER TEXT --- */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-[#00E5FF]/10 rounded-full items-center justify-center mb-4">
            <Ionicons name="diamond" size={32} color="#00E5FF" />
          </View>
          <Text className="text-white text-3xl font-black text-center mb-2">Upgrade your Binge</Text>
          <Text className="text-[#8899B6] text-center text-base px-4">
            Get unlimited access to the best movies and shows in the highest quality.
          </Text>
        </View>

        {/* --- PLAN CARDS --- */}
        <View className="gap-y-4">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                className={`relative p-5 rounded-3xl border-2 transition-all ${
                  isSelected 
                    ? 'border-[#00E5FF] bg-[#00E5FF]/5' 
                    : 'border-[#1A2235] bg-surface'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <View className="absolute -top-3 right-5 bg-[#00E5FF] px-3 py-1 rounded-full shadow-lg">
                    <Text className="text-black text-[10px] font-black tracking-widest uppercase">Most Popular</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className={`text-xl font-black ${isSelected ? 'text-[#00E5FF]' : 'text-white'}`}>
                      {plan.name}
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                      <Text className="text-white text-2xl font-bold">{plan.price}</Text>
                      <Text className="text-[#8899B6] text-sm ml-1">{plan.period}</Text>
                    </View>
                  </View>

                  {/* Radio Button Circle */}
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-[#00E5FF]' : 'border-[#4B5563]'
                  }`}>
                    {isSelected && <View className="w-3 h-3 rounded-full bg-[#00E5FF]" />}
                  </View>
                </View>

                {/* Features List */}
                <View className="pt-4 border-t border-[#1A2235]">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Ionicons 
                        name={plan.id === 'basic' && index === 1 ? 'close-circle' : 'checkmark-circle'} 
                        size={18} 
                        color={plan.id === 'basic' && index === 1 ? '#EF4444' : '#00E5FF'} 
                      />
                      <Text className="text-[#8899B6] ml-3 text-sm font-medium">{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>

      {/* --- STICKY FOOTER BUTTON --- */}
      <View className="absolute bottom-0 w-full bg-background px-5 pt-4 pb-8 border-t border-[#1A2235]">
        <Pressable 
          className="w-full h-14 bg-[#00E5FF] rounded-2xl items-center justify-center flex-row shadow-lg shadow-[#00E5FF]/20"
        >
          <Text className="text-black font-bold text-lg">
            {selectedPlan === 'pro' ? 'Manage Pro Plan' : `Upgrade to ${PLANS.find(p => p.id === selectedPlan)?.name}`}
          </Text>
        </Pressable>
        <Text className="text-center text-[#8899B6] text-xs mt-4">
          Recurring billing. Cancel anytime in App Settings.
        </Text>
      </View>
    </SafeAreaView>
  );
}