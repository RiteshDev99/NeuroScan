import { Tabs } from 'expo-router';
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import CustomHeader from "@/src/components/customHeader";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#154354',
                header: () => <CustomHeader />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Fontisto size={20} name="compass" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome6 size={20} name="circle-user" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
