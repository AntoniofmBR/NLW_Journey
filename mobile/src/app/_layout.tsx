import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
 } from '@expo-google-fonts/inter'
import { Slot } from 'expo-router'
import { View, StatusBar } from 'react-native'

import '@/styles/global.css'
import '@/utils/dayjsLocaleConfig'
import { Loading } from '@/components/loading'

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  if (!fontsLoaded) {
    return <Loading />
  }

  return (
    <View className='bg-zinc-950 flex-1'>
      <StatusBar 
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      <Slot />
    </View>
  )
}