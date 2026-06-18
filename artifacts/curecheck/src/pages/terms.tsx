import { motion } from "framer-motion";
import { FileText, Mail, Calendar } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useLanguage } from "@/contexts/language-context";

const LAST_UPDATED = "June 17, 2025";

export default function Terms() {
  const { t } = useLanguage();
  return (
    <div className="relative z-10 min-h-[80vh] max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageMeta
        title="Terms of Service — CureCheck"
        description="Terms and conditions for using CureCheck, the AI-powered health information platform."
        path="/terms"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-800 text-foreground">
            {t("Terms of Service", "सेवा की शर्तें")}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
          <Calendar className="w-3.5 h-3.5" />
          {t(`Last updated: ${LAST_UPDATED}`, `अंतिम अपडेट: ${LAST_UPDATED}`)}
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("1. Acceptance of Terms", "1. शर्तों की स्वीकृति")}</h2>
            <p>{t(
              "By accessing or using CureCheck (curecheck.in), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
              "CureCheck (curecheck.in) का उपयोग करके, आप इन सेवा शर्तों से बाध्य होने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारे प्लेटफॉर्म का उपयोग न करें।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("2. Educational Purpose — NOT Medical Advice", "2. शैक्षणिक उद्देश्य — चिकित्सा सलाह नहीं")}</h2>
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-3">
              <p className="text-foreground font-600">{t(
                "⚠️ IMPORTANT: CureCheck provides general health information for educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment.",
                "⚠️ महत्वपूर्ण: CureCheck केवल शैक्षणिक उद्देश्यों के लिए सामान्य स्वास्थ्य जानकारी प्रदान करता है। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।"
              )}</p>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("Always consult a qualified, licensed doctor or healthcare professional for any medical concerns.", "किसी भी स्वास्थ्य चिंता के लिए हमेशा एक योग्य, लाइसेंस प्राप्त डॉक्टर या स्वास्थ्य सेवा पेशेवर से परामर्श करें।")}</li>
              <li>{t("Never disregard professional medical advice based on information from CureCheck.", "CureCheck की जानकारी के आधार पर पेशेवर चिकित्सा सलाह को कभी नज़रअंदाज़ न करें।")}</li>
              <li>{t("In case of a medical emergency, call 108 (Ambulance) or your nearest emergency services immediately.", "चिकित्सा आपातकाल में तुरंत 108 (एम्बुलेंस) या नजदीकी आपातकालीन सेवाओं को कॉल करें।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("3. Eligibility", "3. पात्रता")}</h2>
            <p>{t(
              "You must be at least 13 years of age to use CureCheck. By using the platform, you represent that you are 13 years of age or older.",
              "CureCheck का उपयोग करने के लिए आपकी आयु कम से कम 13 वर्ष होनी चाहिए।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("4. User Accounts", "4. उपयोगकर्ता खाते")}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("You are responsible for maintaining the confidentiality of your account credentials.", "आप अपने खाते की जानकारी की गोपनीयता बनाए रखने के लिए जिम्मेदार हैं।")}</li>
              <li>{t("You agree to provide accurate information when creating an account.", "खाता बनाते समय सटीक जानकारी प्रदान करने के लिए आप सहमत हैं।")}</li>
              <li>{t("You must notify us immediately of any unauthorized access to your account.", "आपको अपने खाते तक किसी अनधिकृत पहुंच की तुरंत सूचना देनी होगी।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("5. Acceptable Use", "5. स्वीकार्य उपयोग")}</h2>
            <p className="mb-3">{t("You agree NOT to:", "आप निम्नलिखित करने से सहमत नहीं हैं:")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("Use the platform for any unlawful purpose or in violation of applicable Indian laws.", "किसी गैरकानूनी उद्देश्य के लिए या भारतीय कानूनों के उल्लंघन में प्लेटफॉर्म का उपयोग करना।")}</li>
              <li>{t("Attempt to abuse, overload, or exploit our AI services (including automated scraping or bulk requests).", "हमारी AI सेवाओं का दुरुपयोग, अधिभार या शोषण करने का प्रयास करना।")}</li>
              <li>{t("Submit false, misleading, or harmful content to our AI tools.", "हमारे AI टूल्स में गलत, भ्रामक या हानिकारक सामग्री जमा करना।")}</li>
              <li>{t("Impersonate any person or entity.", "किसी व्यक्ति या संस्था का प्रतिरूपण करना।")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("6. AI-Generated Content Disclaimer", "6. AI-जनित सामग्री अस्वीकरण")}</h2>
            <p>{t(
              "All responses generated by CureCheck's AI are based on general health information and may not be accurate, complete, or current. AI responses can be incorrect. Do not make medical decisions based solely on AI-generated content. CureCheck is not liable for any harm resulting from reliance on AI responses.",
              "CureCheck की AI द्वारा दी गई सभी प्रतिक्रियाएं सामान्य स्वास्थ्य जानकारी पर आधारित हैं और सटीक, पूर्ण या वर्तमान नहीं हो सकती हैं। AI प्रतिक्रियाएं गलत हो सकती हैं। CureCheck, AI प्रतिक्रियाओं पर निर्भरता से होने वाले किसी भी नुकसान के लिए उत्तरदायी नहीं है।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("7. Intellectual Property", "7. बौद्धिक संपदा")}</h2>
            <p>{t(
              "CureCheck and its content, features, and functionality are owned by Praful Srivastava and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or reproduce any part of the platform without prior written permission.",
              "CureCheck और इसकी सामग्री, सुविधाएं और कार्यक्षमता Praful Srivastava की संपत्ति हैं और बौद्धिक संपदा कानूनों द्वारा संरक्षित हैं।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("8. Limitation of Liability", "8. देनदारी की सीमा")}</h2>
            <p>{t(
              "To the maximum extent permitted by law, CureCheck and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to medical decisions made based on platform content.",
              "कानून द्वारा अनुमत अधिकतम सीमा तक, CureCheck और इसके संचालक प्लेटफॉर्म के आपके उपयोग से उत्पन्न होने वाली किसी भी अप्रत्यक्ष या परिणामी क्षति के लिए उत्तरदायी नहीं होंगे।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("9. Governing Law", "9. शासकीय कानून")}</h2>
            <p>{t(
              "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.",
              "ये शर्तें भारत के कानूनों द्वारा शासित हैं। कोई भी विवाद भारत की अदालतों के अनन्य अधिकार क्षेत्र के अधीन होगा।"
            )}</p>
          </section>

          <section>
            <h2 className="text-foreground text-lg font-700 mb-3">{t("10. Contact", "10. संपर्क")}</h2>
            <p className="mb-3">{t("For questions about these Terms:", "इन शर्तों के बारे में प्रश्नों के लिए:")}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:prafulsrivastava2@gmail.com" className="text-primary font-600 hover:underline text-sm">
                prafulsrivastava2@gmail.com
              </a>
            </div>
          </section>

          <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground/60">
            {t(
              "We reserve the right to modify these Terms at any time. Continued use of CureCheck after changes constitutes acceptance of the updated Terms.",
              "हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। बदलाव के बाद CureCheck का उपयोग जारी रखना अद्यतन शर्तों की स्वीकृति मानी जाएगी।"
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
