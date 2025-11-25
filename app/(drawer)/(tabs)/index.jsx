import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import {useRouter} from "expo-router";

export default function MRIDashboard() {
    const router = useRouter();
    const recentScans = [
        {
            id: 1,
            date: 'Oct 26, 2023',
            status: 'No Indicators Found',
            icon: 'checkmark-circle',
            iconColor: '#4ade80',
            bgColor: '#dcfce7'
        },
        {
            id: 2,
            date: 'Sep 15, 2023',
            status: 'Early Stage Detected',
            icon: 'warning',
            iconColor: '#fbbf24',
            bgColor: '#fef3c7'
        },
        {
            id: 3,
            date: 'Aug 02, 2023',
            status: 'Analysis in Progress',
            icon: 'hourglass-outline',
            iconColor: '#60a5fa',
            bgColor: '#dbeafe'
        }
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1">

                <View className="bg-white mx-4 mt-6 rounded-2xl p-6 shadow-sm">
                    <Text className="text-xl font-semibold text-gray-800 mb-2">
                        Start a New Analysis
                    </Text>
                    <Text className="text-gray-500 mb-4">
                        Get a confidential analysis in minutes.
                    </Text>


                    <View className="h-48 rounded-2xl overflow-hidden">
                        <View
                            style={{
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)",
                            }}
                        />

                        <Image
                            source={{ uri: "https://i.ytimg.com/vi/7F-t9yvPP_0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDaxbLHgcUOw0ETHBF2YpSEqNdPfw" }}
                            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                            resizeMode="cover"
                        />
                    </View>
                    <TouchableOpacity className="bg-blue-600 rounded-xl py-4 mt-6"
                                      onPress={() => router.push('/(drawer)/(tabs)/Scan')}
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            Upload & Scan MRI
                        </Text>
                    </TouchableOpacity>

                </View>

                <View className="px-4 mt-8">
                    <Text className="text-xl font-semibold text-gray-800 mb-4">
                        Recent Activity
                    </Text>

                    {recentScans.map((scan) => (
                        <TouchableOpacity
                            key={scan.id}
                            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: scan.bgColor }}
                            >
                                <Ionicons name={scan.icon} size={24} color={scan.iconColor} />
                            </View>

                            <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-800 mb-1">
                                    Scan from {scan.date}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    {scan.status}
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Understanding Results Card */}
                <View className="mx-4 mt-4 mb-8">
                    <TouchableOpacity className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="w-12 h-12 bg-cyan-100 rounded-full items-center justify-center mb-4">
                            <MaterialCommunityIcons name="brain" size={24} color="#06b6d4" />
                        </View>

                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            Understanding Your Results
                        </Text>
                        <Text className="text-gray-500 mb-4">
                            Explore our guide and resources.
                        </Text>

                        <View className="items-end">
                            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}