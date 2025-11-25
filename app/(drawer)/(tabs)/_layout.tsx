import { Tabs } from 'expo-router';
import { AntDesign, MaterialCommunityIcons  } from "@expo/vector-icons";
import CustomHeader from "@/src/components/customHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function TabLayout() {

    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#60a5fa',
                header: ({ route, options }) => (
                    <CustomHeader
                        routeName={route.name}
                        title={options.title || route.name}
                    />
                ),
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                    backgroundColor:'#fff',
                    height: 60 + insets.bottom,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <AntDesign name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="line-scan" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
