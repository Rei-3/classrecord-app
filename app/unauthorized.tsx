import { View, Text, TouchableOpacity } from "react-native";
import {Image} from "expo-image";
import { router } from "expo-router";
import { removeAuthToken } from "@/lib/utils/authUtils";

export default function UnauthorizedScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text className="font-bold text-5xl">
                Unauthorized
            </Text>
        <Image
            source={require("@/assets/images/yui.gif")}
            style={{ width: 400, height: 300, borderRadius: 0, borderWidth: 2, borderColor: "#3b82f6" }}
        />
            <Text style={{ fontSize: 16 }}>You do not have permission to access this page.</Text>
            <Text style={{ fontSize: 16 }}>Go Back Ya Fool</Text>
            <TouchableOpacity
                className="bg-indigo-600 py-3 px-8 rounded-xl mt-8"
                onPress={() => {
                    removeAuthToken();
                    router.replace("/login");
                }}
            >
                <Text className="text-white font-bold text-lg">Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}