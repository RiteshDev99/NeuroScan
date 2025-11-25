import { StyleSheet, View, Text,  TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
const CustomHeader = ({ routeName, title }) => {

    const titles = {
        index: "Good Morning, Alex",
        Scan:'Brain MRI',
    };

    const headerTitle = titles[routeName] ?? title;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <View className='flex-row items-center gap-x-3' >
                    <TouchableOpacity className=' flex h-12 w-12 bg-[#3b82f6] rounded-full items-center justify-center' >
                        <FontAwesome6 name="user" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className='text-xl text-[#000000]'>{headerTitle}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#fff",
    },
    header: {
        height: 56,
        width: "100%",
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "600",
    },
});

export default CustomHeader;