import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { Benefits } from '@/components/Benefits';
import { Program } from '@/components/Program';
import { Career } from '@/components/Career';
import { About } from '@/components/About';
import { Work } from '@/components/Work';
import { Voices } from '@/components/Voices';
import { Recommend } from '@/components/Recommend';
import { Schedule } from '@/components/Schedule';
import { Access } from '@/components/Access';
import { Faq } from '@/components/Faq';
import { FinalCta } from '@/components/FinalCta';
import { EntryForm } from '@/components/EntryForm';
import { StickyCta } from '@/components/StickyCta';
import { Footer } from '@/components/Footer';

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        {/* 01 ファーストビュー */}
        <Hero />
        {/* 02 イベントへの導入 ＋ 喜びのリレー */}
        <Intro />
        {/* 03 参加して分かること */}
        <Benefits />
        {/* 04 当日のプログラム */}
        <Program />
        {/* 05 仕事の広がり */}
        <Career />
        {/* 06 ロマンライフについて */}
        <About />
        {/* 07 ロマンライフの仕事 */}
        <Work />
        {/* 08 社員・社風（座談会） */}
        <Voices />
        {/* 09 こんな人におすすめ */}
        <Recommend />
        {/* 10・11 開催概要・日程選択／締切 */}
        <Schedule />
        {/* 12 アクセス */}
        <Access />
        {/* 13 FAQ */}
        <Faq />
        {/* 14 最終CTA */}
        <FinalCta />
        {/* 15 イベント申込フォーム */}
        <EntryForm />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
