import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle, ArrowRight, Star, Activity,
  FileSearch, MapPin, Users, Award,
  Zap, Lock, Heart, Microscope, RefreshCw, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/language-context";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const DAILY_MYTHS = [
  {
    myth: { en: "Eating papaya causes miscarriage", hi: "पपीता खाने से गर्भपात होता है" },
    truth: { en: "Ripe papaya is safe during pregnancy. Only raw, unripe papaya in very large amounts may pose a small risk — but ripe papaya eaten normally is perfectly fine.", hi: "पका हुआ पपीता गर्भावस्था में सुरक्षित है। केवल कच्चा, अधपका पपीता बड़ी मात्रा में खाने से थोड़ा जोखिम हो सकता है। सामान्य मात्रा में पका पपीता बिल्कुल ठीक है।" },
    score: 12,
  },
  {
    myth: { en: "Drinking cold water after a meal causes cancer", hi: "खाने के बाद ठंडा पानी पीने से कैंसर होता है" },
    truth: { en: "There is no scientific evidence linking cold water after meals to cancer. Your stomach acid neutralizes cold water within seconds. This claim is pure misinformation.", hi: "खाने के बाद ठंडा पानी पीने से कैंसर होने का कोई वैज्ञानिक प्रमाण नहीं है। पेट का एसिड ठंडे पानी को सेकंडों में बेअसर कर देता है। यह दावा पूरी तरह गलत है।" },
    score: 4,
  },
  {
    myth: { en: "Giloy cures COVID-19 and all infections completely", hi: "गिलोय COVID-19 और सभी संक्रमण को पूरी तरह ठीक करता है" },
    truth: { en: "Giloy has immune-modulating properties in lab studies, but multiple Indian hospitals reported liver damage cases linked to Giloy supplements during COVID. It is not a cure for any viral infection.", hi: "गिलोय में इम्यून-मॉड्युलेटिंग गुण हैं, लेकिन COVID के दौरान कई भारतीय अस्पतालों ने गिलोय सप्लीमेंट से जुड़े लिवर नुकसान के मामले रिपोर्ट किए। यह किसी भी वायरल संक्रमण का इलाज नहीं है।" },
    score: 18,
  },
  {
    myth: { en: "Cow urine (gomutra) cures diabetes and cancer", hi: "गोमूत्र पीने से मधुमेह और कैंसर ठीक होता है" },
    truth: { en: "No peer-reviewed clinical trials support cow urine as a treatment for diabetes or cancer. Urine contains bacteria and waste products — consuming it carries real infection risks.", hi: "कोई peer-reviewed clinical trial गोमूत्र को मधुमेह या कैंसर के उपचार के रूप में समर्थन नहीं करता। मूत्र में बैक्टीरिया होते हैं — इसे पीने से संक्रमण का गंभीर खतरा है।" },
    score: 6,
  },
  {
    myth: { en: "Eating non-veg during fever worsens the illness", hi: "बुखार में मांस खाने से बीमारी बढ़ती है" },
    truth: { en: "Protein from eggs, chicken, or fish actually helps your immune system fight infection. Light, easily digestible protein is beneficial during fever — not harmful.", hi: "अंडे, चिकन या मछली से मिला प्रोटीन दरअसल आपके इम्यून सिस्टम को संक्रमण से लड़ने में मदद करता है। बुखार में हल्का, आसानी से पचने वाला प्रोटीन फायदेमंद होता है।" },
    score: 22,
  },
  {
    myth: { en: "Drinking lemon water on empty stomach cures thyroid problems", hi: "खाली पेट नींबू पानी पीने से थायराइड ठीक होता है" },
    truth: { en: "Lemon water has no proven effect on thyroid hormone levels. Hypothyroidism requires proper medication (levothyroxine) and monitoring. Delaying treatment can cause serious complications.", hi: "नींबू पानी का थायराइड हार्मोन स्तर पर कोई सिद्ध प्रभाव नहीं है। हाइपोथायरायडिज्म में उचित दवा जरूरी है। इलाज में देरी गंभीर जटिलताएं पैदा कर सकती है।" },
    score: 8,
  },
  {
    myth: { en: "Turmeric milk cures any type of cancer", hi: "हल्दी वाला दूध किसी भी तरह का कैंसर ठीक करता है" },
    truth: { en: "Curcumin in turmeric shows some anti-cancer properties in lab studies — but human clinical trials have not confirmed it as a cancer treatment. Doses in food are too small to have therapeutic effect.", hi: "हल्दी में करक्यूमिन लैब अध्ययनों में कुछ anti-cancer गुण दिखाता है, लेकिन मानव clinical trials में इसे कैंसर उपचार के रूप में confirm नहीं किया गया। खाने में इसकी मात्रा treatment के लिए पर्याप्त नहीं होती।" },
    score: 35,
  },
  {
    myth: { en: "Eating curd at night causes cold and throat problems", hi: "रात को दही खाने से सर्दी और गले की समस्या होती है" },
    truth: { en: "Curd (yogurt) at night is generally safe and even beneficial — it contains probiotics that help gut health. People with severe dairy intolerance or active respiratory infections may feel discomfort, but for most people it is fine.", hi: "रात को दही खाना सामान्यतः सुरक्षित है और फायदेमंद भी — इसमें प्रोबायोटिक्स होते हैं जो पाचन तंत्र की मदद करते हैं। अधिकांश लोगों के लिए यह बिल्कुल ठीक है।" },
    score: 20,
  },
  {
    myth: { en: "Diabetics should completely avoid rice and roti", hi: "मधुमेह के रोगियों को चावल और रोटी बिल्कुल बंद करनी चाहिए" },
    truth: { en: "Carbohydrates are not forbidden for diabetics — portion control and glycemic index matter. Small amounts of rice or 1–2 rotis with vegetables and protein at each meal is acceptable. Complete elimination is not necessary or realistic for most Indian patients.", hi: "मधुमेह में कार्बोहाइड्रेट पूरी तरह बंद नहीं करने होते — मात्रा और glycemic index महत्वपूर्ण है। सब्जियों और प्रोटीन के साथ कम मात्रा में चावल या 1–2 रोटी ठीक है। पूरी तरह बंद करना जरूरी नहीं।" },
    score: 28,
  },
  {
    myth: { en: "Homeopathy has no side effects and is always safe", hi: "होम्योपैथी के कोई side effects नहीं होते और यह हमेशा सुरक्षित है" },
    truth: { en: "While most homeopathic remedies are extremely diluted (often containing no original substance), the risk is delay in seeking proven treatment for serious conditions. Homeopathy has not been proven effective beyond placebo in rigorous trials.", hi: "अधिकांश होम्योपैथिक दवाएं बहुत diluted होती हैं, लेकिन असली खतरा गंभीर बीमारियों में proven इलाज में देरी है। कठोर clinical trials में होम्योपैथी की प्रभावशीलता placebo से अधिक सिद्ध नहीं हुई है।" },
    score: 30,
  },
  {
    myth: { en: "Sour foods like amla and lemon should be avoided during fever", hi: "बुखार में खट्टी चीजें जैसे आंवला और नींबू नहीं खाने चाहिए" },
    truth: { en: "Vitamin C-rich foods like amla, lemon, and orange actually support immunity during fever. This myth has no scientific basis — these foods are beneficial, not harmful, during illness.", hi: "आंवला, नींबू जैसे Vitamin C से भरपूर खाद्य पदार्थ बुखार के दौरान immunity को support करते हैं। इस मिथक का कोई वैज्ञानिक आधार नहीं है — ये खाद्य पदार्थ बीमारी में फायदेमंद हैं।" },
    score: 15,
  },
  {
    myth: { en: "BP medication should be stopped once blood pressure becomes normal", hi: "BP सामान्य होने के बाद दवाई बंद करनी चाहिए" },
    truth: { en: "Blood pressure becomes normal BECAUSE of the medication. Stopping it usually causes BP to rise again within days to weeks. Never stop BP medication without your doctor's explicit guidance.", hi: "Blood pressure दवाई की वजह से सामान्य होता है। इसे बंद करने पर कुछ दिनों-हफ्तों में BP फिर बढ़ जाता है। डॉक्टर की स्पष्ट सलाह के बिना कभी BP दवाई बंद न करें।" },
    score: 10,
  },
  {
    myth: { en: "Sitting under a fan or AC after exercise causes joint pain", hi: "व्यायाम के बाद AC में बैठने से जोड़ों में दर्द होता है" },
    truth: { en: "Cooling down after exercise is natural and healthy. There is no evidence that AC or fan exposure after exercise causes joint damage or pain. Joint pain from exercise is typically muscle soreness, not caused by temperature change.", hi: "व्यायाम के बाद ठंडा होना स्वाभाविक और स्वस्थ है। AC या पंखे से जोड़ों में नुकसान का कोई प्रमाण नहीं है। व्यायाम के बाद दर्द आमतौर पर muscle soreness होता है।" },
    score: 18,
  },
  {
    myth: { en: "Ghee and coconut oil are heart-healthy and unlimited quantities are fine", hi: "घी और नारियल तेल हृदय के लिए स्वस्थ हैं और असीमित मात्रा में खा सकते हैं" },
    truth: { en: "Ghee and coconut oil contain saturated fats. While small amounts can be part of a balanced diet, large quantities raise LDL cholesterol and increase cardiovascular risk. Moderation is key.", hi: "घी और नारियल तेल में saturated fats होते हैं। थोड़ी मात्रा balanced diet का हिस्सा हो सकती है, लेकिन अधिक मात्रा LDL cholesterol बढ़ाती है। संयम जरूरी है।" },
    score: 25,
  },
  {
    myth: { en: "Insulin injections are addictive and should be avoided as long as possible", hi: "Insulin के इंजेक्शन लत लगाते हैं और जितना हो सके इससे बचना चाहिए" },
    truth: { en: "Insulin is not addictive — it is a hormone your body needs. Many doctors and patients delay insulin out of fear, but this worsens long-term outcomes. When your doctor recommends insulin, it is the right time to start.", hi: "Insulin लत नहीं लगाती — यह एक हार्मोन है जिसकी शरीर को जरूरत है। डर से insulin में देरी करने से long-term outcomes खराब होते हैं। जब डॉक्टर recommend करें, तभी शुरू करना सही समय है।" },
    score: 12,
  },
  {
    myth: { en: "Eating crab causes skin diseases and infections", hi: "केकड़ा खाने से त्वचा रोग और संक्रमण होते हैं" },
    truth: { en: "There is no credible scientific evidence that eating crab causes skin diseases. Shellfish allergies are real and can cause reactions in some people — but that is an allergy, not a universal risk.", hi: "केकड़ा खाने से त्वचा रोग होने का कोई विश्वसनीय वैज्ञानिक प्रमाण नहीं है। Shellfish allergy कुछ लोगों को होती है — लेकिन यह allergy है, सबके लिए जोखिम नहीं।" },
    score: 8,
  },
  {
    myth: { en: "Antibiotics should be taken for all fevers and coughs", hi: "सभी बुखार और खांसी में antibiotics लेनी चाहिए" },
    truth: { en: "Most fevers and coughs are caused by viruses — antibiotics do not work against viruses. Overusing antibiotics creates antibiotic resistance, which is a major public health crisis. Always consult a doctor before taking antibiotics.", hi: "अधिकांश बुखार और खांसी वायरस से होती है — antibiotics वायरस पर काम नहीं करतीं। Antibiotics का दुरुपयोग antibiotic resistance बनाता है, जो एक बड़ी public health समस्या है। हमेशा डॉक्टर से पूछकर ही लें।" },
    score: 5,
  },
  {
    myth: { en: "Drinking water while standing causes knee pain and arthritis", hi: "खड़े होकर पानी पीने से घुटनों में दर्द और arthritis होता है" },
    truth: { en: "There is no scientific basis for this claim. Arthritis and knee pain have genetic, weight, age, and lifestyle factors — not whether you stood or sat while drinking water.", hi: "इस दावे का कोई वैज्ञानिक आधार नहीं है। Arthritis और घुटने के दर्द में genetic, वजन, उम्र और lifestyle factors होते हैं — पानी खड़े या बैठकर पीना नहीं।" },
    score: 7,
  },
  {
    myth: { en: "Black seed (kalonji) oil cures every disease", hi: "कलौंजी का तेल हर बीमारी ठीक करता है" },
    truth: { en: "Kalonji (Nigella sativa) has been studied and shows some anti-inflammatory and antioxidant properties. However, 'cures every disease' is an exaggerated claim with no scientific backing. It can be part of a healthy diet but is not a medicine.", hi: "कलौंजी (Nigella sativa) में कुछ anti-inflammatory और antioxidant गुण हैं। लेकिन 'हर बीमारी ठीक करता है' एक अतिरंजित दावा है जिसका कोई वैज्ञानिक आधार नहीं। यह स्वस्थ आहार का हिस्सा हो सकता है लेकिन दवा नहीं है।" },
    score: 25,
  },
  {
    myth: { en: "Drinking a lot of water flushes out kidney stones by itself", hi: "बहुत पानी पीने से गुर्दे की पथरी अपने आप निकल जाती है" },
    truth: { en: "Hydration helps prevent small kidney stones and may help pass very small ones. But larger stones (>5mm) typically need medical intervention — lithotripsy or surgery. Don't rely on water alone for a known stone.", hi: "पर्याप्त पानी पीना छोटी पथरी को रोकने और बहुत छोटी पथरी को निकालने में मदद कर सकता है। लेकिन बड़ी पथरी (>5mm) के लिए medical intervention की जरूरत होती है। पानी पर अकेले निर्भर न रहें।" },
    score: 30,
  },
  {
    myth: { en: "Children should not be given eggs as they cause heat in the body", hi: "बच्चों को अंडे नहीं देने चाहिए क्योंकि इससे शरीर में गर्मी होती है" },
    truth: { en: "Eggs are one of the best sources of protein, vitamins, and healthy fats for children's development. The 'body heat' concept is not supported by scientific evidence. Eggs support brain development and growth.", hi: "अंडे बच्चों के विकास के लिए प्रोटीन, vitamins और healthy fats का सबसे अच्छा स्रोत हैं। 'शरीर में गर्मी' की अवधारणा का वैज्ञानिक आधार नहीं है। अंडे brain development और growth में मदद करते हैं।" },
    score: 9,
  },
  {
    myth: { en: "TB is caused by eating cold food or sleeping on the floor", hi: "TB ठंडा खाना खाने या जमीन पर सोने से होती है" },
    truth: { en: "Tuberculosis is caused by Mycobacterium tuberculosis bacteria — spread through the air when an infected person coughs or sneezes. It has nothing to do with cold food or sleeping arrangements.", hi: "Tuberculosis Mycobacterium tuberculosis बैक्टीरिया से होती है — संक्रमित व्यक्ति के खांसने या छींकने से फैलती है। इसका ठंडे खाने या सोने की जगह से कोई संबंध नहीं है।" },
    score: 5,
  },
  {
    myth: { en: "Using mobile phones too much directly causes brain tumors", hi: "ज्यादा mobile phone इस्तेमाल करने से directly brain tumor होता है" },
    truth: { en: "Decades of research have not found a clear causal link between mobile phone radiation and brain tumors. The radiation from phones is non-ionizing and too weak to damage DNA. Excessive screen time causes other issues (sleep, posture) but not brain tumors.", hi: "दशकों के research में mobile phone radiation और brain tumor के बीच कोई स्पष्ट causal link नहीं मिला। फोन से non-ionizing radiation होती है जो DNA को नुकसान पहुंचाने के लिए बहुत कमजोर है।" },
    score: 20,
  },
  {
    myth: { en: "Drinking jeera (cumin) water every morning cures all digestive problems permanently", hi: "रोज सुबह जीरा पानी पीने से सभी पाचन समस्याएं हमेशा के लिए ठीक हो जाती हैं" },
    truth: { en: "Jeera water may provide mild digestive relief and has some evidence for reducing bloating. However, chronic digestive issues like IBS, GERD, or ulcers need proper diagnosis and treatment — not just jeera water.", hi: "जीरा पानी हल्के पाचन राहत दे सकता है और bloating कम करने के कुछ प्रमाण हैं। लेकिन IBS, GERD, या ulcers जैसी पुरानी समस्याओं के लिए proper diagnosis और इलाज जरूरी है।" },
    score: 35,
  },
  {
    myth: { en: "A person with dengue should not eat any solid food", hi: "डेंगू में कोई ठोस खाना नहीं खाना चाहिए" },
    truth: { en: "Nutrition is important during dengue recovery. Light, easily digestible foods like khichdi, fruits, and dal are recommended. Complete fasting is harmful — your body needs nutrients to fight the infection and rebuild platelets.", hi: "Dengue recovery में पोषण जरूरी है। खिचड़ी, फल, और दाल जैसे हल्के खाद्य पदार्थ recommended हैं। पूरी तरह न खाना हानिकारक है — शरीर को संक्रमण से लड़ने और platelets बनाने के लिए nutrients चाहिए।" },
    score: 15,
  },
  {
    myth: { en: "Applying mustard oil inside the nose prevents all respiratory infections", hi: "नाक में सरसों का तेल लगाने से सभी श्वसन संक्रमण रोके जाते हैं" },
    truth: { en: "While some traditional practices use nasal oils, there is no clinical evidence that mustard oil prevents respiratory infections. Vaccination, handwashing, and masks are proven prevention methods.", hi: "कुछ पारंपरिक प्रथाओं में nasal oils का उपयोग होता है, लेकिन सरसों का तेल respiratory infections रोकता है — इसका कोई clinical प्रमाण नहीं। टीकाकरण, हाथ धोना और मास्क proven तरीके हैं।" },
    score: 20,
  },
  {
    myth: { en: "Women should not exercise during their periods", hi: "महिलाओं को periods के दौरान व्यायाम नहीं करना चाहिए" },
    truth: { en: "Light to moderate exercise during menstruation is not only safe but can actually reduce cramps and improve mood through endorphin release. Heavy intense training may be worth adjusting, but walking and yoga are beneficial.", hi: "Menstruation के दौरान हल्का से मध्यम व्यायाम न केवल सुरक्षित है बल्कि endorphin release से ऐंठन कम और mood बेहतर कर सकता है। Walking और yoga फायदेमंद हैं।" },
    score: 22,
  },
  {
    myth: { en: "Having sex during pregnancy harms the baby", hi: "गर्भावस्था के दौरान sex करने से बच्चे को नुकसान होता है" },
    truth: { en: "Sex during a normal, low-risk pregnancy is safe for both mother and baby. The baby is well-protected by amniotic fluid and the cervix. Your doctor will advise if there are specific reasons to avoid it.", hi: "सामान्य, कम जोखिम वाली गर्भावस्था में sex माँ और बच्चे दोनों के लिए सुरक्षित है। बच्चा amniotic fluid और cervix से सुरक्षित रहता है। अगर specific कारण हों तो डॉक्टर बताएंगे।" },
    score: 28,
  },
  {
    myth: { en: "Vitamin C megadoses can cure a cold within hours", hi: "Vitamin C की बड़ी खुराक कुछ घंटों में सर्दी ठीक कर देती है" },
    truth: { en: "Vitamin C may slightly shorten cold duration when taken regularly but does not cure a cold once you have it. Megadoses (above 2000mg/day) can cause kidney stones and digestive issues without additional benefit.", hi: "Vitamin C नियमित रूप से लेने पर सर्दी की अवधि थोड़ी कम कर सकता है, लेकिन एक बार सर्दी होने पर ठीक नहीं करता। Megadoses (2000mg/day से अधिक) से kidney stones और पाचन समस्याएं हो सकती हैं।" },
    score: 32,
  },
  {
    myth: { en: "Sleeping immediately after a meal causes stomach problems and obesity", hi: "खाने के तुरंत बाद सोने से पेट की समस्याएं और मोटापा होता है" },
    truth: { en: "Lying down right after eating can worsen acid reflux in people prone to it. However, it doesn't directly cause obesity. A short 20-minute walk after meals actually improves blood sugar control.", hi: "खाने के तुरंत बाद लेटने से acid reflux prone लोगों में समस्या बढ़ सकती है। लेकिन यह सीधे मोटापा नहीं बनाता। खाने के बाद 20 मिनट की walk blood sugar control बेहतर करती है।" },
    score: 30,
  },
];

function getDailyMyth() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_MYTHS[dayOfYear % DAILY_MYTHS.length];
}

const features = [
  {
    icon: Activity,
    title: { en: "Symptom Checker", hi: "लक्षण जांचकर्ता" },
    description: { en: "Describe your symptoms and get an urgency assessment, possible causes, and clear guidance on what to do next — in Hindi or English.", hi: "अपने लक्षण बताएं और तत्कालता आकलन, संभावित कारण, और अगले कदमों पर स्पष्ट मार्गदर्शन पाएं।" },
    href: "/symptom-checker",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    badge: { en: "New", hi: "नया" },
  },
  {
    icon: Shield,
    title: { en: "Health Claim Checker", hi: "स्वास्थ्य दावा जांच" },
    description: { en: "Paste any WhatsApp forward, YouTube claim, or supplement ad. Get a credibility score, red flags, and safer interpretation.", hi: "कोई भी WhatsApp forward, YouTube claim, या supplement ad paste करें और credibility score पाएं।" },
    href: "/claim-checker",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    badge: null,
  },
  {
    icon: MapPin,
    title: { en: "Disease Journey Map", hi: "रोग यात्रा मानचित्र" },
    description: { en: "Diagnosed with something new? Understand what typically happens — phase by phase — so you and your family know what to expect.", hi: "नई बीमारी का पता चला? समझें कि phase दर phase क्या होता है — आप और परिवार तैयार रहें।" },
    href: "/disease-journey",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    badge: null,
  },
  {
    icon: FileSearch,
    title: { en: "Report Explainer", hi: "रिपोर्ट समझें" },
    description: { en: "Paste your CBC, thyroid, lipid, or any other report. Get a plain-language breakdown with key findings and questions to ask your doctor.", hi: "CBC, thyroid, lipid या कोई भी report paste करें। सरल भाषा में मुख्य निष्कर्ष और डॉक्टर से पूछने के सवाल पाएं।" },
    href: "/report-explainer",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    badge: null,
  },
];

const stats = [
  { value: "50,000+", label: { en: "Users helped across India", hi: "भारत में मदद की" } },
  { value: "1,20,000+", label: { en: "Claims analyzed", hi: "दावे जांचे गए" } },
  { value: "95%", label: { en: "Users felt more informed", hi: "उपयोगकर्ता बेहतर informed महसूस किए" } },
  { value: "Free", label: { en: "Always free to use", hi: "हमेशा मुफ्त" } },
];

const testimonials = [
  {
    name: "Priya Sharma", location: "Bengaluru", role: "Software Engineer",
    text: { en: "My mother-in-law was convinced that giloy cures thyroid problems — a relative shared a video. CureCheck gave us a clear breakdown that helped us have a calm, informed conversation with her doctor.", hi: "मेरी सास को यकीन था कि गिलोय थायराइड ठीक करती है। CureCheck की मदद से हम डॉक्टर से सही तरीके से बात कर पाए।" },
  },
  {
    name: "Ramesh Gupta", location: "Lucknow", role: "Teacher",
    text: { en: "My father was newly diagnosed with Type 2 diabetes and we had no idea what to expect. The Disease Journey map gave our entire family a roadmap — what tests to expect, warning signs, everything.", hi: "पिताजी को Type 2 diabetes का पता चला था। Disease Journey map ने पूरे परिवार को roadmap दिया — क्या expect करें, warning signs, सब कुछ।" },
  },
  {
    name: "Dr. Anjali Mehta", location: "Mumbai", role: "General Physician, MBBS",
    text: { en: "I recommend CureCheck to patients who come in confused by social media health claims. It does not replace me — it helps patients come prepared with the right questions.", hi: "मैं अपने मरीजों को CureCheck recommend करती हूं जो social media health claims से confused होते हैं। यह मुझे replace नहीं करता — मरीजों को सही सवाल पूछने में मदद करता है।" },
  },
];

const faqs = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck provides educational information to help you understand health claims, medical reports, and disease journeys. It never diagnoses, prescribes treatment, or gives personalized medical advice.", hi: "बिल्कुल नहीं। CureCheck शैक्षिक जानकारी देता है। यह कभी निदान नहीं करता, इलाज नहीं बताता। हमेशा qualified डॉक्टर से मिलें।" } },
  { q: { en: "How does the AI analyze health claims?", hi: "AI स्वास्थ्य दावों का विश्लेषण कैसे करता है?" }, a: { en: "CureCheck uses Groq's large language model to evaluate claims against known scientific evidence, identifying red flags and providing context. It is not infallible and should not be treated as a medical opinion.", hi: "CureCheck Groq के large language model का उपयोग करता है। यह claims को वैज्ञानिक साक्ष्यों के आधार पर evaluate करता है। यह अचूक नहीं है।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा स्वास्थ्य डेटा सुरक्षित है?" }, a: { en: "We do not store your health queries, reports, or any personal data. Each session is independent and private. We do not sell or share your information.", hi: "हम आपके स्वास्थ्य प्रश्न, रिपोर्ट, या कोई भी व्यक्तिगत डेटा store नहीं करते। प्रत्येक session स्वतंत्र है।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, CureCheck is completely free. Our mission is to help everyday Indians navigate health information — we believe that should never be behind a paywall.", hi: "हां, CureCheck पूरी तरह मुफ्त है। हमारा मिशन है कि हर भारतीय स्वास्थ्य जानकारी को सही तरीके से समझे।" } },
  { q: { en: "Does it work for Ayurvedic and home remedy claims?", hi: "क्या यह Ayurvedic और घरेलू नुस्खों के दावों के लिए काम करता है?" }, a: { en: "Yes. CureCheck is built with the Indian context in mind and regularly evaluates Ayurvedic claims, home remedies, and traditional medicine claims — balancing traditional wisdom with scientific evidence.", hi: "हां। CureCheck भारतीय context को ध्यान में रखकर बना है और Ayurvedic दावों, घरेलू नुस्खों को evaluate करता है।" } },
];

export default function Home() {
  const { language, t } = useLanguage();
  const dailyMyth = getDailyMyth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Badge className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 text-sm font-medium">
              {t("Built for India. Trusted by thousands.", "भारत के लिए बना। हजारों का भरोसा।")}
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-800 text-foreground leading-tight tracking-tight"
          >
            {t("Healthcare Information", "स्वास्थ्य जानकारी")}
            <br />
            <span className="gradient-text">{t("You Can Actually Trust", "जिस पर आप भरोसा कर सकते हैं")}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "Verify health claims from WhatsApp forwards, check your symptoms, understand medical reports, and navigate diagnosis with AI-powered educational guidance.",
              "WhatsApp forwards के स्वास्थ्य दावों की जांच करें, लक्षण समझें, medical reports को सरल भाषा में जानें।"
            )}
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link href="/symptom-checker">
              <Button size="lg" className="gap-2 rounded-full px-8 shadow-md hover:shadow-lg transition-shadow bg-rose-500 hover:bg-rose-600" data-testid="button-try-symptom-checker">
                <Activity className="w-4 h-4" />
                {t("Check Symptoms", "लक्षण जांचें")}
              </Button>
            </Link>
            <Link href="/claim-checker">
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8" data-testid="button-try-claim-checker">
                {t("Verify a Health Claim", "दावा जांचें")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-5 text-sm text-muted-foreground"
          >
            {t("Free · No signup · Not medical advice", "मुफ्त · कोई signup नहीं · चिकित्सा सलाह नहीं")}
          </motion.p>
        </div>

        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="text-center">
                <p className="text-3xl font-serif font-700 gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{language === "hi" ? s.label.hi : s.label.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Myth Buster */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-700 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {t("Health Myth of the Day", "आज का स्वास्थ्य मिथक")}
                  </p>
                  <p className="text-xs text-amber-500 dark:text-amber-500/70">
                    {t("Updated daily · Share to spread awareness", "रोज़ अपडेट · जागरूकता फैलाएं")}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-600 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    {t("Credibility", "विश्वसनीयता")}: {dailyMyth.score}/100
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-700 text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                  {t("The Myth:", "मिथक:")}
                </p>
                <p className="text-lg font-serif font-700 text-foreground">
                  "{language === "hi" ? dailyMyth.myth.hi : dailyMyth.myth.en}"
                </p>
              </div>

              <div className="rounded-xl bg-white/60 dark:bg-black/20 border border-amber-200/50 dark:border-amber-700/30 p-4">
                <p className="text-xs font-700 text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                  {t("The Truth:", "सच्चाई:")}
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {language === "hi" ? dailyMyth.truth.hi : dailyMyth.truth.en}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/claim-checker">
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30" data-testid="button-myth-check">
                    <Shield className="w-3.5 h-3.5" />
                    {t("Check similar claims", "ऐसे दावे जांचें")}
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    const text = `🚫 *${t("Health Myth Busted!", "स्वास्थ्य मिथक ध्वस्त!")}* — CureCheck\n\n❌ *${t("Myth", "मिथक")}:* "${language === "hi" ? dailyMyth.myth.hi : dailyMyth.myth.en}"\n\n✅ *${t("Truth", "सच")}:* ${language === "hi" ? dailyMyth.truth.hi : dailyMyth.truth.en}\n\n_${t("Check more health myths on CureCheck", "CureCheck पर और मिथक जांचें")}_ 👇`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                  }}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-600"
                  data-testid="button-myth-whatsapp"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t("Share on WhatsApp", "WhatsApp पर शेयर करें")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">
              {t("Four tools. One mission.", "चार tools। एक मिशन।")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {t("Cut through health misinformation with evidence-based, easy-to-understand guidance.", "वैज्ञानिक प्रमाणों पर आधारित, आसान भाषा में स्वास्थ्य मार्गदर्शन।")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link href={f.href}>
                  <div className="group h-full rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                    {f.badge && (
                      <span className="absolute top-4 right-4 text-xs font-700 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400">
                        {language === "hi" ? f.badge.hi : f.badge.en}
                      </span>
                    )}
                    <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                      <f.icon className={`w-5.5 h-5.5 ${f.color}`} />
                    </div>
                    <h3 className="text-base font-serif font-600 text-foreground mb-2">{language === "hi" ? f.title.hi : f.title.en}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{language === "hi" ? f.description.hi : f.description.en}</p>
                    <div className="mt-4 flex items-center gap-1 text-primary text-xs font-600 group-hover:gap-2 transition-all">
                      {t("Try it", "आज़माएं")} <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">
              {t("How CureCheck works", "CureCheck कैसे काम करता है")}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Zap, title: { en: "Paste your content", hi: "अपना content paste करें" }, desc: { en: "A health claim, your medical report text, or describe your symptoms. No account needed.", hi: "कोई स्वास्थ्य दावा, medical report, या लक्षण। कोई account नहीं चाहिए।" } },
              { step: "02", icon: Microscope, title: { en: "AI analyzes the evidence", hi: "AI साक्ष्य का विश्लेषण करता है" }, desc: { en: "Our AI cross-references medical literature to evaluate accuracy, red flags, and context.", hi: "हमारा AI medical literature के आधार पर सटीकता, red flags और context evaluate करता है।" } },
              { step: "03", icon: CheckCircle, title: { en: "Get clear guidance", hi: "स्पष्ट मार्गदर्शन पाएं" }, desc: { en: "Receive plain-language results with questions to ask your doctor — not a diagnosis.", hi: "सरल भाषा में परिणाम पाएं, डॉक्टर से पूछने के सवाल — निदान नहीं।" } },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-700 text-primary tracking-widest uppercase mb-2">{item.step}</p>
                <h3 className="text-lg font-serif font-600 text-foreground mb-2">{language === "hi" ? item.title.hi : item.title.en}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{language === "hi" ? item.desc.hi : item.desc.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">
              {t("Built with trust at the core", "भरोसे के साथ बनाया गया")}
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Lock, title: { en: "No data stored", hi: "डेटा store नहीं" }, desc: { en: "Your queries are never saved or sold.", hi: "आपके सवाल कभी save या sell नहीं होते।" } },
              { icon: Heart, title: { en: "India-first design", hi: "India-first डिज़ाइन" }, desc: { en: "Built around Indian health concerns, reports, and context.", hi: "भारतीय स्वास्थ्य चिंताओं, reports और context के आसपास बना।" } },
              { icon: Award, title: { en: "Evidence-based", hi: "साक्ष्य-आधारित" }, desc: { en: "AI grounded in peer-reviewed medical literature.", hi: "peer-reviewed medical literature पर आधारित AI।" } },
              { icon: Users, title: { en: "Doctor-friendly", hi: "डॉक्टर के अनुकूल" }, desc: { en: "Designed to complement — never replace — your physician.", hi: "डॉक्टर को complement करने के लिए बना — replace नहीं।" } },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="rounded-xl border border-border bg-card p-5">
                <item.icon className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-600 text-foreground mb-1">{language === "hi" ? item.title.hi : item.title.en}</h4>
                <p className="text-sm text-muted-foreground">{language === "hi" ? item.desc.hi : item.desc.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">
              {t("What people are saying", "लोग क्या कह रहे हैं")}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t_, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{language === "hi" ? t_.text.hi : t_.text.en}"</p>
                <div className="mt-auto">
                  <p className="font-600 text-foreground text-sm">{t_.name}</p>
                  <p className="text-xs text-muted-foreground">{t_.role} · {t_.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">
              {t("Frequently asked questions", "अक्सर पूछे जाने वाले सवाल")}
            </h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}>
                <AccordionItem value={`faq-${i}`} className="border border-border rounded-xl px-5 bg-card">
                  <AccordionTrigger className="text-left font-500 text-foreground hover:no-underline py-4">
                    {language === "hi" ? faq.q.hi : faq.q.en}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {language === "hi" ? faq.a.hi : faq.a.en}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 p-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground mb-4">
                {t("Check your symptoms now", "अभी अपने लक्षण जांचें")}
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                {t("Free. Private. Built for India.", "मुफ्त। निजी। भारत के लिए बना।")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/symptom-checker">
                  <Button size="lg" className="rounded-full px-10 gap-2 shadow-lg hover:shadow-xl transition-shadow bg-rose-500 hover:bg-rose-600" data-testid="button-cta-symptoms">
                    <Activity className="w-4 h-4" />
                    {t("Check Symptoms", "लक्षण जांचें")}
                  </Button>
                </Link>
                <Link href="/claim-checker">
                  <Button size="lg" variant="outline" className="rounded-full px-8 gap-2" data-testid="button-cta-claim">
                    {t("Verify a Claim", "दावा जांचें")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-600 text-foreground">CureCheck</span>
            <span>— {t("Educational information only. Not medical advice.", "केवल शैक्षिक जानकारी। चिकित्सा सलाह नहीं।")}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { href: "/symptom-checker", en: "Symptom Checker", hi: "लक्षण जांच" },
              { href: "/claim-checker", en: "Claim Checker", hi: "दावा जांच" },
              { href: "/disease-journey", en: "Disease Journey", hi: "रोग यात्रा" },
              { href: "/report-explainer", en: "Report Explainer", hi: "रिपोर्ट समझें" },
              { href: "/about", en: "About", hi: "परिचय" },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {language === "hi" ? link.hi : link.en}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
