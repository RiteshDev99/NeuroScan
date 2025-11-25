import { Drawer } from "expo-router/drawer";
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerContentComponentProps,
} from "@react-navigation/drawer";
import {FontAwesome, Ionicons, SimpleLineIcons} from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, StyleSheet} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const insets = useSafeAreaInsets();

    return (
        <>
            <View style={[styles.statusBarBg, { height: insets.top }]} />
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={[styles.scrollContentContainer,
                    { paddingTop: insets.top}
                ]}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.userInfo}>
                    <View style={styles.bgWrapper}>
                        <Image
                            source={{
                                uri: 'https://static.vecteezy.com/system/resources/thumbnails/006/654/400/small_2x/abstract-blue-digital-particles-wave-and-digital-data-network-connections-for-technology-background-concept-communication-or-social-media-connection-background-photo.jpg',
                            }}
                            style={styles.bgImg}
                            contentFit="cover"
                            transition={300}
                        />
                    </View>

                    <View style={styles.headerContent}>
                        <View style={styles.userProfile}>
                            {/*<Image*/}
                            {/*    source={require('')}*/}
                            {/*    style={styles.profilePic}*/}
                            {/*/>*/}
                        </View>
                        <Text style={styles.headerText}>Ritesh Chaudhary</Text>
                        <View style={styles.row}>
                            <FontAwesome size={18} name="location-arrow" color={"#fff"} />
                            <Text style={styles.headerText}>Berihwa, Uttar Pradesh</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.drawerItemsContainer}>
                    <DrawerItem
                        icon={() => <Ionicons size={25} name="home-outline" />}
                        label="Home"
                        labelStyle={styles.drawerLabel}
                        style={styles.drawerItem}
                        onPress={() => {
                            router.push("/(drawer)/(tabs)");
                        }}
                    />

                    <DrawerItem
                        icon={() => <SimpleLineIcons size={25} name="user" />}
                        label="Profile"
                        labelStyle={styles.drawerLabel}
                        style={styles.drawerItem}
                        onPress={() => {
                            router.push("/(drawer)/(tabs)/profile");
                        }}
                    />
                </View>
            </DrawerContentScrollView>
        </>
    );
};

export default function Layout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerStyle: styles.drawerStyle,
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        />
    );
}

const styles = StyleSheet.create({
    statusBarBg: {
        backgroundColor: '#b8baba',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    scrollView: {
        flex: 1,
        marginTop: 0,
        paddingTop: 0,
    },
    scrollContentContainer: {
        flexGrow: 1,
        paddingHorizontal: 0,
        paddingBottom: 20,
        alignItems: 'center',
    },
    drawerStyle: {
        width: 300,
        backgroundColor: '#fff',
    },
    userInfo: {
        height: 160,
        width: 300,
        borderBottomRightRadius: 10,
        position: 'relative',
        marginTop: 0,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bgWrapper: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        backgroundColor: 'red',
        borderBottomRightRadius: 15,
    },
    bgImg: {
        width: 300,
        height: '100%',
    },
    headerContent: {
        padding: 20,
        gap: 4,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        justifyContent: 'center',
    },
    userProfile: {
        height: 70,
        width: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 8,
    },
    headerText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
    drawerItemsContainer: {
        flex: 1,
        width: 300,
        paddingTop: 8,
    },
    drawerItem: {
        borderRadius: 8,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    drawerLabel: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
    },
    profilePic: {
        height: 70,
        width: 70,
        borderRadius: 35,
    },
});
