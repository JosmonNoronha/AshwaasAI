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

// ── Reusable pieces ──────────────────────────────────────────────────────

function AccordionSection({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        style={styles.accordionHeader}
        activeOpacity={0.7}
        onPress={() => setOpen((v) => !v)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.accordionTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.accordionSubtitle}>{subtitle}</Text>}
        </View>
        <Text style={styles.accordionIcon}>{open ? "−" : "+"}</Text>
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function ExpandableRow({ title, detail, isLast, badge }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.expandRow}
        activeOpacity={0.7}
        onPress={() => setOpen((v) => !v)}
      >
        {badge ? (
          <View style={styles.expandRowBadge}>
            <Text style={styles.expandRowBadgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.expandRowTitle}>{title}</Text>
        <Text style={styles.expandRowIcon}>{open ? "−" : "+"}</Text>
      </TouchableOpacity>
      {open && <Text style={styles.expandRowDetail}>{detail}</Text>}
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

export default function Mood() {
  const [tab, setTab] = useState("calm"); // "calm" | "help"
  const breathing = useBreathingExercise();
  const currentPhase = breathing.phaseIndex !== null ? BREATH_PHASES[breathing.phaseIndex] : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>आदार आनी शांती</Text>
        <Text style={styles.heading}>आतां कितें करूं येता?</Text>

        {/* ── Crisis banner (always visible) ────────────────────────── */}
        <TouchableOpacity
          style={styles.crisisBanner}
          activeOpacity={0.88}
          onPress={() => callNumber("112")}
        >
          <Text style={styles.crisisText}>
            तुर्त धोक्यांत आसात? <Text style={styles.crisisTextBold}>112</Text> कॉल करात
          </Text>
          <View style={styles.crisisCallButton}>
            <Text style={styles.crisisCallButtonText}>कॉल</Text>
          </View>
        </TouchableOpacity>

        {/* ── Tab toggle ─────────────────────────────────────────────── */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.tabButton, tab === "calm" && styles.tabButtonActive]}
            onPress={() => setTab("calm")}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabButtonText, tab === "calm" && styles.tabButtonTextActive]}>
              व्यायाम
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === "help" && styles.tabButtonActive]}
            onPress={() => setTab("help")}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabButtonText, tab === "help" && styles.tabButtonTextActive]}>
              हेल्पलायन
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "calm" ? (
          <>
            {/* ── Breathing exercise ───────────────────────────────── */}
            <View style={styles.breathingCard}>
              <Text style={styles.breathingLabel}>बॉक्स ब्रीदिंग</Text>
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
                <Text
                  style={[
                    styles.breathingButtonText,
                    breathing.isActive && styles.breathingButtonTextActive,
                  ]}
                >
                  {breathing.isActive ? "बंद करात" : "सुरू करात"}
                </Text>
              </TouchableOpacity>
              {!breathing.isActive && (
                <Text style={styles.breathingHint}>
                  4 सेकंद भितर, 4 धरात, 4 भायर, 4 धरात — परतून परतून
                </Text>
              )}
            </View>

            {/* ── Grounding, collapsed by default ─────────────────── */}
            <AccordionSection
              title="5-4-3-2-1 जाणीव व्यायाम"
              subtitle="विचार वेगान धांवतात तेन्ना उपेगी"
            >
              {GROUNDING_STEPS.map((step, index) => (
                <View key={step.sense} style={styles.groundingRow}>
                  <View style={styles.groundingCountBubble}>
                    <Text style={styles.groundingCountText}>{step.count}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groundingSense}>{step.sense}</Text>
                    <Text style={styles.groundingDetail}>{step.detail}</Text>
                  </View>
                </View>
              ))}
            </AccordionSection>

            {/* ── Techniques, collapsed rows ───────────────────────── */}
            <AccordionSection
              title="आनीक मजत करपी गजाली"
              subtitle="टॅप करून वाचात"
            >
              {TECHNIQUES.map((t, index) => (
                <ExpandableRow
                  key={t.title}
                  title={t.title}
                  detail={t.detail}
                  isLast={index === TECHNIQUES.length - 1}
                />
              ))}
            </AccordionSection>
          </>
        ) : (
          <>
            {/* ── Helpline directory ────────────────────────────────── */}
            <Text style={styles.sectionHint}>
              फुकट आनी गुप्त. कार्डार टॅप करून सरळ कॉल करात.
            </Text>
            <View style={{ gap: 12, marginBottom: theme.spacing.lg }}>
              {HELPLINES.filter((h) => !h.danger).map((h) => (
                <TouchableOpacity
                  key={h.name}
                  style={styles.helplineCard}
                  activeOpacity={0.88}
                  onPress={() => callNumber(h.tel)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.helplineName}>{h.name}</Text>
                    <Text style={styles.helplineDetail}>{h.detail}</Text>
                    <Text style={styles.helplineHours}>{h.hours}</Text>
                  </View>
                  <View style={styles.helplineNumberPill}>
                    <Text style={styles.helplineNumberText}>{h.number}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.disclaimer}>
          ही साधनां व्यावसायीक उपचारांचो पर्याय न्हय. वैयक्तीक तकलीफ जाल्यार, हेल्पलायनीक वा तज्ञाक संपर्क करचो.
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
    paddingBottom: 40,
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
    fontSize: 26,
    lineHeight: 32,
    marginBottom: theme.spacing.md,
  },

  // ── Crisis banner: compact, single line ──────────────────────────
  crisisBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(248,113,113,0.08)",
    borderRadius: theme.radius.full,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: theme.spacing.lg,
  },
  crisisText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontSize: 13,
    flex: 1,
  },
  crisisTextBold: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.danger,
  },
  crisisCallButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  crisisCallButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 12,
  },

  // ── Tab toggle ────────────────────────────────────────────────────
  tabToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: theme.radius.full,
    alignItems: "center",
  },
  tabButtonActive: { backgroundColor: theme.colors.primary },
  tabButtonText: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  tabButtonTextActive: { color: "#fff" },

  sectionHint: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },

  // ── Breathing card: no border, soft tint, generous room ──────────
  breathingCard: {
    backgroundColor: theme.colors.primaryGlow,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  breathingLabel: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: theme.spacing.lg,
  },
  breathingCircleWrap: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.background,
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
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  breathingButtonActive: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  breathingButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  breathingButtonTextActive: { color: theme.colors.primary },
  breathingHint: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: theme.spacing.md,
  },

  // ── Accordion (grounding + techniques) ───────────────────────────
  accordionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accordionTitle: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 2,
  },
  accordionSubtitle: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  accordionIcon: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 20,
    width: 24,
    textAlign: "center",
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  groundingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  groundingCountBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groundingCountText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 13,
  },
  groundingSense: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 13.5,
    marginBottom: 2,
  },
  groundingDetail: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },

  // ── Expandable rows (techniques) ─────────────────────────────────
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  expandRowTitle: {
    flex: 1,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 13.5,
  },
  expandRowIcon: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 18,
    width: 20,
    textAlign: "center",
  },
  expandRowDetail: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 19,
    paddingBottom: 12,
    paddingRight: 26,
  },
  expandRowBadge: {},
  expandRowBadgeText: {},
  divider: { height: 1, backgroundColor: theme.colors.border },

  // ── Helpline cards, more spacious in their own tab ───────────────
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
    lineHeight: 18,
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
  helplineNumberText: {
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.text,
    fontSize: 12,
  },

  disclaimer: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
    marginTop: theme.spacing.md,
  },
});