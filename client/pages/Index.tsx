import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const logoUrl = "/promohive-logo.png";

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
    <div className="text-2xl font-extrabold tracking-tight text-white">{value}</div>
    <div className="mt-1 text-sm text-white/70">{label}</div>
  </div>
);

const Testimonial = ({ quote, author }: { quote: string; author: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
  >
    <p className="text-lg italic text-white/90">\"{quote}\"</p>
    <p className="mt-4 text-sm font-semibold text-white">- {author}</p>
  </motion.div>
);

export default function Index() {
  return (
    <Layout>
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-400/30 via-fuchsia-400/30 to-purple-400/30 blur-3xl" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white"
            >
              أطلق العنان لإمكاناتك: اربح HivePoints من خلال المهام والعروض والإحالات
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-white/80 text-lg"
            >
              PromoHive هي شبكة ترويج متميزة حيث يمكنك تحويل وقتك إلى أرباح حقيقية. أكمل المهام اليدوية، واستفد من عروض AdGem المربحة، واكتشف فرصًا جديدة. انضم إلينا اليوم وابدأ رحلة الربح السهلة والآمنة.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild className="bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:from-sky-600 hover:to-fuchsia-600 transition-all duration-300">
                <Link to="/dashboard">ابدأ الربح الآن</Link>
              </Button>
              <Button variant="secondary" asChild className="hover:bg-white/10 transition-all duration-300">
                <a href="#how">كيف تعمل؟</a>
              </Button>
            </motion.div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              <Stat label="مستخدمين سعداء" value="12,450+" />
              <Stat label="مهام مكتملة" value="318k" />
              <Stat label="مدفوعات" value="$410k+" />
            </div>
          </div>
          <div className="relative">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <img src={logoUrl} alt="PromoHive logo" className="mx-auto h-40 w-40" />
              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-white/70">1 دولار أمريكي = 100 HivePoints</p>
                <p className="text-sm text-white/70">المدفوعات بعملة USDT • الحد الأدنى 10 دولارات</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how" className="py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-10">
          كيف يعمل PromoHive؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">1. سجل الدخول بسهولة</h3>
            <p className="mt-2 text-sm text-white/70">تسجيل دخول سريع وآمن عبر رابط سحري يصل إلى بريدك الإلكتروني. لا توجد كلمات مرور معقدة، فقط وصول فوري.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">2. اربح HivePoints</h3>
            <p className="mt-2 text-sm text-white/70">أكمل مهام بسيطة، واستفد من عروض AdGem، وشاهد الإعلانات المنسقة. كلما ارتفع مستواك، زادت نقاطك!</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">3. اسحب أرباحك</h3>
            <p className="mt-2 text-sm text-white/70">اطلب سحب أرباحك بعملة USDT بمجرد وصولك إلى 10 دولارات. عملية سحب سريعة وموثوقة.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-10">
          ماذا يقول مستخدمونا؟
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Testimonial
            quote="PromoHive غيرت طريقة ربحي عبر الإنترنت. المهام سهلة وممتعة، والمدفوعات سريعة وموثوقة!"
            author="أحمد م. - مستخدم نشط"
          />
          <Testimonial
            quote="لم أصدق مدى سهولة البدء والربح. الواجهة رائعة والدعم ممتاز. أوصي به بشدة!"
            author="فاطمة ح. - عضو جديد"
          />
          <Testimonial
            quote="نظام الإحالة مذهل! لقد كسبت مكافآت كبيرة بمجرد دعوة أصدقائي. أفضل شبكة ترويج على الإطلاق."
            author="خالد س. - محيل ذهبي"
          />
        </div>
      </section>

      <section className="py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6"
        >
          جاهز للانضمام إلى مجتمع PromoHive؟
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-white/80 mb-8"
        >
          لا تفوت فرصة تحويل وقتك إلى أرباح. انضم إلى آلاف المستخدمين الراضين اليوم!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button asChild className="bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:from-sky-600 hover:to-fuchsia-600 transition-all duration-300 text-xl px-8 py-4">
            <Link to="/dashboard">ابدأ رحلة الربح الآن!</Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
}

