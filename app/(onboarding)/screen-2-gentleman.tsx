// app/(onboarding)/screen-2-gentleman.tsx
import { ContinueButton } from "@/components/ContinueButton";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { router } from "expo-router";
import { Dimensions, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_H * 0.5;

export default function Screen2Gentleman() {
  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={["top", "bottom"]}>
      <View className="flex-1">
        {/* Centered title + decorative underline */}
        <View className="items-center pt-5 pb-4">
          <Text
            className="text-ink text-[22px] text-center"
            style={{ fontFamily: "PlayfairDisplay_400Regular" }}
          >
            Become a Gentleman
          </Text>
          <View
            style={{
              width: 40,
              height: 1,
              backgroundColor: "#0A0A0A",
              marginTop: 8,
            }}
          />
        </View>

        {/* Hero photo — full bleed */}
        <Image
          source={require("../../assets/elegant-images/elegant3.png")}
          style={{ width: "100%", height: HERO_HEIGHT }}
          resizeMode="cover"
        />

        {/* Body text */}
        <View className="px-6 pt-5 gap-2">
          <Text
            className="text-ink text-[26px] leading-[34px]"
            style={{ fontFamily: "PlayfairDisplay_700Bold" }}
          >
            You already know the{"\n"}man you should be.
          </Text>
          <Text
            className="text-muted text-[14px] leading-5"
            style={{ fontFamily: "PlayfairDisplay_400Regular" }}
          >
            Every great man was once a boy who decided enough was enough.
          </Text>
        </View>
      </View>

      <View>
        <OnboardingProgress total={5} current={0} />
        <ContinueButton
          onPress={() => router.push("/(onboarding)/screen-3-soundtrack")}
        />
      </View>
    </SafeAreaView>
  );
}
