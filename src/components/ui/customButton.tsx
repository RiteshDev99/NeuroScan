import { StyleSheet, Text, TouchableOpacity } from "react-native";

export interface ButtonPropsItem {
    id: string;
    title: string;
    backgroundColor?: string;
    textColor?: string;
    onPress?: () => void;
}

const CustomButton = ({ title, onPress, backgroundColor = '#fff', textColor = '#000' }: ButtonPropsItem) => {
    return (
        <TouchableOpacity
            style={[styles.btn, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        paddingVertical: 7,
        paddingHorizontal: 30,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
        marginRight: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CustomButton;
