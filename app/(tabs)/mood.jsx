import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

// ── Box breathing: 4s in, 4s hold, 4s out, 4s hold, on a loop ──────────────
const BREATH_PHASES = [
  { label: "स्वास भितर घेयात", duration: 4000, toScale: 1.35 },
  { label: "धरून दवरात", duration: 4000, toScale: 1.35 },
  { label: "स्वास भायर सोडात", duration: 4000, toScale: 1 },
  { label: "धरून दवरात", duration: 4000, toScale: 1 },
];

function useBreathingExercise() {
  const scale = useRef(new Animated.Value(1)).current;
  const [phaseIndex, setPhaseIndex] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);

  function runPhase(index) {
    if (!isActiveRef.current) return;
    const phase = BREATH_PHASES[index];
    setPhaseIndex(index);
    Animated.timing(scale, {
      toValue: phase.toScale,
      duration: phase.duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isActiveRef.current) {
        runPhase((index + 1) % BREATH_PHASES.length);
      }
    });
  }

  function start() {
    isActiveRef.current = true;
    setIsActive(true);
    runPhase(0);
  }

  function stop() {
    isActiveRef.current = false;
    setIsActive(false);
    setPhaseIndex(null);
    scale.stopAnimation();
    Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  return { scale, phaseIndex, isActive, start, stop };
}

const GROUNDING_STEPS = [
  {
    count: "5",
    sense: "वस्तू तुमी पळोवं येतात",
    detail: "हळू हळू सभोंवतणी पळयात आनी त्यांची नांवां घेयात, मोठ्यान वा मनांतल्यान.",
  },
  {
    count: "4",
    sense: "वस्तू तुमी शिवं येतात",
    detail: "तुमचें कपडें, खुर्ची, पांयां सकयलचो फर्शी.",
  },
  {
    count: "3",
    sense: "आवाज तुमी आयकूं येतात",
    detail: "रस्त्यावयलो आवाज, पंखो, तुमचो स्वताचो स्वास.",
  },
  {
    count: "2",
    sense: "वास तुमी घेवं येतात",
    detail: "कांयच खास दिसना जाल्यार, तुमकां आवडटात असले दोन वास सांगात.",
  },
  {
    count: "1",
    sense: "रूच तुमी घेवं येता",
    detail: "उदकाचो एक घोट, वा आतां तुमच्या तोंडांत आशिल्ली रूच.",
  },
];

const TECHNIQUES = [
  {
    title: "स्नायू सैल करपाची पद्दत",
    detail: "पांयां सावन सुरवात करून, प्रत्येक स्नायू गट 5 सेकंद घट्ट धरात, उपरांत सैल सोडात. हळू हळू खांद्यांपर्यांत वयर वचात.",
  },
  {
    title: "कुडीक हालचाल दियात",
    detail: "एक ल्हान चाल, स्ट्रेचिंग, वा हातांक हालोवप, जमिल्लो ताण बेगीन काडपाक मजत करता.",
  },
  {
    title: "आवाजाचो आदार घेयात",
    detail: "एक गीत गुणगुणात, कांय शांत आवाज लायात, वा तुमचो स्वास मंद जायसर कुडींतल्या एका आवाजार लक्ष दवरात.",
  },
  {
    title: "बरोवन काडात",
    detail: "तुमकां कितें भोगता तें कागदार बरयात, बदल करिनासतां वा न्याय करिनासतां. तें दवरपाची गरज ना.",
  },
  {
    title: "कोणाकतरी संपर्क करात",
    detail: "तुमी विश्वास दवरतात अशा कोणाकतरी मेसेज वा कॉल करात. कारण सांगपाची गरज ना — फकत सांगात की तुमकां उलोवपाचें आशिल्लें.",
  },
];

const HELPLINES = [
  {
    name: "आपत्कालीन सेवा",
    number: "112",
    hours: "24×7",
    detail: "पोलीस, अग्निशामक दल, आनी रुग्णवाहिका. जर तुमी वा दुसरो कोणूय तुर्त धोक्यांत आसात तर कॉल करात.",
    tel: "112",
    danger: true,
  },
  {
    name: "KIRAN मानसिक आरोग्य हेल्पलायन",
    number: "1800-599-0019",
    hours: "24×7 · टोल-फ्री",
    detail: "मानसिक ताणतणावा खातीर भारत सरकाराची हेल्पलायन, वेगवेगळ्या भाशांनी.",
    tel: "18005990019",
  },
  {
    name: "Tele MANAS",
    number: "14416",
    hours: "24×7 · टोल-फ्री",
    detail: "राश्ट्रीय टेली-मानसिक आरोग्य सेवा, आरोग्य आनी कुटुंब कल्याण मंत्रालय.",
    tel: "14416",
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-266-2345",
    hours: "24×7",
    detail: "विशाद, त्रास आनी आत्महत्येच्या विचारां खातीर फुकट, गुप्त सल्लो.",
    tel: "18602662345",
  },
  {
    name: "COOJ Distress Helpline (गोंय)",
    number: "63 6161 2525",
    hours: "सोमार–सुक्रार · दनपार 1 ते सांज 7",
    detail: "गोंयची हेल्पलायन, जी कसलोय न्याय करिनासतां भावनीक आदार दिता.",
    tel: "6361612525",
  },
];

function callNumber(tel) {
  const url = `tel:${tel}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("कॉल करूंक जमलें ना", `उपकार करून ${tel} हो नंबर हाताबरी लावात.`);
      }
    })
    .catch(() => {
      Alert.alert("कॉल करूंक जमलें ना", `उपकार करून ${tel} हो नंबर हाताबरी लावात.`);
    });
}

export default function Mood() {
  const breathing = useBreathingExercise();
  const currentPhase = breathing.phaseIndex !== null ? BREATH_PHASES[breathing.phaseIndex] : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>आदार आनी शांती</Text>
        <Text style={styles.heading}>आतांच वापरपाक येतात असली साधनां, आनी कॉल करपाक लोक</Text>
        <Text style={styles.subheading}>
          तुमकां थंड जावपाक कांय सोपी व्यायाम, आनी जर व्यायामा परस चड मजत जाय जाल्यार खर्‍या माणसांची हेल्पलायन.
        </Text>

        {/* ── Crisis banner ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.crisisBanner}
          activeOpacity={0.88}
          onPress={() => callNumber("112")}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.crisisTitle}>तुर्त धोक्यांत आसात?</Text>
            <Text style={styles.crisisText}>
              जर तुमी वा तुमच्या वांगडा आशिल्लो कोणूय आतां सुरक्षीत ना, तर आपत्कालीन सेवेक कॉल करात.
            </Text>
          </View>
          <View style={styles.crisisCallButton}>
            <Text style={styles.crisisCallButtonText}>112 कॉल करात</Text>
          </View>
        </TouchableOpacity>

        {/* ── Breathing exercise ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>श्वासोच्छ्वासाचो व्यायाम</Text>
        <View style={styles.breathingCard}>
          <Text style={styles.breathingHint}>
            चार सेकंद स्वास भितर घेयात, चार सेकंद धरून दवरात, चार सेकंद भायर सोडात, चार सेकंद धरून दवरात. तुमकां बरें दिसपासर परतून करात.
          </Text>
          <View style={styles.breathingCircleWrap}>
            <Animated.View
              style={[
                styles.breathingCircle,
                { transform: [{ scale: breathing.scale }] },
              ]}
            >
              <Text style={styles.breathingPhaseText}>
                {currentPhase ? currentPhase.label : "तयार"}
              </Text>
            </Animated.View>
          </View>
          <TouchableOpacity
            style={[styles.breathingButton, breathing.isActive && styles.breathingButtonActive]}
            activeOpacity={0.85}
            onPress={breathing.isActive ? breathing.stop : breathing.start}
          >
            <Text style={styles.breathingButtonText}>
              {breathing.isActive ? "बंद करात" : "व्यायाम सुरू करात"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Grounding exercise ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>5-4-3-2-1 जाणीव व्यायाम</Text>
        <Text style={styles.sectionHint}>
          जेन्ना तुमचे विचार वेगान धांवतात तेन्ना उपेगी. एका फाटल्यान एक, हळू हळू, प्रत्येक ज्ञानेंद्रियाचो वापर करात.
        </Text>
        <View style={styles.groundingCard}>
          {GROUNDING_STEPS.map((step, index) => (
            <View key={step.sense}>
              <View style={styles.groundingRow}>
                <View style={styles.groundingCountBubble}>
                  <Text style={styles.groundingCountText}>{step.count}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groundingSense}>{step.sense}</Text>
                  <Text style={styles.groundingDetail}>{step.detail}</Text>
                </View>
              </View>
              {index < GROUNDING_STEPS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* ── Other calming techniques ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>आनीक मजत करपी गजाली</Text>
        <View style={{ gap: 10, marginBottom: theme.spacing.lg }}>
          {TECHNIQUES.map((t) => (
            <View key={t.title} style={styles.techniqueCard}>
              <Text style={styles.techniqueTitle}>{t.title}</Text>
              <Text style={styles.techniqueDetail}>{t.detail}</Text>
            </View>
          ))}
        </View>

        {/* ── Helpline directory ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>कोणाशीं उलोवात</Text>
        <Text style={styles.sectionHint}>
          फुकट आनी गुप्त. कॉल करपाक कार्डार क्लीक करात.
        </Text>
        <View style={{ gap: 10, marginBottom: theme.spacing.lg }}>
          {HELPLINES.map((h) => (
            <TouchableOpacity
              key={h.name}
              style={[styles.helplineCard, h.danger && styles.helplineCardDanger]}
              activeOpacity={0.88}
              onPress={() => callNumber(h.tel)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.helplineName}>{h.name}</Text>
                <Text style={styles.helplineDetail}>{h.detail}</Text>
                <Text style={styles.helplineHours}>{h.hours}</Text>
              </View>
              <View style={[styles.helplineNumberPill, h.danger && styles.helplineNumberPillDanger]}>
                <Text style={[styles.helplineNumberText, h.danger && styles.helplineNumberTextDanger]}>
                  {h.number}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          ही साधनां व्यावसायीक उपचारांचो पर्याय न्हय. जर तुमकां वैयक्तीक तकलीफ जाता, तर वयल्या हेल्पलायनींपैकी एका वा परवानो आशिल्ल्या तज्ञाक संपर्क करचो.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 36,
  },
  kicker: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heading: {
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
    fontSize: 25,
    lineHeight: 34,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },

  crisisBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(248,113,113,0.08)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.35)",
    marginBottom: theme.spacing.lg,
  },
  crisisTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.danger,
    fontSize: 15,
    marginBottom: 4,
  },
  crisisText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  crisisCallButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  crisisCallButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 13,
  },

  sectionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHint: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },

  breathingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  breathingHint: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  breathingCircleWrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  breathingCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.primaryGlow,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  breathingPhaseText: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  breathingButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  breathingButtonActive: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  breathingButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },

  groundingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
  },
  groundingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groundingCountBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groundingCountText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  groundingSense: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 3,
  },
  groundingDetail: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 46 },

  techniqueCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  techniqueTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  techniqueDetail: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },

  helplineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helplineCardDanger: {
    borderColor: "rgba(248,113,113,0.35)",
  },
  helplineName: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 3,
  },
  helplineDetail: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 4,
  },
  helplineHours: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  helplineNumberPill: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helplineNumberPillDanger: {
    backgroundColor: "rgba(248,113,113,0.12)",
    borderColor: "rgba(248,113,113,0.4)",
  },
  helplineNumberText: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 12,
  },
  helplineNumberTextDanger: {
    color: theme.colors.danger,
  },

  disclaimer: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
    marginTop: 4,
  },
});