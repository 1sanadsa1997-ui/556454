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
              Unlock Your Potential: Earn HivePoints Through Tasks, Offers & Referrals
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-white/80 text-lg"
            >
              PromoHive is a premium promotional network where you can turn your time into real earnings. Complete manual tasks, benefit from lucrative AdGem offers, and discover new opportunities. Join us today and start your easy and secure earning journey.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild className="bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:from-sky-600 hover:to-fuchsia-600 transition-all duration-300">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button variant="secondary" asChild className="hover:bg-white/10 transition-all duration-300">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="hover:bg-white/10 transition-all duration-300">
                <a href="#how">How it works?</a>
              </Button>
            </motion.div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              <Stat label="Happy Users" value="12,450+" />
              <Stat label="Tasks Completed" value="318k" />
              <Stat label="Payments" value="$410k+" />
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
                <p className="text-sm text-white/70">1 USD = 100 HivePoints</p>
                <p className="text-sm text-white/70">USDT Payments • Minimum $10</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how" className="py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-10">
          How does PromoHive work?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">1. Easy Sign Up</h3>
            <p className="mt-2 text-sm text-white/70">Quick and secure registration with email verification. No complex passwords, just instant access.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">2. Earn HivePoints</h3>
            <p className="mt-2 text-sm text-white/70">Complete simple tasks, benefit from AdGem offers, and watch curated ads. The higher your level, the more points you earn!</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h3 className="font-semibold text-white">3. Withdraw Earnings</h3>
            <p className="mt-2 text-sm text-white/70">Request withdrawal in USDT once you reach $10. Fast and reliable withdrawal process.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-10">
          What our users say?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Testimonial
            quote="PromoHive changed how I earn online. Tasks are easy and fun, payments are fast and reliable!"
            author="Ahmed M. - Active User"
          />
          <Testimonial
            quote="I couldn't believe how easy it was to start earning. Great interface and excellent support. Highly recommended!"
            author="Fatima H. - New Member"
          />
          <Testimonial
            quote="The referral system is amazing! I earned big rewards just by inviting friends. Best promotional network ever."
            author="Khalid S. - Gold Referrer"
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
          Ready to join the PromoHive community?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-white/80 mb-8"
        >
          Don't miss the opportunity to turn your time into earnings. Join thousands of satisfied users today!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button asChild className="bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:from-sky-600 hover:to-fuchsia-600 transition-all duration-300 text-xl px-8 py-4">
            <Link to="/register">Start Your Earning Journey Now!</Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
}

