import { motion } from "framer-motion";
import { Shield, Mail, Calendar } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useLanguage } from "@/contexts/language-context";

const LAST_UPDATED = "June 17, 2025";

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <div className="relative z-10 min-h-[80vh] max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageMeta
        title="Privacy Policy — CureCheck"
        description="How CureCheck collects, uses, and protects your health information."
        path="/privacy"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-800 text-foreground">
            {t("Privacy Policy", "गोपनीयता नीति")}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
          <Calendar className="w-3.5 h-3.5" />
          {t(`Last updated: ${LAST_UPDATED}`, `अंतिम अपडेट: ${LAST_UPDATED}`)}
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("1. Overview", "1. परिचय")}</h2>
            <p>{t(
              "CureCheck (\"we\", \"us\", or \"our\") operates curecheck.in, an AI-powered health information platform for Indian users. We are committed to protecting your personal information and being transparent about what we collect and why.",
              "CureCheck (\"हम\") curecheck.in चलाता है — भारतीय उपयोगकर्ताओं के लिए एक AI-आधारित स्वास्थ्य जानकारी प्लेटफॉर्म। हम आपकी व्यक्तिगत जानकारी की सुरक्षा के प्रति प्रतिबद्ध हैं।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("2. Information We Collect", "2. हम क्या जानकारी एकत्र करते हैं")}</h2>
            <p className="mb-3">{t("We collect the following types of information:", "हम निम्नलिखित प्रकार की जानकारी एकत्र करते हैं:")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">{t("Account Information:", "खाता जानकारी:")}</strong> {t("Name, email address, and password when you create an account.", "खाता बनाते समय नाम, ईमेल पता और पासवर्ड।")}</li>
              <li><strong className="text-foreground">{t("Health Inputs:", "स्वास्थ्य जानकारी:")}</strong> {t("Symptoms, lab report text, medicine names, and health claims you enter into our AI tools. This information is processed to generate responses and is not stored permanently on our servers.", "लक्षण, लैब रिपोर्ट टेक्स्ट, दवाओं के नाम जो आप AI टूल्स में दर्ज करते हैं। यह जानकारी केवल AI प्रतिक्रिया के लिए उपयोग की जाती है और हमारे सर्वर पर स्थायी रूप से संग्रहीत नहीं होती।")}</li>
              <li><strong className="text-foreground">{t("Profile Data:", "प्रोफ़ाइल डेटा:")}</strong> {t("Optional health profile details (age, gender, blood group, city, allergies) that you choose to save.", "वैकल्पिक स्वास्थ्य प्रोफ़ाइल विवरण जो आप सहेजना चुनते हैं।")}</li>
              <li><strong className="text-foreground">{t("Usage Data:", "उपयोग डेटा:")}</strong> {t("Pages visited, features used, and general analytics to improve the platform. No personally identifiable health data is included in analytics.", "विज़िट किए गए पेज और उपयोग की गई सुविधाएं — प्लेटफॉर्म सुधार के लिए।")}</li>
              <li><strong className="text-foreground">{t("Local Storage:", "लोकल स्टोरेज:")}</strong> {t("Health timeline entries and fitness data are stored in your browser's local storage and never transmitted to our servers unless you choose to sync.", "स्वास्थ्य टाइमलाइन और फिटनेस डेटा आपके ब्राउज़र में संग्रहीत होता है।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("3. How We Use Your Information", "3. हम आपकी जानकारी का उपयोग कैसे करते हैं")}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("To provide AI-powered health information responses via Groq/LLaMA language models.", "Groq/LLaMA AI मॉडल के माध्यम से स्वास्थ्य जानकारी प्रदान करने के लिए।")}</li>
              <li>{t("To maintain your account and sync your health profile across devices.", "आपका खाता बनाए रखने और डिवाइस के पार प्रोफ़ाइल सिंक करने के लिए।")}</li>
              <li>{t("To improve the platform based on aggregated, anonymised usage patterns.", "अनामीकृत उपयोग डेटा के आधार पर प्लेटफॉर्म सुधारने के लिए।")}</li>
              <li>{t("To send important service notifications (not marketing) if you have enabled push notifications.", "यदि आपने सूचनाएं चालू की हैं, तो महत्वपूर्ण सेवा सूचनाएं भेजने के लिए।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("4. Third-Party Services", "4. तृतीय-पक्ष सेवाएं")}</h2>
            <p className="mb-3">{t("We use the following third-party services:", "हम निम्नलिखित तृतीय-पक्ष सेवाओं का उपयोग करते हैं:")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Groq (AI Processing)</strong> — {t("Your health inputs are sent to Groq's API to generate AI responses. Groq's privacy policy applies.", "आपके स्वास्थ्य इनपुट AI प्रतिक्रिया के लिए Groq को भेजे जाते हैं।")}</li>
              <li><strong className="text-foreground">Supabase (Authentication & Database)</strong> — {t("Account credentials and profile data are stored securely via Supabase.", "खाता और प्रोफ़ाइल डेटा Supabase के माध्यम से सुरक्षित रूप से संग्रहीत।")}</li>
              <li><strong className="text-foreground">Google Analytics</strong> — {t("Anonymised page view and event tracking.", "अनामीकृत पेज व्यू और इवेंट ट्रैकिंग।")}</li>
              <li><strong className="text-foreground">Google Maps</strong> — {t("Used only on the Hospital Finder page to show nearby hospitals.", "अस्पताल खोजने वाले पेज पर मानचित्र के लिए।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("5. Data Retention", "5. डेटा संधारण")}</h2>
            <p>{t(
              "Health inputs (symptoms, report text, medicine queries) are processed in real-time and are not stored on our servers after the response is generated. Account and profile data is retained until you delete your account. You may request deletion at any time by emailing us.",
              "स्वास्थ्य इनपुट (लक्षण, रिपोर्ट टेक्स्ट, दवा प्रश्न) रीयल-टाइम में संसाधित होते हैं और प्रतिक्रिया के बाद हमारे सर्वर पर संग्रहीत नहीं किए जाते। खाता डेटा तब तक रखा जाता है जब तक आप इसे हटाने का अनुरोध नहीं करते।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("6. Children's Privacy", "6. बच्चों की गोपनीयता")}</h2>
            <p>{t(
              "CureCheck is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
              "CureCheck 13 वर्ष से कम आयु के बच्चों के लिए नहीं है। हम जानबूझकर 13 वर्ष से कम आयु के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("7. Your Rights", "7. आपके अधिकार")}</h2>
            <p className="mb-3">{t("Under the Digital Personal Data Protection Act (DPDP) 2023 and applicable Indian law, you have the right to:", "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP) 2023 के तहत, आपको अधिकार है:")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("Access and review your personal data.", "अपना व्यक्तिगत डेटा देखने का।")}</li>
              <li>{t("Correct inaccurate personal data.", "गलत डेटा सुधारने का।")}</li>
              <li>{t("Request deletion of your personal data.", "अपना डेटा हटाने का अनुरोध करने का।")}</li>
              <li>{t("Withdraw consent at any time.", "किसी भी समय सहमति वापस लेने का।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("8. Security", "8. सुरक्षा")}</h2>
            <p>{t(
              "We implement industry-standard security measures including HTTPS encryption, secure authentication via Supabase, and rate limiting on all AI endpoints. However, no method of transmission over the internet is 100% secure.",
              "हम HTTPS एन्क्रिप्शन, Supabase के माध्यम से सुरक्षित प्रमाणीकरण और AI एंडपॉइंट पर दर सीमा जैसे उद्योग-मानक सुरक्षा उपाय लागू करते हैं।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("9. Contact Us", "9. संपर्क करें")}</h2>
            <p>{t(
              "For privacy-related questions, data deletion requests, or concerns about this policy, please contact:",
              "गोपनीयता संबंधी प्रश्नों, डेटा हटाने के अनुरोध, या इस नीति के बारे में किसी भी चिंता के लिए संपर्क करें:"
            )}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:prafulsrivastava2@gmail.com" className="text-primary font-600 hover:underline text-sm">
                prafulsrivastava2@gmail.com
              </a>
            </div>
          </section>

          <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground/60">
            {t(
              "This Privacy Policy is subject to change. Continued use of CureCheck after changes constitutes acceptance of the updated policy.",
              "यह गोपनीयता नीति परिवर्तन के अधीन है। बदलाव के बाद CureCheck का उपयोग जारी रखना अद्यतन नीति की स्वीकृति मानी जाएगी।"
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
